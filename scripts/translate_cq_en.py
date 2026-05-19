#!/usr/bin/env python3
"""Write English CQ JSON files for chapters 2-5."""
import json, os

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

cq_en = {}
cq_en['ch2'] = [
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_12",
        "stem": "One day a teacher was discussing factors of production in the classroom. He mentioned two factors of production — the first one has limited supply and is indestructible, and the second one is perishable and cannot be stored. He said that although the second factor is available in sufficient quantity in Bangladesh, many developed countries face a shortage of it. Although Bangladesh exports this factor abroad, the government should be more proactive in exporting it.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is labor mobility?",
                "model_answer": "Labor mobility refers to the movement of workers from one place, occupation, or industry to another.\n\nLabor mobility means the ability and willingness of workers to move between jobs, locations, or industries. It can be geographical (moving from one place to another), occupational (changing profession or job type), or industrial (moving between industries)."
            },
            {
                "label": "b",
                "question": "\"Organization helps in achieving objectives\" — explain.",
                "model_answer": "Organization helps in achieving objectives by coordinating resources and efforts toward common goals.\n\nOrganization involves determining objectives, collecting necessary resources, assigning tasks, and coordinating activities. Through proper organization, an establishment can achieve its objectives efficiently by ensuring that all factors of production work together harmoniously toward the same goals."
            },
            {
                "label": "c",
                "question": "Which factor of production did the teacher mention first in the stimulus? Explain.",
                "model_answer": "The teacher first mentioned Land.\n\nLand is the factor of production whose supply is limited and is indestructible. Land is a gift of nature with a fixed supply — its quantity cannot be increased or decreased by human effort. Land is also indestructible in the sense that its physical quantity remains constant over time, though its fertility can be changed."
            },
            {
                "label": "d",
                "question": "\"If the second factor mentioned in the stimulus can be exported in sufficient quantity, the economic development of the country will accelerate\" — analyze the statement.",
                "model_answer": "The second factor is Labor. Exporting labor (through overseas employment) can indeed accelerate economic development.\n\nWhen a country exports labor in sufficient quantity, several economic benefits occur: (1) Remittances sent by workers abroad increase foreign exchange earnings, (2) Unemployment decreases domestically, (3) Workers gain new skills and experience abroad, (4) The standard of living of worker families improves. Bangladesh has experienced significant economic growth partly due to remittances from overseas workers. Therefore, the government should focus on increasing labor exports through training, skills development, and creating more international employment opportunities."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_13",
        "stem": "Mrs. Lucky established a mango juice factory in Natore. She spent Tk 2 lakh to buy state-of-the-art juice-making machines from Japan. According to the production capacity of the machines, she employed 250 workers. As a result, the success of her establishment is increasing day by day.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is capital?",
                "model_answer": "Capital is the produced means of production.\n\nAccording to economists, capital is that part of wealth which is used in the production of further wealth. It includes machinery, tools, factories, raw materials, and other man-made resources used in the production process. Capital is a man-made factor of production, unlike land which is a natural factor."
            },
            {
                "label": "b",
                "question": "In which factor of production is the machine mentioned in the stimulus included? Explain.",
                "model_answer": "The machine mentioned in the stimulus is included in Capital.\n\nA machine is a man-made tool used in the production process. Mrs. Lucky bought modern machines from Japan for Tk 2 lakh, which are capital goods. Capital includes all manufactured goods used in production such as machinery, equipment, buildings, and tools. These are produced means of production that help in creating other goods and services."
            },
            {
                "label": "c",
                "question": "What type of factor of production does the 250 workers represent? Explain.",
                "model_answer": "The 250 workers represent Labor as a factor of production.\n\nLabor refers to all human efforts — physical and mental — used in the production process. The 250 workers employed by Mrs. Lucky contribute their physical and mental efforts to operate the machines and run the factory. Labor is an active factor of production because without human effort, other factors like machines cannot function."
            },
            {
                "label": "d",
                "question": "Evaluate the relationship between the factors of production mentioned in the stimulus.",
                "model_answer": "The factors work together — Capital (machines), Labor (250 workers), and Organization (Mrs. Lucky herself) combine with Land (factory location) to create production.\n\nIn the stimulus, all factors of production work in coordination: Land provides the location in Natore, Capital is represented by the modern machines, Labor consists of 250 workers, and Mrs. Lucky acts as the organizer/entrepreneur who brings all factors together. The increasing success of the establishment shows how proper combination of all factors leads to higher productivity and profitability. The relationship is complementary — each factor depends on the others for efficient production."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_14",
        "stem": "Mr. Jamil works as a supervisor in a garments called 'Zex Fashion'. After working for three years, he joined 'Haq Fashion', a well-known garment in the industry, in the same position. This establishment has earned reputation abroad by exporting their garments. Mr. Jamil observed that this establishment is very conscious about employee efficiency and they take various hands-on training initiatives to increase employee skills.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is the efficiency of labor?",
                "model_answer": "Efficiency of labor refers to the productivity or work capacity of labor.\n\nLabor efficiency means the ability of workers to produce output within a given time. Higher efficiency means more production per unit of time. Factors affecting labor efficiency include education, training, health, nutrition, working environment, and motivation."
            },
            {
                "label": "b",
                "question": "\"Occupation mobility of labor\" — explain.",
                "model_answer": "Occupation mobility of labor refers to workers changing from one profession or occupation to another.\n\nWhen a worker leaves one job and takes up a different type of work, it is called occupational mobility. In the stimulus, Mr. Jamil moved from one garments to another — this is an example of occupational mobility within the same industry sector. Occupational mobility allows workers to find better opportunities and improves labor market efficiency."
            },
            {
                "label": "c",
                "question": "What measures can be taken to increase the efficiency of workers like Mr. Jamil? Explain.",
                "model_answer": "Training and skill development programs can increase worker efficiency.\n\nTo increase worker efficiency, the following measures can be taken: (1) Providing hands-on training as mentioned in the stimulus, (2) Arranging regular skill development workshops, (3) Ensuring good working conditions, (4) Providing proper equipment and tools, (5) Offering incentives and motivation, (6) Ensuring health and safety at work. The stimulus shows that 'Haq Fashion' takes various training initiatives, which is why they have been successful in exporting quality garments."
            },
            {
                "label": "d",
                "question": "Evaluate the role of continuous training in increasing labor productivity in the readymade garments sector of Bangladesh.",
                "model_answer": "Continuous training plays a vital role in increasing labor productivity in the RMG sector of Bangladesh.\n\nContinuous training is essential for the RMG sector because: (1) It keeps workers updated with modern techniques, (2) It improves product quality, (3) It reduces wastage and rework, (4) It increases worker confidence and motivation, (5) It helps in meeting international quality standards for export. As seen in the stimulus, 'Haq Fashion' focuses on training to ensure quality products for export. The RMG sector of Bangladesh, being a major export earner, needs continuous investment in worker training to remain competitive in the global market."
            }
        ]
    }
]

