import fs from "fs";

function readJSON(path) {
  let content = fs.readFileSync(path, "utf8");
  // Strip BOM if present
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  return JSON.parse(content);
}

// Read generated topics
const generated = readJSON("D:\\Tanvir Mahfuz\\80-20-exam\\scripts\\generated_topics.json");

// Read index.json
const index = readJSON("D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json");

// Find and replace general_science topics
const gsSubject = index.subjects.find((s) => s.id === "general_science");
if (!gsSubject) {
  console.error("ERROR: general_science subject not found in index.json");
  process.exit(1);
}
gsSubject.topics = generated.general_science_topics;

// Find and replace agriculture topics
const agSubject = index.subjects.find((s) => s.id === "agriculture");
if (!agSubject) {
  console.error("ERROR: agriculture subject not found in index.json");
  process.exit(1);
}
agSubject.topics = generated.agriculture_topics;

// Find and replace islam topics
let islamSubject = index.subjects.find((s) => s.id === "islam");
if (!islamSubject) {
  // Add new islam subject entry
  islamSubject = {
    id: "islam",
    name: "ইসলাম শিক্ষা",
    icon: "BookHeart",
    name_en: "Islam Education",
    name_bn: "ইসলাম শিক্ষা",
    topics: generated.islam_topics,
  };
  // Insert after agriculture (find its index)
  const agIdx = index.subjects.findIndex((s) => s.id === "agriculture");
  index.subjects.splice(agIdx + 1, 0, islamSubject);
} else {
  islamSubject.topics = generated.islam_topics;
}

// Validate file counts
function countChapters(subj) {
  let c = 0;
  for (const t of subj.topics) c += t.chapters.length;
  return c;
}
const gsChapters = countChapters(gsSubject);
const agChapters = countChapters(agSubject);
const islamChapters = countChapters(islamSubject);

if (gsChapters !== 97) {
  console.error(`ERROR: Expected 97 GS chapters, got ${gsChapters}`);
  process.exit(1);
}
if (agChapters !== 68) {
  console.error(`ERROR: Expected 68 AG chapters, got ${agChapters}`);
  process.exit(1);
}
if (islamChapters !== 91) {
  console.error(`ERROR: Expected 91 Islam chapters, got ${islamChapters}`);
  process.exit(1);
}

// Validate no duplicate IDs
function findDuplicateIds(topics) {
  const seen = {};
  const dupes = [];
  function walk(obj) {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) { obj.forEach(walk); }
      else {
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

const gsDupes = findDuplicateIds(gsSubject.topics);
const agDupes = findDuplicateIds(agSubject.topics);
const islamDupes = findDuplicateIds(islamSubject.topics);
if (gsDupes.length > 0) {
  console.error("GS duplicate IDs:", gsDupes);
  process.exit(1);
}
if (agDupes.length > 0) {
  console.error("AG duplicate IDs:", agDupes);
  process.exit(1);
}
if (islamDupes.length > 0) {
  console.error("Islam duplicate IDs:", islamDupes);
  process.exit(1);
}

// Validate all file paths exist
function validatePaths(topics) {
  const missing = [];
  for (const t of topics) {
    for (const c of t.chapters) {
      const fullPath = `D:\\Tanvir Mahfuz\\80-20-exam\\public${c.file}`;
      if (!fs.existsSync(fullPath)) {
        missing.push(c.file);
      }
    }
  }
  return missing;
}

const gsMissing = validatePaths(gsSubject.topics);
const agMissing = validatePaths(agSubject.topics);
const islamMissing = validatePaths(islamSubject.topics);

if (gsMissing.length > 0) {
  console.error("GS missing files:", gsMissing);
  process.exit(1);
}
if (agMissing.length > 0) {
  console.error("AG missing files:", agMissing);
  process.exit(1);
}
if (islamMissing.length > 0) {
  console.error("Islam missing files:", islamMissing);
  process.exit(1);
}

// Write updated index.json
fs.writeFileSync(
  "D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json",
  JSON.stringify(index, null, 4) + "\n",
  "utf8"
);

console.log("SUCCESS!");
console.log(`GS: ${gsChapters} chapters, 0 missing files, 0 duplicate IDs`);
console.log(`AG: ${agChapters} chapters, 0 missing files, 0 duplicate IDs`);
console.log(`Islam: ${islamChapters} chapters, 0 missing files, 0 duplicate IDs`);
