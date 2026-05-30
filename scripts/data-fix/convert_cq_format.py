import json

def convert_cq(bn_path, en_path):
    # Convert Bengali CQs
    with open(bn_path) as f:
        bn_cq = json.load(f)
    
    for cq in bn_cq:
        for sq in cq.get('questions', []):
            if 'options' in sq and 'answer' in sq:
                correct_key = sq['answer']
                correct_text = sq['options'].get(correct_key, '')
                explanation = sq.get('explanation', '') or sq.get('explanation_bn', '')
                
                # Use correct option text as model_answer (it IS the full answer for CQs)
                # For original CQs (7), the correct option is short, add explanation
                # For new CQs (4), the correct option is already the full answer
                if correct_text:
                    sq['model_answer'] = correct_text
                    if explanation and len(correct_text) < 80:
                        sq['model_answer'] = f"{correct_text}\n\n{explanation}"
                elif explanation:
                    sq['model_answer'] = explanation
                else:
                    sq['model_answer'] = ''
                
                del sq['options']
                del sq['answer']
                if 'explanation' in sq:
                    del sq['explanation']
                if 'explanation_bn' in sq:
                    del sq['explanation_bn']
                if 'explanation_en' in sq:
                    del sq['explanation_en']
    
    with open(bn_path, 'w') as f:
        json.dump(bn_cq, f, ensure_ascii=False, indent=2)
    print(f'Converted {len(bn_cq)} Bengali CQs')
    
    # Convert English CQs
    with open(en_path) as f:
        en_cq = json.load(f)
    
    for cq in en_cq:
        for sq in cq.get('questions', []):
            if 'options' in sq and 'answer' in sq:
                correct_key = sq['answer']
                correct_text = sq['options'].get(correct_key, '')
                explanation = sq.get('explanation', '') or sq.get('explanation_en', '')
                
                if correct_text:
                    sq['model_answer'] = correct_text
                    if explanation and len(correct_text) < 80:
                        sq['model_answer'] = f"{correct_text}\n\n{explanation}"
                elif explanation:
                    sq['model_answer'] = explanation
                else:
                    sq['model_answer'] = ''
                
                del sq['options']
                del sq['answer']
                if 'explanation' in sq:
                    del sq['explanation']
                if 'explanation_bn' in sq:
                    del sq['explanation_bn']
                if 'explanation_en' in sq:
                    del sq['explanation_en']
    
    with open(en_path, 'w') as f:
        json.dump(en_cq, f, ensure_ascii=False, indent=2)
    print(f'Converted {len(en_cq)} English CQs')

convert_cq(
    'public/hsc/production_1st/chapter_1_cq.json',
    'public/hsc/production_1st/english/chapter_1_cq.json'
)
