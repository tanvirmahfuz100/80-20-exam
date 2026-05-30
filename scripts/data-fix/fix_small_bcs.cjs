const fs = require('fs');

// === bcs_37.json ===
let q = JSON.parse(fs.readFileSync('public/bcs/bcs_37.json', 'utf8'));
q.forEach(item => {
  if (item.id === 152) item.explanation = 'TCP (Transmission Control Protocol) একটি যোগাযোগ প্রোটোকল যা ডেটা ট্রান্সমিশন নিয়ন্ত্রণ করে। এটি ইন্টারনেটের মৌলিক প্রোটোকলগুলোর একটি।';
  if (item.id === 165) item.explanation = 'বৃত্তের জ্যা-এর দৈর্ঘ্য নির্ণয়ের জন্য জ্যামিতিক সূত্র ব্যবহার করতে হয়। ব্যাসার্ধ ও জ্যা-এর অর্ধেকের সাথে কেন্দ্র থেকে লম্ব দূরত্বের সম্পর্ক পিথাগোরাসের উপপাদ্য দ্বারা নির্ণয় করা যায়।';
});
fs.writeFileSync('public/bcs/bcs_37.json', JSON.stringify(q, null, 2), 'utf8');

// === bcs_41.json ===
q = JSON.parse(fs.readFileSync('public/bcs/bcs_41.json', 'utf8'));
q.forEach(item => {
  if (item.id === 70) item.explanation = 'সার্বভৌম (Sovereign) বলতে একজন সর্বোচ্চ শাসককে বোঝায়, যা রাজা বা সম্রাটের মতো পুরুষ অথবা রাণীর মতো নারী হতে পারে। প্রদত্ত অপশনগুলোর মধ্যে এটি সবচেয়ে ছোট সংখ্যা নয় বরং ক্ষমতার সর্বোচ্চ স্তর নির্দেশ করে।';
});
fs.writeFileSync('public/bcs/bcs_41.json', JSON.stringify(q, null, 2), 'utf8');

// === bcs_44.json ===
q = JSON.parse(fs.readFileSync('public/bcs/bcs_44.json', 'utf8'));
q.forEach(item => {
  if (item.id === 43) item.explanation = '"আমার সন্তান যেন থাকে দুধেভাতে" - এই মনোবাঞ্ছাটি জ্ঞানদা সুন্দরী দেবীর। এটি তার সন্তানের প্রতি মমতা ও আশীর্বাদ প্রকাশ করে।';
});
fs.writeFileSync('public/bcs/bcs_44.json', JSON.stringify(q, null, 2), 'utf8');

// === bcs_45.json ===
q = JSON.parse(fs.readFileSync('public/bcs/bcs_45.json', 'utf8'));
q.forEach(item => {
  if (item.id === 61) item.explanation = 'এখানে "ওর" বলতে লেখকের ভাই বুদ্ধদেব বসুকে বোঝানো হয়েছে। জীবনানন্দ দাশের আত্মজীবনীমূলক রচনায় এই উল্লেখ পাওয়া যায়।';
});
fs.writeFileSync('public/bcs/bcs_45.json', JSON.stringify(q, null, 2), 'utf8');

// === bcs_48_1.json ===
q = JSON.parse(fs.readFileSync('public/bcs/bcs_48_1.json', 'utf8'));
q.forEach(item => {
  if (item.id === 39) item.explanation = 'A=1, B=2, ..., P=16, T=20 ধরে TAP = 20+1+16 = 37। একইভাবে CUP = 3+21+16 = 40। এটি ইংরেজি বর্ণমালার অবস্থান ভিত্তিক সংখ্যা নির্ণয় পদ্ধতি।';
});
fs.writeFileSync('public/bcs/bcs_48_1.json', JSON.stringify(q, null, 2), 'utf8');

console.log('Small files done.');
