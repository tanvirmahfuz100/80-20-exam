import json

# 4 sample CQs from MD's সৃজনশীল নমুনা প্রশ্নোত্তর section
sample_cqs = [
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_8",
        "stem": "জনাব রফিক ঢাকার একজন ফার্নিচার ব্যবসায়ী। তিনি চট্টগ্রামে উৎপাদিত উৎকৃষ্ট মানের কাঠ সংগ্রহ করে বিভিন্ন ডিজাইনের ফার্নিচার তৈরি করে থাকেন। তার ফার্নিচারের গুণগত মান এবং ডিজাইন আকর্ষণীয় হওয়ার কারণে অল্প সময়ের মধ্যে তিনি এই ব্যবসায়ে সুনাম অর্জন করেছেন। বর্তমানে তার উৎপাদিত ফার্নিচার দেশের বিভিন্ন স্থানে ভোক্তাদের কাছে সরবরাহ করা হচ্ছে। ফলে তিনি ব্যবসায়িকভাবে লাভবান হচ্ছেন।",
        "stem_label": "উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও",
        "questions": [
            {"label": "ক", "question": "উৎপাদন কী?", "options": {"A": "পণ্য বিক্রয় করার প্রক্রিয়া", "B": "মানুষের জ্ঞান ও বুদ্ধিমত্তা দিয়ে প্রাকৃতিক সম্পদের সাহায্যে উপযোগ সৃষ্টি ও পণ্য তৈরি করাকে উৎপাদন বলে", "C": "পণ্য পরিবহনের প্রক্রিয়া", "D": "পণ্য মজুদ করার প্রক্রিয়া"}, "answer": "B", "explanation": "মানুষ তার কারিগরি জ্ঞান ও বুদ্ধিমত্তা দিয়ে প্রাকৃতিক সম্পদের সাহায্যে উপযোগ সৃষ্টি ও পণ্য তৈরি করাকে উৎপাদন বলে।"},
            {"label": "খ", "question": 'উৎপাদনশীলতা মুনাফা বাড়াতে সহায়ক — ব্যাখ্যা করো।', "options": {"A": "উৎপাদনশীলতা বাড়লে পণ্যের গুণাগুণ কমে যায়, ফলে মুনাফা বাড়ে", "B": "উৎপাদনশীলতা বাড়লে এককপ্রতি উৎপাদন ব্যয় কমে, বিক্রি ও মুনাফা বাড়ে", "C": "উৎপাদনশীলতা মুনাফার ওপর কোনো প্রভাব ফেলে না", "D": "উৎপাদনশীলতা কমলে মুনাফা বাড়ে"}, "answer": "B", "explanation": "উৎপাদনশীলতা বাড়লে একই পরিমাণ উপকরণ ব্যবহার করে আগের তুলনায় বেশি পণ্য উৎপাদন করা যায়। এতে এককপ্রতি উৎপাদন ব্যয় কম হয়। পণ্যমূল্য কম হওয়ার কারণে বিক্রি ও মুনাফা উভয়ই বেড়ে যায়।"},
            {"label": "গ", "question": "উদ্দীপকে জনাব রফিকের প্রাথমিক পর্যায়ের কাজের মাধ্যমে কোন ধরনের উপযোগ সৃষ্টি হয়েছে? ব্যাখ্যা করো।", "options": {"A": "সময়গত উপযোগ — কারণ তিনি পণ্য মজুদ করেন", "B": "স্থানগত উপযোগ — কারণ তিনি কাঠ ঢাকায় আনেন", "C": "রূপগত উপযোগ — কারণ তিনি কাঠের রূপ ও আকার পরিবর্তন করে ফার্নিচার তৈরি করেন", "D": "সেবাগত উপযোগ — কারণ তিনি ক্রেতাদের সেবা দেন"}, "answer": "C", "explanation": "জনাব রফিকের প্রাথমিক পর্যায়ের কাজের মাধ্যমে রূপগত উপযোগ সৃষ্টি হয়েছে। প্রকৃতি থেকে পাওয়া সম্পদের রূপ বা আকার পরিবর্তন করে ব্যবহার উপযোগী পণ্য তৈরি করে রূপগত উপযোগ সৃষ্টি করা হয়। জনাব রফিক কাঠ কাঁচামাল হিসেবে সংগ্রহ করে এর রূপ ও আকার পরিবর্তন করে ফার্নিচার তৈরি করেন।"},
            {"label": "ঘ", "question": '"স্থানগত উপযোগ সৃষ্টিই উদ্দীপকের প্রতিষ্ঠানের সফলতার মূল কারণ" — উক্তিটি মূল্যায়ন করো।', "options": {"A": "উক্তিটি ভুল, কারণ রূপগত উপযোগই সফলতার মূল কারণ", "B": "উক্তিটি যথার্থ, কারণ তিনি দেশের বিভিন্ন স্থানে ফার্নিচার সরবরাহ করে ক্রেতা তৈরি ও বিক্রি বাড়িয়েছেন", "C": "উক্তিটি আংশিক সত্য, কারণ সময়গত উপযোগ বেশি গুরুত্বপূর্ণ", "D": "উক্তিটি সম্পূর্ণ ভুল, কারণ শুধু স্থানগত উপযোগেই সফলতা আসে না"}, "answer": "B", "explanation": 'উক্তিটি যথার্থ। এক জায়গা থেকে অন্য জায়গায় পণ্য স্থানান্তরের মাধ্যমে স্থানগত উপযোগ সৃষ্টি হয়। জনাব রফিক তার উৎপাদিত ফার্নিচার দেশের বিভিন্ন স্থানে সরবরাহ করছেন। এতে ঢাকার বাইরের ক্রেতা তৈরি হচ্ছে এবং তার প্রতিষ্ঠানের বিক্রি বাড়ছে। তিনি যদি পরিবহনের মাধ্যমে ফার্নিচার দেশের বিভিন্ন স্থানে সরবরাহ না করতেন, তাহলে এত বেশি লাভবান হতে পারতেন না।'}
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_9",
        "stem": "জনাব মিনা কুমিল্লার বিসিক-এ ২৫ লক্ষ টাকা বিনিয়োগ করে ব্যবসা শুরু করেন। তিনি ৫ লক্ষ টাকার কাঁচামাল, ১৫ লক্ষ টাকার যন্ত্রপাতি, ২ লক্ষ টাকা কারখানা ভাড়া ও ২ লক্ষ টাকার অন্যান্য উপকরণ কিনে ৫০ লক্ষ টাকার সুতা ও জাল উৎপাদন করেন। অপরদিকে জনাব হাশেম ৩০ লক্ষ টাকা বিনিয়োগ করে ১০ লক্ষ টাকার কাঁচামাল, ১৫ লক্ষ টাকার যন্ত্রপাতি, ২ লক্ষ টাকা কারখানা ভাড়া ও ২ লক্ষ টাকার অন্যান্য উপকরণ কিনে ৩৫ লক্ষ টাকার পণ্য উৎপাদন করেন।",
        "stem_label": "উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও",
        "questions": [
            {"label": "ক", "question": "সংগঠন কী?", "options": {"A": "পণ্য বিক্রয় করার প্রক্রিয়া", "B": "উৎপাদনের উদ্দেশ্যে ভূমি, শ্রম ও মূলধনের আনুপাতিক সংগ্রহ, সংযোজন এবং উৎপাদনে নিয়োগ করার উদ্যোগ বা প্রচেষ্টা", "C": "পণ্য পরিবহনের ব্যবস্থা", "D": "কাঁচামাল সংগ্রহের প্রক্রিয়া"}, "answer": "B", "explanation": "উৎপাদনের উদ্দেশ্যে ভূমি, শ্রম ও মূলধনের আনুপাতিক সংগ্রহ, সংযোজন এবং উৎপাদনে নিয়োগ করার উদ্যোগ বা প্রচেষ্টাকে সংগঠন বলা হয়।"},
            {"label": "খ", "question": '"যৌথ উদ্যোগ বিশ্বব্যাপী পণ্য বিপণন করে" — ব্যাখ্যা করো।', "options": {"A": "যৌথ উদ্যোগ শুধু স্থানীয় বাজারে পণ্য বিক্রি করে", "B": "দুই বা ততোধিক দেশি ও বিদেশি কোম্পানির সমন্বয়ে গঠিত যৌথ উদ্যোগ বেশি মূলধন ও বিশ্বব্যাপী পণ্য সরবরাহে সক্ষম", "C": "যৌথ উদ্যোগে মুনাফা কম হয়", "D": "যৌথ উদ্যোগে শুধু দেশি কোম্পানি অংশ নেয়"}, "answer": "B", "explanation": "দুই বা ততোধিক দেশি ও বিদেশি কোম্পানির সমন্বয়ে কোন ব্যবসায় গঠিত হলে তাকে যৌথ উদ্যোগ বলে। একাধিক প্রতিষ্ঠান যুক্ত থাকে বলে এ সংগঠনের মূলধন বেশি হয়। একাধিক দেশ জড়িত থাকায় বিশ্বের বিভিন্ন জায়গায় পণ্য সরবরাহ করা সহজ হয়।"},
            {"label": "গ", "question": "উদ্দীপকে উল্লিখিত জনাব মিনার প্রতিষ্ঠানের উৎপাদনশীলতা নির্ণয় করো।", "options": {"A": "১.৫০", "B": "২.০৮", "C": "২.৫০", "D": "৩.০০"}, "answer": "B", "explanation": "জনাব মিনার প্রতিষ্ঠানের মোট উৎপাদন = ৫০,০০,০০০ টাকা। মোট উপকরণের মূল্য = (৫,০০,০০০ + ১৫,০০,০০০ + ২,০০,০০০ + ২,০০,০০০) = ২৪,০০,০০০ টাকা। মোট উৎপাদনশীলতা = ৫০,০০,০০০ / ২৪,০০,০০০ = ২.০৮।"},
            {"label": "ঘ", "question": "উৎপাদনশীলতা বিবেচনায় উদ্দীপকের কোন প্রতিষ্ঠানটি লাভজনক? বিশ্লেষণ করো।", "options": {"A": "জনাব হাশেমের প্রতিষ্ঠান, কারণ তার বিনিয়োগ বেশি", "B": "জনাব মিনার প্রতিষ্ঠান, কারণ তার উৎপাদনশীলতা (২.০৮) হাশেমের (১.২১) থেকে বেশি", "C": "উভয় প্রতিষ্ঠানই সমান লাভজনক", "D": "কোনোটিই লাভজনক নয়"}, "answer": "B", "explanation": "জনাব হাশেমের মোট উৎপাদনশীলতা = ৩৫,০০,০০০ / (১০,০০,০০০+১৫,০০,০০০+২,০০,০০০+২,০০,০০০) = ৩৫,০০,০০০ / ২৯,০০,০০০ = ১.২১। জনাব মিনার প্রতিষ্ঠানের উৎপাদনশীলতা (২.০৮) হাশেমের (১.২১) থেকে বেশি। মিনার কম উপকরণ ব্যবহার করে বেশি উৎপাদন করতে পেরেছেন, তাই তার প্রতিষ্ঠান বেশি লাভজনক।"}
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_10",
        "stem": "উৎপাদন মৌসুমে পেঁয়াজের দাম কম থাকলেও অ-মৌসুমে অস্বাভাবিকভাবে দাম বাড়ে। বিষয়টি চিন্তা করে 'একতা কৃষক সমিতি' উৎপাদন মৌসুমে পেঁয়াজ সংগ্রহ করে আধুনিক প্রযুক্তির মাধ্যমে তা সংরক্ষণের ব্যবস্থা করে পরবর্তীতে অ-মৌসুমে ন্যায্যমূল্যে ক্রেতাদের কাছে সরবরাহ করে। সমিতির সদস্যরা যাবতীয় কার্যাবলি নিজেরাই সম্পাদন করে। ফলে খরচ তুলনামূলক কম হয়। এতে তারা বেশ লাভবান হচ্ছে। সমিতির সদস্যরা লাভ-লোকসান সমানভাবে ভাগ করে নেয়। এতে সদস্যদের কর্মসংস্থানের মাধ্যমে জীবনযাত্রার মানের উন্নতি হচ্ছে।",
        "stem_label": "উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও",
        "questions": [
            {"label": "ক", "question": "উৎপাদন কী?", "options": {"A": "পণ্য বিক্রয় করার প্রক্রিয়া", "B": "প্রকৃতি থেকে পাওয়া সম্পদের রূপ বা আকৃতি পরিবর্তন করে মানুষের ব্যবহার উপযোগী পণ্য তৈরির প্রক্রিয়া", "C": "পণ্য সংরক্ষণের প্রক্রিয়া", "D": "পণ্য আমদানির প্রক্রিয়া"}, "answer": "B", "explanation": "প্রকৃতি থেকে পাওয়া সম্পদের রূপ বা আকৃতি পরিবর্তন করে মানুষের ব্যবহার উপযোগী পণ্য তৈরির প্রক্রিয়াকে উৎপাদন বলে।"},
            {"label": "খ", "question": '"উৎপাদন কর্মসংস্থান সৃষ্টি করে" — ব্যাখ্যা করো।', "options": {"A": "উৎপাদন কাজে কম লোকের প্রয়োজন হয়", "B": "উৎপাদন কাজের জন্য শ্রমিক-কর্মী নিয়োগের মাধ্যমে কর্মসংস্থানের সুযোগ সৃষ্টি হয়", "C": "উৎপাদন কর্মসংস্থান কমায়", "D": "উৎপাদনের সাথে কর্মসংস্থানের কোনো সম্পর্ক নেই"}, "answer": "B", "explanation": "উৎপাদন কাজের জন্য প্রয়োজনীয় শ্রমিক-কর্মী নিয়োগের মাধ্যমে কর্মসংস্থানের সুযোগ সৃষ্টি হয়। কাঁচামাল সংগ্রহ, যন্ত্রপাতি চালনা, পণ্যের মান নিয়ন্ত্রণ, সঠিক ব্যবস্থাপনাসহ আরো অনেক কাজ ধারাবাহিকভাবে করতে হয়। এজন্য মালিক বা উদ্যোক্তাকে শ্রমিক ও কর্মচারী নিয়োগ করে উৎপাদন কাজ গতিশীল রাখতে হয়।"},
            {"label": "গ", "question": "উদ্দীপকে উল্লিখিত 'একতা কৃষক সমিতি' প্রথমে কোন ধরনের উপযোগ সৃষ্টি করছে? ব্যাখ্যা করো।", "options": {"A": "রূপগত উপযোগ — কারণ তারা পেঁয়াজ প্রক্রিয়াজাত করে", "B": "স্থানগত উপযোগ — কারণ তারা পেঁয়াজ পরিবহন করে", "C": "সময়গত উপযোগ — কারণ তারা এক সময়ের পণ্য অন্য সময়ের জন্য সংরক্ষণ করে", "D": "স্বত্বগত উপযোগ — কারণ তারা পেঁয়াজ বিক্রি করে"}, "answer": "C", "explanation": "'একতা কৃষক সমিতি' প্রথমে সময়গত উপযোগ সৃষ্টি করছে। এক সময়ের উৎপাদিত পণ্য সংরক্ষণ করে অন্য সময়ে ভোগের মাধ্যমে মানুষের অভাব পূরণ করলে সময়গত উপযোগ সৃষ্টি হয়। সমিতি উৎপাদন মৌসুমে পেঁয়াজ সংগ্রহ করে সংরক্ষণ করে এবং অ-মৌসুমে সরবরাহ করে। এতে ঘাটতি মৌসুমেও ক্রেতারা পেঁয়াজ ভোগের সুযোগ পাচ্ছে।"},
            {"label": "ঘ", "question": "সদস্যদের জীবনযাত্রার মান উন্নয়নে 'একতা কৃষক সমিতি'-এর অবদান মূল্যায়ন করো।", "options": {"A": "সমিতির কোনো অবদান নেই", "B": "সমিতি শুধু পেঁয়াজ সংরক্ষণে ভূমিকা রাখে", "C": "সমিতির সদস্যরা সব কাজ নিজেরাই করে মুনাফা ভাগ করে নেয়ায় কর্মসংস্থান ও আয় বৃদ্ধির মাধ্যমে জীবনযাত্রার মান উন্নত হয়েছে", "D": "শুধু পেঁয়াজের দাম কমানোই সমিতির একমাত্র অবদান"}, "answer": "C", "explanation": "একতা কৃষক সমিতির সদস্যদের পেঁয়াজ সংগ্রহ, সংরক্ষণ ও বিক্রির ফলে কর্মসংস্থানের সুযোগ সৃষ্টি হচ্ছে। সদস্যরা সব কাজ নিজেরাই করে ন্যায্যমূল্যে পেঁয়াজ বিক্রি করে এবং মুনাফা সমানভাবে ভাগ করে নেয়। এতে তাদের বেকার সমস্যার সমাধান হওয়ার পাশাপাশি আয়ও বাড়ছে, যা জীবনযাত্রার মান উন্নয়নে গুরুত্বপূর্ণ ভূমিকা রাখছে।"}
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_11",
        "stem": "২০১৯ সালে স্টাইল জোন লি.-এর উৎপাদিত পণ্যের মূল্য ছিল ১০,০০,০০০ টাকা। এ সময় প্রতিষ্ঠানটির ব্যবহৃত উপকরণের মূল্য ছিল যথাক্রমে কাঁচামাল ৪,০০,০০০ টাকা, বেতন ও মজুরি ২,০০,০০০ টাকা এবং অন্যান্য ১,০০,০০০ টাকা। ২০১৮ সালে উৎপাদনের পরিমাণ একই থাকলেও ব্যবহৃত উপকরণ মূল্য ছিল যথাক্রমে কাঁচামাল ৪,৫০,০০০ টাকা, বেতন ও মজুরি ২,০০,০০০ টাকা এবং অন্যান্য ১,৫০,০০০ টাকা।",
        "stem_label": "উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও",
        "questions": [
            {"label": "ক", "question": "উপযোগ কী?", "options": {"A": "পণ্য উৎপাদনের ক্ষমতা", "B": "কোনো পণ্য বা সেবার মধ্যে মানুষের অভাব পূরণের ক্ষমতা", "C": "পণ্য বিক্রয়ের ক্ষমতা", "D": "পণ্য সংরক্ষণের ক্ষমতা"}, "answer": "B", "explanation": "কোনো পণ্য বা সেবার মধ্যে মানুষের অভাব পূরণের যে ক্ষমতা থাকে তাকে ঐ পণ্য বা সেবার উপযোগ বলে।"},
            {"label": "খ", "question": "সূত্রের মাধ্যমে কীভাবে কাঁচামালের উৎপাদনশীলতা নির্ণয় করা হয়?", "options": {"A": "কাঁচামালের মূল্য / মোট উৎপাদিত পণ্যের মূল্য", "B": "মোট উৎপাদিত পণ্যের মূল্য / কাঁচামালের মূল্য", "C": "কাঁচামালের পরিমাণ × মোট উৎপাদন", "D": "মোট উৎপাদন / কাঁচামালের পরিমাণ"}, "answer": "B", "explanation": "মোট উৎপাদিত পণ্যের মূল্য এবং উৎপাদনে ব্যবহৃত কাঁচামালের মূল্যের অনুপাতকে কাঁচামালের উৎপাদনশীলতা বলে। সূত্র: কাঁচামালের উৎপাদনশীলতা = মোট উৎপাদিত পণ্যের মূল্য / কাঁচামালের মূল্য।"},
            {"label": "গ", "question": "২০১৯ সালের জন্য স্টাইল জোন লি.-এর মোট উৎপাদনশীলতা নির্ণয় করো।", "options": {"A": "১.২৫", "B": "১.৪৩", "C": "২.০০", "D": "২.৫০"}, "answer": "B", "explanation": "২০১৯ সালে মোট উৎপাদন = ১০,০০,০০০ টাকা। মোট উপকরণ = (৪,০০,০০০+২,০০,০০০+১,০০,০০০) = ৭,০০,০০০ টাকা। মোট উৎপাদনশীলতা = ১০,০০,০০০ / ৭,০০,০০০ = ১.৪৩।"},
            {"label": "ঘ", "question": "উদ্দীপকের আলোকে ২০১৮ সালের জন্য প্রতিষ্ঠানের উৎপাদনের সামগ্রিক অবস্থা মূল্যায়ন করো।", "options": {"A": "২০১৮ সালের অবস্থা ভালো, কারণ উৎপাদন বেশি ছিল", "B": "২০১৮ সালের উৎপাদনশীলতা (১.২৫) ২০১৯ সালের (১.৪৩) থেকে কম, তাই প্রতিষ্ঠান ২০১৯ সালে বেশি দক্ষ ছিল", "C": "উভয় বছর সমান", "D": "২০১৮ সালে কোনো উৎপাদন হয়নি"}, "answer": "B", "explanation": "২০১৮ সালের মোট উৎপাদনশীলতা = ১০,০০,০০০ / (৪,৫০,০০০+২,০০,০০০+১,৫০,০০০) = ১০,০০,০০০ / ৮,০০,০০০ = ১.২৫। ২০১৯ সালের উৎপাদনশীলতা ১.৪৩, যা ২০১৮ সালের ১.২৫ থেকে বেশি। প্রতিষ্ঠানটি ২০১৯ সালে সম্পদ বা উপকরণগুলো আরও সঠিকভাবে ব্যবহার করতে সমর্থ হয়েছে এবং কাঁচামাল ও অন্যান্য খাতে অপচয় কমাতে সক্ষম হয়েছে।"}
        ]
    }
]

# Add Bengali CQs
with open('public/hsc/production_1st/chapter_1_cq.json') as f:
    bn_cq = json.load(f)

existing_ids = {cq['id'] for cq in bn_cq}
new_count = 0
for cq in sample_cqs:
    if cq['id'] not in existing_ids:
        bn_cq.append(cq)
        new_count += 1

with open('public/hsc/production_1st/chapter_1_cq.json', 'w') as f:
    json.dump(bn_cq, f, ensure_ascii=False, indent=2)
print(f'Added {new_count} Bengali CQs. Total: {len(bn_cq)}')

# English translations
en_translations = [
    {
        "stem": "Mr. Rafiq is a furniture businessman in Dhaka. He collects quality wood produced in Chattogram and makes various designed furniture. Due to the quality and attractive design of his furniture, he has gained reputation in this business in a short time. Currently, his furniture is being supplied to consumers in different parts of the country. As a result, he is profiting from the business.",
        "questions": [
            {"label": "a", "q": "What is production?", "A": "The process of selling products", "B": "Creating utility and products using natural resources with human knowledge and intelligence", "C": "The process of transporting products", "D": "The process of storing products", "answer": "B", "explanation": "Production is the process of creating utility and products with the help of natural resources using human technical knowledge and intelligence."},
            {"label": "b", "q": 'Productivity helps increase profit — explain.', "A": "When productivity increases, product quality decreases, so profit increases", "B": "When productivity increases, per-unit production cost decreases, sales and profit increase", "C": "Productivity has no effect on profit", "D": "When productivity decreases, profit increases", "answer": "B", "explanation": "When productivity increases, more products can be produced using the same amount of resources. This reduces per-unit production cost. Due to lower product prices, both sales and profit increase."},
            {"label": "c", "q": "What type of utility is created through Mr. Rafiq's primary work? Explain.", "A": "Time utility — because he stores products", "B": "Place utility — because he brings wood to Dhaka", "C": "Form utility — because he changes the form and shape of wood to make furniture", "D": "Service utility — because he serves customers", "answer": "C", "explanation": "Form utility is created through Mr. Rafiq's primary work. Changing the form or shape of natural resources to create usable products creates form utility. Mr. Rafiq collects wood as raw material and changes its form and shape to make furniture."},
            {"label": "d", "q": '"Creation of place utility is the main reason for the success of the establishment in the stimulus" — evaluate.', "A": "The statement is wrong, because form utility is the main reason for success", "B": "The statement is correct, because he supplies furniture to different parts of the country, creating customers and increasing sales", "C": "The statement is partially true, because time utility is more important", "D": "The statement is completely wrong, because success does not come only from place utility", "answer": "B", "explanation": "The statement is correct. Place utility is created by transferring products from one place to another. Mr. Rafiq is supplying his furniture to different parts of the country, creating customers outside Dhaka and increasing sales."}
        ]
    },
    {
        "stem": "Mr. Mina started a business with an investment of Tk 25 lakh at BSCIC in Cumilla. He bought raw materials worth Tk 5 lakh, machinery worth Tk 15 lakh, factory rent Tk 2 lakh and other resources Tk 2 lakh, and produced thread and nets worth Tk 50 lakh. On the other hand, Mr. Hashem invested Tk 30 lakh and bought raw materials worth Tk 10 lakh, machinery worth Tk 15 lakh, factory rent Tk 2 lakh and other resources Tk 2 lakh, and produced products worth Tk 35 lakh.",
        "questions": [
            {"label": "a", "q": "What is organization?", "A": "The process of selling products", "B": "The initiative or effort to proportionally collect, combine and employ land, labor and capital for the purpose of production", "C": "The system of product transportation", "D": "The process of collecting raw materials", "answer": "B", "explanation": "The initiative or effort to proportionally collect, combine and employ land, labor and capital for the purpose of production is called organization."},
            {"label": "b", "q": '"Joint venture markets products globally" — explain.', "A": "Joint ventures only sell products in local markets", "B": "Joint ventures formed by combining two or more domestic and foreign companies have more capital and can supply products globally", "C": "Joint ventures have lower profits", "D": "Only domestic companies participate in joint ventures", "answer": "B", "explanation": "When a business is formed by combining two or more domestic and foreign companies, it is called a joint venture. Due to multiple companies, the organization has more capital and can supply products to different parts of the world."},
            {"label": "c", "q": "Determine the productivity of Mr. Mina's establishment mentioned in the stimulus.", "A": "1.50", "B": "2.08", "C": "2.50", "D": "3.00", "answer": "B", "explanation": "Mr. Mina's total production = Tk 50,00,000. Total input = (5,00,000+15,00,000+2,00,000+2,00,000) = Tk 24,00,000. Overall productivity = 50,00,000/24,00,000 = 2.08."},
            {"label": "d", "q": "Considering productivity, which establishment in the stimulus is profitable? Analyze.", "A": "Mr. Hashem's establishment, because his investment is higher", "B": "Mr. Mina's establishment, because his productivity (2.08) is higher than Hashem's (1.21)", "C": "Both establishments are equally profitable", "D": "Neither is profitable", "answer": "B", "explanation": "Mr. Hashem's productivity = 35,00,000/(10,00,000+15,00,000+2,00,000+2,00,000) = 35,00,000/29,00,000 = 1.21. Mr. Mina's productivity (2.08) is higher than Hashem's (1.21), meaning Mina used fewer resources to produce more."}
        ]
    },
    {
        "stem": "During the production season, onion prices are low, but in the off-season, prices increase abnormally. Considering this, 'Ekta Krishak Samity' collects onions during the production season, preserves them using modern technology, and supplies them to consumers at fair prices in the off-season. The members of the Samity perform all activities themselves, so costs are relatively low. They are quite profitable. The members share profits and losses equally. Through employment, their standard of living is improving.",
        "questions": [
            {"label": "a", "q": "What is production?", "A": "The process of selling products", "B": "The process of changing the form or shape of natural resources to create products usable by humans", "C": "The process of storing products", "D": "The process of importing products", "answer": "B", "explanation": "Production is the process of changing the form or shape of natural resources to create products usable by humans."},
            {"label": "b", "q": '"Production creates employment" — explain.', "A": "Production requires few workers", "B": "Employment opportunities are created by hiring workers for production work", "C": "Production reduces employment", "D": "Production has no relation to employment", "answer": "B", "explanation": "Employment opportunities are created by hiring necessary workers for production work. Raw material collection, machine operation, quality control, management — many tasks need to be done continuously, requiring the owner to hire workers."},
            {"label": "c", "q": "What type of utility is 'Ekta Krishak Samity' creating first in the stimulus? Explain.", "A": "Form utility — because they process onions", "B": "Place utility — because they transport onions", "C": "Time utility — because they preserve products from one time for another time", "D": "Possession utility — because they sell onions", "answer": "C", "explanation": "'Ekta Krishak Samity' is first creating time utility. When products from one time are preserved for consumption at another time to satisfy human wants, time utility is created. The Samity collects onions during the production season, preserves them, and supplies them in the off-season."},
            {"label": "d", "q": "Evaluate the contribution of 'Ekta Krishak Samity' in improving members' standard of living.", "A": "The Samity has no contribution", "B": "The Samity only plays a role in onion preservation", "C": "Members doing all work themselves and sharing profits has improved employment, income, and standard of living", "D": "Reducing onion prices is the Samity's only contribution", "answer": "C", "explanation": "Through onion collection, preservation, and selling, employment opportunities are created for Samity members. Members do all work themselves, sell onions at fair prices, and share profits equally. This solves unemployment and increases income."}
        ]
    },
    {
        "stem": "In 2019, Style Zone Ltd.'s produced product value was Tk 10,00,000. The cost of resources used was: raw materials Tk 4,00,000, salaries and wages Tk 2,00,000, and others Tk 1,00,000. In 2018, with the same production quantity, resource costs were: raw materials Tk 4,50,000, salaries and wages Tk 2,00,000, and others Tk 1,50,000.",
        "questions": [
            {"label": "a", "q": "What is utility?", "A": "The ability to produce products", "B": "The capacity of a product or service to satisfy human wants", "C": "The ability to sell products", "D": "The ability to store products", "answer": "B", "explanation": "The capacity of a product or service to satisfy human wants is called utility."},
            {"label": "b", "q": "How is material productivity determined through formula?", "A": "Value of materials / Total value of output", "B": "Total value of output / Value of materials", "C": "Quantity of materials × Total production", "D": "Total production / Quantity of materials", "answer": "B", "explanation": "Material productivity = Total value of output / Value of materials used. It is the ratio of total output value to the value of raw materials used in production."},
            {"label": "c", "q": "Determine the overall productivity of Style Zone Ltd. for 2019.", "A": "1.25", "B": "1.43", "C": "2.00", "D": "2.50", "answer": "B", "explanation": "2019 total output = Tk 10,00,000. Total input = (4,00,000+2,00,000+1,00,000) = Tk 7,00,000. Overall productivity = 10,00,000/7,00,000 = 1.43."},
            {"label": "d", "q": "Evaluate the overall production situation of the establishment for 2018 in light of the stimulus.", "A": "2018 was better because production was higher", "B": "2018 productivity (1.25) was lower than 2019 (1.43), so the establishment was more efficient in 2019", "C": "Both years were equal", "D": "No production occurred in 2018", "answer": "B", "explanation": "2018 overall productivity = 10,00,000/(4,50,000+2,00,000+1,50,000) = 10,00,000/8,00,000 = 1.25. 2019 productivity (1.43) is higher than 2018 (1.25), indicating more efficient resource utilization."}
        ]
    }
]

# Add English CQs
with open('public/hsc/production_1st/english/chapter_1_cq.json') as f:
    en_cq = json.load(f)

existing_en_ids = {cq['id'] for cq in en_cq}
new_en_count = 0
for i, t in enumerate(en_translations):
    cq_id = f"hsc_prod1_cq_{i + 8}"  # cq_8 through cq_11
    if cq_id not in existing_en_ids:
        qs = []
        for sq in t['questions']:
            qs.append({
                "label": sq['label'],
                "question": sq['q'],
                "options": {"A": sq['A'], "B": sq['B'], "C": sq['C'], "D": sq['D']},
                "answer": sq['answer'],
                "explanation": sq['explanation']
            })
        en_cq.append({
            "_type": "creative_question",
            "id": cq_id,
            "stem": t['stem'],
            "stem_label": "Read the stimulus and answer the following questions",
            "questions": qs
        })
        new_en_count += 1

with open('public/hsc/production_1st/english/chapter_1_cq.json', 'w') as f:
    json.dump(en_cq, f, ensure_ascii=False, indent=2)
print(f'Added {new_en_count} English CQs. Total: {len(en_cq)}')
