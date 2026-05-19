import json

# ─── 1. Fix English MCQ duplicate ───
with open('public/hsc/production_1st/english/chapter_1.json') as f:
    en_mcq = json.load(f)

# Remove ID 41 (duplicate of ID 4: "Which is the synonym of production?")
en_mcq = [q for q in en_mcq if q['id'] != 41]
print(f'English MCQs after dedup: {len(en_mcq)}')

with open('public/hsc/production_1st/english/chapter_1.json', 'w') as f:
    json.dump(en_mcq, f, ensure_ascii=False, indent=2)

# ─── 2. Add English CQs 6 & 7 ───
en_cq_6 = {
    "_type": "creative_question",
    "id": "hsc_prod1_cq_6",
    "stem": "Mr. Sohel has taken some initiatives to increase productivity. For example, he uses modern machinery or technology in production as well as preserves quality raw materials. Besides, he emphasizes creating a good working environment, recruiting and retaining skilled human resources. Because if productivity increases, the total production of the organization increases, which creates the possibility of increasing sales and profit.",
    "stem_label": "Read the stimulus and answer the following questions",
    "questions": [
        {"label": "a", "question": "What is productivity?", "model_answer": "Productivity is the ratio of output (goods and services) to input (resources). In simple terms, the ratio of produced goods to resources used in production is called productivity. According to Paul S. Samuelson, productivity is a name that denotes the ratio of output in relation to input."},
        {"label": "b", "question": "Evaluate Mr. Sohel's initiatives as an entrepreneur.", "model_answer": "Mr. Sohel has taken appropriate steps. In order to increase productivity, using modern technology, collecting quality raw materials, recruiting skilled human resources, and creating a good working environment are very important. These steps are helpful in increasing productivity and profit. When all these factors work together, the organization can produce more output with the same or fewer resources."},
        {"label": "c", "question": "What other steps are needed to increase productivity? Discuss.", "model_answer": "To increase productivity, 10 important steps are needed: (1) Efficient management, (2) Modern technology, (3) Quality raw materials, (4) Skilled human resources, (5) Good relationship between management and workers, (6) Good working environment, (7) Proper layout, (8) Improved production process, (9) Research and development, (10) Incentive measures. All of these steps together help maximize output while minimizing input costs."},
        {"label": "d", "question": "What are the disadvantages of productivity? Evaluate.", "model_answer": "Productivity has several disadvantages: (1) Decreased worker performance, (2) Reduced machinery effectiveness, (3) Increased storage costs, (4) Increased raw material costs, (5) Negative impact on quality control, (6) Increased per-unit production cost, (7) Pressure on capital, (8) Impact on selling price. However, most of these disadvantages can be avoided by taking careful measures and proper planning."}
    ]
}

en_cq_7 = {
    "_type": "creative_question",
    "id": "hsc_prod1_cq_7",
    "stem": "The productivity of an organization does not depend on any single factor. Many factors influence it. For example, workers' skills, managerial factors and production process are included in work-related factors. On the other hand, technological factors, finance and raw materials used are resource-related factors. Besides, natural factors, factory layout and work environment fall under environmental factors.",
    "stem_label": "Read the stimulus and answer the following questions",
    "questions": [
        {"label": "a", "question": "How many main categories of factors affect productivity?", "model_answer": "The factors affecting productivity can be mainly divided into three categories: (1) Work-related factors, (2) Resource-related factors, (3) Environmental factors. Work-related factors include workers' skills, management, and production process. Resource-related factors include technology, finance, and raw materials. Environmental factors include natural elements, factory layout, and work environment."},
        {"label": "b", "question": "What is meant by work-related factors? Explain.", "model_answer": "Work-related factors include: (1) Workers' skills — whether workers are self-motivated and perform their duties efficiently, (2) Managerial factors — coordination and sincerity between management and workers, (3) Production process — using improved and modern production methods. These factors directly influence how efficiently work is performed in an organization."},
        {"label": "c", "question": "How do technological factors and finance affect productivity? Discuss.", "model_answer": "Technological factors: Organizations that are ahead in using modern technology have higher productivity. Technology helps reduce costs and produce more output. Finance: When an organization is financially strong, it can afford modern technology and hire experienced workers, which increases productivity. Both factors work together to enhance overall productivity."},
        {"label": "d", "question": "How do environmental factors affect productivity? Evaluate.", "model_answer": "Environmental factors affect productivity in three ways: (1) Natural factors — geographical location, weather, climate and natural resources influence productivity. For example, favorable weather helps agriculture. (2) Factory layout — proper arrangement of machinery and production processes increases workflow and reduces waste, boosting productivity. (3) Work environment — a worker-friendly environment with proper lighting, ventilation, and safety measures increases worker efficiency and motivation, thus improving productivity."}
    ]
}

with open('public/hsc/production_1st/english/chapter_1_cq.json') as f:
    en_cq = json.load(f)

existing_en_ids = {c['id'] for c in en_cq}
if en_cq_6['id'] not in existing_en_ids:
    en_cq.append(en_cq_6)
if en_cq_7['id'] not in existing_en_ids:
    en_cq.append(en_cq_7)

en_cq.sort(key=lambda x: x['id'])
print(f'English CQs: {len(en_cq)}')

with open('public/hsc/production_1st/english/chapter_1_cq.json', 'w') as f:
    json.dump(en_cq, f, ensure_ascii=False, indent=2)

# ─── 3. Fix Bengali CQ model_answers ───
# Using exact answers from the MD's জ্ঞানমূলক, অনুধাবনমূলক, and সৃজনশীল নমুনা sections

