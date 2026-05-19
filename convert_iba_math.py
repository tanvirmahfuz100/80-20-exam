import json, re, os

OPTION_LETTERS = ['A','B','C','D','E','F','G','H']

# Mapping: (docs_file, public_file, chapter_name, id_prefix)
MAPPING = [
    ("docs/iba-average.json", "public/iba/math/algebra_averages.json", "Averages", "math_alg_avg"),
    ("docs/iba-math-ages.json", "public/iba/math/algebra_ages.json", "Ages", "math_alg_age"),
    ("docs/iba-math-basic-operation.json", "public/iba/math/algebra_operations.json", "Basic Operations", "math_alg_ops"),
    ("docs/iba-math-divisibility.json", "public/iba/math/algebra_divisibility.json", "Divisibility Rules", "math_alg_div"),
    ("docs/iba-exponents.json", "public/iba/math/algebra_exponents.json", "Exponents & Roots (Square/Cube)", "math_alg_exp"),
    ("docs/iba-math-fractions.json", "public/iba/math/algebra_fractions.json", "Fractions & Decimals", "math_alg_frac"),
    ("docs/iba-math-inequalities.json", "public/iba/math/algebra_inequalities.json", "Inequalities", "math_alg_ineq"),
    ("docs/iba-math-interest.json", "public/iba/math/algebra_interest.json", "Interest", "math_alg_int"),
    ("docs/iba-math-numbers.json", "public/iba/math/algebra_numbers.json", "Numbers (Integer, Odd/Even, Prime)", "math_alg_num"),
    ("docs/iba-math-percentage.json", "public/iba/math/algebra_percentages.json", "Percentages", "math_alg_pct"),
    ("docs/iba-math-profit-and-loss.json", "public/iba/math/algebra_profit_loss.json", "Profit & Loss", "math_alg_profit"),
    ("docs/iba-math-ratio.json", "public/iba/math/algebra_ratio.json", "Ratio & Proportion", "math_alg_ratio"),
    ("docs/iba-math-real-numbers.json", "public/iba/math/algebra_real_numbers.json", "Real Numbers, Absolute Value & Reciprocals", "math_alg_real"),
    ("docs/iba-math-time-and-distance.json", "public/iba/math/algebra_speed.json", "Distance, Time & Speed", "math_alg_speed"),
]

def fix_json(content):
    """Fix common JSON issues in docs files"""
    # Fix invalid \% escapes
    result = bytearray()
    i = 0
    while i < len(content):
        if content[i] == 0x5C and i+1 < len(content) and content[i+1] == 0x25:
            if i > 0 and content[i-1] == 0x5C:
                result.append(content[i])
            else:
                result.extend(b'\\\\')
            i += 1
            result.append(content[i])
        else:
            result.append(content[i])
        i += 1
    return bytes(result).decode('utf-8')

def letter_to_index(correct_letter):
    """Convert letter (A,B,C,D,E) to 0-based index"""
    if correct_letter in OPTION_LETTERS:
        return OPTION_LETTERS.index(correct_letter)
    try:
        return int(correct_letter) - 1
    except ValueError:
        return 0

def convert_questions(docs_path, public_path, chapter_name, id_prefix):
    """Convert docs questions to public format"""
    
    if not os.path.exists(docs_path):
        print(f"  SKIP: docs file not found: {docs_path}")
        return False
    
    with open(docs_path, 'rb') as f:
        raw = f.read()
    
    content = fix_json(raw)
    
    try:
        docs_data = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"  ERROR: JSON parse error in {docs_path}: {e}")
        return False
    
    if not isinstance(docs_data, list):
        print(f"  ERROR: Expected list in {docs_path}, got {type(docs_data)}")
        return False
    
    # Read existing public file to merge with
    existing_count = 0
    existing_ids = set()
    if os.path.exists(public_path):
        try:
            with open(public_path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            if 'questions' in existing:
                for q in existing['questions']:
                    existing_ids.add(q.get('id', ''))
                existing_count = len(existing['questions'])
        except (json.JSONDecodeError, Exception):
            existing_count = 0
    
    # Convert docs questions to public format
    new_questions = []
    seen_questions = set()
    
    for i, q in enumerate(docs_data):
        qid = f"{id_prefix}_{i+1}"
        
        # Skip if already exists (by question text)
        q_text = q.get('question', '').strip()
        if q_text in seen_questions:
            continue
        seen_questions.add(q_text)
        
        # Use Bengali explanation, or English as fallback
        explanation = q.get('explanation_bn', q.get('explanation_en', ''))
        
        converted = {
            "id": qid,
            "question": q.get('question', ''),
            "options": q.get('options', []),
            "correct": letter_to_index(q.get('correct_option', 'A')),
            "explanation": explanation,
            "difficulty": "medium",
            "chapter_tag": q.get('chapter_tag', ''),
            "source": q.get('source', 'Unknown')
        }
        new_questions.append(converted)
    
    # Filter out duplicates that already exist
    unique_questions = [q for q in new_questions if q['id'] not in existing_ids]
    
    if len(unique_questions) == 0:
        print(f"  SKIP: No new questions to add (existing: {existing_count}, total in docs: {len(docs_data)})")
        return False
    
    # For now, just write the docs questions as new content
    # (this replaces the file entirely)
    output = {
        "subject": "Math",
        "topic": "Algebra",
        "chapter": chapter_name,
        "questions": new_questions
    }
    
    with open(public_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"  WRITTEN: {len(new_questions)} questions to {public_path}")
    return True

def main():
    base_dir = "/media/tanvir/Project/80-20-exam"
    results = []
    
    for doc_rel, pub_rel, chapter, prefix in MAPPING:
        docs_path = os.path.join(base_dir, doc_rel)
        pub_path = os.path.join(base_dir, pub_rel)
        
        print(f"\n{doc_rel}  ->  {pub_rel}")
        ok = convert_questions(docs_path, pub_path, chapter, prefix)
        results.append((doc_rel, pub_rel, ok))
    
    print("\n\n=== SUMMARY ===")
    for doc, pub, ok in results:
        status = "OK" if ok else "SKIP/ERROR"
        print(f"  [{status}] {doc} -> {pub}")

if __name__ == "__main__":
    main()