cq_en['ch3'] = [
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_15",
        "stem": "After finishing his job abroad, Badsha Mia returned to the country. He used his experience and invested Tk 10 crore to establish 'Jhilik Fashion', a readymade garments factory in Ashulia. His factory employs 90 workers. The readymade garments produced in Badsha Mia's factory are delivered to designated shops through their own transportation. Due to quality garments and relatively lower prices, he was able to achieve business success in a short time.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is scale of production?",
                "model_answer": "Scale of production refers to the size or magnitude of production in an establishment.\n\nAccording to economists, scale of production is the quantum of production that a firm can produce by utilizing all its resources optimally. It indicates the capacity of a production unit and determines the level of output, cost structure, and efficiency."
            },
            {
                "label": "b",
                "question": "On which scale of production is Badsha Mia's establishment? Explain.",
                "model_answer": "Badsha Mia's establishment is a Large Scale Production.\n\nSince Badsha Mia invested Tk 10 crore (which is significant capital), employs 90 workers, and has its own transportation system, this indicates a large scale of production. The factory is located in Ashulia, an industrial area, and produces for the market with quality garments sold at competitive prices. These characteristics align with large scale production where substantial capital, labor, and technology are used."
            },
            {
                "label": "c",
                "question": "\"Quality garments and relatively lower prices are the reasons for Badsha Mia's success\" — analyze.",
                "model_answer": "Quality and competitive pricing are indeed key factors for business success.\n\nQuality garments ensure customer satisfaction and repeat purchases, while relatively lower prices make the products accessible to more consumers. This combination creates a competitive advantage in the market. When a business offers good quality at affordable prices, it can capture market share quickly and build a strong customer base. Badsha Mia's success in a short time demonstrates this principle."
            },
            {
                "label": "d",
                "question": "Compare the importance of capital, labor, and organization in the context of the stimulus.",
                "model_answer": "All three factors — capital (Tk 10 crore investment), labor (90 workers), and organization (Badsha Mia's entrepreneurial skills) — are essential and interdependent.\n\nIn Badsha Mia's establishment: Capital provided the necessary infrastructure and technology; Labor operates the production process; and Organization (Badsha Mia himself) coordinates all activities including planning, quality control, and marketing. Without any one of these, the factory could not function effectively. The stimulus shows that Badsha Mia combined his experience (organization) with capital investment and labor to create a successful business."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_16",
        "stem": "Mr. Jewel established a 'Kazi Furniture' factory with Tk 5 crore. He allocated Tk 2 crore for building construction, Tk 1 crore for machinery, Tk 50 lakh for raw materials, Tk 50 lakh for furniture design, and the rest for other purposes. His total cost for producing one unit of furniture is Tk 5,000. He sells each unit at Tk 6,500. The furniture is well appreciated by customers for its design and quality. Currently he supplies furniture within the district and has plans to expand to other districts.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is optimum scale of production?",
                "model_answer": "Optimum scale of production is the scale where average cost of production is the minimum.\n\nOptimum scale refers to the most efficient size of production where the firm can produce goods at the lowest possible average cost. At this scale, the firm enjoys maximum economies of scale and produces at the most efficient level."
            },
            {
                "label": "b",
                "question": "\"Mr. Jewel's establishment is producing furniture on a large scale\" — explain.",
                "model_answer": "Mr. Jewel's establishment is indeed a large scale production due to substantial capital investment, structured operations, and market reach.\n\nWith Tk 5 crore investment and a defined production process with cost analysis (Tk 5,000 per unit cost, Tk 6,500 selling price), this indicates large scale production. Large scale production is characterized by significant capital investment, division of labor, use of machinery, and wider market coverage — all present in Mr. Jewel's factory."
            },
            {
                "label": "c",
                "question": "What type of cost is Tk 5,000 mentioned in the stimulus? Explain.",
                "model_answer": "Tk 5,000 refers to the Average Cost (per unit cost) of production.\n\nAverage cost is the total cost divided by the number of units produced. It includes both fixed costs (building, machinery) and variable costs (raw materials, labor). In the stimulus, Tk 5,000 per unit includes all costs of production. Mr. Jewel sells each unit at Tk 6,500, making a profit of Tk 1,500 per unit."
            },
            {
                "label": "d",
                "question": "Analyze the profitability of Mr. Jewel's establishment and suggest ways to expand the business.",
                "model_answer": "Mr. Jewel's establishment is profitable (Tk 1,500 profit per unit) and has good potential for expansion.\n\nAnalysis: With a selling price of Tk 6,500 and cost of Tk 5,000 per unit, the profit margin is Tk 1,500 (about 23%). To expand: (1) Increase production scale to benefit from economies of scale, (2) Modernize machinery to reduce costs, (3) Expand to other districts as planned, (4) Develop online sales channels, (5) Introduce new furniture designs, (6) Consider exporting to international markets. The positive customer feedback indicates strong market demand."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_17",
        "stem": "'Modern Garments' can produce 5,000 pieces of garments per month with a total cost of Tk 50,00,000. The fixed cost of the factory is Tk 20,00,000. The owner wants to increase production to 8,000 pieces. For this, he needs an additional Tk 5,00,000 for raw materials and Tk 3,00,000 for labor.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is total cost?",
                "model_answer": "Total cost is the sum of all costs incurred in production.\n\nTotal cost includes both fixed costs and variable costs. It represents the total expense of producing a given quantity of output. TC = FC + VC, where FC is fixed cost and VC is variable cost."
            },
            {
                "label": "b",
                "question": "Calculate the fixed cost and variable cost of 'Modern Garments'.",
                "model_answer": "Fixed cost = Tk 20,00,000, Variable cost = Tk 30,00,000.\n\nTotal cost = Tk 50,00,000. Fixed cost = Tk 20,00,000. Therefore, Variable cost = Total cost - Fixed cost = Tk 50,00,000 - Tk 20,00,000 = Tk 30,00,000."
            },
            {
                "label": "c",
                "question": "What will be the new average cost if production increases to 8,000 pieces?",
                "model_answer": "New average cost = Tk 7,250 per piece.\n\nNew total cost = Old total cost (Tk 50,00,000) + Additional raw material (Tk 5,00,000) + Additional labor (Tk 3,00,000) = Tk 58,00,000. New production = 8,000 pieces. Average cost = Tk 58,00,000 / 8,000 = Tk 7,250 per piece."
            },
            {
                "label": "d",
                "question": "Should 'Modern Garments' increase production? Give your analysis.",
                "model_answer": "Yes, increasing production would be beneficial because with higher production, fixed cost per unit decreases.\n\nAnalysis: At the current production of 5,000 pieces, the average cost is Tk 10,000 per piece (Tk 50,00,000 / 5,000). At 8,000 pieces, the average cost is Tk 7,250 per piece — a decrease of Tk 2,750 per unit. This is due to the spreading of fixed costs over more units (economies of scale). If the selling price remains the same, the profit margin would increase significantly. Therefore, expanding production is economically beneficial."
            }
        ]
    }
]