bn_cq_updates = {
    "hsc_prod1_cq_1": {
        "questions": [
            {"label": "ক", "model_answer": "কোনো পণ্য বা সেবার মধ্যে মানুষের অভাব পূরণের যে ক্ষমতা ও গুণ বিদ্যমান থাকে তাকে ঐ পণ্য বা সেবা সামগ্রীর উপযোগ বলে। অধ্যাপক মেয়ার্সের মতে, \"উপযোগ হচ্ছে কোনো দ্রব্যের বিশেষ গুণ বা ক্ষমতা, যা মানুষের অভাব পূরণ করতে পারে।\" সাধারণ ভাষায় উপযোগ বলতে দ্রব্যের অভাব পূরণের ক্ষমতাকে বোঝায়।"},
            {"label": "খ", "model_answer": "রাজশাহী থেকে ঢাকায় আম আনার ফলে স্থানগত উপযোগ সৃষ্টি হয়েছে। উপযোগ হচ্ছে কোনো দ্রব্যের অভাব পূরণের গুণ বা ক্ষমতা। কোনো দ্রব্য এক জায়গা থেকে অন্য জায়গায় স্থানান্তরের ফলে স্থানগত উপযোগের সৃষ্টি হয়। স্থানগত উপযোগ সৃষ্টি ছাড়া উৎপাদিত পণ্য চূড়ান্ত ব্যবহারকারীর কাছে পৌঁছানো সম্ভব হয় না। রাজশাহী থেকে ঢাকার স্থানগত প্রতিবন্ধকতা পণ্য পরিবহনের মাধ্যমে দূর করা সম্ভব হয়েছে। ফলে দূরবর্তী অঞ্চলের ক্রেতারা আম ভোগের সুযোগ পেয়েছে, যা স্থানগত উপযোগ।"},
            {"label": "গ", "model_answer": "গুদামজাতকরণের ফলে সময়গত উপযোগ সৃষ্টি হয়েছে। এক সময়ে উৎপাদিত পণ্য অন্য সময় পর্যন্ত সংরক্ষণ করে মানুষের অভাব পূরণের যে ক্ষমতা সৃষ্টি হয় তাকে সময়গত উপযোগ বলে। W. J. Stanton-এর মতে, \"Time utility means having a product available when you want it.\" গুদামজাতকরণের মাধ্যমে নির্দিষ্ট সময় পর্যন্ত পণ্যকে সংরক্ষণ করে রাখা হয়। বাজারে আম না থাকার সময় মজুদকৃত আম সরবরাহ করায় ক্রেতারা দীর্ঘ সময় পর্যন্ত আম ভোগের সুযোগ পাচ্ছে, যা সময়গত উপযোগ।"},
            {"label": "ঘ", "model_answer": "উদ্দীপকের ব্যবসায়ীর কার্যক্রমে তিন ধরনের উপযোগ সৃষ্টি হয়েছে: (১) স্থানগত উপযোগ — রাজশাহী থেকে ঢাকায় পরিবহনের মাধ্যমে পণ্য স্থানান্তরিত হওয়ায় দূরবর্তী ক্রেতারা আম পেয়েছে। (২) সময়গত উপযোগ — গুদামজাতকরণের মাধ্যমে আম সংরক্ষণ করে বাজারে আম না থাকার সময় সরবরাহ করায় ক্রেতারা দীর্ঘ সময় আম ভোগের সুযোগ পেয়েছে। (৩) স্বত্বগত উপযোগ — আম ক্রয়-বিক্রয়ের মাধ্যমে মালিকানা পরিবর্তন হয়েছে। পণ্য কেনা-বেচা করে মালিকানা হস্তান্তরের মাধ্যমে স্বত্বগত উপযোগ সৃষ্টি হয়। জনাব মাহবুব আম ক্রয় ও বিক্রয়ের মাধ্যমে মালিকানা হস্তান্তর করেছেন, যা স্বত্বগত উপযোগ।"}
        ]
    },
    "hsc_prod1_cq_2": {
        "questions": [
            {"label": "ক", "model_answer": "উৎপাদনের সবচেয়ে প্রাচীন ও পুরাতন খাত হলো কৃষি খাত। কৃষিজাত পণ্য যেমন ধান, গম, ডাল, ভুট্টা, শাকসবজি, তুলা, পাট ইত্যাদি উৎপাদনের সাথে সম্পৃক্ত খাতকে কৃষি খাত বলে। মৎস্য চাষ, পশুপালন ইত্যাদি কৃষি খাতের উপখাত। বাংলাদেশ কৃষিপ্রধান দেশ এবং বিশ্বের অন্যান্য শক্তিশালী দেশও কৃষিজাত পণ্যের ওপর অনেকাংশে নির্ভরশীল।"},
            {"label": "খ", "model_answer": "জনাব ইকবালের রুটি তৈরি কার্যক্রমটি উৎপাদনের শিল্প খাতের অন্তর্ভুক্ত। প্রযুক্তি ও যন্ত্রপাতির সাহায্যে কাঁচামাল ও অন্যান্য উপকরণের রূপগত উপযোগ সৃষ্টির সাথে সম্পৃক্ত খাতকে শিল্প খাত বলে। ময়দা থেকে রুটি/ব্রেড তৈরি একটি প্রক্রিয়াজাতকরণ কাজ, যাতে প্রযুক্তি ও যন্ত্রপাতি ব্যবহার করা হয়। কাঁচামালের রূপগত পরিবর্তনের মাধ্যমে নতুন পণ্য তৈরি করা হয় বলে এটি শিল্প খাতের অন্তর্ভুক্ত।"},
            {"label": "গ", "model_answer": "জনাব হাসানের হাসপাতালটি উৎপাদনের সেবা খাতের অন্তর্ভুক্ত। সেবা খাত মানুষের মৌলিক চাহিদা পূরণ ছাড়াও আরামদায়ক ও স্বাচ্ছন্দ্যময় জীবন প্রত্যাশা পূরণে কাজ করে। হাসপাতাল চিকিৎসাসেবা প্রদানের মাধ্যমে মানুষের স্বাস্থ্যসেবার অভাব পূরণ করে। ডাক্তারের স্বাস্থ্যসেবা, শিক্ষকের পাঠ দান, মোবাইল কোম্পানির সেবা — এগুলো সেবাগত উপযোগের উদাহরণ। তাই হাসপাতাল সেবা খাতের অন্তর্ভুক্ত।"},
            {"label": "ঘ", "model_answer": "জনাব ইকবাল ও জনাব হাসান উভয়ের কার্যক্রমই দেশের অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখছে। জনাব ইকবাল কৃষি ও শিল্প খাতে পণ্য উৎপাদন করে দেশের জিডিপি বৃদ্ধি, কর্মসংস্থান ও খাদ্য সরবরাহে ভূমিকা রাখেন। তাঁর রুটি ও শাকসবজি উৎপাদন দেশের খাদ্য চাহিদা মেটাতে সাহায্য করে। অন্যদিকে, জনাব হাসানের হাসপাতাল স্বাস্থ্যসেবা খাতে মানবসম্পদ উন্নয়ন ও সামাজিক কল্যাণে ভূমিকা রাখে। বিনামূল্যে চিকিৎসাসেবা প্রদানের মাধ্যমে তিনি দরিদ্র মানুষের সেবা করছেন। উৎপাদনের দৃষ্টিকোণ থেকে, ইকবাল পণ্য উৎপাদন ও সরবরাহে এবং হাসান মানবসম্পদ উন্নয়নে গুরুত্বপূর্ণ ভূমিকা পালন করছেন। তাই উভয়ের কার্যক্রমই অর্থনীতির জন্য গুরুত্বপূর্ণ।"}
        ]
    },
    "hsc_prod1_cq_3": {
        "questions": [
            {"label": "ক", "model_answer": "Heizer এবং Render-এর মতে, \"Productivity is the creation of goods and services.\" উৎপাদনশীলতা হলো আউটপুট (পণ্য ও সেবা) কে ইনপুট (সম্পদ) দিয়ে ভাগ করে প্রাপ্ত অনুপাত। সাধারণ অর্থে, উৎপাদিত পণ্য এবং উৎপাদনে ব্যবহৃত উপাদানের অনুপাতই হলো উৎপাদনশীলতা। Paul S. Samuelson-এর মতে, উৎপাদনশীলতা হচ্ছে একটি নাম যা ইনপুটের প্রেক্ষিতে আউটপুটের অনুপাত বোঝায়।"},
            {"label": "খ", "model_answer": "মোট উৎপাদনশীলতার সূত্রটি হলো:\n\nমোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য / মোট উপকরণের মূল্য\n\nঅর্থাৎ, প্রতিষ্ঠানের মোট উৎপাদিত পণ্যের মূল্য ও উৎপাদনে ব্যবহৃত মোট উপকরণের মূল্যের অনুপাতকে মোট উৎপাদনশীলতা বলে। এটি সার্বিক উৎপাদনশীলতা নামেও পরিচিত।"},
            {"label": "গ", "model_answer": "'ক' লিমিটেডের ২০১৯ সালের মোট উৎপাদনশীলতা:\n\nমোট উৎপাদনের মূল্য = ৩০,০০,০০০ টাকা\nমোট উপকরণের মূল্য = কাঁচামাল ৫,০০,০০০ + বেতন ও মজুরি ২,৬০,০০০ + অন্যান্য ১,৪০,০০০ = ৯,০০,০০০ টাকা\n\nমোট উৎপাদনশীলতা = ৩০,০০,০০০ / ৯,০০,০০০ = ৩.৩৩ (প্রায়)"},
            {"label": "ঘ", "model_answer": "'খ' লিমিটেডের মোট উৎপাদনশীলতা = ৩০,০০,০০০ / (৫,৭০,০০০ + ২,৫০,০০০ + ১,৮০,০০০) = ৩০,০০,০০০ / ১০,০০,০০০ = ৩.০০\n\n'ক' লিমিটেডের উৎপাদনশীলতা (৩.৩৩) 'খ' লিমিটেডের (৩.০০) থেকে বেশি। 'ক' লিমিটেড কম উপকরণ ব্যয় করে একই পরিমাণ পণ্য উৎপাদন করতে পেরেছে (মোট উপকরণ ব্যয় ৯,০০,০০০ বনাম ১০,০০,০০০ টাকা)। তাই 'ক' লিমিটেড বেশি সুবিধাজনক অবস্থানে রয়েছে। কারণ উৎপাদনশীলতা যত বেশি, প্রতিষ্ঠান তত বেশি দক্ষ ও লাভজনক।"}
        ]
    },
    "hsc_prod1_cq_4": {
        "questions": [
            {"label": "ক", "model_answer": "E. S. Buffa-এর মতে, \"Production is a process by which goods and services are created.\" অর্থাৎ, \"উৎপাদন হচ্ছে একটি প্রক্রিয়া, যার মাধ্যমে পণ্য এবং সেবা তৈরি করা হয়।\" মানুষের কারিগরি জ্ঞান ও বুদ্ধিমত্তা দিয়ে প্রাকৃতিক সম্পদের সাহায্যে উপযোগ সৃষ্টি ও পণ্য তৈরি করাকে উৎপাদন বলে।"},
            {"label": "খ", "model_answer": "উৎপাদনের মাধ্যমে জীবনযাত্রার মানোন্নয়ন সম্ভব। প্রতিনিয়ত নতুন নতুন পণ্য উৎপাদনের ফলে ভোগের ক্ষেত্রে নতুন মাত্রা যুক্ত হয়। মানুষের আয়ের পরিমাণ বাড়লে ভোগের পরিমাণ ও জীবনধাঁচে ইতিবাচক পরিবর্তন হয়। উৎপাদনের ফলে কর্মসংস্থানের সুযোগ সৃষ্টি হয়, যা আয় বাড়ায়। এছাড়া, বৈচিত্র্যময় পণ্য ব্যবহারের সুযোগ সৃষ্টি হয় এবং ক্রেতারা যথাসময়ে পণ্য পেতে পারে, যা জীবনযাত্রার মান উন্নত করে।"},
            {"label": "গ", "model_answer": "উৎপাদনের ক্ষমতা বাড়াতে উৎপাদনের উপকরণসমূহের যথাযথ ব্যবহার নিশ্চিত করা অত্যন্ত জরুরি। উৎপাদনের প্রধান চারটি উপকরণ হলো ভূমি, শ্রম, মূলধন ও সংগঠন। উৎপাদনক্ষমতা বাড়ানোর জন্য এই উপকরণগুলোর সুষ্ঠু সমন্বয় ও সর্বোত্তম ব্যবহার প্রয়োজন। যেমন: সঠিক পরিকল্পনা, দক্ষ শ্রমিক নিয়োগ, আধুনিক যন্ত্রপাতি ব্যবহার ও কাঁচামালের সঠিক ব্যবহারের মাধ্যমেই উৎপাদন ক্ষমতা বাড়ানো সম্ভব। জনাব ফয়সাল কঠোর পরিশ্রম ও উপকরণসমূহের যথাযথ ব্যবহারের মাধ্যমেই প্রতিষ্ঠানের উৎপাদনক্ষমতা বাড়াতে পেরেছেন।"},
            {"label": "ঘ", "model_answer": "জনাব ফয়সালের প্রতিষ্ঠানের উৎপাদনশীলতা বাড়ানোর জন্য নিম্নলিখিত পদক্ষেপ নেওয়া যেতে পারে:\n\n(১) দক্ষ ব্যবস্থাপনা — সঠিক পরিকল্পনা, সংগঠন, নির্দেশনা ও নিয়ন্ত্রণ নিশ্চিত করা।\n(২) আধুনিক প্রযুক্তি ব্যবহার — অত্যাধুনিক যন্ত্রপাতি ও প্রযুক্তি ব্যবহার করে উৎপাদন বৃদ্ধি।\n(৩) উন্নত কাঁচামাল সংগ্রহ — ভালো মানের কাঁচামাল ব্যবহার করলে পণ্যের গুণাগুণ ও উৎপাদনশীলতা বাড়ে।\n(৪) দক্ষ মানবসম্পদ নিয়োগ ও ধরে রাখা — দক্ষ ও প্রশিক্ষিত কর্মী নিয়োগ ও তাদের ধরে রাখা।\n(৫) ব্যবস্থাপনা ও শ্রমিকের মধ্যে সুসম্পর্ক বজায় রাখা।\n(৬) উন্নত কাজের পরিবেশ নিশ্চিত করা — পর্যাপ্ত আলো, বাতাস, নিরাপত্তা প্রভৃতি।\n(৭) যথাযথ বিন্যাস — যন্ত্রপাতি ও উৎপাদন প্রক্রিয়ার সঠিক বিন্যাস।\n(৮) উন্নত উৎপাদন প্রক্রিয়া — আধুনিক ও উন্নত উৎপাদন পদ্ধতি ব্যবহার।\n(৯) গবেষণা ও উন্নয়ন — নতুন পণ্য ও প্রক্রিয়া উদ্ভাবনে গবেষণা।\n(১০) উৎসাহমূলক ব্যবস্থা — কর্মীদের উৎসাহিত করার জন্য পুরস্কার ও প্রণোদনা।"}
        ]
    },
    "hsc_prod1_cq_5": {
        "questions": [
            {"label": "ক", "model_answer": "Norman Gaither and Greg Frazier-এর মতে, \"Productivity is amount of products or services produced with the resources used.\" অর্থাৎ, উৎপাদনশীলতা হলো সম্পদ ব্যবহার করে পণ্য বা সেবা উৎপাদনের পরিমাণ। এটি উৎপাদন ও উপকরণের অনুপাত। সবচেয়ে কম সম্পদ ব্যবহার করে সবচেয়ে বেশি উৎপাদন করাই উৎপাদনশীলতার লক্ষ্য।"},
            {"label": "খ", "model_answer": "উদ্দীপকে উল্লেখ করা হয়েছে যে, 'ওয়ার্সি কোম্পানি' প্রযুক্তির উন্নয়ন এবং কর্মীদের দক্ষতা বাড়ানোর মাধ্যমে উৎপাদন ৫০,০০,০০০ থেকে ৭০,০০,০০০ কার্পেটে উন্নীত করেছে। প্রযুক্তি উৎপাদন বাড়াতে ও ব্যয় কমাতে সহায়তা করে। নতুন প্রযুক্তি ব্যবহারের ফলে উৎপাদন প্রক্রিয়া দ্রুততর ও অধিক কার্যকর হয়। অন্যদিকে, দক্ষ কর্মীরা তাদের কাজ আরও দ্রুত ও নির্ভুলভাবে সম্পন্ন করতে পারে। ফলে প্রতিষ্ঠানের সামগ্রিক উৎপাদনশীলতা বৃদ্ধি পেয়েছে।"},
            {"label": "গ", "model_answer": "উৎপাদনশীলতা বাড়ার সুবিধাগুলোর মধ্যে রয়েছে:\n(১) বেশি পরিমাণে পণ্য উৎপাদন করা যায়\n(২) উন্নত মানের পণ্য উৎপাদন সম্ভব হয়\n(৩) উৎপাদন ব্যয় কমে যায়, কারণ এককপ্রতি ব্যয় হ্রাস পায়\n(৪) স্থায়ী ক্রেতা সৃষ্টি হয়, কারণ মানসম্মত পণ্য ন্যায্যমূল্যে পাওয়া যায়\n(৫) কর্মচারীদের দক্ষতা বাড়ে\n(৬) বেশি মুনাফা অর্জন সম্ভব হয়\n(৭) নতুন নতুন প্রযুক্তি ব্যবহারের সুযোগ সৃষ্টি হয়\n(৮) অর্থনৈতিক প্রবৃদ্ধি অর্জনে সহায়তা করে\n(৯) দেশের প্রতিযোগিতামূলক সক্ষমতা বাড়ে"},
            {"label": "ঘ", "model_answer": "উৎপাদন ও উৎপাদনশীলতার মধ্যে গুরুত্বপূর্ণ পার্থক্য:\n\nপ্রকৃতির দিক থেকে — উৎপাদন পণ্য সৃষ্টি করে, উৎপাদনশীলতা ইনপুট-আউটপুট অনুপাত নির্দেশ করে।\n\nউপযোগ — উৎপাদন রূপগত উপযোগ সৃষ্টি করে, উৎপাদনশীলতা কোনো উপযোগ সৃষ্টি করে না।\n\nআওতা — উৎপাদনের আওতা ব্যাপক (কাঁচামাল সংগ্রহ থেকে চূড়ান্ত পণ্য পর্যন্ত), উৎপাদনশীলতার আওতা তুলনামূলকভাবে ছোট (শুধু ইনপুট-আউটপুট অনুপাত)।\n\nগতিশীলতা — উৎপাদনে গতিশীলতা কম, উৎপাদনশীলতায় গতিশীলতা বেশি।\n\nপরিমাপ — উৎপাদন এককে পরিমাপ করা যায়, উৎপাদনশীলতা অনুপাতে প্রকাশ করা হয়।\n\nনির্ভরতা — উৎপাদন উৎপাদনশীলতার ওপর নির্ভর করে না, কিন্তু উৎপাদনশীলতা উৎপাদনের ওপর নির্ভর করে।"}
        ]
    },
    "hsc_prod1_cq_6": {
        "questions": [
            {"label": "ক", "model_answer": "সাধারণ ভাষায়, উৎপাদনশীলতা হলো উৎপাদিত পণ্য এবং উৎপাদনে ব্যবহৃত উপাদানের অনুপাত। Paul S. Samuelson-এর মতে, উৎপাদনশীলতা হচ্ছে একটি নাম যা ইনপুটের প্রেক্ষিতে আউটপুটের অনুপাত বোঝায়। Heizer এবং Render-এর মতে, \"Productivity is the creation of goods and services.\" উৎপাদনশীলতা বাড়ানোর অর্থ হলো একই পরিমাণ সম্পদ ব্যবহার করে বেশি পরিমাণ পণ্য ও সেবা উৎপাদন করা।"},
            {"label": "খ", "model_answer": "উদ্যোক্তা হিসেবে জনাব সোহেলের উদ্যোগসমূহ যথাযথ ও প্রশংসনীয়। তিনি উৎপাদনশীলতা বাড়ানোর জন্য গুরুত্বপূর্ণ পদক্ষেপ গ্রহণ করেছেন:\n\n(১) আধুনিক যন্ত্রপাতি বা প্রযুক্তির ব্যবহার — প্রযুক্তি ব্যবহার করলে উৎপাদন প্রক্রিয়া দ্রুততর হয় এবং উৎপাদনশীলতা বাড়ে।\n(২) উন্নত কাঁচামাল সংরক্ষণ — ভালো মানের কাঁচামাল ব্যবহার পণ্যের গুণাগুণ নিশ্চিত করে।\n(৩) উন্নত কাজের পরিবেশ সৃষ্টি — কার্যবান্ধব পরিবেশে কর্মীরা বেশি উৎপাদনশীল হয়।\n(৪) দক্ষ মানবসম্পদ নিয়োগ ও ধরে রাখা — দক্ষ কর্মীরা উৎপাদনশীলতা বাড়াতে গুরুত্বপূর্ণ ভূমিকা রাখে।\n(৫) উৎপাদন বাড়ানো — উৎপাদনশীলতা বাড়লে মোট উৎপাদন, বিক্রি ও মুনাফা বৃদ্ধি পায়।"},
            {"label": "গ", "model_answer": "উৎপাদনশীলতা বাড়ানোর জন্য আরও যেসব পদক্ষেপ প্রয়োজন:\n\n(১) দক্ষ ব্যবস্থাপনা — সঠিক পরিকল্পনা ও নিয়ন্ত্রণের মাধ্যমে সম্পদের সর্বোত্তম ব্যবহার নিশ্চিত করা।\n(২) ব্যবস্থাপনা ও শ্রমিকের মধ্যে সুসম্পর্ক — ভালো সম্পর্ক কাজের পরিবেশ উন্নত করে ও উৎপাদনশীলতা বাড়ায়।\n(৩) যথাযথ বিন্যাস — যন্ত্রপাতি ও উৎপাদন প্রক্রিয়ার সঠিক বিন্যাস সময় ও শ্রম বাঁচায়।\n(৪) উন্নত উৎপাদন প্রক্রিয়া — আধুনিক ও উন্নত উৎপাদন পদ্ধতি ব্যবহার উৎপাদনশীলতা বাড়ায়।\n(৫) গবেষণা ও উন্নয়ন — নতুন প্রযুক্তি ও পদ্ধতি উদ্ভাবনে সহায়তা করে।\n(৬) উৎসাহমূলক ব্যবস্থা — কর্মীদের জন্য প্রণোদনা ও পুরস্কার ব্যবস্থা তাদের উৎসাহিত করে।\n\nউল্লিখিত ১০টি পদক্ষেপই উৎপাদনশীলতা বাড়াতে গুরুত্বপূর্ণ ভূমিকা রাখে।"},
            {"label": "ঘ", "model_answer": "উৎপাদনশীলতার বেশ কিছু অসুবিধা রয়েছে:\n\n(১) শ্রমিকের কর্মক্ষমতা কমানো — অতিরিক্ত উৎপাদন চাপের কারণে শ্রমিকদের কর্মক্ষমতা কমে যেতে পারে।\n(২) যন্ত্রপাতির কার্যকারিতা কমে যাওয়া — বেশি ব্যবহারে যন্ত্রপাতির কার্যকারিতা হ্রাস পায় এবং ভেঙে যেতে পারে।\n(৩) মজুদকরণ ব্যয় বেড়ে যাওয়া — বেশি উৎপাদনের ফলে মজুদ খরচ বাড়ে।\n(৪) কাঁচামালের ব্যয় বেড়ে যাওয়া — অধিক উৎপাদনের জন্য বেশি কাঁচামালের প্রয়োজন হয়, যা ব্যয় বাড়ায়।\n(৫) মান নিয়ন্ত্রণের ঋণাত্মক প্রভাব — দ্রুত উৎপাদনের ফলে মান নিয়ন্ত্রণে সমস্যা হতে পারে।\n(৬) পণ্যের এককপ্রতি উৎপাদন ব্যয় বেড়ে যাওয়া — কিছু ক্ষেত্রে উৎপাদনশীলতা বাড়ালে এককপ্রতি ব্যয় বাড়তে পারে।\n(৭) মূলধনের ওপর চাপ সৃষ্টি — অধিক উৎপাদনের জন্য বেশি মূলধনের প্রয়োজন হয়।\n\nতবে সতর্ক পদক্ষেপ নিলে এসব অসুবিধা এড়ানো সম্ভব।"}
        ]
    },
    "hsc_prod1_cq_7": {
        "questions": [
            {"label": "ক", "model_answer": "উৎপাদনশীলতার ওপর প্রভাব বিস্তারকারী উপাদানগুলিকে প্রধানত তিনটি শ্রেণিতে ভাগ করা যায়:\n(১) কর্মসংক্রান্ত বিষয় (Work-related factors)\n(২) সম্পদসংক্রান্ত বিষয় (Wealth-related factors)\n(৩) পরিবেশগত বিষয় (Environment-related factors)\n\nপ্রতিটি শ্রেণির অধীনে একাধিক উপাদান উৎপাদনশীলতাকে প্রভাবিত করে।"},
            {"label": "খ", "model_answer": "কর্মসংক্রান্ত বিষয় বলতে সেসব উপাদানকে বোঝায় যা কর্মীদের কাজের সাথে সম্পর্কিত। এর মধ্যে রয়েছে:\n\n(১) কর্মীদের দক্ষতা — কর্মীরা স্বেচ্ছাপ্রণোদিত হয়ে দক্ষতার সাথে দায়িত্ব পালন করে কিনা তা উৎপাদনশীলতাকে প্রভাবিত করে। দক্ষ কর্মীরা বেশি উৎপাদনশীল।\n\n(২) ব্যবস্থাপকীয় উপাদান — ব্যবস্থাপনার সাথে কর্মীদের সমন্বয় ও আন্তরিকতা কেমন তা গুরুত্বপূর্ণ। ভালো ব্যবস্থাপনা উৎপাদনশীলতা বাড়ায়।\n\n(৩) উৎপাদন প্রক্রিয়া — উন্নত ও আধুনিক উৎপাদন প্রক্রিয়া ব্যবহার উৎপাদনশীলতা বাড়ায়। অপ্রচলিত প্রক্রিয়া উৎপাদনশীলতা কমায়।"},
            {"label": "গ", "model_answer": "প্রযুক্তিগত উপাদান ও অর্থ কীভাবে উৎপাদনশীলতাকে প্রভাবিত করে:\n\nপ্রযুক্তিগত উপাদান: যে প্রতিষ্ঠান আধুনিক প্রযুক্তি ব্যবহারে এগিয়ে, তার উৎপাদনশীলতা বেশি হয়। প্রযুক্তি উৎপাদন প্রক্রিয়াকে দ্রুততর, নির্ভুল ও কার্যকর করে। যেমন: স্বয়ংক্রিয় মেশিন ব্যবহার করলে কম সময়ে বেশি পণ্য উৎপাদন সম্ভব।\n\nঅর্থ: প্রতিষ্ঠান আর্থিকভাবে সমৃদ্ধিশালী হলেই উন্নত প্রযুক্তি ব্যবহার ও অভিজ্ঞ কর্মী নিয়োগ সম্ভব হয়। পর্যাপ্ত অর্থ থাকলে গবেষণা ও উন্নয়ন, প্রশিক্ষণ, আধুনিক যন্ত্রপাতি ক্রয় করা যায়, যা উৎপাদনশীলতা বাড়ায়। অপর্যাপ্ত অর্থ উৎপাদনশীলতা বাড়াতে বাধা সৃষ্টি করে।"},
            {"label": "ঘ", "model_answer": "পরিবেশগত বিষয় তিনটি উপাদানে বিভক্ত যা উৎপাদনশীলতাকে প্রভাবিত করে:\n\n(১) প্রাকৃতিক উপাদান — ভৌগোলিক অবস্থান, আবহাওয়া, জলবায়ু ও প্রাকৃতিক সম্পদ উৎপাদনশীলতাকে প্রভাবিত করে। যেমন: অনুকূল আবহাওয়ায় কৃষি উৎপাদনশীলতা বেশি হয়। প্রাকৃতিক দুর্যোগ উৎপাদনশীলতা কমিয়ে দেয়।\n\n(২) কারখানার বিন্যাস — যন্ত্রপাতি ও উৎপাদন প্রক্রিয়ার সঠিক বিন্যাস উৎপাদনশীলতা বাড়ায়। অপরিকল্পিত বিন্যাস সময় ও শ্রমের অপচয় ঘটায়। সঠিক বিন্যাসে কাঁচামাল থেকে চূড়ান্ত পণ্য পর্যন্ত প্রবাহ মসৃণ হয়।\n\n(৩) কাজের পরিবেশ — কার্যবান্ধব পরিবেশে কর্মীরা বেশি উৎপাদনশীল হয়। পর্যাপ্ত আলো, বাতাস, নিরাপত্তা, তাপমাত্রা নিয়ন্ত্রণ ইত্যাদি কাজের পরিবেশের অংশ। ভালো পরিবেশে কর্মীদের মনোবল ও উৎপাদনশীলতা বাড়ে।"}
        ]
    }
}

