import json

with open('public/hsc/production_1st/chapter_1.json') as f:
    bn_data = json.load(f)
with open('public/hsc/production_1st/english/chapter_1.json') as f:
    en_data = json.load(f)

existing_ids = {q['id'] for q in en_data}

# English translations for the 67 new MCQs
translations = {
    102: {"q": "What is surplus associated with in an organization?", "opts": {"A": "Profit", "B": "Loss", "C": "Production", "D": "Cost"}},
    103: {"q": "Which one is a producing organization?", "opts": {"A": "University of Dhaka", "B": "Unilever Company", "C": "BRTC", "D": "Grameenphone"}},
    104: {"q": "This year, due to bumper tomato yield, Mr. Nirob decided to process his tomatoes into sauce. What type of utility is created by Mr. Nirob's activities?", "opts": {"A": "Time", "B": "Place", "C": "Form", "D": "Possession"}},
    105: {"q": "What type of utility is created in a bread factory?", "opts": {"A": "Place", "B": "Form", "C": "Problematic", "D": "Service"}},
    106: {"q": "What type of utility of goods is created through air transport?", "opts": {"A": "Form", "B": "Possession", "C": "Place", "D": "Time"}},
    107: {"q": "What type of utility is created due to change of ownership?", "opts": {"A": "Possession", "B": "Place", "C": "Temporal", "D": "Form"}},
    108: {"q": "What type of utility does a mobile company create?", "opts": {"A": "Service", "B": "Form", "C": "Place", "D": "Ownership"}},
    109: {"q": "What type of utility does warehousing create?", "opts": {"A": "Form", "B": "Time", "C": "Place", "D": "Possession"}},
    110: {"q": "What is created through production?", "opts": {"A": "Money", "B": "Employment", "C": "Competition", "D": "Inflation"}},
    111: {"q": "How many sectors of production are there?", "opts": {"A": "2", "B": "4", "C": "3", "D": "5"}},
    112: {"q": "Mineral exploration, electricity, gas etc. belong to which sector of a country's economy?", "opts": {"A": "Agriculture", "B": "Industry", "C": "Service", "D": "Import"}},
    113: {"q": "Which sector does information and communication technology belong to?", "opts": {"A": "Agricultural", "B": "Industrial", "C": "Construction", "D": "Service"}},
    114: {"q": "Making pots and pans with clay falls under which sector of production?", "opts": {"A": "Agricultural", "B": "Service", "C": "Industrial", "D": "Construction"}},
    115: {"q": "What is not related to value?", "opts": {"A": "Production", "B": "Utility", "C": "Development", "D": "Productivity"}},
    116: {"q": "Which of the following falls under the scope of production?", "opts": {"A": "Distribution", "B": "Inventory control", "C": "Financing", "D": "Promotion"}},
    117: {"q": "What is created in a product through production?", "opts": {"A": "Utility", "B": "Demand", "C": "Time", "D": "Raw materials"}},
    119: {"q": "Mr. Kabir has to buy raw materials worth Tk 8,000 and he produces goods worth Tk 24,000 per month. What is Mr. Kabir's productivity?", "opts": {"A": "16,000", "B": "32,000", "C": "3", "D": "0.3"}},
    120: {"q": "What is expressed through labor productivity?", "opts": {"A": "Labor supply", "B": "Labor efficiency", "C": "Labor production capacity", "D": "Relation between labor and production"}},
    121: {"q": "What role does research and development play in productivity?", "opts": {"A": "Increases", "B": "Makes zero", "C": "Decreases", "D": "Keeps stable"}},
    122: {"q": "Which of the following is a way to increase productivity?", "opts": {"A": "Distribution system", "B": "Storage system", "C": "Packaging", "D": "Research and development"}},
    123: {"q": "What happens when excessive machinery is used in an organization?", "opts": {"A": "Production capacity decreases", "B": "Production capacity increases", "C": "Worker efficiency increases", "D": "Depreciation decreases"}},
    124: {"q": "Efficiency is expressed through which of the following?", "opts": {"A": "Production", "B": "Resources", "C": "Time", "D": "Productivity"}},
    125: {"q": "Which of the following affects productivity?", "opts": {"A": "Technology", "B": "Advertisement", "C": "Population", "D": "Profit"}},
    126: {"q": "What helps in producing new products?", "opts": {"A": "Organizational activities", "B": "Capital supply", "C": "Labor utilization", "D": "Research activities"}},
    127: {"q": "The meaning of production is -", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    128: {"q": "The characteristics of production are -", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    129: {"q": "Utility can be created through -", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    130: {"q": "The importance of productivity is expressed through -", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    131: {"q": "Productivity can be increased through -", "opts": {"A": "i & ii", "B": "ii & iii", "C": "i & iii", "D": "i, ii & iii"}},
    132: {"q": "Ways to increase productivity are -", "opts": {"A": "i & ii", "B": "ii & iii", "C": "i & iii", "D": "i, ii & iii"}},
    133: {"q": "Difference between production and productivity is seen in -", "opts": {"A": "i & ii", "B": "ii & iii", "C": "i & iii", "D": "i, ii & iii"}},
    134: {"q": "To measure machine productivity, we need -", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    135: {"q": "What will Mehedi's yarn production create?", "opts": {"A": "Service", "B": "Utility", "C": "Risk", "D": "Ownership"}},
    136: {"q": "Mehedi's capital problem will be solved with the help of which institution?", "opts": {"A": "i & ii", "B": "i & iii", "C": "ii & iii", "D": "i, ii & iii"}},
    137: {"q": "What is needed to change the form of a product?", "opts": {"A": "Control", "B": "Selling", "C": "Distribution", "D": "Production"}},
    138: {"q": "All economic activities of daily human life depend on which of the following?", "opts": {"A": "Consumption", "B": "Production", "C": "Resources", "D": "Liability"}},
    139: {"q": "What does production mean?", "opts": {"A": "Creating utility", "B": "Exchanging", "C": "Working", "D": "Operating"}},
    140: {"q": "What type of process is production?", "opts": {"A": "Dynamic", "B": "Static", "C": "Continuous", "D": "Slow"}},
    141: {"q": "What is creating utility of a product called?", "opts": {"A": "Production", "B": "Productivity", "C": "Demand", "D": "Supply"}},
    142: {"q": "What does production create?", "opts": {"A": "Consumption", "B": "Utility", "C": "Demand", "D": "Ownership"}},
    143: {"q": "What is the ability to satisfy human wants called?", "opts": {"A": "Utility", "B": "Demand", "C": "Production", "D": "Consumption"}},
    144: {"q": "Which is the direct task of production?", "opts": {"A": "Form utility", "B": "Time utility", "C": "Place utility", "D": "Ownership utility"}},
    145: {"q": "What is exhausting utility through use called?", "opts": {"A": "Consumption", "B": "Luxury", "C": "Production", "D": "Waste"}},
    146: {"q": "When cotton is made into thread and thread into cloth, what type of utility is created?", "opts": {"A": "Place", "B": "Time", "C": "Service", "D": "Form"}},
    147: {"q": "What type of utility does a lawyer's advice create?", "opts": {"A": "Form", "B": "Possession", "C": "Place", "D": "Service"}},
    148: {"q": "Which of the following is included in service utility?", "opts": {"A": "Teaching by teachers", "B": "Mother's affection for child", "C": "Nursing sick parents", "D": "Helping the blind cross the road"}},
    149: {"q": "What type of utility is created when cloth is cut to make a shirt?", "opts": {"A": "Form", "B": "Place", "C": "Time", "D": "Possession"}},
    150: {"q": "What type of utility does buying and selling create?", "opts": {"A": "Form", "B": "Time", "C": "Place", "D": "Possession"}},
    151: {"q": "What type of utility does transportation create?", "opts": {"A": "Form", "B": "Place", "C": "Time", "D": "Possession"}},
    152: {"q": "What type of utility is created by businessmen warehousing goods in hopes of profit?", "opts": {"A": "Place", "B": "Time", "C": "Form", "D": "Possession"}},
    153: {"q": "What type of utility does a cold storage create?", "opts": {"A": "Time", "B": "Place", "C": "Form", "D": "Possession"}},
    154: {"q": "What effect does production have on consumers?", "opts": {"A": "Creates employment", "B": "Creates investment", "C": "Increases income", "D": "Improves standard of living"}},
    155: {"q": "What makes natural resources suitable for use?", "opts": {"A": "Marketing", "B": "Production", "C": "Trade", "D": "Management"}},
    156: {"q": "What is the ratio of production and resources called?", "opts": {"A": "Productivity", "B": "Level of production", "C": "Production capacity", "D": "Production efficiency"}},
    157: {"q": "How can productivity be expressed?", "opts": {"A": "In price index", "B": "In quantity index", "C": "As a ratio", "D": "As a percentage"}},
    158: {"q": "What is productivity?", "opts": {"A": "Ratio of resources to labor", "B": "Ratio of labor to resources", "C": "Ratio of production to resources", "D": "Ratio of production to productivity"}},
    159: {"q": "Which is the formula for productivity?", "opts": {"A": "Total value of output / Total value of input", "B": "Total output / Total labor hours", "C": "Total output / Total machinery", "D": "Input / Output"}},
    160: {"q": "In a factory, goods worth Tk 60,000 are produced with materials costing Tk 4,000 and machinery costing Tk 1,000 per hour. What is the material productivity of the organization?", "opts": {"A": "15", "B": "12", "C": "20", "D": "60"}},
    161: {"q": "If production increases, what will increase?", "opts": {"A": "Demand", "B": "Employment", "C": "Consumption expenditure", "D": "Market price"}},
    162: {"q": "What does productivity depend on?", "opts": {"A": "Production control", "B": "Quality control", "C": "Production efficiency", "D": "Capital"}},
    163: {"q": "What type of utility does Mr. Fahim's establishment create?", "opts": {"A": "Form", "B": "Time", "C": "Place", "D": "Service"}},
    164: {"q": "The benefits obtained through the work mentioned in the stimulus are -", "opts": {"A": "i & ii", "B": "ii & iii", "C": "i & iii", "D": "i, ii & iii"}},
    165: {"q": "What type of utility has Mr. Rafiz created through his business?", "opts": {"A": "Form", "B": "Place", "C": "Time", "D": "Service"}},
    166: {"q": "What type of utility does Zaman create?", "opts": {"A": "Form", "B": "Time", "C": "Place", "D": "Service"}},
    167: {"q": "Through the establishment of the factory described in the stimulus, consumers can benefit in the following ways -", "opts": {"A": "i & ii", "B": "ii & iii", "C": "i & iii", "D": "i, ii & iii"}},
    168: {"q": "What type of utility does Jalil create through supplying fish?", "opts": {"A": "Time", "B": "Place", "C": "Form", "D": "Possession"}},
    169: {"q": "From the producer's perspective, the result of Jalil's work is -", "opts": {"A": "Investment increases", "B": "Human welfare occurs", "C": "Resource value increases", "D": "Employment is created"}},
}

count = 0
for q in bn_data:
    qid = q['id']
    if qid in existing_ids or qid not in translations:
        continue
    t = translations[qid]
    opts = q.get('options', {})
    answer = q.get('answer', 'A')
    
    en_q = {
        'id': qid,
        'question': t['q'],
        'options': t['opts'],
        'answer': answer,
        'correct': ['A', 'B', 'C', 'D'].index(answer),
        'explanation': '',
        'source': 'Practice',
        'difficulty': 'medium'
    }
    en_data.append(en_q)
    count += 1

en_data.sort(key=lambda x: x['id'])

with open('public/hsc/production_1st/english/chapter_1.json', 'w') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)
print(f'Added {count} English MCQs. Total: {len(en_data)}')