cq_en['ch4'] = [
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_18",
        "stem": "Various information of two countries 'K' and 'Kh' is presented below:\n\n| Various Information | 'K' Country (Crore USD) | 'Kh' Country (Crore USD) |\n|---|---|---|\n| Total Consumption Expenditure | 3,000 | 2,000 |\n| Total Private Investment Expenditure | 3,000 | 2,500 |\n| Total Government Expenditure | 2,000 | 1,500 |\n| Total Exports | 3,000 | 2,500 |\n| Total Imports | 2,500 | 3,000 |\n| Depreciation | 500 | 400 |\n| Net Foreign Income | -100 | 200 |",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is Gross Domestic Product (GDP)?",
                "model_answer": "Gross Domestic Product (GDP) is the total market value of all final goods and services produced within a country's geographical border during a specific period (usually one year).\n\nGDP measures the size of an economy based on production within the country regardless of who owns the factors of production. It can be calculated using three methods: production, income, and expenditure approach."
            },
            {
                "label": "b",
                "question": "Calculate the GDP of 'K' country using the expenditure method.",
                "model_answer": "GDP of 'K' country = Consumption + Investment + Government expenditure + (Exports - Imports) = 3,000 + 3,000 + 2,000 + (3,000 - 2,500) = 3,000 + 3,000 + 2,000 + 500 = Tk 8,500 crore USD.\n\nUsing the expenditure method: GDP = C + I + G + (X - M) where C = Consumption, I = Investment, G = Government expenditure, X = Exports, M = Imports."
            },
            {
                "label": "c",
                "question": "Calculate the GNP of both countries and compare.",
                "model_answer": "GNP of 'K' country = GDP + Net Foreign Income = 8,500 + (-100) = 8,400 crore USD.\n\nGNP of 'Kh' country = GDP + Net Foreign Income\nFirst, GDP of 'Kh' = 2,000 + 2,500 + 1,500 + (2,500 - 3,000) = 2,000 + 2,500 + 1,500 - 500 = 5,500 crore USD.\nGNP of 'Kh' = 5,500 + 200 = 5,700 crore USD.\n\nComparison: 'K' country has a higher GNP (8,400) than 'Kh' country (5,700), indicating 'K' has a larger economy."
            },
            {
                "label": "d",
                "question": "Which country is in a better economic position? Evaluate.",
                "model_answer": "Based on GDP and GNP figures, Country 'K' is in a better economic position.\n\nCountry 'K' has higher GDP (8,500 vs 5,500), higher GNP (8,400 vs 5,700), higher consumption, investment, and government expenditure. However, 'K' has negative net foreign income (-100) meaning it pays more to foreign entities than it receives, while 'Kh' has positive net foreign income (200). Despite this, 'K' consistently outperforms 'Kh' across all major economic indicators. For a complete evaluation, per capita income, growth rate, and other qualitative factors would also need to be considered."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_19",
        "stem": "In the fiscal year 2017-18, the national income of 'X' country was Tk 2,00,000 crore and the total population was 40 crore. In that year, total consumption expenditure was Tk 10,000 crore, total investment expenditure was Tk 4,000 crore, and government expenditure was Tk 4,000 crore. On the other hand, 'Y' country had similar conditions to 'X' country but, due to a smaller population, their per capita income reached Tk 10,000.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is per capita income?",
                "model_answer": "Per capita income is the average income per person in a country.\n\nIt is calculated by dividing the national income by the total population. Per capita income = National Income / Total Population. It is a key indicator of a country's standard of living and economic well-being of its citizens."
            },
            {
                "label": "b",
                "question": "Calculate the per capita income of 'X' country.",
                "model_answer": "Per capita income of 'X' country = National Income / Total Population = Tk 2,00,000 crore / 40 crore = Tk 5,000.\n\nTherefore, the per capita income of 'X' country is Tk 5,000."
            },
            {
                "label": "c",
                "question": "Explain the difference in per capita income between 'X' and 'Y' countries.",
                "model_answer": "The difference is due to population size. 'Y' country has a smaller population but similar national income to 'X', resulting in higher per capita income.\n\nSince both countries have similar economic conditions but 'Y' has a smaller population, the same (or similar) national income is divided among fewer people in 'Y', resulting in higher per capita income (Tk 10,000). This demonstrates that per capita income depends on both national income and population size. A country can have a high national income but low per capita income if its population is large."
            },
            {
                "label": "d",
                "question": "Is per capita income a good indicator of economic development? Evaluate.",
                "model_answer": "Per capita income is a useful but incomplete indicator of economic development.\n\nAdvantages: (1) It gives a quick measure of average living standards, (2) It allows easy comparison between countries, (3) It correlates with many development indicators.\n\nLimitations: (1) It does not show income distribution (inequality), (2) It ignores non-monetary factors like quality of life, (3) It does not account for environmental quality, (4) It excludes informal sector activities, (5) It does not measure health, education, or other social indicators.\n\nTherefore, while per capita income is a useful starting point, it should be used alongside other indicators like HDI, Gini coefficient, and poverty rate to assess true development."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_20",
        "stem": "In the fiscal year 2018-19, country 'K' had total consumption expenditure of Tk 900 crore, total investment expenditure of Tk 300 crore, total government expenditure of Tk 350 crore, export earnings of Tk 200 crore, and import costs of Tk 280 crore.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is National Income?",
                "model_answer": "National Income (NI) is the total income earned by a country's factors of production in a given period.\n\nIt is the sum of all factor incomes — rent, wages, interest, and profit — earned by residents of a country. NI can be measured at market price or factor cost."
            },
            {
                "label": "b",
                "question": "What is the net export of country 'K'?",
                "model_answer": "Net Export = Export - Import = Tk 200 - Tk 280 = -Tk 80 crore (Negative net export/trade deficit).\n\nA negative net export means the country imports more than it exports, resulting in a trade deficit."
            },
            {
                "label": "c",
                "question": "Calculate the GDP of country 'K' using the expenditure method.",
                "model_answer": "GDP = Consumption + Investment + Government Expenditure + Net Export = 900 + 300 + 350 + (200 - 280) = 900 + 300 + 350 - 80 = Tk 1,470 crore.\n\nThe GDP of country 'K' in fiscal year 2018-19 was Tk 1,470 crore."
            },
            {
                "label": "d",
                "question": "Calculate the GDP of both countries if similar data existed and compare the economic condition.",
                "model_answer": "This question would need data from another country for comparison. From the given data, country 'K' has moderate economic activity.\n\nThe GDP calculation shows that consumption (61.2%) is the largest component of 'K' country's GDP, followed by government expenditure (23.8%) and investment (20.4%). The trade deficit (negative net export) of Tk 80 crore indicates the country imports more than it exports. For a comprehensive economic analysis, this data would need to be compared with previous years and other countries to determine trends and relative economic health."
            }
        ]
    }
]