# Now read the full BN CQ file, apply updates
with open('public/hsc/production_1st/chapter_1_cq.json') as f:
    bn_cq = json.load(f)

for cq in bn_cq:
    if cq['id'] in bn_cq_updates:
        update = bn_cq_updates[cq['id']]
        for sq_idx, sq_update in enumerate(update['questions']):
            if sq_idx < len(cq['questions']):
                cq['questions'][sq_idx]['model_answer'] = sq_update['model_answer']

with open('public/hsc/production_1st/chapter_1_cq.json', 'w') as f:
    json.dump(bn_cq, f, ensure_ascii=False, indent=2)
print(f'Updated {len(bn_cq_updates)} Bengali CQs with proper model_answers')

# ─── 4. Fix English CQ model_answers for cq_1 through cq_7 ───
en_cq_updates = {
    "hsc_prod1_cq_1": {
        "questions": [
            {"label": "a", "model_answer": "Utility is the quality or capacity of a commodity to satisfy human wants. According to Prof. Mayers, \"Utility is the quality or capacity of a goods which enables it to satisfy human wants.\" In simple terms, utility refers to the want-satisfying power of a commodity. Any commodity that can satisfy a human need has utility."},
            {"label": "b", "model_answer": "Bringing mangoes from Rajshahi to Dhaka creates place utility. Place utility is created by transferring goods from one place to another to satisfy wants. Without creating place utility, produced goods cannot reach the ultimate consumers. By transporting mangoes from Rajshahi to Dhaka, the geographical barrier has been overcome, allowing consumers in distant areas to enjoy the mangoes."},
            {"label": "c", "model_answer": "Storage creates time utility. Time utility means having a product available when you want it. By preserving products through warehousing from one time period for consumption at another time, time utility is created. By storing mangoes in a warehouse and supplying them when mangoes are not available in the market, consumers can enjoy mangoes for a longer period."},
            {"label": "d", "model_answer": "Three types of utility are created in the businessman's activities: (1) Place utility — by transporting mangoes from Rajshahi to Dhaka, consumers in distant areas get mangoes. (2) Time utility — by storing mangoes in a warehouse and supplying them during off-season, consumers enjoy mangoes for longer. (3) Possession utility — through buying and selling mangoes, ownership has been transferred. When Mr. Mahbub buys and sells mangoes, ownership is transferred from seller to buyer, creating possession utility."}
        ]
    },
    "hsc_prod1_cq_2": {
        "questions": [
            {"label": "a", "model_answer": "The agricultural sector is the oldest and most ancient sector of production. It involves the production of agricultural products such as rice, wheat, pulses, maize, vegetables, cotton, jute, etc. Fisheries, animal husbandry etc. are sub-sectors of agriculture. Bangladesh is an agricultural country and other strong nations also depend largely on agricultural products."},
            {"label": "b", "model_answer": "Mr. Iqbal's bread-making activity falls under the industrial sector of production. The industrial sector is associated with creating form utility of raw materials and other inputs with the help of technology and machinery. Making bread from flour is a processing task that uses technology and machinery, resulting in a new product through form transformation."},
            {"label": "c", "model_answer": "Mr. Hasan's hospital falls under the service sector of production. The service sector works to fulfill basic human needs as well as provide comfortable and convenient life. The hospital provides medical services to satisfy people's healthcare needs. Doctors' healthcare services, teachers' teaching, mobile company services — these are examples of service utility."},
            {"label": "d", "model_answer": "Both Mr. Iqbal's and Mr. Hasan's activities play an important role in the country's economy. Mr. Iqbal contributes to GDP growth, employment and food supply by producing goods in the agriculture and industry sectors. His bread and vegetable production help meet the country's food demand. On the other hand, Mr. Hasan's hospital contributes to human resource development and social welfare through healthcare services. By providing free treatment, he is serving poor people. From the production perspective, Iqbal contributes to production and supply of goods while Hasan contributes to human resource development."}
        ]
    },
    "hsc_prod1_cq_3": {
        "questions": [
            {"label": "a", "model_answer": "According to Heizer and Render, \"Productivity is the creation of goods and services.\" Productivity is the ratio obtained by dividing output (goods and services) by input (resources). In simple terms, the ratio of produced goods to resources used in production is called productivity. According to Paul S. Samuelson, productivity is a name that denotes the ratio of output in relation to input."},
            {"label": "b", "model_answer": "The formula for overall productivity is:\n\nOverall Productivity = Total Value of Output / Total Value of Input\n\nIt is the ratio of the total value of goods produced to the total value of resources used in production. It is also known as total productivity."},
            {"label": "c", "model_answer": "Overall productivity of 'K' Limited in 2019:\n\nTotal value of output = Tk 30,00,000\nTotal value of input = Raw materials Tk 5,00,000 + Salaries & wages Tk 2,60,000 + Others Tk 1,40,000 = Tk 9,00,000\n\nOverall productivity = 30,00,000 / 9,00,000 = 3.33 (approx.)"},
            {"label": "d", "model_answer": "Overall productivity of 'Kha' Limited = 30,00,000 / (5,70,000 + 2,50,000 + 1,80,000) = 30,00,000 / 10,00,000 = 3.00\n\n'K' Limited's productivity (3.33) is higher than 'Kha' Limited's (3.00). 'K' Limited has produced the same amount of output with lower input costs (Tk 9,00,000 vs Tk 10,00,000). Therefore, 'K' Limited is in a more advantageous position. Higher productivity means the organization is more efficient and profitable."}
        ]
    },
    "hsc_prod1_cq_4": {
        "questions": [
            {"label": "a", "model_answer": "According to E. S. Buffa, \"Production is a process by which goods and services are created.\" Production means creating utility and products with the help of natural resources using human technical knowledge and intelligence. It is a process through which raw materials are transformed into finished goods that satisfy human wants."},
            {"label": "b", "model_answer": "The standard of living can be improved through production. Continuous production of new products adds new dimensions to consumption. When people's income increases, their consumption and lifestyle improve positively. Production creates employment opportunities, which increases income. Besides, consumers get access to diverse products and timely availability of goods, which improves their standard of living."},
            {"label": "c", "model_answer": "To increase production capacity, proper utilization of production resources is essential. The four main factors of production are land, labor, capital and organization. Proper combination and optimal use of these factors are necessary to increase production capacity. For example, proper planning, hiring efficient workers, using modern machinery and proper use of raw materials can increase production capacity. Mr. Foysal was able to increase his organization's production capacity through hard work and proper utilization of resources."},
            {"label": "d", "model_answer": "To increase productivity in Mr. Foysal's organization, the following steps can be taken:\n\n(1) Efficient management — ensuring proper planning, organizing, directing and controlling.\n(2) Use of modern technology — using advanced machinery and technology to increase production.\n(3) Quality raw materials — using good quality raw materials improves product quality and productivity.\n(4) Skilled human resources — recruiting and retaining skilled and trained workers.\n(5) Good relationship between management and workers — a harmonious relationship improves the work environment.\n(6) Good working environment — ensuring adequate light, air, safety, etc.\n(7) Proper layout — systematic arrangement of machinery and production processes.\n(8) Improved production process — using modern and improved production methods.\n(9) Research and development — research to innovate new products and processes.\n(10) Incentive measures — rewards and incentives to motivate workers."}
        ]
    },
    "hsc_prod1_cq_5": {
        "questions": [
            {"label": "a", "model_answer": "According to Norman Gaither and Greg Frazier, \"Productivity is amount of products or services produced with the resources used.\" Productivity is the ratio of output to input. The goal of productivity is to produce the maximum output using the minimum resources."},
            {"label": "b", "model_answer": "According to the stimulus, 'Warsi Company' increased production from 50,00,000 to 70,00,000 carpets through technological improvement and increasing worker efficiency. Technology helps increase production and reduce costs. New technology makes the production process faster and more efficient. On the other hand, skilled workers can complete their work faster and more accurately, which increases the organization's overall productivity."},
            {"label": "c", "model_answer": "The advantages of increased productivity include:\n(1) More products can be produced\n(2) Better quality products\n(3) Reduced production cost per unit\n(4) Creation of loyal customers\n(5) Increased worker efficiency\n(6) Higher profit achievement\n(7) Opportunity to use new technologies\n(8) Helps achieve economic growth\n(9) Increases national competitive ability"},
            {"label": "d", "model_answer": "Key differences between production and productivity:\n\nNature — Production creates products, productivity indicates input-output ratio.\n\nUtility — Production creates form utility, productivity does not create any utility.\n\nScope — Scope of production is broad (from raw material collection to finished product), scope of productivity is relatively narrow (just input-output ratio).\n\nDynamics — Production has less dynamism, productivity has more dynamism.\n\nMeasurement — Production can be measured in units, productivity is expressed as a ratio.\n\nDependence — Production does not depend on productivity, but productivity depends on production."}
        ]
    },
    "hsc_prod1_cq_6": {
        "questions": [
            {"label": "a", "model_answer": "Productivity is the ratio of produced goods to resources used in production. According to Paul S. Samuelson, productivity is a name that denotes the ratio of output in relation to input. According to Heizer and Render, \"Productivity is the creation of goods and services.\" Increasing productivity means producing more goods and services using the same amount of resources."},
            {"label": "b", "model_answer": "As an entrepreneur, Mr. Sohel's initiatives are appropriate and commendable. He has taken important steps to increase productivity:\n\n(1) Use of modern machinery or technology — technology makes the production process faster and increases productivity.\n(2) Preservation of quality raw materials — using good quality raw materials ensures product quality.\n(3) Creating a good working environment — workers are more productive in a worker-friendly environment.\n(4) Recruiting and retaining skilled human resources — skilled workers play an important role in increasing productivity.\n(5) Increasing production — when productivity increases, total production, sales and profit increase."},
            {"label": "c", "model_answer": "Other steps needed to increase productivity:\n\n(1) Efficient management — ensuring optimal use of resources through proper planning and control.\n(2) Good relationship between management and workers — good relationships improve the work environment and increase productivity.\n(3) Proper layout — systematic arrangement of machinery and production processes saves time and labor.\n(4) Improved production process — using modern and improved production methods increases productivity.\n(5) Research and development — helps innovate new technologies and methods.\n(6) Incentive measures — incentives and reward systems motivate workers.\n\nThese 10 steps play an important role in increasing productivity."},
            {"label": "d", "model_answer": "Productivity has several disadvantages:\n\n(1) Decreased worker performance — excessive production pressure may reduce worker performance.\n(2) Reduced machinery effectiveness — overuse may reduce machinery effectiveness and cause breakdowns.\n(3) Increased storage costs — more production means higher storage costs.\n(4) Increased raw material costs — more production requires more raw materials, increasing costs.\n(5) Negative impact on quality control — rapid production may cause quality control issues.\n(6) Increased per-unit production cost — in some cases, increasing productivity may increase per-unit cost.\n(7) Pressure on capital — more production requires more capital.\n\nHowever, most of these disadvantages can be avoided by taking careful measures."}
        ]
    },
    "hsc_prod1_cq_7": {
        "questions": [
            {"label": "a", "model_answer": "The factors affecting productivity can be divided into three main categories:\n(1) Work-related factors\n(2) Resource-related factors\n(3) Environmental factors\n\nEach category includes multiple factors that influence productivity."},
            {"label": "b", "model_answer": "Work-related factors refer to elements related to workers' work. These include:\n\n(1) Workers' skills — whether workers are self-motivated and perform their duties efficiently affects productivity. Skilled workers are more productive.\n\n(2) Managerial factors — coordination and sincerity between management and workers is important. Good management increases productivity.\n\n(3) Production process — using improved and modern production processes increases productivity. Outdated processes reduce productivity."},
            {"label": "c", "model_answer": "How technological factors and finance affect productivity:\n\nTechnological factors: Organizations that are ahead in using modern technology have higher productivity. Technology makes the production process faster, more accurate and more efficient. For example, using automated machines can produce more products in less time.\n\nFinance: When an organization is financially strong, it can afford modern technology and hire experienced workers. Adequate funds enable research and development, training, and purchase of modern machinery, which increases productivity. Insufficient funds create obstacles to increasing productivity."},
            {"label": "d", "model_answer": "Environmental factors that affect productivity are divided into three components:\n\n(1) Natural factors — geographical location, weather, climate and natural resources affect productivity. For example, favorable weather increases agricultural productivity. Natural disasters reduce productivity.\n\n(2) Factory layout — proper arrangement of machinery and production processes increases productivity. Poor planning causes waste of time and labor. Proper layout ensures smooth flow from raw materials to finished products.\n\n(3) Work environment — workers are more productive in a worker-friendly environment. Adequate light, air, safety, temperature control etc. are part of the work environment. A good environment boosts worker morale and productivity."}
        ]
    }
}

with open('public/hsc/production_1st/english/chapter_1_cq.json') as f:
    en_cq = json.load(f)

for cq in en_cq:
    if cq['id'] in en_cq_updates:
        update = en_cq_updates[cq['id']]
        for sq_idx, sq_update in enumerate(update['questions']):
            if sq_idx < len(cq['questions']):
                cq['questions'][sq_idx]['model_answer'] = sq_update['model_answer']

with open('public/hsc/production_1st/english/chapter_1_cq.json', 'w') as f:
    json.dump(en_cq, f, ensure_ascii=False, indent=2)
print(f'Updated {len(en_cq_updates)} English CQs with proper model_answers')
