import fs from "fs";

const BN_DIGITS = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
function toAsciiDigits(s) { return s.replace(/[০-৯]/g, (ch) => BN_DIGITS[ch]); }
function toBnDigits(s) { return String(s).split("").map((d) => "০১২৩৪৫৬৭৮৯"[d] || d).join(""); }

const BOARD_PREFIX = {
  "ঢাকা": "dhaka",
  "চট্টগ্রাম": "chattogram",
  "চটগ্রাম": "chattogram",
  "কুমিল্লা": "cumilla",
  "রাজশাহী": "rajshahi",
  "খুলনা": "khulna",
  "বরিশাল": "barishal",
  "সিলেট": "sylhet",
  "দিনাজপুর": "dinajpur",
  "যশোর": "jashore",
  "ময়মনসিংহ": "mymensingh",
  "মাদ্রাসা": "madrasah",
};

const BOARD_ORDER = ["dhaka", "mymensingh", "rajshahi", "cumilla", "chattogram", "dinajpur", "sylhet", "jashore", "barishal", "madrasah"];

function isCombinedMultiBoard(source) {
  // Detects "ঢাকা, ময়মনসিংহ, রাজশাহী, ... বোর্ড ২০২২" type combined entries
  return (source.match(/বোর্ড/g) || []).length > 1 || source.includes(",");
}

function isAllBoards(source) { return source.includes("সকল বোর্ড"); }

function isSchoolExam(source) {
  // A school/college exam does NOT contain "বোর্ড" (board) in its name
  return !source.includes("বোর্ড");
}

function extractYear(source) {
  const normalized = toAsciiDigits(source);
  const m = normalized.match(/(\d{4})/);
  return m ? m[0] : null;
}

function toEnglishBoard(source) {
  if (isCombinedMultiBoard(source)) return "all_combined";
  for (const [bn, en] of Object.entries(BOARD_PREFIX)) {
    if (source.includes(bn)) return en;
  }
  return "other";
}

function parseMapping(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split("\n").filter(Boolean);
  return lines.map((line) => {
    const parts = line.split("|");
    const filePart = parts[0].trim();
    const fileNumMatch = filePart.match(/(\d+)/);
    const fileNum = fileNumMatch ? fileNumMatch[1] : "";
    const source = (parts[2] || "").trim();
    return { jsonFile: `${fileNum}.json`, fileNum: parseInt(fileNum), source };
  });
}

// Simple Romanization mapping for common Bengali school name components
const BN_TO_EN = {
  "আইডিয়াল": "ideal", "আইডিয়াল": "ideal", "কলেজ": "college", "স্কুল": "school",
  "অ্যান্ড": "and", "এন্ড": "and", "মতিঝিল": "motijheel",
  "আদমজী": "adamjee", "ক্যান্টনমেন্ট": "cantonment", "পাবলিক": "public",
  "ক্যান্ট.": "cantonment", "উদয়ন": "udayan", "উচ্চ": "higher",
  "বিদ্যালয়": "school", "ঢাকা": "dhaka",
  "রংপুর": "rangpur", "ও": "and",
  "চট্টগ্রাম": "chattogram", "জয়পুরহাট": "joypurhat",
  "গার্লস": "girls", "ক্যাডেট": "cadet", "ঝিনাইদহ": "jhenaidah",
  "রেসিডেনসিয়াল": "residential", "রেসিডেনসিয়াল": "residential",
  "মডেল": "model", "নূর": "noor", "মোহাম্মদ": "mohammad",
  "ফৌজদারহাট": "faujdarhat", "বরিশাল": "barishal",
  "বীরশ্রেষ্ঠ": "birshreshtha", "মুন্সী": "munshi",
  "আব্দুর": "abdur", "রউফ": "rouf", "ভিকারুননিসা": "viquarunnisa",
  "নূন": "noon", "মনিপুর": "manipur", "মিরপুর": "mirpur",
  "রাজউক": "rajuk", "উত্তরা": "uttara", "রাজশাহী": "rajshahi",
  "সেন্ট": "st", "যোসেফ": "joseph", "হলি": "holy", "ক্রস": "cross",
  "বালিকা": "girls", "পুলিশ": "police", "লাইন্স": "lines",
  "বগুড়া": "bogra", "বাংলাদেশ": "bangladesh", "নৌবাহিনী": "navy",
  "বিএএফ": "baf", "শাহীন": "shaheen",
  "গবর্নমেন্ট": "government", "ল্যাবরেটরি": "laboratory",
  "গভঃ": "government", "ল্যাবরেটরী": "laboratory", "হাই": "high",
  "ময়মনসিংহ": "mymensingh", "ক্যামব্রিয়ান": "cambrian",
  "কুমিল্লা": "cumilla", "পাবনা": "pabna", "ফেনী": "feni",
  "মির্জাপুর": "mirzapur", "সিলেট": "sylhet",
  "ঢাকা কলেজিয়েট": "dhaka_collegiate", "ঢাকা কলেজিয়েট": "dhaka_collegiate",
  "চট্টগ্রাম কলেজিয়েট": "chattogram_collegiate",
};

