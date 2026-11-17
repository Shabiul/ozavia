export type MasalaId = "garam" | "biryani" | "elite" | "pili";

export type Masala = {
  id: MasalaId;
  name: string;
  color: string;
  spiceColor: string;
  hook: string;
  era: string;
  story: string[];
  ingredients: string[];
  sources: { claim: string; url: string }[];
};

export const masalas: Masala[] = [
  {
    id: "garam",
    name: "Garam Masala",
    color: "#8e2a22",
    spiceColor: "#7a4a22",
    hook: "Warmth, not fire: the old spice routes in one spoonful.",
    era: "North India · Mughal era",
    story: [
      "Garam means hot and masala a blend of spices, yet the heat in the name is not the burn of chilli. It points to warmth: in Ayurveda these spices are held to warm the body, and the blend has long been valued against colds. There is no fixed recipe. Households traditionally kept their own proportions.",
      "The blend as it is known today is thought to have taken shape in the Mughal era, beside a court cookery heavy with meat. Northern versions lean on the sweeter spices: cinnamon, cloves and green cardamom.",
      "A jar of it is also an old trade map. Black pepper and green cardamom are native to the Malabar Coast of south-west India. True cinnamon is native to Sri Lanka. Until the sixteenth century, cultivated cloves and nutmeg came only from the Moluccas and Banda islands, and cloves were reaching India before the Common Era.",
    ],
    ingredients: [
      "Black peppercorns",
      "Green cardamom",
      "Cinnamon",
      "Cloves",
      "Nutmeg",
      "Mace",
      "Cumin seed",
      "Bay leaf",
    ],
    sources: [
      {
        claim:
          "The name means 'hot or warm spices', the heat meant is not chilli fire, Ayurveda values the mix, families kept their own recipes, the modern blend is thought to have taken shape under the Mughal empire, and northern versions favour cinnamon, cloves and green cardamom (Abirami Durai, The Star, via Asia News Network).",
        url: "https://asianews.network/?p=313511",
      },
      {
        claim:
          "No set recipe; in Ayurveda the warming spices are believed to help prevent and treat colds; Mughal cuisine was meat-heavy and suited to garam masala (Tasting Table).",
        url: "https://www.tastingtable.com/2149728/garam-masala-spice-guide/",
      },
      {
        claim: "Garam masala originates in the Indian subcontinent; typical ingredients (Wikipedia, supplementary).",
        url: "https://en.wikipedia.org/wiki/Garam_masala",
      },
      {
        claim: "Black pepper is native to the Malabar region (Shirin Mehrotra, Diaspora Co. journal).",
        url: "https://www.diasporaco.com/blogs/journal/did-you-feel-the-burn",
      },
      {
        claim: "Black pepper is indigenous to the Malabar Coast and grows wild in the Western Ghats (Wikipedia, supplementary).",
        url: "https://en.wikipedia.org/wiki/Black_pepper",
      },
      {
        claim: "Green cardamom (Elettaria cardamomum) is native to the Malabar Coast of India (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Cardamom",
      },
      {
        claim: "True cinnamon (Cinnamomum verum) is native to Sri Lanka (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Cinnamomum_verum",
      },
      {
        claim:
          "The Moluccas and Banda islands were the only source of cultivated cloves and nutmeg until the sixteenth century, and cloves were traded to the Indian subcontinent before the birth of Christ (Plumes from Paradise, Sydney University Press).",
        url: "https://open.sydneyuniversitypress.com.au/9781743325445/pfp-the-rise-and-decline-of-the-spice-islands.html",
      },
    ],
  },
  {
    id: "biryani",
    name: "Biryani Masala",
    color: "#4d5a2c",
    spiceColor: "#8a6a2a",
    hook: "Rice, meat and a sealed pot. The rest is debated.",
    era: "Persia to Hindustan · Mughal era",
    story: [
      "The name is Persian in root. The usual derivation is from biryan, to fry or roast, and the phrase birinj biryan means fried rice. Beyond the word, historians disagree. Some hold that the dish came from Persia. Others, Lizzie Collingham among them, place it in Mughal India, where delicate Persian pilau met the pungent, spiced rice dishes of Hindustan.",
      "The written record is thinner than the legends. Historians who have gone through the texts find the first references to biryani only around the eighteenth century, and K. T. Achaya noted that pilau is the older usage in India. The method is clearer: meat and rice in a heavy pot, sealed with dough, left over a slow fire. This is dum pukht, which tradition ties to Awadh.",
      "From there the schools divide. Lucknow's is scented with rose and kewra. Hyderabad's kachchi biryani begins with raw marinated meat. Kolkata's carries a potato, a habit dated to the 1850s. On the Malabar coast, Thalassery cooks use short-grained kaima rice in place of basmati. The spicing they share is aromatic before it is hot: shahi jeera, mace, star anise, cardamom, cloves.",
    ],
    ingredients: [
      "Shahi jeera (caraway)",
      "Mace",
      "Star anise",
      "Bay leaf",
      "Green cardamom",
      "Cloves",
      "Cinnamon",
      "Black peppercorns",
    ],
    sources: [
      {
        claim:
          "Etymology from Persian biryan/beriyan, 'to fry or roast', and 'birinj biryan', fried rice; the competing origin theories of Lizzie Collingham, Pratibha Karan and Salma Hussein; Achaya's remark that pilau is of older usage in India; Kolkata biryani with potato dated to the 1850s (Wikipedia, citing these authors).",
        url: "https://en.wikipedia.org/wiki/Biryani",
      },
      {
        claim:
          "The precise origin 'remains contested among food historians'; the dum pukht method of the Mughal kitchens; Lucknow's rose and kewra (Javed Hassan, Arab News).",
        url: "https://www.arabnews.pk/opinion/biryani-without-borders-how-one-sublime-dish-unites-regions-and-cultures-2608890",
      },
      {
        claim:
          "Historians who have gone through the texts find the first references to biryani only around the 18th century; Achaya did not treat it as the same dish as medieval pulao (Vir Sanghvi).",
        url: "https://www.virsanghvi.com/Article-Details.aspx?key=1777",
      },
      {
        claim:
          "Dum pukht: food sealed in a heavy pot with dough and cooked over low heat; tradition assigns its origin to the reign of Asaf-ud-Daulah, Nawab of Awadh (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Dum_pukht",
      },
      {
        claim:
          "Hyderabadi kachchi biryani is made with raw meat marinated overnight; its spices include shahi jeera, mace, star anise, cardamom and cloves (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Hyderabadi_biryani",
      },
      {
        claim: "Thalassery biryani of the Malabar Mappila community uses short-grained kaima (jeerakasala) rice, not basmati (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Thalassery_biryani",
      },
    ],
  },
  {
    id: "elite",
    name: "Elite All Purpose Masala",
    color: "#1f3358",
    spiceColor: "#9a3d1c",
    hook: "One balanced blend for the everyday pot.",
    era: "Indus Valley · from c. 2500 BCE",
    story: [
      "Many North Indian kitchens keep one all-round masala within reach of the stove, a blend meant for the everyday pot and not for a single dish. Its base is four spices: coriander, cumin, turmeric and chilli. Garlic, tomato and green coriander leaf are the fresh company it usually keeps.",
      "Turmeric's roots here run deep. At Farmana, a Harappan site dated 2600 to 2200 BCE, archaeologists recovered starch grains consistent with turmeric and ginger from a cooking pot. By around 500 BCE turmeric had a settled place in Ayurvedic medicine.",
      "Coriander and cumin are old travellers. Coriander is native to the Mediterranean basin and was placed in Tutankhamun's tomb. Cumin seeds excavated in Syria date to the second millennium BCE, and India has cooked with cumin for millennia. Chilli is the newcomer, carried to India by Portuguese ships around 1542. The blend is younger than any of its parts.",
    ],
    ingredients: [
      "Coriander seed",
      "Cumin seed",
      "Turmeric",
      "Dried red chilli",
      "Black peppercorns",
      "Fenugreek seed",
      "Dried ginger",
      "Garlic",
    ],
    sources: [
      {
        claim:
          "At the Harappan site of Farmana (2600-2200 BC), starches of cf. ginger and cf. turmeric were extracted from a cooking pot (Kashyap & Weber, Antiquity Project Gallery).",
        url: "https://antiquity.ac.uk/projgall/kashyap326/",
      },
      {
        claim:
          "Turmeric, ginger and garlic residue dating to about 2500 BCE; turmeric became an important part of Ayurvedic medicine around 500 BCE (Tori Avey, PBS Food).",
        url: "https://www.pbs.org/food/the-history-kitchen/turmeric-history/",
      },
      {
        claim: "Coriander is native to the Mediterranean Basin; coriander fruits were recovered from the tomb of Tutankhamun (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Coriander",
      },
      {
        claim:
          "Cumin seeds excavated in Syria were dated to the second millennium BC; in India cumin has been used for millennia (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Cumin",
      },
      {
        claim: "Portuguese ships introduced chillies to India around 1542 (Hallie Pugh-Sellers, JSTOR Daily).",
        url: "https://daily.jstor.org/plant-of-the-month-chili-pepper",
      },
    ],
  },
  {
    id: "pili",
    name: "Pili Mirch",
    color: "#c8601c",
    spiceColor: "#cc5a1a",
    hook: "A chilli from the Americas, with a Sanskrit name for pepper.",
    era: "The Americas to Goa · 16th century",
    story: [
      "Pili mirch means yellow chilli. In North Indian cooking, yellow chilli powder is what a cook reaches for when a dish needs heat but should keep its own colour. It goes into the white gravies of Old Delhi and into the galouti kebab of Lucknow. The chillies are associated with the Himalayan foothills: Himachal Pradesh, and Uttarakhand, home of the Lakhori chilli.",
      "No chilli is native to India. The plant was domesticated in Central and South America, and Columbus, meeting it there, thought it resembled black pepper. Portuguese ships brought it to India around 1542. Goa was the likely door: chillies from Goa were once known as Pernambuco pepper, after a region of Brazil.",
      "Before that, heat meant pepper. K. T. Achaya records that the fifty dishes listed in the Ain-i-Akbari of 1590 are spiced with black pepper alone, and the word mirch itself comes from Sanskrit marich, which first meant pepper. Chillies took hold in the south and reached North India in the eighteenth century. Long pepper is now a rarity in trade. Black pepper stayed, with company.",
    ],
    // Single-spice product: listing more "ingredients" would be invention.
    ingredients: ["Dried yellow chillies"],
    sources: [
      {
        claim:
          "Yellow chilli, grown in Himachal Pradesh, 'adds a little heat and no colour' and is used by Old Delhi cooks in white gravies (chef Sadaf Hussain, quoted by Shirin Mehrotra, Diaspora Co. journal). Same article: chillies were assimilated in the south first and reached North India in the 18th century; in Goa they were called Pernambuco pepper.",
        url: "https://www.diasporaco.com/blogs/journal/did-you-feel-the-burn",
      },
      {
        claim: "Pushpesh Pant's recipe for the galouti kebab of Awadh lists yellow chilli powder (The Tribune, 2017).",
        url: "https://www.tribuneindia.com/news/archive/features/morsels-of-delight-381665",
      },
      {
        claim:
          "The yellow Lakhori chilli of Uttarakhand is used by snack makers because its colour blends in, unlike red chillies (Chitra Balasubramaniam, Down To Earth, 2017).",
        url: "https://www.downtoearth.org.in/food/hot-stimulant-58658",
      },
      {
        claim:
          "Chillies were domesticated in Central and South America; Columbus thought they resembled black pepper; Portuguese ships introduced them to India around 1542 (Hallie Pugh-Sellers, JSTOR Daily).",
        url: "https://daily.jstor.org/plant-of-the-month-chili-pepper",
      },
      {
        claim: "Chillies from Goa were known as 'Pernambuco peppers', named after the area in Brazil (Nils-Bertil Wallin, YaleGlobal Online, 2004).",
        url: "https://archive-yaleglobal.yale.edu/chili-small-fruit-sets-global-palettes-fire",
      },
      {
        claim:
          "Achaya: chillies came with the Portuguese; before them pepper 'was the only way of spicing up food'; 'mirch' derives from Sanskrit marich, originally pepper (excerpts from K. T. Achaya, The Story of Our Food).",
        url: "https://cse.iitk.ac.in/users/amit/books/achaya-2000-story-of-our.html",
      },
      {
        claim:
          "Achaya on the Ain-i-Akbari (1590): the 50 dishes listed 'use only [black] pepper to impart spiciness'; chillies have not ended the use of peppercorns (Hari Balasubramanian, 3 Quarks Daily).",
        url: "https://3quarksdaily.com/?p=8827",
      },
      {
        claim: "After chillies spread, the popularity of long pepper faded; it is now a rarity in general commerce (Wikipedia).",
        url: "https://en.wikipedia.org/wiki/Long_pepper",
      },
    ],
  },
];
