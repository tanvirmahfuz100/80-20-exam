import { readFileSync, writeFileSync } from 'fs';

const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

// Remove BOM for processing
const jsonStr = raw.replace(/^\uFEFF/, '');
const idx = JSON.parse(jsonStr);

// Create business_entrepreneurship subject
const be = {
  id: 'business_entrepreneurship',
  name: 'Business Entrepreneurship',
  icon: 'Briefcase',
  name_en: 'Business Entrepreneurship',
  name_bn: 'ব্যবসায় উদ্যোগ',
  topics: [
    {
      id: 'board_2026',
      name: 'Board Exams 2026',
      name_bn: 'বোর্ড পরীক্ষা ২০২৬',
      name_en: 'Board Exams 2026',
      chapters: [
        { id: 'board_dhaka_2026', name: 'Dhaka Board 2026', name_bn: 'ঢাকা বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/26.json' },
        { id: 'board_mymensingh_2026', name: 'Mymensingh Board 2026', name_bn: 'ময়মনসিংহ বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/51.json' },
        { id: 'board_sylhet_2026', name: 'Sylhet Board 2026', name_bn: 'সিলেট বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/80.json' },
        { id: 'board_jashore_2026', name: 'Jashore Board 2026', name_bn: 'যশোর বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/58.json' },
        { id: 'board_chattogram_2026', name: 'Chattogram Board 2026', name_bn: 'চট্টগ্রাম বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/20.json' },
        { id: 'board_cumilla_2026', name: 'Cumilla Board 2026', name_bn: 'কুমিল্লা বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/11.json' },
        { id: 'board_dinajpur_2026', name: 'Dinajpur Board 2026', name_bn: 'দিনাজপুর বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/33.json' },
        { id: 'board_rajshahi_2026', name: 'Rajshahi Board 2026', name_bn: 'রাজশাহী বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/68.json' },
        { id: 'board_barishal_2026', name: 'Barishal Board 2026', name_bn: 'বরিশাল বোর্ড ২০২৬', file: '/ssc/business_entrepreneurship/39.json' },
      ]
    },
    {
      id: 'board_2025',
      name: 'Board Exams 2025',
      name_bn: 'বোর্ড পরীক্ষা ২০২৫',
      name_en: 'Board Exams 2025',
      chapters: [
        { id: 'board_dhaka_2025', name: 'Dhaka Board 2025', name_bn: 'ঢাকা বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/25.json' },
        { id: 'board_mymensingh_2025', name: 'Mymensingh Board 2025', name_bn: 'ময়মনসিংহ বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/50.json' },
        { id: 'board_sylhet_2025', name: 'Sylhet Board 2025', name_bn: 'সিলেট বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/79.json' },
        { id: 'board_jashore_2025', name: 'Jashore Board 2025', name_bn: 'যশোর বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/57.json' },
        { id: 'board_chattogram_2025', name: 'Chattogram Board 2025', name_bn: 'চট্টগ্রাম বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/19.json' },
        { id: 'board_cumilla_2025', name: 'Cumilla Board 2025', name_bn: 'কুমিল্লা বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/10.json' },
        { id: 'board_dinajpur_2025', name: 'Dinajpur Board 2025', name_bn: 'দিনাজপুর বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/32.json' },
        { id: 'board_rajshahi_2025', name: 'Rajshahi Board 2025', name_bn: 'রাজশাহী বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/67.json' },
        { id: 'board_barishal_2025', name: 'Barishal Board 2025', name_bn: 'বরিশাল বোর্ড ২০২৫', file: '/ssc/business_entrepreneurship/38.json' },
        { id: 'school_adamjee_2025', name: 'Adamjee Cantonment Public School 2025', name_bn: 'আদমজী ক্যান্টনমেন্ট পাবলিক স্কুল ২০২৫', file: '/ssc/business_entrepreneurship/3.json' },
        { id: 'school_ideal_2025', name: 'Ideal School and College 2025', name_bn: 'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল ২০২৫', file: '/ssc/business_entrepreneurship/2.json' },
        { id: 'school_dhaka_residential_2025', name: 'Dhaka Residential Model College 2025', name_bn: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/27.json' },
        { id: 'school_cantonment_momenshahi_2025', name: 'Cantonment Public School, Momenshahi 2025', name_bn: 'ক্যান্টনমেন্ট পাবলিক স্কুল এন্ড কলেজ, মোমেনশাহী ২০২৫', file: '/ssc/business_entrepreneurship/12.json' },
        { id: 'school_baf_kurmitola_2025', name: 'BAF Shaheen College, Kurmitola 2025', name_bn: 'বিএএফ শাহীন কলেজ, কুর্মিটোলা ২০২৫', file: '/ssc/business_entrepreneurship/41.json' },
        { id: 'school_nur_mohammad_2025', name: 'Birshreshtha Noor Mohammad Public College 2025', name_bn: 'বীরশ্রেষ্ঠ নূর মোহাম্মদ পাবলিক কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/42.json' },
        { id: 'school_viquarunnisa_2025', name: 'Viqarunnisa Noon School and College 2025', name_bn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/44.json' },
        { id: 'school_milestone_2025', name: 'Milestone College 2025', name_bn: 'মাইলস্টোন কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/52.json' },
        { id: 'school_rajuk_uttara_2025', name: 'Rajuk Uttara Model College 2025', name_bn: 'রাজউক উত্তরা মডেল কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/61.json' },
        { id: 'school_rajshahi_cantonment_2025', name: 'Rajshahi Cantonment Public School 2025', name_bn: 'রাজশাহী ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ ২০২৫', file: '/ssc/business_entrepreneurship/62.json' },
        { id: 'school_holy_cross_2025', name: 'Holy Cross Girls High School 2025', name_bn: 'হলি ক্রস উচ্চ বালিকা বিদ্যালয় ২০২৫', file: '/ssc/business_entrepreneurship/82.json' },
        { id: 'school_st_joseph_2025', name: 'St. Joseph Higher Secondary School 2025', name_bn: 'সেন্ট যোসেফ উচ্চ মাধ্যমিক বিদ্যালয় ২০২৫', file: '/ssc/business_entrepreneurship/81.json' },
      ]
    },
    {
      id: 'board_2024',
      name: 'Board Exams 2024',
      name_bn: 'বোর্ড পরীক্ষা ২০২৪',
      name_en: 'Board Exams 2024',
      chapters: [
        { id: 'board_dhaka_2024', name: 'Dhaka Board 2024', name_bn: 'ঢাকা বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/24.json' },
        { id: 'board_mymensingh_2024', name: 'Mymensingh Board 2024', name_bn: 'ময়মনসিংহ বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/49.json' },
        { id: 'board_sylhet_2024', name: 'Sylhet Board 2024', name_bn: 'সিলেট বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/78.json' },
        { id: 'board_jashore_2024', name: 'Jashore Board 2024', name_bn: 'যশোর বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/56.json' },
        { id: 'board_chattogram_2024', name: 'Chattogram Board 2024', name_bn: 'চট্টগ্রাম বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/18.json' },
        { id: 'board_cumilla_2024', name: 'Cumilla Board 2024', name_bn: 'কুমিল্লা বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/9.json' },
        { id: 'board_dinajpur_2024', name: 'Dinajpur Board 2024', name_bn: 'দিনাজপুর বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/31.json' },
        { id: 'board_rajshahi_2024', name: 'Rajshahi Board 2024', name_bn: 'রাজশাহী বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/66.json' },
        { id: 'board_barishal_2024', name: 'Barishal Board 2024', name_bn: 'বরিশাল বোর্ড ২০২৪', file: '/ssc/business_entrepreneurship/37.json' },
        { id: 'school_ideal_2024', name: 'Ideal College 2024', name_bn: 'আইডিয়াল কলেজ, মতিঝিল ২০২৪', file: '/ssc/business_entrepreneurship/1.json' },
        { id: 'school_adamjee_2024', name: 'Adamjee Cantonment School 2024', name_bn: 'আদমজী ক্যান্টনমেন্ট স্কুল ২০২৪', file: '/ssc/business_entrepreneurship/4.json' },
        { id: 'school_udayan_2024', name: 'Udayan Higher Secondary School 2024', name_bn: 'উদয়ন উচ্চ মাধ্যমিক বিদ্যালয়, ঢাকা ২০২৪', file: '/ssc/business_entrepreneurship/5.json' },
        { id: 'school_rajshahi_cantonment_2024', name: 'Cantonment Public School, Rajshahi 2024', name_bn: 'ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, রংপুর ২০২৪', file: '/ssc/business_entrepreneurship/14.json' },
        { id: 'school_cantonment_momenshahi_2024', name: 'Cantonment Public School, Momenshahi 2024', name_bn: 'ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, মোমেনশাহী ২০২৪', file: '/ssc/business_entrepreneurship/13.json' },
        { id: 'school_baf_tejgaon_2024', name: 'BAF Shaheen College, Tejgaon 2024', name_bn: 'বি এ এফ শাহীন কলেজ,তেজগাঁও ২০২৪', file: '/ssc/business_entrepreneurship/40.json' },
        { id: 'school_viquarunnisa_2024', name: 'Viqarunnisa College 2024', name_bn: 'ভিকারুননিসা কলেজ ২০২৪', file: '/ssc/business_entrepreneurship/43.json' },
        { id: 'school_motijheel_2024', name: 'Motijheel Model School and College 2024', name_bn: 'মতিঝিল মডেল স্কুল এন্ড কলেজ, ঢাকা ২০২৪', file: '/ssc/business_entrepreneurship/45.json' },
        { id: 'school_rangpur_zilla_2024', name: 'Rangpur Zilla School 2024', name_bn: 'রংপুর জিলা স্কুল ২০২৪', file: '/ssc/business_entrepreneurship/59.json' },
        { id: 'school_rajuk_uttara_2024', name: 'Rajuk Uttara College 2024', name_bn: 'রাজউক উত্তরা কলেজ ২০২৪', file: '/ssc/business_entrepreneurship/60.json' },
      ]
    },
    {
      id: 'board_2023',
      name: 'Board Exams 2023',
      name_bn: 'বোর্ড পরীক্ষা ২০২৩',
      name_en: 'Board Exams 2023',
      chapters: [
        { id: 'board_dhaka_2023', name: 'Dhaka Board 2023', name_bn: 'ঢাকা বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/23.json' },
        { id: 'board_mymensingh_2023', name: 'Mymensingh Board 2023', name_bn: 'ময়মনসিংহ বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/48.json' },
        { id: 'board_sylhet_2023', name: 'Sylhet Board 2023', name_bn: 'সিলেট বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/77.json' },
        { id: 'board_jashore_2023', name: 'Jashore Board 2023', name_bn: 'যশোর বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/55.json' },
        { id: 'board_chattogram_2023', name: 'Chattogram Board 2023', name_bn: 'চট্টগ্রাম বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/17.json' },
        { id: 'board_cumilla_2023', name: 'Cumilla Board 2023', name_bn: 'কুমিল্লা বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/8.json' },
        { id: 'board_dinajpur_2023', name: 'Dinajpur Board 2023', name_bn: 'দিনাজপুর বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/30.json' },
        { id: 'board_rajshahi_2023', name: 'Rajshahi Board 2023', name_bn: 'রাজশাহী বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/65.json' },
        { id: 'board_barishal_2023', name: 'Barishal Board 2023', name_bn: 'বরিশাল বোর্ড ২০২৩', file: '/ssc/business_entrepreneurship/36.json' },
      ]
    },
    {
      id: 'board_2022',
      name: 'Board Exams 2022',
      name_bn: 'বোর্ড পরীক্ষা ২০২২',
      name_en: 'Board Exams 2022',
      chapters: [
        { id: 'board_dhaka_2022', name: 'Dhaka Board 2022', name_bn: 'ঢাকা বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/22.json' },
        { id: 'board_mymensingh_2022', name: 'Mymensingh Board 2022', name_bn: 'ময়মনসিংহ বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/47.json' },
        { id: 'board_sylhet_2022', name: 'Sylhet Board 2022', name_bn: 'সিলেট বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/76.json' },
        { id: 'board_jashore_2022', name: 'Jashore Board 2022', name_bn: 'যশোর বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/54.json' },
        { id: 'board_chattogram_2022', name: 'Chattogram Board 2022', name_bn: 'চট্টগ্রাম বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/16.json' },
        { id: 'board_cumilla_2022', name: 'Cumilla Board 2022', name_bn: 'কুমিল্লা বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/7.json' },
        { id: 'board_dinajpur_2022', name: 'Dinajpur Board 2022', name_bn: 'দিনাজপুর বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/29.json' },
        { id: 'board_rajshahi_2022', name: 'Rajshahi Board 2022', name_bn: 'রাজশাহী বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/64.json' },
        { id: 'board_barishal_2022', name: 'Barishal Board 2022', name_bn: 'বরিশাল বোর্ড ২০২২', file: '/ssc/business_entrepreneurship/35.json' },
      ]
    },
    {
      id: 'board_2021',
      name: 'Board Exams 2021',
      name_bn: 'বোর্ড পরীক্ষা ২০২১',
      name_en: 'Board Exams 2021',
      chapters: [
        { id: 'board_dhaka_2021', name: 'Dhaka Board 2021', name_bn: 'ঢাকা বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/21.json' },
        { id: 'board_mymensingh_2021', name: 'Mymensingh Board 2021', name_bn: 'ময়মনসিংহ বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/46.json' },
        { id: 'board_sylhet_2021', name: 'Sylhet Board 2021', name_bn: 'সিলেট বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/75.json' },
        { id: 'board_jashore_2021', name: 'Jashore Board 2021', name_bn: 'যশোর বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/53.json' },
        { id: 'board_chattogram_2021', name: 'Chattogram Board 2021', name_bn: 'চট্টগ্রাম বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/15.json' },
        { id: 'board_cumilla_2021', name: 'Cumilla Board 2021', name_bn: 'কুমিল্লা বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/6.json' },
        { id: 'board_dinajpur_2021', name: 'Dinajpur Board 2021', name_bn: 'দিনাজপুর বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/28.json' },
        { id: 'board_rajshahi_2021', name: 'Rajshahi Board 2021', name_bn: 'রাজশাহী বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/63.json' },
        { id: 'board_barishal_2021', name: 'Barishal Board 2021', name_bn: 'বরিশাল বোর্ড ২০২১', file: '/ssc/business_entrepreneurship/34.json' },
      ]
    },
    {
      id: 'board_2020',
      name: 'Board Exams 2020',
      name_bn: 'বোর্ড পরীক্ষা ২০২০',
      name_en: 'Board Exams 2020',
      chapters: [
        { id: 'board_all_2020', name: 'All Boards 2020 Combined', name_bn: 'সকল বোর্ড ২০২০', file: '/ssc/business_entrepreneurship/74.json' },
      ]
    },
    {
      id: 'board_2019',
      name: 'Board Exams 2019',
      name_bn: 'বোর্ড পরীক্ষা ২০১৯',
      name_en: 'Board Exams 2019',
      chapters: [
        { id: 'board_all_2019', name: 'All Boards 2019 Combined', name_bn: 'সকল বোর্ড ২০১৯', file: '/ssc/business_entrepreneurship/73.json' },
      ]
    },
    {
      id: 'board_2018',
      name: 'Board Exams 2018',
      name_bn: 'বোর্ড পরীক্ষা ২০১৮',
      name_en: 'Board Exams 2018',
      chapters: [
        { id: 'board_all_2018', name: 'All Boards 2018 Combined', name_bn: 'সকল বোর্ড ২০১৮', file: '/ssc/business_entrepreneurship/72.json' },
      ]
    },
    {
      id: 'board_2017',
      name: 'Board Exams 2017',
      name_bn: 'বোর্ড পরীক্ষা ২০১৭',
      name_en: 'Board Exams 2017',
      chapters: [
        { id: 'board_all_2017', name: 'All Boards 2017 Combined', name_bn: 'সকল বোর্ড ২০১৭', file: '/ssc/business_entrepreneurship/71.json' },
      ]
    },
    {
      id: 'board_2016',
      name: 'Board Exams 2016',
      name_bn: 'বোর্ড পরীক্ষা ২০১৬',
      name_en: 'Board Exams 2016',
      chapters: [
        { id: 'board_all_2016', name: 'All Boards 2016 Combined', name_bn: 'সকল বোর্ড ২০১৬', file: '/ssc/business_entrepreneurship/70.json' },
      ]
    },
    {
      id: 'board_2015',
      name: 'Board Exams 2015',
      name_bn: 'বোর্ড পরীক্ষা ২০১৫',
      name_en: 'Board Exams 2015',
      chapters: [
        { id: 'board_all_2015', name: 'All Boards 2015 Combined', name_bn: 'সকল বোর্ড ২০১৫', file: '/ssc/business_entrepreneurship/69.json' },
      ]
    },
  ]
};

// Insert business_entrepreneurship after accounting (index 2)
idx.subjects.splice(3, 0, be);

// Write back with BOM
const output = '\uFEFF' + JSON.stringify(idx, null, 4);
writeFileSync(path, output, 'utf8');
console.log('Added business_entrepreneurship to index.json');

// Verify
const verify = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const be2 = verify.subjects.find(s => s.id === 'business_entrepreneurship');
if (be2) {
  let total = 0;
  be2.topics.forEach(t => {
    console.log('  ' + t.id + ': ' + t.chapters.length + ' chapters');
    total += t.chapters.length;
  });
  console.log('Total chapters: ' + total);
  console.log('Subjects now: ' + verify.subjects.map(s => s.id).join(', '));
}