function romanizeSchoolName(source) {
  // Remove year
  const withoutYear = source.replace(/[\d০-৯]{4}/g, "").trim();
  // Try simple transliteration
  let result = withoutYear;
  for (const [bn, en] of Object.entries(BN_TO_EN)) {
    result = result.replace(new RegExp(bn, "g"), en);
  }
  // Remove remaining Bengali
  result = result.replace(/[\u0980-\u09FF]/g, "").replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_|_$/g, "").toLowerCase().slice(0, 50);
  if (!result) result = "school";
  return result;
}

function generateTopics(subjectId, entries) {
  const boardByYear = {};
  const schoolByYear = {};
  const allBoardsByYear = {};
  const combinedByYear = {};

  for (const e of entries) {
    const year = extractYear(e.source);
    if (!year) continue;

    if (isAllBoards(e.source)) {
      if (!allBoardsByYear[year]) allBoardsByYear[year] = [];
      allBoardsByYear[year].push(e);
      continue;
    }

    if (isSchoolExam(e.source)) {
      if (!schoolByYear[year]) schoolByYear[year] = [];
      schoolByYear[year].push(e);
      continue;
    }

    if (isCombinedMultiBoard(e.source)) {
      if (!combinedByYear[year]) combinedByYear[year] = [];
      combinedByYear[year].push(e);
      continue;
    }

    // Regular board exam
    if (!boardByYear[year]) boardByYear[year] = [];
    boardByYear[year].push(e);
  }

  const topics = [];

  // Get all years involved
  const allYears = new Set([
    ...Object.keys(boardByYear),
    ...Object.keys(allBoardsByYear),
    ...Object.keys(combinedByYear),
  ]);
  const sortedYears = [...allYears].sort((a, b) => parseInt(b) - parseInt(a));

  for (const year of sortedYears) {
    const boards = boardByYear[year] || [];
    const allBoardEntries = allBoardsByYear[year] || [];
    const combinedEntries = combinedByYear[year] || [];

    const chapters = [];

    // Group regular boards
    const grouped = {};
    for (const e of boards) {
      const prefix = toEnglishBoard(e.source);
      if (!grouped[prefix]) grouped[prefix] = [];
      grouped[prefix].push(e);
    }

    const sortedPrefixes = Object.keys(grouped).sort(
      (a, b) => BOARD_ORDER.indexOf(a) - BOARD_ORDER.indexOf(b)
    );

    for (const prefix of sortedPrefixes) {
      for (const e of grouped[prefix]) {
        const bnName = e.source;
        const enName = BOARD_ORDER.includes(prefix)
          ? prefix.charAt(0).toUpperCase() + prefix.slice(1) + " Board " + year
          : bnName;
        chapters.push({
          id: `${subjectId}_board_${prefix}_${year}`,
          name: enName,
          name_bn: bnName,
          file: `/ssc/${subjectId}/${e.jsonFile}`,
        });
      }
    }

    // Deduplicate board chapter IDs (e.g., মাদ্রাসা বোর্ড ২০২৬ and মাদ্রাসা বোর্ড ২০২৬ (অনিয়মিত))
    const seenBoard = {};
    for (const ch of chapters) {
      if (seenBoard[ch.id]) {
        let counter = 2;
        while (seenBoard[`${ch.id}_${counter}`]) counter++;
        ch.id = `${ch.id}_${counter}`;
      }
      seenBoard[ch.id] = true;
    }

    // Combined multi-board entries (like agriculture 2022)
    for (const e of combinedEntries) {
      chapters.push({
        id: `${subjectId}_board_all_combined_${year}`,
        name: `All Boards ${year} Combined`,
        name_bn: e.source,
        file: `/ssc/${subjectId}/${e.jsonFile}`,
      });
    }

    // All-boards combined entry
    for (const e of allBoardEntries) {
      chapters.push({
        id: `${subjectId}_board_all_${year}`,
        name: `All Boards ${year} Combined`,
        name_bn: `সকল বোর্ড ${toBnDigits(year)}`,
        file: `/ssc/${subjectId}/${e.jsonFile}`,
      });
    }

    if (chapters.length > 0) {
      topics.push({
        id: `${subjectId}_board_${year}`,
        name: `Board Exams ${year}`,
        name_bn: `বোর্ড পরীক্ষা ${toBnDigits(year)}`,
        name_en: `Board Exams ${year}`,
        chapters,
      });
    }
  }

  // School topics (newest first)
  const sortedSchoolYears = Object.keys(schoolByYear).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  for (const year of sortedSchoolYears) {
    const chapters = schoolByYear[year].map((e, idx) => {
      const src = e.source;
      const romanized = romanizeSchoolName(src);
      const idSuffix = romanized || `file${e.fileNum}`;
      return {
        id: `${subjectId}_school_${idSuffix}_${year}`,
        name: src,
        name_bn: src,
        file: `/ssc/${subjectId}/${e.jsonFile}`,
      };
    });

    // Deduplicate: add numeric suffix to duplicate IDs
    const seen = {};
    for (const ch of chapters) {
      if (seen[ch.id]) {
        let counter = 2;
        while (seen[`${ch.id}_${counter}`]) counter++;
        ch.id = `${ch.id}_${counter}`;
      }
      seen[ch.id] = true;
    }

    topics.push({
      id: `${subjectId}_school_${year}`,
      name: `School & College Exams ${year}`,
      name_bn: `স্কুল ও কলেজ পরীক্ষা ${toBnDigits(year)}`,
      name_en: `School & College Exams ${year}`,
      chapters,
    });
  }

  return topics;
}

