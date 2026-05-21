# PDF MCQ Extractor (Gemini API)

This script uses the **Google Gemini 1.5 Pro API** to read your Bengali PDF files directly and extract the MCQs into the required JSON format. Gemini 1.5 Pro has native support for reading PDF files (even scanned ones with Bengali text), which makes this the best and most accurate approach for your task.

## Setup Instructions

1. **Get a Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Create a free API key.

2. **Configure the Environment**
   - In this folder (`scratch/pdf_extractor`), create a file named `.env`.
   - Add your API key to the file like this:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Install Dependencies**
   - Open your terminal and navigate to this folder:
     ```bash
     cd "scratch/pdf_extractor"
     ```
   - Run the install command:
     ```bash
     npm install
     ```

4. **Run the Extractor**
   - Run the script and pass the path to your PDF file:
     ```bash
     node extract_mcqs.mjs "C:\Users\User\OneDrive\Documents\contents\hsc\bangla 1st\1. Poem (Bivisoner) - HSC Bangla 1st Paper.pdf"
     ```

The script will upload the PDF to Gemini, apply all your extraction rules (with the system prompt you provided), and save the structured result as `1. Poem (Bivisoner) - HSC Bangla 1st Paper.json` in this directory!
