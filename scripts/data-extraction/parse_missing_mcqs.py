import re, json

with open('docs/hsc_production_chap1.md') as f:
    content = f.read()

# Answer key
answer_key = {}
lines = content.split('\n')
in_answers = False
for line in lines:
    if '### উত্তরমালা' in line:
        in_answers = True
        continue
    if in_answers and '###' in line and 'উত্তরমালা' not in line:
        in_answers = False
        continue
    if in_answers and '|' in line and 'প্রশ্ন' not in line and '---' not in line:
        parts = [p.strip() for p in line.split('|') if p.strip()]
        for i in range(0, len(parts)-1, 2):
            qnum = parts[i]
            ans = parts[i+1]
            if qnum.isdigit():
                answer_key[int(qnum)] = ans

# Bengali letter to option index mapping
bn_letter_map = {'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3}

# Parse questions from both sections
bn_sections = {
    'ক': 'A',
    'খ': 'B',
    'গ': 'C',
    'ঘ': 'D',
}

# Extract questions from the MD using regex
# Pattern: lines like "সংখ্যা. question text" followed by "   ক. opt1 &nbsp;&nbsp; খ. opt2 &nbsp;&nbsp; গ. opt3 &nbsp;&nbsp; **ঘ. opt4**"

new_questions = []
current_id = 101  # Start from after existing 100

# Parse line by line
i = 0
in_mcq_section = False
current_q = None

while i < len(lines):
    line = lines[i]
    
    if '### ক. বহুনির্বাচনি প্রশ্ন' in line or '### খ. বোর্ড পরীক্ষার বহুনির্বাচনি প্রশ্ন' in line or '### উত্তরমালা' in line or '### গ. সংক্ষিপ্ত প্রশ্ন' in line:
        in_mcq_section = ('বহুনির্বাচনি' in line)
    
    if not in_mcq_section:
        i += 1
        continue
    
    # Check if line starts with a number and period (question stem)
    m = re.match(r'^\s*(\d+)[.、]\s*(.*)', line)
    if m:
        qnum = int(m.group(1))
        qtext = m.group(2).strip()
        
        # Next lines should have options (4 lines, one per option)
        # But options may be on a single line like: "   ক. opt &nbsp;&nbsp; খ. opt &nbsp;&nbsp; গ. opt &nbsp;&nbsp; **ঘ. opt**"
        # Or spread across multiple lines
        
        # Read the next few lines for options
        options_raw = {}
        while i + 1 < len(lines):
            next_line = lines[i + 1]
            # Check if next line is a question number
            if re.match(r'^\s*\d+[.、]', next_line):
                break
            if '###' in next_line:
                break
            
            # Extract options from this line: ক. text or ख. text etc.
            for bn_letter in ['ক', 'খ', 'গ', 'ঘ']:
                opt_m = re.search(rf'{bn_letter}[.．]\s*(.*?)(?=\s*(?:ক[.．]|খ[.．]|গ[.．]|ঘ[.．]|$))', next_line)
                if opt_m:
                    opt_text = opt_m.group(1).strip()
                    # Clean up
                    opt_text = re.sub(r'&nbsp;', '', opt_text).strip()
                    opt_text = re.sub(r'\*\*', '', opt_text).strip()
                    if opt_text and bn_letter not in options_raw:
                        options_raw[bn_letter] = opt_text
            
            i += 1
            
            # If we have all 4 options, break
            if len(options_raw) == 4:
                break
        
        if qnum in answer_key and len(options_raw) == 4:
            correct_bn = answer_key[qnum]
            correct_idx = bn_letter_map.get(correct_bn, 0)
            
            # Convert to A, B, C, D format
            options_dict = {}
            for idx, bn_l in enumerate(['ক', 'খ', 'গ', 'ঘ']):
                opt_key = ['A', 'B', 'C', 'D'][idx]
                options_dict[opt_key] = options_raw.get(bn_l, '')
            
            new_questions.append({
                'id': current_id,
                'question': qtext,
                'options': options_dict,
                'answer': ['A', 'B', 'C', 'D'][correct_idx],
                'correct': correct_idx,
                'explanation': '',
                'source': 'Practice' if qnum <= 36 else 'Board',
                'difficulty': 'medium'
            })
            current_id += 1
    
    i += 1

# Write to output
with open('public/hsc/production_1st/chapter_1.json') as f:
    existing = json.load(f)

existing.extend(new_questions)
print(f"Added {len(new_questions)} new MCQs. Total: {len(existing)}")

with open('public/hsc/production_1st/chapter_1.json', 'w') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)
