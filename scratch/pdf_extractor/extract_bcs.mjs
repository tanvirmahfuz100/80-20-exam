import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set in the .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

const SYSTEM_PROMPT = `You are an expert academic content extractor. Extract ALL MCQ questions from this Bengali BCS exam PDF.

## OUTPUT FORMAT
Output a JSON object with this structure:
{
  "examName": "Name of the exam (e.g., 35th BCS)",
  "code": "Code name if mentioned (e.g., হাসনাহেনা)",
  "questions": [
    {
      "id": <sequential number starting from 1>,
      "question": "Full Bengali question text",
      "options": {
        "A": "Option text",
        "B": "Option text",
        "C": "Option text",
        "D": "Option text"
      },
      "answer": "",
      "explanation": ""
    }
  ]
}

## EXTRACTION RULES
1. Extract EVERY question completely - never skip or truncate
2. Map Bengali options correctly: ক → A, খ → B, গ → C, ঘ → D
3. The PDF has answers marked with "উত্তর" or "উত্তর :" - use them to fill the answer field (A/B/C/D)
4. If no answer is marked, leave the answer field as empty string ""
5. Leave explanation field as empty string ""
6. Preserve all Bengali text exactly as written
7. Questions are numbered sequentially with Bengali numerals (১, ২, ৩...) or English numerals (1, 2, 3...)
8. Number the output "id" field sequentially starting from 1
9. Some questions may have sub-options (i, ii, iii, iv) - include them in the question text

Return ONLY valid JSON. No markdown, no code fences.`;

const pdfDir = path.resolve("../../docs/BCS");
const outputDir = path.resolve("../../public/bcs");

const pdfsToProcess = [
  { dir: "BCS 35", file: "35th-bcs-pdf-1777184565-7327.pdf", examKey: "bcs_35", name: "35th BCS" },
  { dir: "BCS 36", file: "36th-bcs-pdf-1777291480-1156.pdf", examKey: "bcs_36", name: "36th BCS" },
  { dir: "BCS 37", file: "37th-bcs-pdf-1777468740-2892.pdf", examKey: "bcs_37", name: "37th BCS" },
  { dir: "BCS 38", file: "38th-bcs-pdf-1777988237-2057.pdf", examKey: "bcs_38", name: "38th BCS" },
  { dir: "BCS 40", file: "40th-bcs-pdf-1778501238-4523.pdf", examKey: "bcs_40", name: "40th BCS" },
];

async function processPDF(pdfInfo) {
  const { dir, file, examKey, name } = pdfInfo;
  const filePath = path.join(pdfDir, dir, file);
  const outputFilePath = path.join(outputDir, `${examKey}.json`);

  // Skip if already exists
  if (fs.existsSync(outputFilePath)) {
    console.log(`Skipping ${examKey} - JSON already exists at ${outputFilePath}`);
    return null;
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  try {
    console.log(`\n======================================`);
    console.log(`Processing: ${name} (${file})`);
    console.log(`Uploading to Gemini...`);

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: file,
    });

    console.log(`Upload complete. Waiting 10 seconds for processing...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log(`Extracting MCQs...`);
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        }
      }
    ]);

    const responseText = result.response.text();
    
    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      console.error(`Failed to parse JSON response for ${name}: ${e.message}`);
      console.error(`Raw response (first 200 chars): ${responseText.substring(0, 200)}`);
      // Save raw response for debugging
      fs.writeFileSync(path.join(outputDir, `${examKey}_raw.txt`), responseText);
      return null;
    }

    // Extract questions array
    const questions = parsed.questions || parsed;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error(`No questions found in response for ${name}`);
      fs.writeFileSync(path.join(outputDir, `${examKey}_raw.txt`), responseText);
      return null;
    }

    // Normalise: ensure answer and explanation are strings
    for (const q of questions) {
      if (q.answer === null || q.answer === undefined) q.answer = '';
      if (q.explanation === null || q.explanation === undefined) q.explanation = '';
    }

    // Write the questions array to JSON
    fs.writeFileSync(outputFilePath, JSON.stringify(questions, null, 2));
    console.log(`Saved ${questions.length} questions to ${outputFilePath}`);

    // Clean up from Gemini storage
    try {
      await fileManager.deleteFile(uploadResult.file.name);
      console.log(`Cleaned up uploaded file from Gemini storage.`);
    } catch (e) {
      console.error(`Warning: Failed to delete file from Gemini storage: ${e.message}`);
    }

    return {
      examKey,
      name,
      code: parsed.code || '',
      questionCount: questions.length
    };

  } catch (error) {
    console.error(`\nERROR processing ${name}:`, error.message || error);
    return null;
  }
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const results = [];

  for (const pdfInfo of pdfsToProcess) {
    const result = await processPDF(pdfInfo);
    if (result) results.push(result);

    // Wait between files to avoid rate limits
    console.log("Waiting 10 seconds before next file...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log(`\n======================================`);
  console.log(`Processing complete!`);
  console.log(`Generated ${results.length} new BCS JSON files.`);

  // Update index.json
  const indexPath = path.join(outputDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    for (const r of results) {
      // Check if already in index
      const existing = index.find(i => i.id === r.examKey);
      if (!existing) {
        index.push({
          id: r.examKey,
          name: r.name,
          code: r.code,
          questionCount: r.questionCount
        });
        console.log(`Added ${r.examKey} to index.json`);
      }
    }

    // Sort by BCS number descending (49, 48, 47...)
    index.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''));
      const numB = parseInt(b.id.replace(/\D/g, ''));
      return numB - numA;
    });

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`Updated ${indexPath}`);
  }
}

main();
