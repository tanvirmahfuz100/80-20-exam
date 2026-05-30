import json

with open('public/hsc/production_1st/chapter_1.json') as f:
    data = json.load(f)

# Group by question text (exact match)
seen = {}
deduped = []
for q in data:
    text = q['question']
    if text in seen:
        print(f"Removing duplicate: id={q['id']} -> '{text[:60]}'")
        continue
    seen[text] = True
    deduped.append(q)

print(f"Removed {len(data) - len(deduped)} duplicates. Final: {len(deduped)}")

with open('public/hsc/production_1st/chapter_1.json', 'w') as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)
