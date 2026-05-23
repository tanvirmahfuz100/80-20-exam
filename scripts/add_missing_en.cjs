const fs = require('fs');
const path = require('path');

const ch1Path = 'c:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\public\\hsc\\production_2nd\\english\\chapter_1.json';
let data = JSON.parse(fs.readFileSync(ch1Path, 'utf8'));

const missingQuestions = [
  {
    "id": 31,
    "question": "Imran is a marketer of a production-oriented company. According to the profession, the parties involved in Mr. Imran's activities are- i. Customer ii. Intermediary iii. Supplier",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "A marketer's activities involve three main parties: 1. Suppliers (who provide raw materials), 2. Customers (who buy the products), and 3. Intermediaries (who assist in distribution).",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 32,
    "question": "The foundations of the marketing concept are- i. Customer satisfaction ii. Integrated marketing iii. Consumer need",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "The marketing concept is built on three pillars: 1. Customer satisfaction (the goal), 2. Integrated marketing (combined effort of all departments), and 3. Consumer need (the center point).",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 33,
    "question": "The tools of the marketing mix are- i. Production ii. Price iii. Promotion",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "A",
    "explanation": "Marketing mix refers to the 4Ps: Product, Price, Place, and Promotion. Price is a key tool, but production itself is not directly listed among the 4Ps. Based on the options provided, i and ii are included.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 34,
    "question": "As a result of establishing EPZs in different regions of the country, it has been possible to- i. Set up modern and high-quality industries ii. Accelerate industrial development iii. Earn foreign currency",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "Establishing EPZs leads to the setup of modern industries, accelerating national industrial development and earning foreign currency through exports.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 35,
    "question": "Stimulus: Mr. Asif is the marketing manager of Z-Pipes Limited. He takes the initiative to sell their pipes after learning about potential customers' tastes, habits, preferences, etc. To ensure customer satisfaction and build strong relationships, he stores customer information in a computer. What can the overall sum of Mr. Asif's activities be called?",
    "options": {
      "A": "Public Relations",
      "B": "Information Collection",
      "C": "Marketing",
      "D": "Advertising"
    },
    "answer": "C",
    "explanation": "The entire process of understanding customer needs, satisfying them, and building relationships through information storage is called marketing.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 36,
    "question": "The ultimate objectives of Mr. Asif's work are- i. Establishing profitable customer relationships ii. Creating customer value iii. Achieving customer satisfaction",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "Marketing's ultimate goals are reflected in Asif's work: achieving satisfaction, creating value, and establishing profitable long-term relationships.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 37,
    "question": "Stimulus: Unilever is an experienced international brand. 'Lux' soap is one of its widely used products. Despite global demand, Unilever offered diamond lockets through a lottery with Lux soap. What is the reason for the widespread demand for Unilever's Lux soap?",
    "options": {
      "A": "Brand Experience",
      "B": "Exceptional product",
      "C": "Lure of diamond locket",
      "D": "Low-priced product"
    },
    "answer": "A",
    "explanation": "Lux is a long-standing international brand. Its widespread demand is due to its brand experience, quality, and consumer trust over the years.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 38,
    "question": "Unilever has offered diamond lockets with 'Lux' soap- i. To increase goodwill ii. To cut costs iii. To maximize profit",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "B",
    "explanation": "Such promotional activities aim to increase goodwill and attraction (i) and maximize profit (iii) by increasing sales. They do not cut costs; in fact, they increase expenses.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 39,
    "question": "Stimulus: Mr. Minhaj produces T-shirts of various prices in his factory. He knows that his work doesn't end with production. Therefore, he takes various steps to deliver the T-shirts to the end user. What is the work of delivering Mr. Minhaj's T-shirts from production to the user called?",
    "options": {
      "A": "Demand fulfillment",
      "B": "Personal selling",
      "C": "Salesmanship",
      "D": "Marketing"
    },
    "answer": "D",
    "explanation": "All activities from production to the consumer (distribution, storage, transportation) are part of marketing. It is a comprehensive process.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 40,
    "question": "As a result of Mr. Minhaj taking steps to deliver T-shirts to the end user- i. Social demand is being fulfilled ii. Balanced product distribution is occurring iii. Relationships are improving",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "Delivering products to users fulfills social demand, ensures balanced distribution, and improves relationships with consumers.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 41,
    "question": "Stimulus: 'Loreen' company is marketing its newly innovated Note-5 mobile set. Currently, it has 100,000 customers. The company expects to sell 500,000 more mobile sets in the future. Which marketing concept is reflected through the number of customers in the stimulus?",
    "options": {
      "A": "Need",
      "B": "Demand",
      "C": "Want",
      "D": "Market"
    },
    "answer": "D",
    "explanation": "In marketing, a 'market' refers to the aggregate of actual (100,000) and potential (500,000) customers.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 42,
    "question": "By marketing the new mobile set, the company can enjoy benefits such as- i. Achieving customer satisfaction ii. Increasing sales volume iii. Due to low product quality",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "A",
    "explanation": "The main goal of marketing a new product is to achieve customer satisfaction and increase sales volume. It is not done because of low product quality.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 43,
    "question": "Stimulus: Amir Hamza from Tangail makes bamboo and cane products. He has started selling his products in Singapore as well. For this, Amir Hamza has hired 30 new workers. What development will occur as a result of Amir Hamza selling products in Singapore?",
    "options": {
      "A": "Unproduced goods",
      "B": "Service marketing",
      "C": "Time utility",
      "D": "Country's economy"
    },
    "answer": "D",
    "explanation": "Exporting locally produced goods earns foreign currency, creates jobs, and develops the country's economy overall.",
    "source": "Production Management & Marketing, Chapter-1"
  },
  {
    "id": 44,
    "question": "By hiring 30 new workers, it will be possible to- i. Ensure continuous production ii. Achieve large-scale production iii. Improve living standards",
    "options": {
      "A": "i & ii",
      "B": "i & iii",
      "C": "ii & iii",
      "D": "i, ii & iii"
    },
    "answer": "D",
    "explanation": "New workers help ensure continuous production, enable large-scale output, and improve living standards through employment and increased income.",
    "source": "Production Management & Marketing, Chapter-1"
  }
];

// Merge and deduplicate just in case
missingQuestions.forEach(mq => {
  const existingIndex = data.findIndex(q => q.id === mq.id);
  if (existingIndex !== -1) {
    data[existingIndex] = mq;
  } else {
    data.push(mq);
  }
});

data.sort((a, b) => a.id - b.id);

fs.writeFileSync(ch1Path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added missing questions to Chapter 1 English.');
