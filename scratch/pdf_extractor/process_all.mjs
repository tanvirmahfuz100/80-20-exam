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
    model: "gemini-1.5-pro",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const SYSTEM_PROMPT = `You are an expert academic content extractor specializing in Bengali educational materials (HSC/Bangla Medium). Your task is to accurately extract ALL MCQ questions from Bengali textbook chapters.

## CORE DIRECTIVE
Extract EVERY MCQ question completely. Never skip, merge, summarize, or truncate any question. Preserve all text exactly as written. Flag uncertainties rather than guessing.

## INPUT FORMAT
You will receive Bengali textbook content containing MCQs in this structure:
- Questions numbered with Bengali numerals (১., ২., ৩.)
- Options marked as ক) খ) গ) ঘ)
- Metadata tags like (জ্ঞান), (অনুধাবন), (প্রয়োগ), (উচ্চতর দক্ষতা)
- Possible school/college names in brackets
- Multi-line questions and options
- Some questions with i, ii, iii sub-options
- Stimulus passages (উদ্দীপক) shared by multiple questions

## EXTRACTION RULES

### 1. Question Completeness
Read question text ACROSS ALL LINES until options begin. Never truncate mid-sentence.

### 2. Sub-Options (i, ii, iii)
When a question has i, ii, iii with combined options (ক) i ও ii, খ) i ও iii, etc.), APPEND sub-options to question text.

### 3. Stimulus Questions
For questions sharing a stimulus (উদ্দীপক), include the FULL stimulus text in each question.

### 4. Option Mapping
Map ক) → A, খ) → B, গ) → C, ঘ) → D. Copy option text exactly.

### 5. Answer Determination
- Use marked answer if present in source
- If not marked, determine logically
- Flag uncertain answers: "confidence": "low"

### 6. Unclear Content
Mark unclear parts: [অস্পষ্ট]. Never fabricate missing text.

## OUTPUT JSON STRUCTURE
Output MUST be an array of objects matching this exact structure:
[
  {
    "id": number,
    "question": "Full Bengali question text (with i, ii, iii if present)",
    "options": {
      "A": "Option text",
      "B": "Option text",
      "C": "Option text",
      "D": "Option text"
    },
    "answer": "A/B/C/D",
    "explanation": "Clear explanation in Bengali",
    "source": "Book Name, Chapter-X",
    "confidence": "high/low"
  }
]`;

const pdfDir = "C:\\Users\\User\\OneDrive\\Documents\\contents\\hsc\\bangla 1st";
const outputDir = path.join(process.cwd(), "extracted_jsons");

async function processPDF(filePath) {
    const fileName = path.basename(filePath);
    const outputFileName = path.join(outputDir, path.basename(filePath, path.extname(filePath)) + '.json');
    
    if (fs.existsSync(outputFileName)) {
        console.log(`\nSkipping ${fileName} - JSON already exists.`);
        return;
    }

    try {
        console.log(`\n=================================================`);
        console.log(`Processing: ${fileName}`);
        console.log(`Uploading to Gemini...`);
        
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: "application/pdf",
            displayName: fileName,
        });
        
        console.log(`Upload complete. Waiting 15 seconds for processing...`);
        await new Promise(resolve => setTimeout(resolve, 15000));

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
        fs.writeFileSync(outputFileName, responseText);
        console.log(`Success! Saved to ${outputFileName}`);
        
        // Clean up
        try {
            await fileManager.deleteFile(uploadResult.file.name);
            console.log(`Cleaned up uploaded file from Gemini storage.`);
        } catch(e) {
            console.error(`Warning: Failed to delete file from Gemini storage.`, e.message);
        }
        
    } catch (error) {
        console.error(`\nERROR processing ${fileName}:`, error);
    }
}

async function main() {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${files.length} PDF files in directory.`);
    
    for (const file of files) {
        const filePath = path.join(pdfDir, file);
        await processPDF(filePath);
        
        // Wait 10 seconds between files to avoid rate limits
        console.log("Waiting 10 seconds before next file to respect API rate limits...");
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    console.log("\nAll files processed!");
}

main();
