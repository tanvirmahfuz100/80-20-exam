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

// Validate file counts
let gsChapters = 0;
for (const t of gsSubject.topics) gsChapters += t.chapters.length;
let agChapters = 0;
for (const t of agSubject.topics) agChapters += t.chapters.length;

if (gsChapters !== 97) {
  console.error(`ERROR: Expected 97 GS chapters, got ${gsChapters}`);
  process.exit(1);
}
if (agChapters !== 68) {
  console.error(`ERROR: Expected 68 AG chapters, got ${agChapters}`);
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
if (gsDupes.length > 0) {
  console.error("GS duplicate IDs:", gsDupes);
  process.exit(1);
}
if (agDupes.length > 0) {
  console.error("AG duplicate IDs:", agDupes);
  process.exit(1);
}

// Validate all file paths exist
function validatePaths(topics, subjectId) {
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

const gsMissing = validatePaths(gsSubject.topics, "general_science");
const agMissing = validatePaths(agSubject.topics, "agriculture");

if (gsMissing.length > 0) {
  console.error("GS missing files:", gsMissing);
  process.exit(1);
}
if (agMissing.length > 0) {
  console.error("AG missing files:", agMissing);
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
