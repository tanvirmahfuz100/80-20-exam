const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\public\\hsc\\production_2nd\\english';
const files = Array.from({ length: 10 }, (_, i) => `chapter_${i + 1}.json`);

const questionFixes = {
    // Chapter 1
    27: "The utilities created through marketing are- i. Form ii. Time iii. Place",
    28: "Marketing does- i. Product classification ii. Warehousing iii. Delivers to consumers",
    29: "The essential conditions for a market are- i. A number of people must have wants and needs ii. Buyers must have purchasing power iii. Must have the right to purchase products",
    30: "From a marketing perspective, a product is- i. Anything that can satisfy a need ii. Capable of attracting market attention iii. A tangible or intangible object presented for consumption",
    31: "Imran is a marketer of a production-oriented company. According to the profession, the parties involved in Mr. Imran's activities are- i. Customer ii. Intermediary iii. Supplier",
    32: "The foundations of the marketing concept are- i. Customer satisfaction ii. Integrated marketing iii. Consumer need",
    33: "The tools of the marketing mix are- i. Production ii. Price iii. Promotion",
    34: "As a result of establishing EPZs in different regions of the country, it has been possible to- i. Set up modern and high-quality industries ii. Accelerate industrial development iii. Earn foreign currency",
    36: "The ultimate objectives of Mr. Asif's work are- i. Establishing profitable customer relationships ii. Creating customer value iii. Achieving customer satisfaction",
    38: "Unilever has offered diamond lockets with 'Lux' soap- i. To increase goodwill ii. To cut costs iii. To maximize profit",
    40: "As a result of Mr. Minhaj taking steps to deliver T-shirts to the end user- i. Social demand is being fulfilled ii. Balanced product distribution is occurring iii. Relationships are improving",
    42: "By marketing the new mobile set, the company can enjoy benefits such as- i. Achieving customer satisfaction ii. Increasing sales volume iii. Due to low product quality",
    44: "By hiring 30 new workers, it will be possible to- i. Ensure continuous production ii. Achieve large-scale production iii. Improve living standards",

    // Chapter 2
    69: "Consumers purchase products- i. For resale ii. For personal use iii. For donating to the poor",
    70: "Jahid started a business after long planning. For success, Jahid needs to know- i. Competitors' financial condition ii. Suppliers' location iii. Competitors' strategies",
    71: "To make the elements of the marketing environment dynamic, a marketer must- i. Reduce the business distribution channel ii. Conduct analysis iii. Apply maximum efficiency and prudence",
    72: "In controlling suppliers in a business, the consideration is- i. Product quality ii. Regular supply capacity of the product iii. Product price",
    73: "'Rahman & Co.' supplies products to consumers nationwide through intermediaries. The intermediaries of 'Rahman & Co.' could be- i. Distributor ii. Wholesaler iii. Agent",
    74: "The technological environment is formed by- i. New technology invention ii. Introducing new products iii. Creating market opportunities",
    75: "The reasons for the decrease in people's purchasing power are- i. Unemployment ii. Tax rate iii. Economic uncertainty",
    77: "'BD Jobs' will remain outside the influence of which elements of the marketing environment- i. Supplier ii. Nature iii. Intermediary",
    79: "Due to Cyclone Mahasen, the impact on Shopno was- i. Direct ii. Indirect iii. Adverse",
    81: "As a result of Nidhi Limited using the 'N' letter- i. Will be able to maximize profit ii. Will easily attract customers iii. Will increase the company's goodwill",

    // Chapter 3
    104: "The essential elements of marketing are- i. Local demand ii. Market information iii. Transportation",
    105: "Rayhan is the marketing manager of 'Square Pharmaceuticals'. The auxiliary functions he will perform are- i. Risk-taking ii. Financing iii. Market information collection",
    106: "Consumers' standard of living improves- i. By using new products ii. By purchasing conventional products iii. By consuming attractive products",
    107: "Raju recently joined 'Jerin Cosmetics Ltd.' as a sales officer after completing his studies. To increase the company's sales, the tasks he must do are- i. Customer search ii. Creating ownership utility iii. Undertaking promotional activities",
    108: "Robin is a dairy product trader. He arranges for the preservation of his goods until a specified period. The reasons for this are- i. Risk reduction ii. Preserving product quality iii. Achieving consumer satisfaction",
    109: "Standardization is done- i. According to customer taste ii. According to seller preference iii. According to customer need",
    110: "Grading is- i. Physical work ii. Mental work iii. Production work",
    111: "Through advertising, customers become aware of- i. Product potential ii. Product qualities iii. Product usage guidelines",
    112: "Advertising is- i. An impersonal presentation ii. A paid activity iii. A one-way communication system",
    114: "By collecting market information, Mr. Russell will be able to perform the auxiliary functions of- i. Marketing planning ii. Implementation and control iii. Analysis and distribution",
    116: "Pran-RFL Co. Ltd.'s market expansion also depends on- i. Consumer satisfaction ii. Acceptable price iii. Product design",
    118: "To reduce Mr. Robin's financial loss, the measures to take are- i. Using refrigerated transport ii. Arranging grading iii. Transporting products via alternative routes",

    // Chapter 4
    146: "From a marketing perspective, the market is- i. Aggregate of actual buyers ii. Aggregate of potential buyers iii. Aggregate of profitable buyers",
    147: "Karim bought a shirt from Star Shopping Complex in New Market. Here, the market is- i. Star Shopping Complex ii. Karim purchasing a product iii. Karim's desire to purchase a product",
    148: "Sales promotional activities are- i. Advertising ii. Personal selling iii. Free product distribution",
    149: "Leasing is used for operating- i. When the product is of a durable nature ii. When purchasing the product requires large capital iii. When the quantity of the product is large",
    150: "The benefits of market segmentation are- i. Increased sales ii. Increased costs iii. Product quality improvement",
    151: "The strategies of marketing promotion are- i. Distribution ii. Advertising iii. Public relations",
    152: "Logistics support means- i. Order processing ii. Warehousing iii. Inventory management",
    154: "By selling Febicol glue in bottles and tubes- i. Customer attraction has been gained ii. Sales have increased iii. Competitor numbers have decreased",
    156: "As a result of this segmentation, the operator- i. Will be able to control costs ii. Will be able to acquire more customers iii. Will be able to determine the number of potential customers",
    158: "The reason for Mr. Rayhan's success in business is- i. Market survey ii. Market segmentation iii. Mass marketing",
    160: "In acquiring customers, the following were used here- i. Promotion ii. Distribution iii. Coordination",

    // Chapter 5
    183: "The characteristics of a product are- i. Tangible ii. Intangible iii. Immutable",
    184: "The characteristics of perishable products are- i. Low price ii. Low demand iii. Short durability",
    185: "The reasons for intense competition in the consumer goods market are- i. Presence of alternative products ii. Presence of homogeneous products iii. Emergence of new competitors",
    186: "In the case of consumer products, the applicable features are- i. Broad market ii. Long distribution channel iii. Low price",
    187: "The objectives of pricing are- i. Maximizing current profit ii. Maximizing market share iii. Product quality leadership",
    188: "Competitive pricing methods are- i. Going-rate pricing ii. Sealed-bid pricing iii. Break-even pricing",
    189: "Russell has been working at Ashuganj Fertilizer Factory for 10 years. Through this, he has gained- i. Skill ii. Experience iii. Price-related knowledge",
    191: "The characteristic prevalent among the customers of Rampura Bazar is- i. Sensitivity ii. Frugality iii. Miserliness",
    193: "In the case of Mehedi's marketed products, the true statements are- i. Its market is limited ii. Its unit price is higher iii. It is used in reproduction",
    196: "If the demand for Milon's product increases, what will happen in the case of Hasan's product- i. Demand will increase ii. Sales will increase iii. Price will decrease",
    198: "'ABC Ltd.'s average cost decreases through- i. Increased production ii. Increased sales iii. Increased purchases",

    // Chapter 6
    221: "The important conditions of a distribution channel are- i. Ownership must be transferred ii. Final consumer interest must be ensured iii. The consumer will get the product or service for free",
    222: "Purchases are made for resale by- i. Producer ii. Wholesaler iii. Retailer",
    223: "Intermediaries take risks related to- i. Storage ii. Unsold goods iii. Transportation",
    224: "The functions of intermediaries are- i. Creating place utility ii. Creating time utility iii. Supplying information",
    225: "Intermediaries control the market because- i. Financial solvency ii. Being influential in society iii. Financial crisis",
    226: "Another name for Jobber is- i. Dalal (Broker) ii. Broker iii. Faria (Peddler)",
    227: "In the agricultural sector, the main special agents in the distribution channel are- i. Purchasing agent ii. Selling agent iii. Merchant commission",
    228: "To get a fair price for agricultural products, before marketing, the product must be properly- i. Dried ii. Cleaned iii. Cooled",
    230: "The function of the second party in the above figure is- i. Buying products directly from the mill ii. Supplying raw materials to the producer iii. Establishing communication between the producer and the consumer",
    234: "Mr. Alam's own hatchery will create the following utilities- i. Place ii. Form iii. Time",
    236: "Hanif, Sattar, and Shafiq together formed- i. Cooperative ii. Organization iii. Group",

    // Chapter 7
    260: "An individual or business activity can be called wholesale trade when- i. Buys on one hand and sells on the other ii. Plays the role of an intermediary iii. Sells products directly to consumers",
    261: "As a result of credit transactions in retail trade- i. The scope of business increases ii. Bad debt risk is created iii. More capital is required",
    262: "A merchant wholesaler is- i. The largest wholesaler ii. An individual wholesaler iii. A joint wholesaler",
    263: "Under the producer's wholesaler, the following are included- i. Sales branch ii. Sales office iii. Sales agency",
    264: "The role of wholesalers in the economic development of the country is- i. Assisting in large-scale production ii. Developing domestic industries iii. Improving the standard of living",
    265: "In determining the product price, a retailer considers- i. Competitor's product price ii. Product sales risk iii. Other expenses",
    266: "To solve the problems of retail trade, the following should be done- i. Forming skilled salespeople ii. Reducing competition iii. Keeping product prices stable",
    268: "The characteristics of Kabir as a trader are- i. Large stock of products ii. High volume of buying and selling iii. Large-scale production",
    270: "The reasons for Mr. Rezaul's high profit are- i. High unit price ii. No warehousing cost iii. Business with small capital",
    272: "The type of service Mr. Polash provides to retailers is- i. Product splitting ii. Product transportation iii. Product warehousing",
    274: "In Mr. Hawlader's business, compared to wholesale trade, the aspects more needed are- i. Product pricing ii. Hiring skilled salespeople iii. Standardization and grading",

    // Chapter 8
    295: "The strategies that the 'Walmart Group' company can formulate to bring stability to sales are- i. Premium ii. Price reduction iii. Customer service",
    296: "In the case of personal selling, the tasks performed are- i. Product demonstration ii. Sales increase iii. Financial transaction",
    297: "Trader-centric sales promotion strategies are- i. Discount ii. Display iii. Gift",
    298: "The aspects a marketing manager must keep in mind in the case of marketing promotion are- i. Exchanging product information ii. Presenting the organization positively iii. Encouraging the purchase of products or services",
    299: "Sunsilk Company introduced a Tk 2 mini-pack considering rural people. The aspects that will be affected by this are- i. Diversification of taste ii. Convenience of purchase iii. Improvement in living standards",
    300: "Modern advertising techniques include- i. Neon sign ii. Sky advertising iii. Cinema",
    301: "The characteristics of publicity are- i. Paid ii. Higher credibility iii. Not controllable",
    302: "Publicity presents product-related information- i. Impersonally ii. With the help of mass media iii. In a paid manner",
    304: "Polar Company has been affected by the marketing activity in terms of- i. Sales stability ii. Increased production iii. Profit equality",
    306: "As a result of the company's financial rejuvenation, the noticeable aspects will be- i. Profit increase ii. Production increase iii. Market expansion",
    308: "ACI Ltd will benefit economically- i. Through direct communication ii. Through increased brand preference and loyalty iii. Through balancing demand and supply",
    310: "As a result of advertising on television, Zakir will benefit from the following aspects- i. Vivid presentation of the product ii. Fast promotion iii. Appealing presentation",

    // Chapter 9
    336: "Personal marketing techniques are- i. Advertising ii. Salesmanship iii. Personal selling",
    337: "As a profession, personal selling is- i. Attractive ii. Challenging iii. Flexible",
    338: "From the producer's perspective, the need for personal selling is- i. Creating demand ii. Personal appeal iii. Decision-making",
    339: "When production increases- i. Consumption increases ii. Investment increases iii. Employment decreases",
    340: "The psychological qualities of a salesperson are- i. Perseverance ii. Imagination iii. Truthfulness",
    341: "The response to advertising is- i. Immediate ii. Slow iii. Time-consuming",
    342: "Advertising is a promotional tool that is- i. Paid ii. Impersonal iii. Direct",
    344: "The tasks of 'Pran Agro Limited's' workers are- i. Selling products ii. Creating customers iii. Knowing customer reactions about the product",
    346: "The purpose of the salespeople of 'Asad Foods Limited' building personal relationships with customers is- i. Bringing dynamism to product sales ii. Identifying customer needs iii. Achieving mutual benefits",
    348: "The promotional activity of Maggi Noodles includes- i. Personal selling ii. Advertising iii. Decentralized selling",

    // Chapter 10
    368: "The subjects included in E-commerce are- i. Internet marketing ii. Electronic fund transfer iii. Inventory management system",
    369: "The tools of direct marketing are- i. Green marketing ii. Online marketing iii. Kiosk marketing",
    370: "Each branch of a chain store- i. Sells the same type of products ii. Follows the central sales policy iii. Sets product prices independently",
    371: "The reason for lower product prices in a supermarket is- i. Absence of salespeople ii. The owner produces some products themselves iii. Decentralized purchasing",
    372: "Green Marketing is- i. Using jute bags ii. Using CFC gas iii. Converting cars to CNG",
    374: "The benefits that customers have gained from this type of selling are- i. Their time has been saved ii. The opportunity to buy products on credit has been created iii. Can place orders 24 hours a day",
    378: "The reasons for Mr. Siddique buying products from Best Buy are- i. Product comparison opportunity ii. Quality products iii. Parking facility",
    380: "According to the seminar, the necessity of Green Marketing exists- i. In all areas of marketing ii. In improving the environment iii. In economic growth"
};

