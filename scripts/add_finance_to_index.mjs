import { readFileSync, writeFileSync } from 'fs';

const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');
const idx = JSON.parse(raw.replace(/^\uFEFF/, ''));

const finance = {
  id: 'finance',
  name: 'Finance',
  icon: 'BarChart3',
  name_en: 'Finance',
  name_bn: 'ফিন্যান্স',
  topics: [
    {
      id: 'board_2026',
      name: 'Board Exams 2026',
      name_bn: 'বোর্ড পরীক্ষা ২০২৬',
      name_en: 'Board Exams 2026',
      chapters: [
        { id: 'board_dhaka_2026', name: 'Dhaka Board 2026', name_bn: 'ঢাকা বোর্ড ২০২৬', file: '/ssc/finance/31.json' },
        { id: 'board_mymensingh_2026', name: 'Mymensingh Board 2026', name_bn: 'ময়মনসিংহ বোর্ড ২০২৬', file: '/ssc/finance/60.json' },
        { id: 'board_sylhet_2026', name: 'Sylhet Board 2026', name_bn: 'সিলেট বোর্ড ২০২৬', file: '/ssc/finance/92.json' },
        { id: 'board_jashore_2026', name: 'Jashore Board 2026', name_bn: 'যশোর বোর্ড ২০২৬', file: '/ssc/finance/69.json' },
        { id: 'board_chattogram_2026', name: 'Chattogram Board 2026', name_bn: 'চট্টগ্রাম বোর্ড ২০২৬', file: '/ssc/finance/22.json' },
        { id: 'board_cumilla_2026', name: 'Cumilla Board 2026', name_bn: 'কুমিল্লা বোর্ড ২০২৬', file: '/ssc/finance/12.json' },
        { id: 'board_dinajpur_2026', name: 'Dinajpur Board 2026', name_bn: 'দিনাজপুর বোর্ড ২০২৬', file: '/ssc/finance/41.json' },
        { id: 'board_rajshahi_2026', name: 'Rajshahi Board 2026', name_bn: 'রাজশাহী বোর্ড ২০২৬', file: '/ssc/finance/79.json' },
        { id: 'board_barishal_2026', name: 'Barishal Board 2026', name_bn: 'বরিশাল বোর্ড ২০২৬', file: '/ssc/finance/49.json' },
      ]
    },
    {
      id: 'board_2025',
      name: 'Board Exams 2025',
      name_bn: 'বোর্ড পরীক্ষা ২০২৫',
      name_en: 'Board Exams 2025',
      chapters: [
        { id: 'board_dhaka_2025', name: 'Dhaka Board 2025', name_bn: 'ঢাকা বোর্ড ২০২৫', file: '/ssc/finance/30.json' },
        { id: 'board_mymensingh_2025', name: 'Mymensingh Board 2025', name_bn: 'ময়মনসিংহ বোর্ড ২০২৫', file: '/ssc/finance/59.json' },
        { id: 'board_sylhet_2025', name: 'Sylhet Board 2025', name_bn: 'সিলেট বোর্ড ২০২৫', file: '/ssc/finance/91.json' },
        { id: 'board_jashore_2025', name: 'Jashore Board 2025', name_bn: 'যশোর বোর্ড ২০২৫', file: '/ssc/finance/68.json' },
        { id: 'board_chattogram_2025', name: 'Chattogram Board 2025', name_bn: 'চট্টগ্রাম বোর্ড ২০২৫', file: '/ssc/finance/21.json' },
        { id: 'board_cumilla_2025', name: 'Cumilla Board 2025', name_bn: 'কুমিল্লা বোর্ড ২০২৫', file: '/ssc/finance/11.json' },
        { id: 'board_dinajpur_2025', name: 'Dinajpur Board 2025', name_bn: 'দিনাজপুর বোর্ড ২০২৫', file: '/ssc/finance/40.json' },
        { id: 'board_rajshahi_2025', name: 'Rajshahi Board 2025', name_bn: 'রাজশাহী বোর্ড ২০২৫', file: '/ssc/finance/78.json' },
        { id: 'board_barishal_2025', name: 'Barishal Board 2025', name_bn: 'বরিশাল বোর্ড ২০২৫', file: '/ssc/finance/48.json' },
        { id: 'school_adamjee_2025', name: 'Adamjee Cantonment Public School 2025', name_bn: 'আদমজী ক্যান্টনমেন্ট পাবলিক স্কুল ২০২৫', file: '/ssc/finance/4.json' },
        { id: 'school_ideal_2025', name: 'Ideal School and College 2025', name_bn: 'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল ২০২৫', file: '/ssc/finance/2.json' },
        { id: 'school_dhaka_residential_2025', name: 'Dhaka Residential Model College 2025', name_bn: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ ২০২৫', file: '/ssc/finance/33.json' },
        { id: 'school_chattogram_cantonment_2025', name: 'Chattogram Cantonment Public College 2025', name_bn: 'চট্টগ্রাম ক্যান্টনমেন্ট পাবলিক কলেজ ২০২৫', file: '/ssc/finance/14.json' },
        { id: 'school_chattogram_residential_2025', name: 'Chattogram Residential School 2025', name_bn: 'চট্টগ্রাম রেসিডেন্সিয়াল স্কুল এন্ড কলেজ ২০২৫', file: '/ssc/finance/23.json' },
        { id: 'school_milestone_2025', name: 'Milestone College 2025', name_bn: 'মাইলস্টোন কলেজ ২০২৫', file: '/ssc/finance/61.json' },
        { id: 'school_rajuk_uttara_2025', name: 'Rajuk Uttara Model College 2025', name_bn: 'রাজউক উত্তরা মডেল কলেজ ২০২৫', file: '/ssc/finance/71.json' },
        { id: 'school_st_joseph_2025', name: 'St. Joseph Higher Secondary School 2025', name_bn: 'সেন্ট যোসেফ উচ্চ মাধ্যমিক বিদ্যালয় ২০২৫', file: '/ssc/finance/93.json' },
        { id: 'school_holy_cross_2025', name: 'Holy Cross Girls High School 2025', name_bn: 'হলি ক্রস উচ্চ বালিকা বিদ্যালয় ২০২৫', file: '/ssc/finance/94.json' },
        { id: 'school_viquarunnisa_2025', name: 'Viqarunnisa Noon School and College 2025', name_bn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ ২০২৫', file: '/ssc/finance/51.json' },
      ]
    },
    {
      id: 'board_2024',
      name: 'Board Exams 2024',
      name_bn: 'বোর্ড পরীক্ষা ২০২৪',
      name_en: 'Board Exams 2024',
      chapters: [
        { id: 'board_dhaka_2024', name: 'Dhaka Board 2024', name_bn: 'ঢাকা বোর্ড ২০২৪', file: '/ssc/finance/29.json' },
        { id: 'board_mymensingh_2024', name: 'Mymensingh Board 2024', name_bn: 'ময়মনসিংহ বোর্ড ২০২৪', file: '/ssc/finance/58.json' },
        { id: 'board_sylhet_2024', name: 'Sylhet Board 2024', name_bn: 'সিলেট বোর্ড ২০২৪', file: '/ssc/finance/90.json' },
        { id: 'board_jashore_2024', name: 'Jashore Board 2024', name_bn: 'যশোর বোর্ড ২০২৪', file: '/ssc/finance/67.json' },
        { id: 'board_chattogram_2024', name: 'Chattogram Board 2024', name_bn: 'চট্টগ্রাম বোর্ড ২০২৪', file: '/ssc/finance/20.json' },
        { id: 'board_cumilla_2024', name: 'Cumilla Board 2024', name_bn: 'কুমিল্লা বোর্ড ২০২৪', file: '/ssc/finance/10.json' },
        { id: 'board_dinajpur_2024', name: 'Dinajpur Board 2024', name_bn: 'দিনাজপুর বোর্ড ২০২৪', file: '/ssc/finance/39.json' },
        { id: 'board_rajshahi_2024', name: 'Rajshahi Board 2024', name_bn: 'রাজশাহী বোর্ড ২০২৪', file: '/ssc/finance/77.json' },
        { id: 'board_barishal_2024', name: 'Barishal Board 2024', name_bn: 'বরিশাল বোর্ড ২০২৪', file: '/ssc/finance/47.json' },
        { id: 'school_ideal_2024', name: 'Ideal College 2024', name_bn: 'আইডিয়াল কলেজ, মতিঝিল ২০২৪', file: '/ssc/finance/1.json' },
        { id: 'school_adamjee_2024', name: 'Adamjee Cantonment School 2024', name_bn: 'আদমজী ক্যান্ট. পাবলিক স্কুল ২০২৪', file: '/ssc/finance/3.json' },
        { id: 'school_govt_lab_2024', name: 'Government Laboratory School 2024', name_bn: 'গভর্নমেন্ট ল্যাবরেটরি স্কুল, ঢাকা ২০২৪', file: '/ssc/finance/13.json' },
        { id: 'school_dhaka_residential_2024', name: 'Dhaka Residential College 2024', name_bn: 'ঢাকা রেসিডেনসিয়াল কলেজ ২০২৪', file: '/ssc/finance/32.json' },
        { id: 'school_viquarunnisa_2024', name: 'Viqarunnisa Noon College 2024', name_bn: 'ভিকারুননিসা নূন কলেজ ২০২৪', file: '/ssc/finance/50.json' },
        { id: 'school_motijheel_2024', name: 'Motijheel Model School 2024', name_bn: 'মতিঝিল মডেল স্কুল এন্ড কলেজ ২০২৪', file: '/ssc/finance/52.json' },
        { id: 'school_manipur_2024', name: 'Manipur High School 2024', name_bn: 'মনিপুর উচ্চ বিদ্যালয়, ঢাকা ২০২৪', file: '/ssc/finance/53.json' },
        { id: 'school_rajuk_uttara_2024', name: 'Rajuk Uttara College 2024', name_bn: 'রাজউক উত্তরা কলেজ ২০২৪', file: '/ssc/finance/70.json' },
        { id: 'school_savar_2024', name: 'Savar Cantonment Public College 2024', name_bn: 'সাভার ক্যান্ট. পাবলিক কলেজ ২০২৪', file: '/ssc/finance/84.json' },
        { id: 'school_holy_cross_2024', name: 'Holy Cross College 2024', name_bn: 'হলি ক্রস কলেজ ২০২৪', file: '/ssc/finance/95.json' },
      ]
    },
    {
      id: 'board_2023',
      name: 'Board Exams 2023',
      name_bn: 'বোর্ড পরীক্ষা ২০২৩',
      name_en: 'Board Exams 2023',
      chapters: [
        { id: 'board_dhaka_2023', name: 'Dhaka Board 2023', name_bn: 'ঢাকা বোর্ড ২০২৩', file: '/ssc/finance/28.json' },
        { id: 'board_mymensingh_2023', name: 'Mymensingh Board 2023', name_bn: 'ময়মনসিংহ বোর্ড ২০২৩', file: '/ssc/finance/57.json' },
        { id: 'board_sylhet_2023', name: 'Sylhet Board 2023', name_bn: 'সিলেট বোর্ড ২০২৩', file: '/ssc/finance/89.json' },
        { id: 'board_jashore_2023', name: 'Jashore Board 2023', name_bn: 'যশোর বোর্ড ২০২৩', file: '/ssc/finance/66.json' },
        { id: 'board_chattogram_2023', name: 'Chattogram Board 2023', name_bn: 'চট্টগ্রাম বোর্ড ২০২৩', file: '/ssc/finance/19.json' },
        { id: 'board_cumilla_2023', name: 'Cumilla Board 2023', name_bn: 'কুমিল্লা বোর্ড ২০২৩', file: '/ssc/finance/9.json' },
        { id: 'board_dinajpur_2023', name: 'Dinajpur Board 2023', name_bn: 'দিনাজপুর বোর্ড ২০২৩', file: '/ssc/finance/38.json' },
        { id: 'board_rajshahi_2023', name: 'Rajshahi Board 2023', name_bn: 'রাজশাহী বোর্ড ২০২৩', file: '/ssc/finance/76.json' },
        { id: 'board_barishal_2023', name: 'Barishal Board 2023', name_bn: 'বরিশাল বোর্ড ২০২৩', file: '/ssc/finance/46.json' },
      ]
    },
    {
      id: 'board_2022',
      name: 'Board Exams 2022',
      name_bn: 'বোর্ড পরীক্ষা ২০২২',
      name_en: 'Board Exams 2022',
      chapters: [
        { id: 'board_dhaka_2022', name: 'Dhaka Board 2022', name_bn: 'ঢাকা বোর্ড ২০২২', file: '/ssc/finance/27.json' },
        { id: 'board_mymensingh_2022', name: 'Mymensingh Board 2022', name_bn: 'ময়মনসিংহ বোর্ড ২০২২', file: '/ssc/finance/56.json' },
        { id: 'board_sylhet_2022', name: 'Sylhet Board 2022', name_bn: 'সিলেট বোর্ড ২০২২', file: '/ssc/finance/88.json' },
        { id: 'board_jashore_2022', name: 'Jashore Board 2022', name_bn: 'যশোর বোর্ড ২০২২', file: '/ssc/finance/65.json' },
        { id: 'board_chattogram_2022', name: 'Chattogram Board 2022', name_bn: 'চট্টগ্রাম বোর্ড ২০২২', file: '/ssc/finance/18.json' },
        { id: 'board_cumilla_2022', name: 'Cumilla Board 2022', name_bn: 'কুমিল্লা বোর্ড ২০২২', file: '/ssc/finance/8.json' },
        { id: 'board_dinajpur_2022', name: 'Dinajpur Board 2022', name_bn: 'দিনাজপুর বোর্ড ২০২২', file: '/ssc/finance/37.json' },
        { id: 'board_rajshahi_2022', name: 'Rajshahi Board 2022', name_bn: 'রাজশাহী বোর্ড ২০২২', file: '/ssc/finance/75.json' },
        { id: 'board_barishal_2022', name: 'Barishal Board 2022', name_bn: 'বরিশাল বোর্ড ২০২২', file: '/ssc/finance/45.json' },
      ]
    },
    {
      id: 'board_2021',
      name: 'Board Exams 2021',
      name_bn: 'বোর্ড পরীক্ষা ২০২১',
      name_en: 'Board Exams 2021',
      chapters: [
        { id: 'board_dhaka_2021', name: 'Dhaka Board 2021', name_bn: 'ঢাকা বোর্ড ২০২১', file: '/ssc/finance/26.json' },
        { id: 'board_mymensingh_2021', name: 'Mymensingh Board 2021', name_bn: 'ময়মনসিংহ বোর্ড ২০২১', file: '/ssc/finance/55.json' },
        { id: 'board_sylhet_2021', name: 'Sylhet Board 2021', name_bn: 'সিলেট বোর্ড ২০২১', file: '/ssc/finance/87.json' },
        { id: 'board_jashore_2021', name: 'Jashore Board 2021', name_bn: 'যশোর বোর্ড ২০২১', file: '/ssc/finance/64.json' },
        { id: 'board_chattogram_2021', name: 'Chattogram Board 2021', name_bn: 'চট্টগ্রাম বোর্ড ২০২১', file: '/ssc/finance/17.json' },
        { id: 'board_cumilla_2021', name: 'Cumilla Board 2021', name_bn: 'কুমিল্লা বোর্ড ২০২১', file: '/ssc/finance/7.json' },
        { id: 'board_dinajpur_2021', name: 'Dinajpur Board 2021', name_bn: 'দিনাজপুর বোর্ড ২০২১', file: '/ssc/finance/36.json' },
        { id: 'board_rajshahi_2021', name: 'Rajshahi Board 2021', name_bn: 'রাজশাহী বোর্ড ২০২১', file: '/ssc/finance/74.json' },
        { id: 'board_barishal_2021', name: 'Barishal Board 2021', name_bn: 'বরিশাল বোর্ড ২০২১', file: '/ssc/finance/44.json' },
      ]
    },
    {
      id: 'board_2020',
      name: 'Board Exams 2020',
      name_bn: 'বোর্ড পরীক্ষা ২০২০',
      name_en: 'Board Exams 2020',
      chapters: [
        { id: 'board_dhaka_2020', name: 'Dhaka Board 2020', name_bn: 'ঢাকা বোর্ড ২০২০', file: '/ssc/finance/25.json' },
        { id: 'board_mymensingh_2020', name: 'Mymensingh Board 2020', name_bn: 'ময়মনসিংহ বোর্ড ২০২০', file: '/ssc/finance/54.json' },
        { id: 'board_sylhet_2020', name: 'Sylhet Board 2020', name_bn: 'সিলেট বোর্ড ২০২০', file: '/ssc/finance/86.json' },
        { id: 'board_jashore_2020', name: 'Jashore Board 2020', name_bn: 'যশোর বোর্ড ২০২০', file: '/ssc/finance/63.json' },
        { id: 'board_chattogram_2020', name: 'Chattogram Board 2020', name_bn: 'চট্টগ্রাম বোর্ড ২০২০', file: '/ssc/finance/16.json' },
        { id: 'board_cumilla_2020', name: 'Cumilla Board 2020', name_bn: 'কুমিল্লা বোর্ড ২০২০', file: '/ssc/finance/6.json' },
        { id: 'board_dinajpur_2020', name: 'Dinajpur Board 2020', name_bn: 'দিনাজপুর বোর্ড ২০২০', file: '/ssc/finance/35.json' },
        { id: 'board_rajshahi_2020', name: 'Rajshahi Board 2020', name_bn: 'রাজশাহী বোর্ড ২০২০', file: '/ssc/finance/73.json' },
        { id: 'board_barishal_2020', name: 'Barishal Board 2020', name_bn: 'বরিশাল বোর্ড ২০২০', file: '/ssc/finance/43.json' },
      ]
    },
    {
      id: 'board_2019',
      name: 'Board Exams 2019',
      name_bn: 'বোর্ড পরীক্ষা ২০১৯',
      name_en: 'Board Exams 2019',
      chapters: [
        { id: 'board_dhaka_2019', name: 'Dhaka Board 2019', name_bn: 'ঢাকা বোর্ড ২০১৯', file: '/ssc/finance/24.json' },
        { id: 'board_sylhet_2019', name: 'Sylhet Board 2019', name_bn: 'সিলেট বোর্ড ২০১৯', file: '/ssc/finance/85.json' },
        { id: 'board_jashore_2019', name: 'Jashore Board 2019', name_bn: 'যশোর বোর্ড ২০১৯', file: '/ssc/finance/62.json' },
        { id: 'board_chattogram_2019', name: 'Chattogram Board 2019', name_bn: 'চট্টগ্রাম বোর্ড ২০১৯', file: '/ssc/finance/15.json' },
        { id: 'board_cumilla_2019', name: 'Cumilla Board 2019', name_bn: 'কুমিল্লা বোর্ড ২০১৯', file: '/ssc/finance/5.json' },
        { id: 'board_dinajpur_2019', name: 'Dinajpur Board 2019', name_bn: 'দিনাজপুর বোর্ড ২০১৯', file: '/ssc/finance/34.json' },
        { id: 'board_rajshahi_2019', name: 'Rajshahi Board 2019', name_bn: 'রাজশাহী বোর্ড ২০১৯', file: '/ssc/finance/72.json' },
        { id: 'board_barishal_2019', name: 'Barishal Board 2019', name_bn: 'বরিশাল বোর্ড ২০১৯', file: '/ssc/finance/42.json' },
      ]
    },
    {
      id: 'board_2018',
      name: 'Board Exams 2018',
      name_bn: 'বোর্ড পরীক্ষা ২০১৮',
      name_en: 'Board Exams 2018',
      chapters: [
        { id: 'board_all_2018', name: 'All Boards 2018 Combined', name_bn: 'সকল বোর্ড ২০১৮', file: '/ssc/finance/83.json' },
      ]
    },
    {
      id: 'board_2017',
      name: 'Board Exams 2017',
      name_bn: 'বোর্ড পরীক্ষা ২০১৭',
      name_en: 'Board Exams 2017',
      chapters: [
        { id: 'board_all_2017', name: 'All Boards 2017 Combined', name_bn: 'সকল বোর্ড ২০১৭', file: '/ssc/finance/82.json' },
      ]
    },
    {
      id: 'board_2016',
      name: 'Board Exams 2016',
      name_bn: 'বোর্ড পরীক্ষা ২০১৬',
      name_en: 'Board Exams 2016',
      chapters: [
        { id: 'board_all_2016', name: 'All Boards 2016 Combined', name_bn: 'সকল বোর্ড ২০১৬', file: '/ssc/finance/81.json' },
      ]
    },
    {
      id: 'board_2015',
      name: 'Board Exams 2015',
      name_bn: 'বোর্ড পরীক্ষা ২০১৫',
      name_en: 'Board Exams 2015',
      chapters: [
        { id: 'board_all_2015', name: 'All Boards 2015 Combined', name_bn: 'সকল বোর্ড ২০১৫', file: '/ssc/finance/80.json' },
      ]
    },
  ]
};

// Insert finance after business_entrepreneurship (index 3)
idx.subjects.splice(4, 0, finance);

const output = '\uFEFF' + JSON.stringify(idx, null, 4);
writeFileSync(path, output, 'utf8');
console.log('Added finance to index.json');

const verify = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const fin = verify.subjects.find(s => s.id === 'finance');
if (fin) {
  let total = 0;
  fin.topics.forEach(t => {
    console.log('  ' + t.id + ': ' + t.chapters.length + ' chapters');
    total += t.chapters.length;
  });
  console.log('Total chapters: ' + total);
  console.log('Subjects: ' + verify.subjects.map(s => s.id).join(', '));
}
