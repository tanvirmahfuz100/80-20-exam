import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(indexPath, 'utf8');
raw = raw.replace(/^\uFEFF/, '');
const idx = JSON.parse(raw);

// ICT subject definition
const ict = {
  id: 'ict',
  name: 'ICT',
  icon: 'Monitor',
  name_en: 'ICT',
  name_bn: 'আইসিটি',
  topics: [
    {
      id: 'board_2026',
      name: 'Board Exams 2026',
      name_bn: 'বোর্ড পরীক্ষা ২০২৬',
      name_en: 'Board Exams 2026',
      chapters: [
        { id: 'board_dhaka_2026', name: 'Dhaka Board 2026', name_bn: 'ঢাকা বোর্ড ২০২৬', file: '/ssc/ict/28.json' },
        { id: 'board_mymensingh_2026', name: 'Mymensingh Board 2026', name_bn: 'ময়মনসিংহ বোর্ড ২০২৬', file: '/ssc/ict/59.json' },
        { id: 'board_rajshahi_2026', name: 'Rajshahi Board 2026', name_bn: 'রাজশাহী বোর্ড ২০২৬', file: '/ssc/ict/87.json' },
        { id: 'board_cumilla_2026', name: 'Cumilla Board 2026', name_bn: 'কুমিল্লা বোর্ড ২০২৬', file: '/ssc/ict/10.json' },
        { id: 'board_jashore_2026', name: 'Jashore Board 2026', name_bn: 'যশোর বোর্ড ২০২৬', file: '/ssc/ict/75.json' },
        { id: 'board_chattogram_2026', name: 'Chattogram Board 2026', name_bn: 'চট্টগ্রাম বোর্ড ২০২৬', file: '/ssc/ict/19.json' },
        { id: 'board_dinajpur_2026', name: 'Dinajpur Board 2026', name_bn: 'দিনাজপুর বোর্ড ২০২৬', file: '/ssc/ict/35.json' },
        { id: 'board_sylhet_2026', name: 'Sylhet Board 2026', name_bn: 'সিলেট বোর্ড ২০২৬', file: '/ssc/ict/96.json' },
        { id: 'board_barishal_2026', name: 'Barishal Board 2026', name_bn: 'বরিশাল বোর্ড ২০২৬', file: '/ssc/ict/51.json' },
        { id: 'board_madrasah_2026', name: 'Madrasah Board 2026', name_bn: 'মাদ্রাসা বোর্ড ২০২৬', file: '/ssc/ict/68.json' },
      ]
    },
    {
      id: 'board_2025',
      name: 'Board Exams 2025',
      name_bn: 'বোর্ড পরীক্ষা ২০২৫',
      name_en: 'Board Exams 2025',
      chapters: [
        { id: 'board_dhaka_2025', name: 'Dhaka Board 2025', name_bn: 'ঢাকা বোর্ড ২০২৫', file: '/ssc/ict/27.json' },
        { id: 'board_mymensingh_2025', name: 'Mymensingh Board 2025', name_bn: 'ময়মনসিংহ বোর্ড ২০২৫', file: '/ssc/ict/58.json' },
        { id: 'board_rajshahi_2025', name: 'Rajshahi Board 2025', name_bn: 'রাজশাহী বোর্ড ২০২৫', file: '/ssc/ict/86.json' },
        { id: 'board_cumilla_2025', name: 'Cumilla Board 2025', name_bn: 'কুমিল্লা বোর্ড ২০২৫', file: '/ssc/ict/9.json' },
        { id: 'board_jashore_2025', name: 'Jashore Board 2025', name_bn: 'যশোর বোর্ড ২০২৫', file: '/ssc/ict/74.json' },
        { id: 'board_chattogram_2025', name: 'Chattogram Board 2025', name_bn: 'চট্টগ্রাম বোর্ড ২০২৫', file: '/ssc/ict/18.json' },
        { id: 'board_dinajpur_2025', name: 'Dinajpur Board 2025', name_bn: 'দিনাজপুর বোর্ড ২০২৫', file: '/ssc/ict/34.json' },
        { id: 'board_sylhet_2025', name: 'Sylhet Board 2025', name_bn: 'সিলেট বোর্ড ২০২৫', file: '/ssc/ict/95.json' },
        { id: 'board_barishal_2025', name: 'Barishal Board 2025', name_bn: 'বরিশাল বোর্ড ২০২৫', file: '/ssc/ict/50.json' },
        { id: 'board_madrasah_2025', name: 'Madrasah Board 2025', name_bn: 'মাদ্রাসা বোর্ড ২০২৫', file: '/ssc/ict/67.json' },
      ]
    },
    {
      id: 'board_2024',
      name: 'Board Exams 2024',
      name_bn: 'বোর্ড পরীক্ষা ২০২৪',
      name_en: 'Board Exams 2024',
      chapters: [
        { id: 'board_dhaka_2024', name: 'Dhaka Board 2024', name_bn: 'ঢাকা বোর্ড ২০২৪', file: '/ssc/ict/26.json' },
        { id: 'board_mymensingh_2024', name: 'Mymensingh Board 2024', name_bn: 'ময়মনসিংহ বোর্ড ২০২৪', file: '/ssc/ict/57.json' },
        { id: 'board_rajshahi_2024', name: 'Rajshahi Board 2024', name_bn: 'রাজশাহী বোর্ড ২০২৪', file: '/ssc/ict/85.json' },
        { id: 'board_cumilla_2024', name: 'Cumilla Board 2024', name_bn: 'কুমিল্লা বোর্ড ২০২৪', file: '/ssc/ict/8.json' },
        { id: 'board_jashore_2024', name: 'Jashore Board 2024', name_bn: 'যশোর বোর্ড ২০২৪', file: '/ssc/ict/73.json' },
        { id: 'board_chattogram_2024', name: 'Chattogram Board 2024', name_bn: 'চট্টগ্রাম বোর্ড ২০২৪', file: '/ssc/ict/17.json' },
        { id: 'board_dinajpur_2024', name: 'Dinajpur Board 2024', name_bn: 'দিনাজপুর বোর্ড ২০২৪', file: '/ssc/ict/33.json' },
        { id: 'board_sylhet_2024', name: 'Sylhet Board 2024', name_bn: 'সিলেট বোর্ড ২০২৪', file: '/ssc/ict/94.json' },
        { id: 'board_barishal_2024', name: 'Barishal Board 2024', name_bn: 'বরিশাল বোর্ড ২০২৪', file: '/ssc/ict/49.json' },
        { id: 'board_madrasah_2024', name: 'Madrasah Board 2024', name_bn: 'মাদ্রাসা বোর্ড ২০২৪', file: '/ssc/ict/66.json' },
      ]
    },
    {
      id: 'board_2023',
      name: 'Board Exams 2023',
      name_bn: 'বোর্ড পরীক্ষা ২০২৩',
      name_en: 'Board Exams 2023',
      chapters: [
        { id: 'board_dhaka_2023', name: 'Dhaka Board 2023', name_bn: 'ঢাকা বোর্ড ২০২৩', file: '/ssc/ict/25.json' },
        { id: 'board_mymensingh_2023', name: 'Mymensingh Board 2023', name_bn: 'ময়মনসিংহ বোর্ড ২০২৩', file: '/ssc/ict/56.json' },
        { id: 'board_rajshahi_2023', name: 'Rajshahi Board 2023', name_bn: 'রাজশাহী বোর্ড ২০২৩', file: '/ssc/ict/84.json' },
        { id: 'board_cumilla_2023', name: 'Cumilla Board 2023', name_bn: 'কুমিল্লা বোর্ড ২০২৩', file: '/ssc/ict/7.json' },
        { id: 'board_jashore_2023', name: 'Jashore Board 2023', name_bn: 'যশোর বোর্ড ২০২৩', file: '/ssc/ict/72.json' },
        { id: 'board_chattogram_2023', name: 'Chattogram Board 2023', name_bn: 'চট্টগ্রাম বোর্ড ২০২৩', file: '/ssc/ict/16.json' },
        { id: 'board_dinajpur_2023', name: 'Dinajpur Board 2023', name_bn: 'দিনাজপুর বোর্ড ২০২৩', file: '/ssc/ict/32.json' },
        { id: 'board_sylhet_2023', name: 'Sylhet Board 2023', name_bn: 'সিলেট বোর্ড ২০২৩', file: '/ssc/ict/93.json' },
        { id: 'board_barishal_2023', name: 'Barishal Board 2023', name_bn: 'বরিশাল বোর্ড ২০২৩', file: '/ssc/ict/48.json' },
        { id: 'board_madrasah_2023', name: 'Madrasah Board 2023', name_bn: 'মাদ্রাসা বোর্ড ২০২৩', file: '/ssc/ict/65.json' },
      ]
    },
    {
      id: 'board_2020',
      name: 'Board Exams 2020 (All)',
      name_bn: 'সকল বোর্ড ২০২০',
      name_en: 'Combined 2020',
      chapters: [
        { id: 'board_all_2020', name: 'All Boards 2020 Combined', name_bn: 'সকল বোর্ড ২০২০', file: '/ssc/ict/90.json' },
      ]
    },
    {
      id: 'board_2019',
      name: 'Board Exams 2019',
      name_bn: 'বোর্ড পরীক্ষা ২০১৯',
      name_en: 'Board Exams 2019',
      chapters: [
        { id: 'board_all_2019', name: 'All Boards 2019 Combined (7)', name_bn: 'ঢাকা, রাজশাহী, কুমিল্লা, চট্টগ্রাম, দিনাজপুর, সিলেট, বরিশাল বোর্ড ২০১৯', file: '/ssc/ict/31.json' },
        { id: 'board_jashore_2019', name: 'Jashore Board 2019', name_bn: 'যশোর বোর্ড ২০১৯', file: '/ssc/ict/71.json' },
        { id: 'board_madrasah_2019', name: 'Madrasah Board 2019', name_bn: 'মাদ্রাসা বোর্ড ২০১৯', file: '/ssc/ict/63.json' },
      ]
    },
    {
      id: 'board_2018',
      name: 'Board Exams 2018',
      name_bn: 'বোর্ড পরীক্ষা ২০১৮',
      name_en: 'Board Exams 2018',
      chapters: [
        { id: 'board_all_2018', name: 'All Boards 2018 Combined', name_bn: 'সকল বোর্ড ২০১৮', file: '/ssc/ict/89.json' },
        { id: 'board_madrasah_2018', name: 'Madrasah Board 2018', name_bn: 'মাদ্রাসা বোর্ড ২০১৮', file: '/ssc/ict/62.json' },
      ]
    },
    {
      id: 'board_2017',
      name: 'Board Exams 2017',
      name_bn: 'বোর্ড পরীক্ষা ২০১৭',
      name_en: 'Board Exams 2017',
      chapters: [
        { id: 'board_all_2017', name: 'All Boards 2017 Combined', name_bn: 'সকল বোর্ড ২০১৭', file: '/ssc/ict/88.json' },
        { id: 'board_madrasah_2017', name: 'Madrasah Board 2017', name_bn: 'মাদ্রাসা বোর্ড ২০১৭', file: '/ssc/ict/61.json' },
      ]
    },
    {
      id: 'school_2025',
      name: 'School & College Exams 2025',
      name_bn: 'স্কুল ও কলেজ পরীক্ষা ২০২৫',
      name_en: 'School & College Exams 2025',
      chapters: [
        { id: 'school_ideal_2025', name: 'Ideal School & College, Motijheel 2025', name_bn: 'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল ২০২৫', file: '/ssc/ict/2.json' },
        { id: 'school_adamjee_2025', name: 'Adamjee Cantonment Public School 2025', name_bn: 'আদমজী ক্যান্টনমেন্ট পাবলিক স্কুল ২০২৫', file: '/ssc/ict/4.json' },
        { id: 'school_cumilla_cadet_2025', name: 'Cumilla Cadet College 2025', name_bn: 'কুমিল্লা ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/6.json' },
        { id: 'school_joypurhat_gls_cadet_2025', name: 'Joypurhat Girls Cadet College 2025', name_bn: 'জয়পুরহাট গার্লস ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/22.json' },
        { id: 'school_jhenaidah_cadet_2025', name: 'Jhenaidah Cadet College 2025', name_bn: 'ঝিনাইদহ ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/23.json' },
        { id: 'school_dhaka_residential_2025', name: 'Dhaka Residential Model College 2025', name_bn: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ ২০২৫', file: '/ssc/ict/30.json' },
        { id: 'school_pabna_cadet_2025', name: 'Pabna Cadet College 2025', name_bn: 'পাবনা ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/39.json' },
        { id: 'school_feni_gls_cadet_2025', name: 'Feni Girls Cadet College 2025', name_bn: 'ফেনী গার্লস ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/42.json' },
        { id: 'school_faujdarhat_cadet_2025', name: 'Faujdarhat Cadet College 2025', name_bn: 'ফৌজদারহাট ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/44.json' },
        { id: 'school_barishal_cadet_2025', name: 'Barishal Cadet College 2025', name_bn: 'বরিশাল ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/47.json' },
        { id: 'school_birshreshtha_nmpc_2025', name: 'Birshreshtha Noor Mohammad Public College 2025', name_bn: 'বীরশ্রেষ্ঠ নূর মোহাম্মদ পাবলিক কলেজ ২০২৫', file: '/ssc/ict/53.json' },
        { id: 'school_viquarunnisa_2025', name: 'Viquarunnisa Noon School & College 2025', name_bn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ ২০২৫', file: '/ssc/ict/55.json' },
        { id: 'school_mirzapur_cadet_2025', name: 'Mirzapur Cadet College 2025', name_bn: 'মির্জাপুর ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/69.json' },
        { id: 'school_rangpur_cadet_2025', name: 'Rangpur Cadet College 2025', name_bn: 'রংপুর ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/77.json' },
        { id: 'school_rajuk_uttara_2025', name: 'Rajuk Uttara Model College 2025', name_bn: 'রাজউক উত্তরা মডেল কলেজ ২০২৫', file: '/ssc/ict/79.json' },
        { id: 'school_rajshahi_cadet_2025', name: 'Rajshahi Cadet College 2025', name_bn: 'রাজশাহী ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/82.json' },
        { id: 'school_sylhet_cadet_2025', name: 'Sylhet Cadet College 2025', name_bn: 'সিলেট ক্যাডেট কলেজ ২০২৫', file: '/ssc/ict/92.json' },
        { id: 'school_st_joseph_2025', name: 'St. Joseph Higher Secondary School 2025', name_bn: 'সেন্ট যোসেফ উচ্চ মাধ্যমিক বিদ্যালয় ২০২৫', file: '/ssc/ict/97.json' },
        { id: 'school_holy_cross_2025', name: 'Holy Cross High School 2025', name_bn: 'হলি ক্রস উচ্চ বালিকা বিদ্যালয় ২০২৫', file: '/ssc/ict/98.json' },
      ]
    },
    {
      id: 'school_2024',
      name: 'School & College Exams 2024',
      name_bn: 'স্কুল ও কলেজ পরীক্ষা ২০২৪',
      name_en: 'School & College Exams 2024',
      chapters: [
        { id: 'school_ideal_2024', name: 'Ideal School & College, Motijheel 2024', name_bn: 'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল ২০২৪', file: '/ssc/ict/1.json' },
        { id: 'school_adamjee_2024', name: 'Adamjee Cant. Public School, Dhaka 2024', name_bn: 'আদমজী ক্যান্ট. পাবলিক স্কুল, ঢাকা ২০২৪', file: '/ssc/ict/3.json' },
        { id: 'school_cumilla_cadet_2024', name: 'Cumilla Cadet College 2024', name_bn: 'কুমিল্লা ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/5.json' },
        { id: 'school_cpsc_mymensingh_2024', name: 'Cant. Public School & College, Mymensingh 2024', name_bn: 'ক্যান্ট. পাবলিক স্কুল এন্ড কলেজ, ময়মনসিংহ ২০২৪', file: '/ssc/ict/11.json' },
        { id: 'school_cpsc_rangpur_2024', name: 'Cant. Public School & College, Rangpur 2024', name_bn: 'ক্যান্ট. পাবলিক স্কুল ও কলেজ, রংপুর ২০২৪', file: '/ssc/ict/12.json' },
        { id: 'school_cambrian_2024', name: 'Cambrian School & College 2024', name_bn: 'ক্যামব্রিয়ান স্কুল এন্ড কলেজ ২০২৪', file: '/ssc/ict/13.json' },
        { id: 'school_gls_dhaka_2024', name: 'Govt. Laboratory High School, Dhaka 2024', name_bn: 'গবর্নমেন্ট ল্যাবরেটরি হাই স্কুল, ঢাকা ২০২৪', file: '/ssc/ict/14.json' },
        { id: 'school_gls_rajshahi_2024', name: 'Govt. Laboratory High School, Rajshahi 2024', name_bn: 'গভঃ ল্যাবরেটরী হাই স্কুল, রাজশাহী ২০২৪', file: '/ssc/ict/15.json' },
        { id: 'school_ctg_govt_high_2024', name: 'Chattogram Govt. High School 2024', name_bn: 'চট্টগ্রাম সরকারি উচ্চ বিদ্যালয় ২০২৪', file: '/ssc/ict/20.json' },
        { id: 'school_joypurhat_gls_cadet_2024', name: 'Joypurhat Girls Cadet College 2024', name_bn: 'জয়পুরহাট গার্লস ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/21.json' },
        { id: 'school_dhaka_collegiate_2024', name: 'Dhaka Collegiate School 2024', name_bn: 'ঢাকা কলেজিয়েট স্কুল ২০২৪', file: '/ssc/ict/24.json' },
        { id: 'school_dhaka_residential_2024', name: 'Dhaka Residential Model College 2024', name_bn: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ ২০২৪', file: '/ssc/ict/29.json' },
        { id: 'school_noor_mohammad_2024', name: 'Noor Mohammad Public College, Dhaka 2024', name_bn: 'নূর মোহাম্মদ পাবলিক কলেজ, ঢাকা ২০২৪', file: '/ssc/ict/36.json' },
        { id: 'school_national_ideal_2024', name: 'National Ideal School, Dhaka 2024', name_bn: 'ন্যাশনাল আইডিয়াল স্কুল, ঢাকা ২০২৪', file: '/ssc/ict/37.json' },
        { id: 'school_pabna_cadet_2024', name: 'Pabna Cadet College 2024', name_bn: 'পাবনা ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/38.json' },
        { id: 'school_police_lines_2024', name: 'Police Lines School & College, Rangpur 2024', name_bn: 'পুলিশ লাইন্স স্কুল এন্ড কলেজ, রংপুর ২০২৪', file: '/ssc/ict/40.json' },
        { id: 'school_feni_gls_cadet_2024', name: 'Feni Girls Cadet College 2024', name_bn: 'ফেনী গার্লস ক্যাডেট কলেজ  ২০২৪', file: '/ssc/ict/41.json' },
        { id: 'school_faujdarhat_cadet_2024', name: 'Faujdarhat Cadet College 2024', name_bn: 'ফৌজদারহাট ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/43.json' },
        { id: 'school_bogra_cant_2024', name: 'Bogra Cant. Public School & College 2024', name_bn: 'বগুড়া ক্যান্ট. পাবলিক স্কুল ও কলেজ ২০২৪', file: '/ssc/ict/45.json' },
        { id: 'school_barishal_cadet_2024', name: 'Barishal Cadet College 2024', name_bn: 'বরিশাল ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/46.json' },
        { id: 'school_baf_shaheen_2024', name: 'BAF Shaheen College, Dhaka 2024', name_bn: 'বিএএফ শাহীন কলেজ, ঢাকা ২০২৪', file: '/ssc/ict/52.json' },
        { id: 'school_viquarunnisa_2024', name: 'Viquarunnisa Noon School & College 2024', name_bn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ ২০২৪', file: '/ssc/ict/54.json' },
        { id: 'school_milestone_2024', name: 'Milestone College, Dhaka 2024', name_bn: 'মাইলস্টোন কলেজ, ঢাকা ২০২৪', file: '/ssc/ict/60.json' },
        { id: 'school_munshi_abdur_2024', name: 'Munshi Abdur Rouf Public College, Dhaka 2024', name_bn: 'মুন্সী আব্দুর রউফ পাবলিক কলেজ, ঢাকা ২০২৪', file: '/ssc/ict/70.json' },
        { id: 'school_rangpur_cadet_2024', name: 'Rangpur Cadet College 2024', name_bn: 'রংপুর ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/76.json' },
        { id: 'school_rajuk_uttara_2024', name: 'Rajuk Uttara Model College 2024', name_bn: 'রাজউক উত্তরা মডেল কলেজ ২০২৪', file: '/ssc/ict/78.json' },
        { id: 'school_rajshahi_collegiate_2024', name: 'Rajshahi Collegiate School 2024', name_bn: 'রাজশাহী কলেজিয়েট স্কুল ২০২৪', file: '/ssc/ict/80.json' },
        { id: 'school_rajshahi_cadet_2024', name: 'Rajshahi Cadet College 2024', name_bn: 'রাজশাহী ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/81.json' },
        { id: 'school_rajshahi_cant_public_2024', name: 'Rajshahi Cant. Public School & College 2024', name_bn: 'রাজশাহী ক্যান্ট. পাবলিক স্কুল ও কলেজ ২০২৪', file: '/ssc/ict/83.json' },
        { id: 'school_sylhet_cadet_2024', name: 'Sylhet Cadet College 2024', name_bn: 'সিলেট ক্যাডেট কলেজ ২০২৪', file: '/ssc/ict/91.json' },
        { id: 'school_holicros_2024', name: 'Holycross High School, Dhaka 2024', name_bn: 'হলিক্রস উচ্চ বালিকা বিদ্যালয়, ঢাকা ২০২৪', file: '/ssc/ict/99.json' },
      ]
    },
  ]
};

// Insert ICT after English (index 1, since English is at index 0)
const insertAfter = idx.subjects.findIndex(s => s.id === 'english');
idx.subjects.splice(insertAfter + 1, 0, ict);

const output = JSON.stringify(idx, null, 4);
writeFileSync(indexPath, '\uFEFF' + output, 'utf8');
console.log('ICT added to index.json successfully');
console.log('Total subjects:', idx.subjects.length);
console.log('ICT chapters:', ict.topics.reduce((s, t) => s + t.chapters.length, 0));
