#!/usr/bin/env python3
"""Extract MCQs + CQs from chapters 2-5 MD, merge with existing JSONs, write output."""
import re, json, os

BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

def load_json(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def normalize_qtext(text):
    return ' '.join(text.strip().split())

def build_text_lookup(items):
    lookup = {}
    for item in items:
        key = normalize_qtext(item.get('question', ''))
        if key:
            lookup[key] = item
    return lookup

# -----------------------------------------------------------------------
# MCQ Parsers
# -----------------------------------------------------------------------

def parse_mcq_bold_bangla(lines, start):
    """**{bnum}.{text}** format — chapters 2, 5"""
    mcqs = []
    i = start
    while i < len(lines):
        line = lines[i].rstrip('\n')
        if not line.strip() or line.startswith('#') or 'সাধারণ বহুনির্বাচনি' in line:
            i += 1
            continue
        if 'বোর্ড পরীক্ষার' in line:
            i += 1
            continue
        m = re.match(r'\*\*([০১২৩৪৫৬৭৮৯]+)\.\*\*\s*(.*)', line)
        if not m:
            i += 1
            continue
        qtext = m.group(2).strip()
        options = []
        j = i + 1
        while j < len(lines):
            nxt = lines[j].rstrip('\n')
            if not nxt.strip():
                j += 1
                continue
            if re.match(r'\*\*[০১২৩৪৫৬৭৮৯]+\.\*\*', nxt):
                break
            if 'বোর্ড পরীক্ষার' in nxt or nxt.startswith('#'):
                break
            for part in re.split(r'\s{2,}', nxt):
                part = part.strip()
                om = re.match(r'[কখগঘ]\.\s*(.*)', part)
                if om:
                    options.append(om.group(1).strip())
            if len(options) >= 4:
                j += 1
                break
            j += 1
        mcqs.append({'question': qtext, 'options': options[:4]})
        i = j
    return mcqs


def parse_mcq_plain_bangla(lines, start):
    """{bnum}. format — chapter 3"""
    mcqs = []
    i = start
    while i < len(lines):
        line = lines[i].rstrip('\n')
        if not line.strip() or line.startswith('#'):
            i += 1
            continue
        if 'বহুনির্বাচনি' in line or 'বোর্ড পরীক্ষার' in line or 'সাধারণ' in line or 'উদ্দীপকভিত্তিক' in line:
            i += 1
            continue
        m = re.match(r'\s*([০১২৩৪৫৬৭৮৯]+)\.\s*(.*)', line)
        if not m:
            i += 1
            continue
        qtext = m.group(2).strip()
        options = []
        j = i + 1
        while j < len(lines):
            nxt = lines[j].rstrip('\n')
            if not nxt.strip():
                j += 1
                continue
            if re.match(r'\s*[০১২৩৪৫৬৭৮৯]+\.', nxt):
                break
            if nxt.startswith('#') or 'বোর্ড পরীক্ষার' in nxt:
                break
            for part in re.split(r'\s{2,}', nxt):
                part = part.strip()
                om = re.match(r'[কখগঘ]\)?\s*(.*)', part)
                if om:
                    options.append(om.group(1).strip())
            if len(options) >= 4:
                j += 1
                break
            j += 1
        mcqs.append({'question': qtext, 'options': options[:4]})
        i = j
    return mcqs


def parse_mcq_ascii(lines, start):
    """{n}. format — chapter 4"""
    mcqs = []
    i = start
    while i < len(lines):
        line = lines[i].rstrip('\n')
        if not line.strip() or line.startswith('#'):
            i += 1
            continue
        if 'বহুনির্বাচনি' in line or 'বোর্ড পরীক্ষার' in line or 'সাধারণ' in line:
            i += 1
            continue
        m = re.match(r'\s*(\d+)\.\s*(.*)', line)
        if not m:
            i += 1
            continue
        qtext = m.group(2).strip()
        options = []
        j = i + 1
        while j < len(lines):
            nxt = lines[j].rstrip('\n')
            if not nxt.strip():
                j += 1
                continue
            if re.match(r'\s*\d+\.', nxt):
                break
            if nxt.startswith('#') or 'বোর্ড পরীক্ষার' in nxt:
                break
            for part in re.split(r'\s{2,}', nxt):
                part = part.strip()
                om = re.match(r'[কখগঘ]\.\s*(.*)', part)
                if om:
                    options.append(om.group(1).strip())
            if len(options) >= 4:
                j += 1
                break
            j += 1
        mcqs.append({'question': qtext, 'options': options[:4]})
        i = j
    return mcqs


# -----------------------------------------------------------------------
# CQ Parsers
# -----------------------------------------------------------------------

def parse_cqs_generic(lines):
    """Parse CQs — handles bold (**প্রশ্ন-X.**) and heading (#### প্রশ্ন-X) formats."""
    cqs = []
    current_cq = None
    current_sub = None
    in_answer = False
    
    for line in lines:
        s = line.strip()
        if not s:
            continue
        
        # Heading format: #### প্রশ্ন-๑  or ### প্রশ্ন-১
        hm = re.match(r'#{1,4}\s+প্রশ্ন[-\s]*(\d+)\s*(.*)', s)
        if hm:
            if current_cq:
                if current_sub:
                    current_cq['questions'].append(current_sub)
                    current_sub = None
                cqs.append(current_cq)
            current_cq = {'stem': hm.group(2).strip(), 'questions': []}
            current_sub = None
            in_answer = False
            continue
        
        # Bold format: **প্রশ্ন-১.** text
        bm = re.match(r'\*\*প্রশ্ন[-\s]*(\d+)[\.\)]\s*\*\*(.*)', s)
        if bm:
            if current_cq:
                if current_sub:
                    current_cq['questions'].append(current_sub)
                    current_sub = None
                cqs.append(current_cq)
            current_cq = {'stem': bm.group(2).strip(), 'questions': []}
            current_sub = None
            in_answer = False
            continue
        
        if current_cq is None:
            continue
        
        # Sub-question: **ক.** text  or **ক)** text or **ক.**text
        sm = re.match(r'\*?\*?[কখগঘ][\.\)]?\*?\*?\s*(.*)', s)
        if sm and len(s) < 100:
            st = sm.group(1).strip()
            if current_sub:
                current_cq['questions'].append(current_sub)
            current_sub = {'question': st, 'model_answer': ''}
            in_answer = False
            continue
        
        # Answer: > **উত্তর:** text  or **উত্তর:** text
        if 'উত্তর' in s and ('> **উত্তর' in s or '**উত্তর:**' in s or '**উত্তর :' in s):
            in_answer = True
            ans = re.sub(r'^>\s*\*?\*?উত্তর\s*:?\*?\*?\s*', '', s)
            if current_sub:
                current_sub['model_answer'] = ans
            continue
        
        # Continuation of answer
        if in_answer and current_sub:
            current_sub['model_answer'] += '\n' + s
            continue
        
        # Continuation of stem or sub question
        if current_sub:
            current_sub['question'] += ' ' + s
        elif current_cq:
            current_cq['stem'] += ' ' + s
    
    if current_cq:
        if current_sub:
            current_cq['questions'].append(current_sub)
        cqs.append(current_cq)
    
    return cqs


# -----------------------------------------------------------------------
# Chapter definitions
# -----------------------------------------------------------------------

CHAPTERS = [
    {
        'num': 2,
        'md': 'docs/hsc/production1st/chap2.md',
        'bn': 'public/hsc/production_1st/chapter_2.json',
        'en': 'public/hsc/production_1st/english/chapter_2.json',
        'cq_bn': 'public/hsc/production_1st/chapter_2_cq.json',
        'cq_en': 'public/hsc/production_1st/english/chapter_2_cq.json',
        'mcq_parser': 'bold_bangla',
        'cq_id_start': 12,
    },
    {
        'num': 3,
        'md': 'docs/hsc/production1st/chap3.md',
        'bn': 'public/hsc/production_1st/chapter_3.json',
        'en': 'public/hsc/production_1st/english/chapter_3.json',
        'cq_bn': 'public/hsc/production_1st/chapter_3_cq.json',
        'cq_en': 'public/hsc/production_1st/english/chapter_3_cq.json',
        'mcq_parser': 'plain_bangla',
        'cq_id_start': 15,
    },
    {
        'num': 4,
        'md': 'docs/hsc/production1st/chap4.md',
        'bn': 'public/hsc/production_1st/chapter_4.json',
        'en': 'public/hsc/production_1st/english/chapter_4.json',
        'cq_bn': 'public/hsc/production_1st/chapter_4_cq.json',
        'cq_en': 'public/hsc/production_1st/english/chapter_4_cq.json',
        'mcq_parser': 'ascii',
        'cq_id_start': 18,
    },
    {
        'num': 5,
        'md': 'docs/hsc/production1st/chap5.md',
        'bn': 'public/hsc/production_1st/chapter_5.json',
        'en': 'public/hsc/production_1st/english/chapter_5.json',
        'cq_bn': 'public/hsc/production_1st/chapter_5_cq.json',
        'cq_en': 'public/hsc/production_1st/english/chapter_5_cq.json',
        'mcq_parser': 'bold_bangla',
        'cq_id_start': 21,
    },
]

PARSERS = {
    'bold_bangla': parse_mcq_bold_bangla,
    'plain_bangla': parse_mcq_plain_bangla,
    'ascii': parse_mcq_ascii,
}


# -----------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------

def main():
    for ch in CHAPTERS:
        ch_num = ch['num']
        print(f"\n{'='*60}")
        print(f"  CHAPTER {ch_num}")
        print(f"{'='*60}")
        
        # ---- MCQs ----
        with open(ch['md']) as f:
            lines = f.readlines()
        
        mcq_start = None
        for i, line in enumerate(lines):
            if 'বহুনির্বাচনি প্রশ্ন' in line:
                mcq_start = i + 1
                break
        
        if mcq_start:
            parser = PARSERS[ch['mcq_parser']]
            new_mcqs = parser(lines, mcq_start)
            print(f"  MCQs extracted from MD: {len(new_mcqs)}")
        else:
            new_mcqs = []
            print(f"  WARNING: No MCQ section found!")
        
        # Load existing
        existing_bn = load_json(ch['bn'])
        existing_en = load_json(ch['en'])
        print(f"  Existing JSON: BN={len(existing_bn)} EN={len(existing_en)}")
        
        # Merge
        bn_lookup = build_text_lookup(existing_bn)
        added = 0
        dup = 0
        new_entries = []
        for m in new_mcqs:
            key = normalize_qtext(m['question'])
            if key in bn_lookup:
                dup += 1
                continue
            opt_keys = ['A', 'B', 'C', 'D']
            item = {
                'question': m['question'],
                'options': {k: m['options'][i] if i < len(m['options']) else '' for i, k in enumerate(opt_keys)},
                'answer': '',
                'explanation': '',
                'source': 'Textbook'
            }
            existing_bn.append(item)
            new_entries.append(item)
            added += 1
        
        # Clean up ordering
        for idx, item in enumerate(existing_bn):
            item['id'] = idx + 1
        
        print(f"  Added: {added}, Duplicates: {dup}")
        print(f"  Total Bengali MCQs: {len(existing_bn)}")
        
        save_json(ch['bn'], existing_bn)
        print(f"  ✓ Saved: {ch['bn']}")
        
        # ---- English MCQs ----
        # Only add English placeholders for genuinely NEW Bengali items
        # (items that were merged in from the MD, not the original 36-47)
        en_added = 0
        for item in new_entries:
            opt_keys = ['A', 'B', 'C', 'D']
            en_item = {
                'question': item['question'],
                'options': item['options'].copy(),
                'answer': '',
                'explanation': '',
                'source': 'Textbook'
            }
            existing_en.append(en_item)
            en_added += 1
        
        for idx, item in enumerate(existing_en):
            item['id'] = idx + 1
        
        print(f"  English entries: {len(existing_en)} (new English placeholders: {en_added})")
        save_json(ch['en'], existing_en)
        
        # ---- CQs ----
        cq_start = None
        mcq_header = None
        for i, line in enumerate(lines):
            if 'সৃজনশীল নমুনা প্রশ্নোত্তর' in line:
                cq_start = i
            if cq_start and 'বহুনির্বাচনি প্রশ্ন' in line:
                mcq_header = i
                break
        
        if cq_start and mcq_header and mcq_header > cq_start:
            cq_lines = lines[cq_start:mcq_header]
            raw_cqs = parse_cqs_generic(cq_lines)
            
            # Build CQ JSON
            cq_items = []
            cq_counter = 0
            for raw in raw_cqs:
                if not raw.get('questions'):
                    continue
                cq_counter += 1
                cq_id = ch['cq_id_start'] + cq_counter - 1
                labels = ['ক', 'খ', 'গ', 'ঘ']
                questions_out = []
                for qi, sub in enumerate(raw['questions']):
                    label = labels[qi] if qi < len(labels) else str(qi + 1)
                    questions_out.append({
                        'label': label,
                        'question': sub['question'].strip(),
                        'model_answer': sub['model_answer'].strip()
                    })
                
                cq_items.append({
                    '_type': 'creative_question',
                    'id': f'hsc_prod1_cq_{cq_id}',
                    'stem': raw['stem'].strip(),
                    'stem_label': 'Read the stimulus and answer the following questions',
                    'questions': questions_out
                })
            
            save_json(ch['cq_bn'], cq_items)
            
            # Create English CQ placeholder (same structure, Bengali text — translate later)
            save_json(ch['cq_en'], cq_items)
            
            print(f"  CQs: {len(cq_items)} extracted → saved")
        else:
            print(f"  CQs: NOT FOUND (cq_start={cq_start}, mcq_header={mcq_header})")


if __name__ == '__main__':
    main()