// Generate for general_science
const gsEntries = parseMapping("D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\general_science\\_mapping.txt");
const gsTopics = generateTopics("general_science", gsEntries);

// Generate for agriculture
const agEntries = parseMapping("D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\agriculture\\_mapping.txt");
const agTopics = generateTopics("agriculture", agEntries);

// Generate for islam
const islamEntries = parseMapping("D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\islam\\_mapping.txt");
const islamTopics = generateTopics("islam", islamEntries);

// Generate for math
const mathEntries = parseMapping("D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\math\\_mapping.txt");
const mathTopics = generateTopics("math", mathEntries);

// Count check
function countChapters(topics) {
  let c = 0;
  for (const t of topics) c += t.chapters.length;
  return c;
}
const gsCount = countChapters(gsTopics);
const agCount = countChapters(agTopics);
const islamCount = countChapters(islamTopics);
const mathCount = countChapters(mathTopics);

// Validate no Bengali in IDs
const idErrors = [];
function checkIds(obj, path) {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => checkIds(item, `${path}[${i}]`));
    } else {
      for (const [key, val] of Object.entries(obj)) {
        if (key === "id" && /[\u0980-\u09FF]/.test(val)) {
          idErrors.push(`${path}.id = "${val}"`);
        }
        checkIds(val, `${path}.${key}`);
      }
    }
  }
}
checkIds(gsTopics, "gs");
checkIds(agTopics, "ag");
checkIds(islamTopics, "islam");
checkIds(mathTopics, "math");

// Check for duplicate IDs
function findDuplicateIds(topics) {
  const seen = {};
  const dupes = [];
  function walk(obj) {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(walk);
      } else {
        if (obj.id) {
          if (seen[obj.id]) dupes.push(obj.id);
          else seen[obj.id] = true;
        }
        for (const val of Object.values(obj)) walk(val);
      }
    }
  }
  walk(topics);
  return dupes;
}

const gsDupes = findDuplicateIds(gsTopics);
const agDupes = findDuplicateIds(agTopics);
const islamDupes = findDuplicateIds(islamTopics);
const mathDupes = findDuplicateIds(mathTopics);

const result = {
  general_science_topics: gsTopics,
  agriculture_topics: agTopics,
  islam_topics: islamTopics,
  math_topics: mathTopics,
  gs_count: gsCount,
  ag_count: agCount,
  islam_count: islamCount,
  math_count: mathCount,
  gs_dupes: gsDupes,
  ag_dupes: agDupes,
  islam_dupes: islamDupes,
  math_dupes: mathDupes,
  id_errors: idErrors,
};

fs.writeFileSync("D:\\Tanvir Mahfuz\\80-20-exam\\scripts\\generated_topics.json", JSON.stringify(result, null, 2), "utf8");

// Print summary
console.log("GENERAL SCIENCE: " + gsCount + " files in " + gsTopics.length + " topics");
console.log("AGRICULTURE: " + agCount + " files in " + agTopics.length + " topics");
console.log("ISLAM: " + islamCount + " files in " + islamTopics.length + " topics");
console.log("MATH: " + mathCount + " files in " + mathTopics.length + " topics");
if (idErrors.length > 0) console.log("ID ERRORS: " + idErrors.length);
if (gsDupes.length > 0) console.log("GS DUPLICATE IDs: " + gsDupes.join(", "));
if (agDupes.length > 0) console.log("AG DUPLICATE IDs: " + agDupes.join(", "));
if (islamDupes.length > 0) console.log("ISLAM DUPLICATE IDs: " + islamDupes.join(", "));
if (mathDupes.length > 0) console.log("MATH DUPLICATE IDs: " + mathDupes.join(", "));