cq_en['ch5'] = [
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_21",
        "stem": "Considering the World Cup cricket, a renowned mobile company of the country ordered 10 lakh pieces of T-shirts of specific design from 'Lara Fashion' as part of their promotional activities. With this goal, 'Lara Fashion' performed all tasks including production planning, production control, and quality control in such a way that the T-shirts are produced in less time and at lower cost.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is an emergency product?",
                "model_answer": "An emergency product is a product purchased urgently to meet an immediate and essential need.\n\nEmergency products are goods or services that consumers need immediately in urgent situations, such as medicines, umbrellas during rain, or repair services. These products are purchased without delay when the need arises."
            },
            {
                "label": "b",
                "question": "Describe the role of quality products in increasing sales.",
                "model_answer": "Quality products increase customer satisfaction, build trust, generate positive word-of-mouth, and create repeat purchases — all of which increase sales.\n\nWhen a company produces quality products, customers are more likely to recommend them to others, leading to increased market share. Quality also reduces returns and complaints, enhancing brand reputation."
            },
            {
                "label": "c",
                "question": "What types of production management tasks are mentioned in the stimulus? Explain.",
                "model_answer": "The stimulus mentions Production Planning, Production Control, and Quality Control.\n\nProduction Planning involves deciding what to produce, how to produce, when to produce, and in what quantity. Production Control involves monitoring the production process to ensure plans are followed. Quality Control involves checking products to ensure they meet specified standards. 'Lara Fashion' used all three to efficiently produce T-shirts for the World Cup order."
            },
            {
                "label": "d",
                "question": "How does proper production management help reduce production time and cost? Evaluate.",
                "model_answer": "Proper production management reduces time and cost through efficient planning, controlling waste, and maintaining quality standards.\n\nProduction management helps reduce time by: (1) Proper scheduling of production activities, (2) Efficient resource allocation, (3) Smooth workflow coordination.\n\nProduction management helps reduce cost by: (1) Minimizing waste of raw materials, (2) Reducing idle time of machines and labor, (3) Preventing quality defects that cause rework, (4) Optimizing inventory levels.\n\nIn the stimulus, 'Lara Fashion' achieved both objectives — less time and lower cost — by applying proper production management techniques."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_22",
        "stem": "'Poly Fashion Ltd.' produces different types of fashionable clothes. They produce large quantities of standardized products. The company has separate departments for cutting, sewing, finishing, and packaging. Each department has specialized workers. As a result, production is fast and quality is maintained. The products are exported to various countries earning foreign currency.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is a product?",
                "model_answer": "A product is anything that can be offered to a market to satisfy a want or need.\n\nProducts can be tangible (goods like clothes, furniture) or intangible (services like banking, healthcare). A product includes features, design, packaging, brand, and associated services."
            },
            {
                "label": "b",
                "question": "What type of production method does 'Poly Fashion Ltd.' follow? Explain.",
                "model_answer": "Poly Fashion Ltd. follows Mass Production Method (also called Flow Production).\n\nMass production involves producing large quantities of standardized products using an assembly line or continuous process. The company produces large quantities of fashionable clothes, has specialized departments (cutting, sewing, finishing, packaging), and employs specialized workers — all characteristics of mass production. This method allows fast production and consistent quality."
            },
            {
                "label": "c",
                "question": "\"Division of labor increases production speed\" — analyze.",
                "model_answer": "Division of labor increases production speed because workers become specialized and efficient at their specific tasks.\n\nWhen workers focus on a single task repeatedly, they develop expertise, speed, and accuracy. In 'Poly Fashion Ltd.', each department has specialized workers — cutters only cut fabric, sewers only sew, etc. This specialization eliminates the need for workers to switch between different tasks, saving time and increasing overall production speed."
            },
            {
                "label": "d",
                "question": "Evaluate the importance of exports for the readymade garments industry of Bangladesh.",
                "model_answer": "Exports are critically important for Bangladesh's RMG industry — they earn foreign currency, create employment, and drive economic growth.\n\nThe readymade garments sector is Bangladesh's largest export earner, contributing about 80% of total export earnings. Export-oriented production: (1) Brings foreign currency reserves, (2) Creates millions of jobs, especially for women, (3) Transfers technology and skills, (4) Enhances international reputation, (5) Promotes industrial development. Like 'Poly Fashion Ltd.', many Bangladeshi RMG factories export to international markets, contributing significantly to the country's economy."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_23",
        "stem": "'Shikder Group' manufactures furniture in both standard and customized designs. For standard furniture, they use assembly line production. For customized furniture based on customer orders, they produce in small batches with special attention to design. The company uses modern machinery and skilled workers to ensure quality.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What is batch production?",
                "model_answer": "Batch production is a manufacturing method where products are produced in groups or batches.\n\nIn batch production, a specific quantity of identical products is produced together (a batch), then the production line is set up for the next batch. This method is suitable for producing different product varieties in moderate quantities."
            },
            {
                "label": "b",
                "question": "Explain the difference between the two production methods mentioned in the stimulus.",
                "model_answer": "Assembly line production (for standard furniture) produces continuously with standardized processes, while batch production (for customized furniture) produces in small groups with flexible processes.\n\nAssembly line production is characterized by high volume, standardized products, continuous flow, and lower per-unit cost. Batch production involves producing different products in batches, requires setup changes between batches, and offers more flexibility for customization."
            },
            {
                "label": "c",
                "question": "How does 'Shikder Group' balance standardization and customization? Explain.",
                "model_answer": "By using different production methods for different product types — assembly line for standard furniture, batch production for customized furniture.\n\nThis dual approach allows 'Shikder Group' to serve both market segments efficiently. Standard products benefit from economies of scale through mass production, while customized products command higher prices through personalized designs. Modern machinery and skilled workers support both production methods, ensuring quality across all product types."
            },
            {
                "label": "d",
                "question": "Analyze the role of skilled workers and modern technology in maintaining product quality.",
                "model_answer": "Skilled workers bring expertise and precision; modern technology ensures consistency and efficiency — both are essential for quality.\n\nSkilled workers: (1) Can perform complex tasks accurately, (2) Can identify and solve quality issues, (3) Contribute to continuous improvement, (4) Can adapt to different production requirements.\n\nModern technology: (1) Ensures precision and consistency, (2) Reduces human error, (3) Increases production speed, (4) Enables complex designs.\n\nIn 'Shikder Group', the combination of skilled workers and modern machinery ensures that both standard and customized furniture meet quality standards."
            }
        ]
    },
    {
        "_type": "creative_question",
        "id": "hsc_prod1_cq_24",
        "stem": "'Deshi Foods' produces three types of products: (1) Chips and biscuits for daily consumption, (2) Packaged rice and lentils for regular household use, (3) Premium quality sweets for special occasions and festivals. Their products are sold through various retail stores across the country.",
        "stem_label": "Read the stimulus and answer the following questions",
        "questions": [
            {
                "label": "a",
                "question": "What are consumer goods?",
                "model_answer": "Consumer goods are products purchased by final consumers for personal consumption.\n\nConsumer goods are the end products of production that directly satisfy human wants. They are classified into convenience goods, shopping goods, specialty goods, and unsought goods based on consumer buying behavior."
            },
            {
                "label": "b",
                "question": "Classify the products of 'Deshi Foods' according to product classification.",
                "model_answer": "(1) Chips and biscuits = Convenience goods (daily consumption, frequent purchase), (2) Packaged rice and lentils = Shopping goods (regular household use, compared on price and quality), (3) Premium sweets = Specialty goods (special occasions, unique characteristics).\n\nConvenience goods are purchased frequently with minimal effort. Shopping goods are compared before purchase. Specialty goods have unique features that buyers actively seek."
            },
            {
                "label": "c",
                "question": "What type of distribution channel is 'Deshi Foods' using? Explain.",
                "model_answer": "Producer \u2192 Retailer \u2192 Consumer (a short distribution channel).\n\n'Deshi Foods' sells through various retail stores across the country, meaning they distribute through retailers who then sell to final consumers. This is a common distribution channel for consumer goods where the manufacturer focuses on production and retailers handle direct selling to consumers."
            },
            {
                "label": "d",
                "question": "How can 'Deshi Foods' expand its market beyond the national level? Evaluate different strategies.",
                "model_answer": "Deshi Foods can expand by: (1) Exporting to international markets, (2) Developing e-commerce channels, (3) Creating strong brand identity, (4) Obtaining international quality certifications, (5) Setting up distribution in neighboring countries.\n\nFor international expansion, 'Deshi Foods' would need to: (1) Research target markets and adapt products accordingly, (2) Meet international food safety and quality standards, (3) Develop packaging suitable for export, (4) Establish partnerships with international distributors, (5) Create an online presence for global reach. The company could start with the Bangladeshi diaspora market and gradually expand to mainstream markets."
            }
        ]
    }
]

# Save
for key, data in cq_en.items():
    ch_num = key.replace('ch', '')
    path = f'public/hsc/production_1st/english/chapter_{ch_num}_cq.json'
    save_json(path, data)
    print(f"Saved {len(data)} CQs → {path}")
