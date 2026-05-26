import React from 'react';
import { HelpCircle, MessageSquareWarning, BookOpen, Mail, ChevronRight } from 'lucide-react';

const faqItems = [
  { question: 'কিভাবে কুইজ শুরু করব?', answer: 'হোম পেজ থেকে "প্রাক্টিস শুরু করো" বাটনে ক্লিক করে যেকোনো সাবজেক্ট বাছাই করে কুইজ শুরু করতে পারো।' },
  { question: 'এক্সপি কীভাবে বাড়াব?', answer: 'প্রতিটি সঠিক উত্তরের জন্য ১০ এক্সপি পাওয়া যায়। প্রতিদিন প্রাক্টিস করলে বাড়তি বোনাস এক্সপি মিলবে।' },
  { question: 'স্ট্রিক কী?', answer: 'টানা কত দিন তুমি প্রাক্টিস করেছো, সেটাই স্ট্রিক। প্রতিদিন অন্তত একটা কুইজ দিলে স্ট্রিক বাড়ে।' },
  { question: 'স্টার রিভিউ কী?', answer: 'ভুল উত্তর দেওয়া প্রশ্নগুলো স্টার আকারে সংরক্ষিত হয়। পরে সেগুলো রিভিউ করে শেখার সুযোগ পাবে।' },
];

export default function Help() {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-lg font-black text-text">হেল্প সেন্টার</h1>
        <p className="text-sm text-text-muted font-medium mt-0.5">কিভাবে ব্যবহার করবেন</p>
      </div>

      <div className="space-y-2 mb-6">
        {faqItems.map((item, i) => (
          <div key={i} className="bg-surface border rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-3.5 text-left"
            >
              <span className="font-bold text-sm text-text">{item.question}</span>
              <ChevronRight className={`w-4 h-4 text-hare transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-3.5 pb-3.5">
                <p className="text-sm text-text-muted font-medium">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-eel border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <MessageSquareWarning className="w-5 h-5 text-hare shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-text mb-1">কোনো সমস্যা পাও?</h3>
            <p className="text-xs text-hare font-medium mb-2">তোমার সমস্যা সম্পর্কে জানাও, আমরা সাহায্য করব।</p>
            <a
              href="mailto:support@80-20-exam.com"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover"
            >
              <Mail className="w-3.5 h-3.5" />
              support@80-20-exam.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
