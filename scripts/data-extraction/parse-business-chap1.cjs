const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'docs', 'ssc', 'business_entreprenuership_chap1.txt');
const OUT_DIR = path.join(__dirname, '..', 'public', 'ssc', 'business_entrepreneurship');

const text = readFileSync(SRC, 'utf-8');
const lines = text.split('\n');

mkdirSync(OUT_DIR, { recursive: true });

function clean(s) {
  return s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

// ─────────────────────────────────────────────────────────────
// Generate MCQs from chapter content knowledge  
// ─────────────────────────────────────────────────────────────

const mcqs = [
  {
    id: 1,
    question: 'ব্যবসায়ের উৎপত্তির মূলে কী রয়েছে?',
    options: { A: 'মুনাফা', B: 'অভাববোধ', C: 'চাহিদা', D: 'সরকারি নির্দেশনা' },
    answer: 'B',
    explanation: 'ব্যবসায়ের উৎপত্তির মূলে ছিল মানুষের অভাববোধ। অভাব পূরণের লক্ষ্যেই মানুষ অর্থনৈতিক কর্মকাণ্ডে জড়িত হয়।',
    source: 'পাঠ্যবই',
  },
  {
    id: 2,
    question: 'ব্যবসায়ের ক্রমবিকাশকে কয়টি পর্যায়ে ভাগ করা যায়?',
    options: { A: '২টি', B: '৩টি', C: '৪টি', D: '৫টি' },
    answer: 'B',
    explanation: 'ব্যবসায়ের ক্রমবিকাশকে তিনটি পর্যায়ে ভাগ করা যায়: প্রাচীন যুগ, মধ্যযুগ ও আধুনিক যুগ।',
    source: 'পাঠ্যবই',
  },
  {
    id: 3,
    question: 'পশু শিকার করে প্রয়োজন মেটানো হতো কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'অত্যাধুনিক যুগে' },
    answer: 'A',
    explanation: 'প্রাচীন যুগে মানুষ পশু শিকার, ফলমূল আহরণ ও কৃষিকাজের মাধ্যমে ব্যবসায়িক লেনদেনের প্রচেষ্টা চালাত।',
    source: 'পাঠ্যবই',
  },
  {
    id: 4,
    question: 'বিনিময়ের মাধ্যম হিসেবে ধাতব মুদ্রার প্রচলন হয় কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'প্রাগৈতিহাসিক যুগে' },
    answer: 'B',
    explanation: 'মধ্যযুগে স্বর্ণ ও রৌপ্য মুদ্রার ব্যবহার এবং কাগজি মুদ্রার প্রচলন শুরু হয়।',
    source: 'পাঠ্যবই',
  },
  {
    id: 5,
    question: 'কাগজি মুদ্রার প্রচলন শুরু হয় কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'বিনিময় যুগে' },
    answer: 'B',
    explanation: 'মধ্যযুগে কাগজি মুদ্রার প্রচলন শুরু হয়।',
    source: 'পাঠ্যবই',
  },
  {
    id: 6,
    question: 'ব্যাংক, বিমা, এটিএম কার্ড ও মোবাইল ব্যাংকিং কোন যুগের বৈশিষ্ট্য?',
    options: { A: 'প্রাচীন যুগ', B: 'মধ্যযুগ', C: 'আধুনিক যুগ', D: 'প্রাগৈতিহাসিক যুগ' },
    answer: 'C',
    explanation: 'আধুনিক যুগে ব্যাংক, বিমা, এটিএম কার্ড ও মোবাইল ব্যাংকিং-এর প্রচলন ঘটে।',
    source: 'পাঠ্যবই',
  },
  {
    id: 7,
    question: 'শিল্পবিপ্লব ঘটে কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'প্রাক্-মধ্যযুগে' },
    answer: 'C',
    explanation: 'শিল্পবিপ্লব ও বিভিন্ন শিল্পকারখানার বিকাশ ঘটে আধুনিক যুগে।',
    source: 'পাঠ্যবই',
  },
  {
    id: 8,
    question: 'বাজার ও শহর সৃষ্টি হয় কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'অত্যাধুনিক যুগে' },
    answer: 'B',
    explanation: 'মধ্যযুগে বাজার ও শহর সৃষ্টি হয় এবং ব্যবসায় সংগঠনের উদ্ভব ঘটে।',
    source: 'পাঠ্যবই',
  },
  {
    id: 9,
    question: 'দ্রব্য বিনিময় প্রথা কোন যুগে প্রচলিত ছিল?',
    options: { A: 'প্রাচীন যুগে', B: 'মধ্যযুগে', C: 'আধুনিক যুগে', D: 'বর্তমান যুগে' },
    answer: 'A',
    explanation: 'প্রাচীন যুগে দ্রব্য বিনিময় প্রথা চালু ছিল। পণ্যের বিনিময়ে পণ্য গ্রহণ করা হতো।',
    source: 'পাঠ্যবই',
  },
  {
    id: 10,
    question: 'বিনিময়ের মাধ্যম হিসেবে শামুক-ঝিনুকের ব্যবহার কোন যুগের বৈশিষ্ট্য?',
    options: { A: 'প্রাচীন যুগ', B: 'মধ্যযুগ', C: 'আধুনিক যুগ', D: 'স্বর্ণ যুগ' },
    answer: 'A',
    source: 'পাঠ্যবইয়ের অনুশীলনী',
  },
  {
    id: 11,
    question: 'মুনাফা অর্জনের লক্ষ্যে দেশের আইন অনুযায়ী বৈধ ও সঠিক উপায়ে পরিচালিত অর্থনৈতিক কর্মকাণ্ডকে কী বলে?',
    options: { A: 'শিল্প', B: 'বাণিজ্য', C: 'ব্যবসায়', D: 'সেবা' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 12,
    question: 'ব্যবসায়ের প্রধান উদ্দেশ্য কী?',
    options: { A: 'সমাজকল্যাণ', B: 'মুনাফা অর্জন', C: 'জনকল্যাণ', D: 'সেবা প্রদান' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 13,
    question: 'ব্যবসায়ের সাথে জড়িত পণ্য বা সেবার অবশ্যই কী থাকতে হবে?',
    options: { A: 'মান', B: 'মোড়ক', C: 'আর্থিক মূল্য', D: 'ব্র্যান্ড' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 14,
    question: 'ব্যবসায়ে সর্বদা কী বিদ্যমান থাকে?',
    options: { A: 'নিশ্চিত সফলতা', B: 'ঝুঁকি', C: 'কম মুনাফা', D: 'সরকারি পৃষ্ঠপোষকতা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 15,
    question: 'মুনাফা অর্জনের পাশাপাশি ব্যবসায়ে আর কোন বিষয়টি থাকা আবশ্যক?',
    options: { A: 'প্রতিযোগিতা', B: 'সেবার মনোভাব', C: 'একচেটিয়া অধিকার', D: 'সরকারি সহায়তা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 16,
    question: 'ব্যবসায়ের গুরুত্বপূর্ণ দিক কোনটি?',
    options: { A: 'উৎপাদন', B: 'নৈতিকতা ও সামাজিক দায়বদ্ধতা', C: 'বিজ্ঞাপন', D: 'প্রতিযোগিতা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 17,
    question: 'পণ্যদ্রব্য ও সেবাকর্ম উৎপাদন, পণ্যদ্রব্য বিনিময় ও এর সহায়ক কাজের সমষ্টিকে কী বলে?',
    options: { A: 'শিল্প', B: 'বাণিজ্য', C: 'ব্যবসায়', D: 'প্রত্যক্ষ সেবা' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 18,
    question: 'ব্যবসায়ের অন্যতম বৈশিষ্ট্য কোনটি?',
    options: { A: 'সামাজিক উন্নয়ন', B: 'ঝুঁকি ও অনিশ্চয়তা', C: 'রাজনৈতিক ক্ষমতা', D: 'সাংস্কৃতিক কার্যক্রম' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 19,
    question: 'কোনটি ব্যবসায় উৎপত্তির মূল কারণ?',
    options: { A: 'প্রয়োজনবোধ', B: 'অভাববোধ', C: 'চাহিদাবোধ', D: 'দায়বোধ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 20,
    question: 'মূলত ব্যবসায়ের উদ্ভব হয় কীকে ঘিরে?',
    options: { A: 'সামাজিক কর্মকাণ্ড', B: 'অর্থনৈতিক কর্মকাণ্ড ও লেনদেন', C: 'রাজনৈতিক কার্যক্রম', D: 'সাংস্কৃতিক অনুষ্ঠান' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 21,
    question: 'আধুনিক ব্যবসায়কে প্রধানত কয় ভাগে ভাগ করা যায়?',
    options: { A: '২ ভাগে', B: '৩ ভাগে', C: '৪ ভাগে', D: '৫ ভাগে' },
    answer: 'B',
    explanation: 'আধুনিক ব্যবসায়কে প্রধানত শিল্প, বাণিজ্য ও প্রত্যক্ষ সেবা — এ তিন ভাগে ভাগ করা যায়।',
    source: 'পাঠ্যবই',
  },
  {
    id: 22,
    question: 'উৎপাদনের বাহন কোনটি?',
    options: { A: 'বাণিজ্য', B: 'শিল্প', C: 'প্রত্যক্ষ সেবা', D: 'পরিবহন' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 23,
    question: 'শিল্পকে প্রধানত কয় ভাগে ভাগ করা হয়েছে?',
    options: { A: '২ ভাগে', B: '৩ ভাগে', C: '৪ ভাগে', D: '৫ ভাগে' },
    answer: 'D',
    explanation: 'শিল্পকে প্রধানত পাঁচ ভাগে ভাগ করা হয়েছে: প্রজনন, নিষ্কাশন, নির্মাণ, উৎপাদন ও সেবামূলক শিল্প।',
    source: 'পাঠ্যবই',
  },
  {
    id: 24,
    question: 'প্রকৃতিপ্রদত্ত সম্পদ সংগ্রহ বা ব্যবহার করে মানুষের ব্যবহার উপযোগী পণ্য ও সেবা উৎপাদনের সামগ্রিক কর্মপ্রচেষ্টাকে কী বলে?',
    options: { A: 'ব্যবসায়', B: 'শিল্প', C: 'বাণিজ্য', D: 'প্রত্যক্ষ সেবা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 25,
    question: 'উৎপাদিত সামগ্রী পুনরায় সৃষ্টি বা উৎপাদনের কাজে ব্যবহৃত হয় কোন শিল্পে?',
    options: { A: 'নিষ্কাশন শিল্প', B: 'প্রজনন শিল্প', C: 'নির্মাণ শিল্প', D: 'সেবামূলক শিল্প' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 26,
    question: 'নিচের কোনটি প্রজনন শিল্পের উদাহরণ?',
    options: { A: 'খনি শিল্প', B: 'নার্সারি', C: 'সেতু নির্মাণ', D: 'বস্ত্র শিল্প' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 27,
    question: 'ভূগর্ভ, পানি বা বায়ু থেকে প্রাকৃতিক সম্পদ আহরণকে কী বলে?',
    options: { A: 'প্রজনন শিল্প', B: 'নিষ্কাশন শিল্প', C: 'উৎপাদন শিল্প', D: 'নির্মাণ শিল্প' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 28,
    question: 'নিচের কোনটি নিষ্কাশন শিল্পের উদাহরণ?',
    options: { A: 'নার্সারি', B: 'কয়লা উত্তোলন', C: 'বস্ত্র তৈরি', D: 'রাস্তা নির্মাণ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 29,
    question: 'সেতু, বাঁধ, ইমারত, রাস্তাঘাট নির্মাণ কোন শিল্পের অন্তর্গত?',
    options: { A: 'প্রজনন শিল্প', B: 'নিষ্কাশন শিল্প', C: 'নির্মাণ শিল্প', D: 'সেবামূলক শিল্প' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 30,
    question: 'শ্রম ও যন্ত্রের সাহায্যে কাঁচামাল প্রক্রিয়াজাত করে চূড়ান্ত পণ্যে রূপান্তর করাকে কী বলে?',
    options: { A: 'নির্মাণ শিল্প', B: 'উৎপাদন শিল্প', C: 'প্রজনন শিল্প', D: 'সেবা শিল্প' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 31,
    question: 'নিচের কোনটি সেবামূলক শিল্পের উদাহরণ?',
    options: { A: 'সুতা থেকে কাপড় তৈরি', B: 'গ্যাস উৎপাদন ও বিতরণ', C: 'সেতু নির্মাণ', D: 'নার্সারি' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 32,
    question: 'কোন শিল্প মানুষের জীবন সহজ ও আরামদায়ক করে?',
    options: { A: 'উৎপাদন শিল্প', B: 'সেবা শিল্প', C: 'নির্মাণ শিল্প', D: 'নিষ্কাশন শিল্প' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 33,
    question: 'নিচের কোনটি প্রত্যক্ষ সেবার উদাহরণ?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'ডাক্তারি', D: 'ব্যাংকিং' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 34,
    question: 'অদৃশ্যমানতা কোনটির বৈশিষ্ট্য?',
    options: { A: 'পণ্য', B: 'সেবা', C: 'শিল্প', D: 'বাণিজ্য' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 35,
    question: 'বিউটি পার্লার একটি —',
    options: { A: 'শিল্প', B: 'বাণিজ্য', C: 'প্রত্যক্ষ সেবা', D: 'উৎপাদন' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 36,
    question: 'হ্যাচারি কোন শিল্পের অন্তর্গত?',
    options: { A: 'প্রজনন শিল্প', B: 'নিষ্কাশন শিল্প', C: 'উৎপাদন শিল্প', D: 'সেবা শিল্প' },
    answer: 'A',
    source: 'পাঠ্যবই',
  },
  {
    id: 37,
    question: 'ব্যবসায়ের পণ্য বণ্টনকারী শাখা কোনটি?',
    options: { A: 'শিল্প', B: 'বাণিজ্য', C: 'প্রত্যক্ষ সেবা', D: 'পরোক্ষ সেবা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 38,
    question: 'বাণিজ্যকে আধুনিককালে কী নামে অভিহিত করা হয়?',
    options: { A: 'ব্যবসায় টু শিল্প', B: 'ব্যবসায় টু ব্যবসায়', C: 'বাণিজ্য টু শিল্প', D: 'ব্যবসায় টু বাণিজ্য' },
    answer: 'B',
    explanation: 'বাণিজ্যকে আধুনিককালে "ব্যবসায় টু ব্যবসায়" (Business to Business) নামে অভিহিত করা হয়।',
    source: 'পাঠ্যবই',
  },
  {
    id: 39,
    question: 'ক্রেতা বা ভোক্তাদের নিকট পণ্য ও সেবা বণ্টনের কার্যাবলিকে কী বলে?',
    options: { A: 'শিল্প', B: 'ব্যবসায়', C: 'বাণিজ্য', D: 'প্রত্যক্ষ সেবা' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 40,
    question: 'বাণিজ্যের স্থানগত বাধা দূর করে কোনটি?',
    options: { A: 'গুদামজাতকরণ', B: 'পরিবহন', C: 'ব্যাংকিং', D: 'বিমা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 41,
    question: 'বাণিজ্যের সময়গত বাধা দূর করে কোনটি?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'ব্যাংকিং', D: 'বিজ্ঞাপন' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 42,
    question: 'বাণিজ্যের অর্থসংক্রান্ত বাধা দূর করে কোনটি?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'ব্যাংকিং', D: 'বিমা' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 43,
    question: 'বাণিজ্যের ঝুঁকিসংক্রান্ত বাধা দূর করে কোনটি?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'বিজ্ঞাপন', D: 'বিমা' },
    answer: 'D',
    source: 'পাঠ্যবই',
  },
  {
    id: 44,
    question: 'বাণিজ্যের তথ্য ও প্রচারসংক্রান্ত বাধা দূর করে কোনটি?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'বিজ্ঞাপন', D: 'ব্যাংকিং' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 45,
    question: 'বাণিজ্যের মালিকানাসংক্রান্ত বাধা দূর করে কোনটি?',
    options: { A: 'পরিবহন', B: 'গুদামজাতকরণ', C: 'পণ্য বিনিময়', D: 'বিজ্ঞাপন' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 46,
    question: 'গুদামজাতকরণের মাধ্যমে পণ্যের কোন ধরনের উপযোগ সৃষ্টি হয়?',
    options: { A: 'স্থানগত', B: 'সময়গত', C: 'স্বত্বগত', D: 'রূপগত' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 47,
    question: 'পরিবহন কোন ধরনের উপযোগ সৃষ্টি করে?',
    options: { A: 'সময়গত', B: 'স্থানগত', C: 'স্বত্বগত', D: 'তথ্যগত' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 48,
    question: 'ক্রয়-বিক্রয় কোন ধরনের উপযোগ সৃষ্টি করে?',
    options: { A: 'স্থানগত', B: 'সময়গত', C: 'স্বত্বগত', D: 'রূপগত' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 49,
    question: 'শিল্পে উৎপাদিত পণ্য বা সেবাসামগ্রী ভোক্তাদের নিকট পৌঁছানোর সকল বাধা দূর করে কোনটি?',
    options: { A: 'শিল্প', B: 'বাণিজ্য', C: 'প্রত্যক্ষ সেবা', D: 'উৎপাদন' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 50,
    question: 'ব্যবসায়ের মাধ্যমে কী গঠিত হয়?',
    options: { A: 'সমাজ', B: 'মূলধন', C: 'সরকার', D: 'সংস্কৃতি' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 51,
    question: 'ব্যবসায় কীসের উন্নয়ন ঘটায়?',
    options: { A: 'শুধু বাণিজ্যের', B: 'গবেষণা ও সৃজনশীল কাজের', C: 'শুধু উৎপাদনের', D: 'শুধু পরিবহনের' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 52,
    question: 'ব্যবসায় কীভাবে বেকার সমস্যা সমাধানে ভূমিকা রাখে?',
    options: { A: 'সরকারি চাকরি দিয়ে', B: 'কর্মসংস্থান সৃষ্টির মাধ্যমে', C: 'বিদেশি বিনিয়োগের মাধ্যমে', D: 'শিক্ষার প্রসার ঘটিয়ে' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 53,
    question: 'নতুন নতুন শহর ও বন্দর গড়ে ওঠে কীকে ঘিরে?',
    options: { A: 'রাজনীতিকে', B: 'শিক্ষাকে', C: 'ব্যবসা-বাণিজ্যকে', D: 'সরকারি উদ্যোগকে' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 54,
    question: 'ব্যবসায়িক পরিবেশের উপাদানকে প্রধানত কয় ভাগে ভাগ করা যায়?',
    options: { A: '৪ ভাগে', B: '৫ ভাগে', C: '৬ ভাগে', D: '৭ ভাগে' },
    answer: 'C',
    explanation: 'ব্যবসায়িক পরিবেশের উপাদানকে প্রধানত ৬ ভাগে ভাগ করা যায়: প্রাকৃতিক, অর্থনৈতিক, সামাজিক, রাজনৈতিক, আইনগত ও প্রযুক্তিগত।',
    source: 'পাঠ্যবই',
  },
  {
    id: 55,
    question: 'জলবায়ু, ভূমি ও প্রাকৃতিক সম্পদ কোন পরিবেশের উপাদান?',
    options: { A: 'অর্থনৈতিক পরিবেশ', B: 'প্রাকৃতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'রাজনৈতিক পরিবেশ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 56,
    question: 'সঞ্চয়, বিনিয়োগ, মূলধন, অর্থ ও ব্যাংকিং কোন পরিবেশের উপাদান?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 57,
    question: 'জাতি, ধর্মীয় বিশ্বাস, শিক্ষা ও সংস্কৃতি কোন পরিবেশের অন্তর্ভুক্ত?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'রাজনৈতিক পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 58,
    question: 'সরকার, সার্বভৌমত্ব ও রাজনৈতিক স্থিতিশীলতা কোন পরিবেশের উপাদান?',
    options: { A: 'সামাজিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'রাজনৈতিক পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 59,
    question: 'বাণিজ্যিক আইন ও শিল্প আইন কোন পরিবেশের উপাদান?',
    options: { A: 'রাজনৈতিক পরিবেশ', B: 'প্রযুক্তিগত পরিবেশ', C: 'আইনগত পরিবেশ', D: 'সামাজিক পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 60,
    question: 'প্রযুক্তি শিক্ষা, কারিগরি দক্ষতা, তথ্য ও যোগাযোগ প্রযুক্তি কোন পরিবেশের উপাদান?',
    options: { A: 'অর্থনৈতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'প্রযুক্তিগত পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 61,
    question: 'ভোক্তার আয় কোন পরিবেশের উপাদান?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'অর্থনৈতিক পরিবেশ', D: 'রাজনৈতিক পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 62,
    question: '"আন্তর্জাতিক সম্পর্ক" কোন পরিবেশের উপাদান?',
    options: { A: 'অর্থনৈতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'রাজনৈতিক পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 63,
    question: 'মানব সম্পদ কোন পরিবেশের উপাদান?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'প্রযুক্তিগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 64,
    question: 'কারিগরি দক্ষতা কোন পরিবেশের উপাদান?',
    options: { A: 'অর্থনৈতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'প্রযুক্তিগত পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 65,
    question: 'শিক্ষা ও সংস্কৃতি ব্যবসায়ের কোন পরিবেশের উপাদান?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'প্রযুক্তিগত পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 66,
    question: 'হরতাল কোন পরিবেশের উপাদান?',
    options: { A: 'সামাজিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'আইনগত পরিবেশ', D: 'রাজনৈতিক পরিবেশ' },
    answer: 'D',
    source: 'পাঠ্যবই',
  },
  {
    id: 67,
    question: 'ভোক্তা আইন কোন পরিবেশের উপাদান?',
    options: { A: 'অর্থনৈতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'আইনগত পরিবেশ', D: 'রাজনৈতিক পরিবেশ' },
    answer: 'C',
    source: 'পাঠ্যবই',
  },
  {
    id: 68,
    question: 'ব্যবসায়িক পরিবেশের উপাদানগুলোর মধ্যে নদনদী কোনটির অন্তর্ভুক্ত?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'অর্থনৈতিক পরিবেশ', C: 'সামাজিক পরিবেশ', D: 'আইনগত পরিবেশ' },
    answer: 'A',
    source: 'পাঠ্যবই',
  },
  {
    id: 69,
    question: 'ব্যবসায়ের জন্য মারাত্মক হুমকি কোনটি?',
    options: { A: 'অর্থের অভাব', B: 'প্রতিকূল আইন-শৃঙ্খলা পরিস্থিতি', C: 'জনবলের অভাব', D: 'যাতায়াত সমস্যা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 70,
    question: 'ঐতিহ্য কোন পরিবেশের উপাদান?',
    options: { A: 'প্রাকৃতিক পরিবেশ', B: 'সামাজিক পরিবেশ', C: 'রাজনৈতিক পরিবেশ', D: 'প্রযুক্তিগত পরিবেশ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 71,
    question: 'মসলিন কাপড়ের জন্য সারা বিশ্বে কোন স্থানের নাম ছড়িয়ে পড়েছিল?',
    options: { A: 'সপ্তগ্রাম', B: 'সোনারগাঁও', C: 'চট্টগ্রাম', D: 'ঢাকা' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 72,
    question: 'পর্তুগিজরা চট্টগ্রামকে কী নামে অভিহিত করেছিল?',
    options: { A: 'Grand Port', B: 'Porto Grando', C: 'Great Harbor', D: 'Chittagong Port' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 73,
    question: 'বাংলাদেশে পর্তুগিজরা বাণিজ্য করতে আসে কোন শতাব্দীতে?',
    options: { A: 'পঞ্চদশ শতাব্দীতে', B: 'ষোড়শ শতাব্দীতে', C: 'সপ্তদশ শতাব্দীতে', D: 'অষ্টাদশ শতাব্দীতে' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 74,
    question: 'সপ্তগ্রাম সমুদ্রবন্দরটি কোথায় অবস্থিত?',
    options: { A: 'বাংলাদেশে', B: 'পশ্চিমবঙ্গে', C: 'ভারতের ওড়িশায়', D: 'মিয়ানমারে' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 75,
    question: 'নিচের কোন কাজটি ব্যবসায়ের অন্তর্ভুক্ত?',
    options: { A: 'পরিবারের জন্য খাদ্য উৎপাদন', B: 'মুনাফার আশায় মাছ চাষ', C: 'সরকারি চাকরি', D: 'স্বেচ্ছাসেবামূলক কাজ' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 76,
    question: 'নিচের কোনটি ব্যবসায়ের বৈশিষ্ট্য নয়?',
    options: { A: 'মুনাফা অর্জনের উদ্দেশ্য', B: 'ঝুঁকি ও অনিশ্চয়তা', C: 'আইনগত বৈধতা', D: 'অলাভজনক কার্যক্রম' },
    answer: 'D',
    source: 'পাঠ্যবই',
  },
  {
    id: 77,
    question: 'নিচের কোন উপাদানটি প্রাকৃতিক পরিবেশের বহির্ভূত?',
    options: { A: 'নদনদী', B: 'মৃত্তিকা', C: 'জলবায়ু', D: 'ধর্মীয় বিশ্বাস' },
    answer: 'D',
    explanation: 'ধর্মীয় বিশ্বাস প্রাকৃতিক পরিবেশের নয়, বরং সামাজিক পরিবেশের উপাদান।',
    source: 'পাঠ্যবই',
  },
  {
    id: 78,
    question: 'ব্যবসায় অন্য সব পেশা থেকে আলাদা কেননা ব্যবসায়ের রয়েছে —',
    options: { A: 'শুধু আর্থিক মূল্য', B: 'আর্থিক মূল্য, সেবার মনোভাব ও ঝুঁকি', C: 'শুধু সেবার মনোভাব', D: 'শুধু ঝুঁকি' },
    answer: 'B',
    source: 'পাঠ্যবই',
  },
  {
    id: 79,
    question: 'ব্যবসায় সংগঠনের উদ্ভব হয় কোন যুগে?',
    options: { A: 'প্রাচীন যুগে', B: 'আধুনিক যুগে', C: 'প্রাক্-মধ্যযুগে', D: 'মধ্যযুগে' },
    answer: 'D',
    source: 'পাঠ্যবই',
  },
  {
    id: 80,
    question: 'প্রাচীনকালে ব্যবসায়িক কর্মকাণ্ডের মধ্যে কী অন্তর্ভুক্ত ছিল?',
    options: { A: 'পশুপালন ও মৎস্য শিকার', B: 'ব্যাংকিং ও বিমা', C: 'এটিএম কার্ড', D: 'মোবাইল ব্যাংকিং' },
    answer: 'A',
    source: 'পাঠ্যবই',
  },
];

// ─────────────────────────────────────────────────────────────
// Parse Creative Questions from structured sections
// ─────────────────────────────────────────────────────────────

function parseAllCreativeQuestions(lines) {
  const allCQs = [];

  // Find the start of CQ section
  let cqStart = -1;
  for (let i = 2525; i < lines.length; i++) {
    const l = clean(lines[i]);
    // First CQ section starts with "পাঠ্যবইয়ের অনুশীলনীর সৃজনশীল প্রশ্ন ও উত্তর" or similar
    if (l.includes('পাঠ্যবইয়ের অনুশীলনীর') && l.includes('সৃজনশীল')) {
      cqStart = i;
      break;
    }
  }

  if (cqStart === -1) {
    console.log('Could not find CQ section start');
    return allCQs;
  }

  console.log('CQ section starts at line', cqStart);

  // Now parse CQs from cqStart to end of file (or until model test)
  // Each CQ has: "প্রশ্ন {N}" header, stimulus paragraph, ক-খ-গ-ঘ sub-questions, answer block
  let i = cqStart;
  
  while (i < lines.length) {
    const line = clean(lines[i]);
    
    // Look for "প্রশ্ন {N}" patterns that start new questions
    // But skip short-answer style (প্রশ্ন ১৭, ১৮ etc which have no ক-ঘ)
    // Bangla digits (\u09E6-\u09EF) don't match \d
    const cqHeader = line.match(/প্রশ্ন\s+([\u09E6-\u09EF0-9]+)(?:[\.\s\)]|\s|$)/);
    
    if (cqHeader) {
      const rawNum = cqHeader[1];
      const num = parseInt(toArabicNum(rawNum));
      
      // Skip questions past the reasonable range or in board/School sections
      // Look ahead to determine if this is a real CQ
      let lookText = '';
      for (let k = i + 1; k < Math.min(i + 30, lines.length); k++) {
        lookText += '\n' + clean(lines[k]);
      }
      
      // Real CQ has sub-questions (ক, খ, গ, ঘ) within the next ~25 lines
      const hasSubQ = lookText.match(/\n[ক-ঘ]\s*[\.\)]/);
      
      if (hasSubQ && num <= 16) {
        console.log(`  Found CQ ${num} at line ${i}`);
        
        // Extract the source/board info
        let source = cqHeader[2] || '';
        
        // Build regex pattern for "Nনং প্রশ্নের উত্তর" with both digit types
        const numStr = String(num);
        // Match either Bangla or Arabic digits followed by নং
        const nPattern = `[${numStr}${toBanglaNum(numStr)}]নং`;
        
        // Collect stimulus - read lines until first sub-question
        let stimulusLines = [];
        let j = i + 1;
        while (j < lines.length) {
          const sl = clean(lines[j]);
          if (sl.match(/^[ক-ঘ]\s*[\.\)]/)) break;
          if (sl.match(new RegExp(nPattern + '\\s*প্রশ্নের উত্তর'))) break;
          if (sl.match(/^প্রশ্ন\s+[\u09E6-\u09EF0-9]+/) && !sl.match(new RegExp(nPattern))) break;
          if (sl && !sl.match(/^পৃষ্ঠা/) && !sl.match(/^অধ্যায়/) && !sl.match(/^প্রথম\s+অধ্যায়/) && !sl.match(/লেকচার/)) {
            stimulusLines.push(lines[j]);
          }
          j++;
        }
        i = j;
        
        // Parse sub-questions
        let subQs = [];
        let currentLabel = '';
        let currentText = '';
        
        while (i < lines.length) {
          const sl = clean(lines[i]);
          
          // Stop conditions
          if (sl.match(new RegExp(nPattern + '\\s*প্রশ্নের উত্তর'))) break;
          if (sl.match(/^প্রশ্ন\s+[\u09E6-\u09EF0-9]+/) && !sl.match(new RegExp(nPattern))) break;
          if (sl.includes('সকল বোর্ডের') || sl.includes('শীর্ষস্থানীয়') || sl.includes('মাস্টার ট্রেইনার')) break;
          if (sl.match(/^অধ্যায়/) || sl.match(/^প্রথম\s+অধ্যায়/)) break;
          
          const subMatch = sl.match(/^([ক-ঘ])[\.\)]\s*(.+)/);
          if (subMatch) {
            if (currentLabel && currentText) {
              subQs.push({ label: currentLabel, text: cleanQ(currentText) });
            }
            currentLabel = subMatch[1];
            currentText = subMatch[2].trim();
            i++;
            continue;
          }
          
          if (currentLabel && sl && !sl.match(/^পৃষ্ঠা/)) {
            currentText += ' ' + sl;
          }
          i++;
        }
        
        if (currentLabel && currentText) {
          subQs.push({ label: currentLabel, text: cleanQ(currentText) });
        }
        
        // Parse answer block
        // Strategy:
        // 1. Normalize merged labels (e.g. কমধ্যযুগে → ক মধ্যযুগে)
        // 2. Handle unlabeled content by assigning to next expected label in [ক,খ,গ,ঘ]
        // 3. Fix OCR wrong-label (ব → ক)
        // 4. Skip sub-question noise, junk lines
        let answers = {};
        let ansLabel = '';
        let ansText = '';
        const labelOrder = ['ক', 'খ', 'গ', 'ঘ'];
        let nextLabelIdx = 0;
        
        // Known merged-label patterns found in source
        const mergedFixers = [
          [/^কমধ্যযুগে/, 'ক মধ্যযুগে'],
          [/^ঘউদ্দীপকে/, 'ঘ উদ্দীপকে'],
          [/^গউদ্দীপকের\s*/, 'গ উদ্দীপকের'],
          [/^যজনাব/, 'ঘ জনাব'],
          [/^গউদ্দীপকের/, 'গ উদ্দীপকের'],
          [/^ক.?(সে\s+শিল্পের|যে\s+শিল্পের|শিল্পের|প্রকৃতিপ্রদত্ত|শ্রম)/, 'ক $1'], // tentative
        ];
        
        while (i < lines.length) {
          let sl = clean(lines[i]);
          
          // Stop conditions
          if (sl.match(/^প্রশ্ন\s+[\u09E6-\u09EF0-9]+/) && !sl.match(new RegExp(nPattern))) break;
          if (sl.includes('সকল বোর্ডের') || sl.includes('শীর্ষস্থানীয়') || sl.includes('মাস্টার ট্রেইনার')) break;
          // Skip chapter headers, publisher lines, page numbers
          if (sl.match(/^অধ্যায়/) || sl.match(/^প্রথম\s+অধ্যায়/)) break;
          if (sl.match(/^▶?\s*শিখনফল/) || sl.match(/পৃষ্ঠা\s+/) || sl.match(/^লেকচার/) 
              || sl.match(/LPL\s+SSC/) || sl.match(/^প্রথম\s+অধ্যায়/)) { i++; continue; }
          // Skip sub-question lines inside answer block (they're noise, not answers)
          if (sl.match(/^[কখগঘ][\.\)]\s*(.+)\?/)) { i++; continue; }
          // Skip very short lines or stray punctuation
          if (sl.length < 3 && !sl.match(/^[কখগঘ]\s/)) { i++; continue; }
          if (sl.match(/^[০-৯]+\s*$/)) { i++; continue; }
          
          // Normalize merged labels
          for (const [pattern, replacement] of mergedFixers) {
            sl = sl.replace(pattern, replacement);
          }
          
          // Also handle any general merged label: label letter followed immediately by a Bengali letter
          // Only if the resulting content after the first char looks like answer text (multi-word)
          const mergedCheck = sl.match(/^([কখগঘ])([অ-হ].*)/);
          if (mergedCheck && !sl.match(/^[কখগঘ][\.\)\s]/)) {
            const possibleLabel = mergedCheck[1];
            const restText = mergedCheck[2];
            // Confirm: the rest text is word-like (starts with a word) and not a common false positive
            // False positives: গঠন, করা, কাজ, খানি, etc.
            const falsePositives = ['গঠন', 'গুরু', 'করা', 'কাজ', 'খানি', 'করে', 'করেন', 'গুলো'];
            const firstWord = restText.split(/\s/)[0];
            if (!falsePositives.some(fp => firstWord.startsWith(fp)) && restText.length > 4) {
              sl = possibleLabel + ' ' + restText;
            }
          }
          
          // Detect answer labels (standard format): ক ), ক., ক with space
          const stdMatch = sl.match(/^([কখগঘ])[\.\)]?\s+(.+)/);
          // Detect wrong label: ব used instead of ক
          const wrongMatch = sl.match(/^[ব]\s+(.+)/);
          
          if (stdMatch && sl.length > 3) {
            const foundLabel = stdMatch[1];
            // Save previous answer
            if (ansLabel && ansText) answers[ansLabel] = cleanQ(ansText);
            ansLabel = foundLabel;
            ansText = stdMatch[2].trim().replace(/^[\u09E6-\u09EF\s]+\s*/, '');
            // Advance nextExpectedLabel past this label
            const foundIdx = labelOrder.indexOf(foundLabel);
            if (foundIdx >= 0) nextLabelIdx = foundIdx + 1;
            i++;
            continue;
          }
          
          if (wrongMatch && sl.match(/^[ব]\s+/)) {
            // Treat as ক
            if (ansLabel && ansText) answers[ansLabel] = cleanQ(ansText);
            ansLabel = 'ক';
            ansText = wrongMatch[1].trim();
            nextLabelIdx = Math.max(nextLabelIdx, 1);
            i++;
            continue;
          }
          
          // Handle unlabeled content: if we have an ansLabel and this line
          // looks like answer text (not noise), append to current ansLabel
          if (ansLabel && sl && sl.length > 3) {
            ansText = ansText ? ansText + ' ' + sl : sl;
            i++;
            continue;
          }
          
          // If no ansLabel yet but we have a substantial line,
          // it might be the start of the first unlabeled answer
          if (!ansLabel && sl.length > 5 && !sl.match(/^[কখগঘ][\.\)]/) && !sl.match(/^\d+[\.\)]/)) {
            ansLabel = labelOrder[nextLabelIdx] || 'ক';
            ansText = sl;
            nextLabelIdx = Math.min(nextLabelIdx + 1, 3);
            i++;
            continue;
          }
          
          i++;
        }
        
        if (ansLabel && ansText) {
          // Ensure we don't add trivial short texts
          if (ansText.length > 5) {
            answers[ansLabel] = cleanQ(ansText);
          }
        }
        
        const stimulus = stimulusLines.map(clean).filter(Boolean).join(' ').trim();
        
        // Extract marks from sub-question text
        const cleanedSubQs = subQs.map(sq => {
          const markMatch = sq.text.match(/[\u09E6-\u09EF0-9]+\s*$/);
          const mark = markMatch ? markMatch[0].trim() : '';
          const text = markMatch ? sq.text.slice(0, -markMatch[0].length).trim() : sq.text;
          return { label: sq.label, text, mark };
        });
        
        if (stimulus && cleanedSubQs.length >= 2) {
          allCQs.push({
            id: num,
            source: source || 'সৃজনশীল প্রশ্ন',
            stimulus,
            questions: cleanedSubQs,
            answer: answers,
          });
        }
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  
  return allCQs;
}

function cleanQ(s) {
  return s.replace(/\s+/g, ' ').trim();
}

// Convert Bangla digits to Arabic numerals
function toArabicNum(s) {
  const map = {
    '\u09E6': '0', '\u09E7': '1', '\u09E8': '2', '\u09E9': '3', '\u09EA': '4',
    '\u09EB': '5', '\u09EC': '6', '\u09ED': '7', '\u09EE': '8', '\u09EF': '9',
  };
  return s.replace(/[\u09E6-\u09EF]/g, c => map[c]);
}

// Convert Arabic digits to Bangla numerals
function toBanglaNum(s) {
  const map = {
    '0': '\u09E6', '1': '\u09E7', '2': '\u09E8', '3': '\u09E9', '4': '\u09EA',
    '5': '\u09EB', '6': '\u09EC', '7': '\u09ED', '8': '\u09EE', '9': '\u09EF',
  };
  return s.replace(/[0-9]/g, c => map[c]);
}

// ── MAIN ─────────────────────────────────────────────────────
console.log('=== Business Entrepreneurship Chapter 1 Generator ===\n');
mkdirSync(OUT_DIR, { recursive: true });

console.log(`Generated ${mcqs.length} MCQs from chapter content`);

const cqs = parseAllCreativeQuestions(lines);
console.log(`Extracted ${cqs.length} Creative Questions`);

// Write MCQ file
writeFileSync(path.join(OUT_DIR, 'chapter_1_mcq.json'), JSON.stringify(mcqs, null, 2), 'utf-8');
console.log(`\n✓ Wrote: chapter_1_mcq.json`);

// Write CQ file
writeFileSync(path.join(OUT_DIR, 'chapter_1_cq.json'), JSON.stringify({
  _type: 'creative_questions',
  questions: cqs,
}, null, 2), 'utf-8');
console.log(`✓ Wrote: chapter_1_cq.json`);

// Write bundle
writeFileSync(path.join(OUT_DIR, 'chapter_1.json'), JSON.stringify({
  _type: 'chapter_bundle',
  mcqs,
  cqs,
}, null, 2), 'utf-8');
console.log(`✓ Wrote: chapter_1.json (bundle)`);

console.log(`\n✅ Done! Output in: ${OUT_DIR}`);