const answerFixes = {
    // Chapter 1
    11: "C", 27: "D", 28: "D", 29: "D", 30: "D", 42: "A",
    // Chapter 2
    46: "C", 55: "C", 63: "A", 64: "C", 69: "C", 70: "D", 71: "D", 72: "D", 73: "D", 74: "D", 77: "A", 79: "B", 81: "C",
    // Chapter 3
    104: "C", 105: "D", 107: "B", 110: "A", 112: "D", 115: "B", 116: "D", 118: "B",
    // Chapter 4
    146: "A", 148: "B", 149: "A", 150: "B", 151: "D", 152: "D", 154: "A", 156: "B", 158: "A", 160: "A",
    // Chapter 5
    189: "A", 191: "A", 196: "A", 198: "A",
    // Chapter 6
    221: "A", 222: "C", 226: "A", 227: "A", 228: "D", 230: "B", 234: "D", 236: "A",
    // Chapter 7
    264: "D", 265: "B", 266: "B", 270: "A", 274: "A",
    // Chapter 8
    295: "D", 296: "D", 297: "D", 299: "C", 301: "C", 302: "A", 304: "A", 306: "D", 308: "C",
    // Chapter 9
    336: "C", 337: "D", 339: "A", 341: "C", 342: "A", 348: "A",
    // Chapter 10
    369: "C", 371: "A", 372: "B", 374: "B", 378: "D", 380: "D"
};

let allQuestions = [];

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) return;
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.forEach(item => {
        const qid = item.id;
        if (questionFixes[qid]) {
            item.question = questionFixes[qid];
        }
        if (answerFixes[qid]) {
            item.answer = answerFixes[qid];
        }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    allQuestions = allQuestions.concat(data);
});

allQuestions.sort((a, b) => a.id - b.id);

const outputPath = path.join(basePath, 'production_2nd_complete_en.json');
fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');

console.log(`Successfully fixed questions in ${files.length} English files and created consolidated file.`);
