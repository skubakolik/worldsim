// Game Configuration
const CONFIG = {
    asteroidIntervalMin: 60000, // 1 minute
    asteroidIntervalMax: 60000,
    asteroidChance: 0.1,        // 10% destruction chance
    baseIncome: 5,
    baseCost: 50,
    stockInterval: 90000,      // 1 minute 30 seconds
    stockAmount: 30
};

function getGlobalIncomeMultiplier() {
    let multiplier = 1;

    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'income') {
            multiplier += u.value;
        }
    });
    return multiplier;
}

function getEffectiveStockInterval() {
    let multiplier = 1.0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'stock') {
            multiplier *= u.value;
        }
    });
    return CONFIG.stockInterval * multiplier;
}

function getEffectiveAsteroidInterval() {
    if (state.ownedUpgrades.has('ASTEROID_RAIN')) return 600000; // Legacy support
    return CONFIG.asteroidIntervalMin;
}

function getEffectiveAsteroidChance() {
    let reduction = 0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'asteroid_chance') {
            reduction += u.value;
        }
    });
    // reduction here is percentage reduction from base (e.g. 0.005)
    return Math.max(0.001, CONFIG.asteroidChance - reduction);
}

function getEffectiveStockAmount() {
    let bonus = 0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'stock_size') {
            bonus += u.value;
        }
    });
    return CONFIG.stockAmount + bonus;
}

function getEffectiveRarityMultiplier() {
    let multiplier = 1.0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'stock_quality') {
            multiplier += u.value;
        }
    });
    return multiplier;
}

function getLevelsPerUpgrade() {
    let bonus = 0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'multi_level') {
            bonus += u.value;
        }
    });
    return 1 + bonus;
}

// Rarity Definitions
const RARITIES = {
    COMMON: { id: 'common', name: 'NAVADNA', multiplier: 1, color: '#22c55e', rank: 1, weight: 100 },
    RARE: { id: 'rare', name: 'REDKA', multiplier: 100, color: '#3b82f6', rank: 2, weight: 50 },
    EPIC: { id: 'epic', name: 'EPSKA', multiplier: 2000, color: '#a855f7', rank: 3, weight: 25 },
    LEGENDARY: { id: 'legendary', name: 'LEGENDARNA', multiplier: 50000, color: '#eab308', rank: 3.5, weight: 15 },
    MYTHIC: { id: 'mythic', name: 'MITIČNA', multiplier: 1000000, color: '#ef4444', rank: 4, weight: 5 },
    GODLY: { id: 'godly', name: 'BOŽANSKA', multiplier: 50000000, color: '#ff00ff', rank: 5, weight: 2 },
    SECRET: { id: 'secret', name: 'SKRIVNA', multiplier: 500000000, color: '#000', rank: 6, weight: 0.8 },
    OG: { id: 'og', name: 'OG', multiplier: 10000000000, color: '#b45309', rank: 7, weight: 0.3 }
};

const GLOBAL_UPGRADES = {
    // COMMON
    STOCK_C: { id: 'STOCK_C', rarity: 'common', name: 'Hitrejša Zaloga I', cost: 25000, type: 'stock', value: 0.95, desc: 'Zaloga prihaja 5% hitreje' },
    STOCK_C2: { id: 'STOCK_C2', rarity: 'common', name: 'Hitrejša Zaloga II', cost: 75000, type: 'stock', value: 0.95, desc: 'Zaloga prihaja 5% hitreje' },
    INCOME_C: { id: 'INCOME_C', rarity: 'common', name: 'Večji Zaslužek I', cost: 125000, type: 'income', value: 0.05, desc: 'Skupni zaslužek +5%' },
    INCOME_C2: { id: 'INCOME_C2', rarity: 'common', name: 'Večji Zaslužek II', cost: 250000, type: 'income', value: 0.05, desc: 'Skupni zaslužek +5%' },
    ASTEROID_C: { id: 'ASTEROID_C', rarity: 'common', name: 'Mini Ščit', cost: 450000, type: 'asteroid_chance', value: 0.002, desc: 'Možnost uničenja -0.2%' },

    // RARE
    STOCK_R: { id: 'STOCK_R', rarity: 'rare', name: 'Hitrejša Zaloga III', cost: 1500000, type: 'stock', value: 0.9, desc: 'Zaloga prihaja 10% hitreje' },
    STOCK_SIZE_R: { id: 'STOCK_SIZE_R', rarity: 'rare', name: 'Večja Zaloga I', cost: 2500000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav' },
    STOCK_R2: { id: 'STOCK_R2', rarity: 'rare', name: 'Hitrejša Zaloga IV', cost: 4500000, type: 'stock', value: 0.9, desc: 'Zaloga prihaja 10% hitreje' },
    STOCK_QUAL_R: { id: 'STOCK_QUAL_R', rarity: 'rare', name: 'Kvalitetna Zaloga I', cost: 5000000, type: 'stock_quality', value: 0.25, desc: 'Možnost za redke države +25%' },
    ASTEROID_R: { id: 'ASTEROID_R', rarity: 'rare', name: 'Asteroidna Zaščita I', cost: 7500000, type: 'asteroid_chance', value: 0.005, desc: 'Možnost uničenja -0.5%' },
    INCOME_R: { id: 'INCOME_R', rarity: 'rare', name: 'Redki Dobiček', cost: 15000000, type: 'income', value: 0.15, desc: 'Skupni zaslužek +15%' },
    MULTI_LEVEL_R: { id: 'MULTI_LEVEL_R', rarity: 'rare', name: 'Dvojna Moč I', cost: 50000000, type: 'multi_level', value: 1, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +1 NIVO VEČ' },

    // EPIC
    STOCK_E: { id: 'STOCK_E', rarity: 'epic', name: 'Hitrejša Zaloga V', cost: 100000000, type: 'stock', value: 0.85, desc: 'Zaloga prihaja 15% hitreje' },
    STOCK_SIZE_E: { id: 'STOCK_SIZE_E', rarity: 'epic', name: 'Večja Zaloga II', cost: 250000000, type: 'stock_size', value: 10, desc: 'Zaloga +10 držav' },
    STOCK_E2: { id: 'STOCK_E2', rarity: 'epic', name: 'Hitrejša Zaloga VI', cost: 500000000, type: 'stock', value: 0.85, desc: 'Zaloga prihaja 15% hitreje' },
    STOCK_QUAL_E: { id: 'STOCK_QUAL_E', rarity: 'epic', name: 'Kvalitetna Zaloga II', cost: 1000000000, type: 'stock_quality', value: 0.5, desc: 'Možnost za redke države +50%' },
    INCOME_E: { id: 'INCOME_E', rarity: 'epic', name: 'Mega Zaslužek II', cost: 1200000000, type: 'income', value: 0.3, desc: 'Skupni zaslužek +30%' },
    ASTEROID_E: { id: 'ASTEROID_E', rarity: 'epic', name: 'Epic Shielding', cost: 5000000000, type: 'asteroid_chance', value: 0.008, desc: 'Možnost uničenja -0.8%' },
    MULTI_LEVEL_E: { id: 'MULTI_LEVEL_E', rarity: 'epic', name: 'Trojna Moč II', cost: 50000000000, type: 'multi_level', value: 2, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +2 NIVOJA VEČ' },

    // LEGENDARY
    ASTEROID_L: { id: 'ASTEROID_L', rarity: 'legendary', name: 'Asteroidna Zaščita II', cost: 75000000000, type: 'asteroid_chance', value: 0.01, desc: 'Možnost uničenja -1%' },
    STOCK_SIZE_L: { id: 'STOCK_SIZE_L', rarity: 'legendary', name: 'Mega Skladišče', cost: 750000000000, type: 'stock_size', value: 15, desc: 'Zaloga +15 držav' },
    ASTEROID_L2: { id: 'ASTEROID_L2', rarity: 'legendary', name: 'Legendary Wall', cost: 150000000000, type: 'asteroid_chance', value: 0.005, desc: 'Možnost uničenja -0.5%' },
    STOCK_QUAL_L: { id: 'STOCK_QUAL_L', rarity: 'legendary', name: 'Elitni Izbor', cost: 2500000000000, type: 'stock_quality', value: 1.0, desc: 'Možnost za redke države +100%' },
    INCOME_L: { id: 'INCOME_L', rarity: 'legendary', name: 'Legendarni Zaslužek III', cost: 500000000000, type: 'income', value: 0.6, desc: 'Skupni zaslužek +60%' },
    STOCK_L: { id: 'STOCK_L', rarity: 'legendary', name: 'Legend Speed VII', cost: 1000000000000, type: 'stock', value: 0.8, desc: 'Zaloga prihaja 20% hitreje' },
    MULTI_LEVEL_L: { id: 'MULTI_LEVEL_L', rarity: 'legendary', name: 'Kraljevska Moč III', cost: 7500000000000, type: 'multi_level', value: 4, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +4 NIVOJE VEČ' },

    // MYTHIC
    STOCK_M: { id: 'STOCK_M', rarity: 'mythic', name: 'Ultra Zaloga VIII', cost: 10000000000000, type: 'stock', value: 0.75, desc: 'Zaloga prihaja 25% hitreje' },
    ASTEROID_M: { id: 'ASTEROID_M', rarity: 'mythic', name: 'Mythic Barrier', cost: 25000000000000, type: 'asteroid_chance', value: 0.005, desc: 'Možnost uničenja -0.5%' },
    STOCK_SIZE_M: { id: 'STOCK_SIZE_M', rarity: 'mythic', name: 'Galaktični Center', cost: 50000000000000, type: 'stock_size', value: 25, desc: 'Zaloga +25 držav' },
    INCOME_M: { id: 'INCOME_M', rarity: 'mythic', name: 'Mitični Zaslužek IV', cost: 100000000000000, type: 'income', value: 1.25, desc: 'Skupni zaslužek +125%' },
    STOCK_QUAL_M: { id: 'STOCK_QUAL_M', rarity: 'mythic', name: 'Mitična Selekcija', cost: 250000000000000, type: 'stock_quality', value: 2.0, desc: 'Možnost za redke države +200%' },
    MULTI_LEVEL_M: { id: 'MULTI_LEVEL_M', rarity: 'mythic', name: 'Mitična Moč IV', cost: 500000000000000, type: 'multi_level', value: 6, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +6 NIVOJEV VEČ' },

    // GODLY
    RAINBOW_M: { id: 'RAINBOW_M', rarity: 'godly', name: 'Mavrični Multiplikator', cost: 500000000000000, type: 'income', value: 2.5, desc: 'Dobiček se utripičuje (+250%)' },
    ASTEROID_G: { id: 'ASTEROID_G', rarity: 'godly', name: 'Godly Zaščita', cost: 750000000000000, type: 'asteroid_chance', value: 0.012, desc: 'Možnost uničenja -1.2%' },
    STOCK_QUAL_G: { id: 'STOCK_QUAL_G', rarity: 'godly', name: 'Božanska Izbira', cost: 1000000000000000, type: 'stock_quality', value: 4.0, desc: 'Možnost za redke države +400%' },
    RAINBOW_M2: { id: 'RAINBOW_M2', rarity: 'godly', name: 'Divine Multiplier', cost: 1500000000000000, type: 'income', value: 1.5, desc: 'Dobiček +150%' },
    MULTI_LEVEL_G: { id: 'MULTI_LEVEL_G', rarity: 'godly', name: 'Božanska Moč IV', cost: 2500000000000000, type: 'multi_level', value: 8, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +8 NIVOJEV VEČ' },

    // SECRET
    STOCK_S: { id: 'STOCK_S', rarity: 'secret', name: 'Nadzvočna Zaloga IX', cost: 10000000000000000, type: 'stock', value: 0.5, desc: 'Zaloga se razpolovi' },
    STOCK_SIZE_S: { id: 'STOCK_SIZE_S', rarity: 'secret', name: 'Neskončna Zaloga', cost: 25000000000000000, type: 'stock_size', value: 50, desc: 'Zaloga +50 držav' },
    STOCK_S2: { id: 'STOCK_S2', rarity: 'secret', name: 'Črna Luknja (Zaloga)', cost: 50000000000000000, type: 'stock', value: 0.5, desc: 'Hitrost zaloge se podvoji' },
    INCOME_S: { id: 'INCOME_S', rarity: 'secret', name: 'Skrivni Zaklad', cost: 150000000000000000, type: 'income', value: 5.0, desc: 'Zaslužek +500%' },

    // OG
    WORLD_MASTER: { id: 'WORLD_MASTER', rarity: 'og', name: 'Svetovni Mojster', cost: 500000000000000000, type: 'income', value: 9.0, desc: 'Celoten zaslužek se poveča za 10x' },
    STOCK_QUAL_OG: { id: 'STOCK_QUAL_OG', rarity: 'og', name: 'Božanski Dar', cost: 1000000000000000000, type: 'stock_quality', value: 9.0, desc: 'Možnost za redke države +900%' }
};

// Fixed assignments by Name
// User requested "Bigger = Better Rarity".
// We remove most hardcoded overrides to let Size determine Rarity.
// Keeping specific requests or corrections.
const FIXED_RARITIES = {
    // Specific user override example:
    'United Kingdom': 'LEGENDARY',
    'Vatican': 'COMMON', // Fits size anyway
    'Greenland': 'GODLY',
};

// Satellite-style colors (Google Earth Vibe)
const REAL_COLORS = {
    // Polar / Ice
    'Antarctica': '#f1f5f9', 'Greenland': '#f1f5f9', 'Iceland': '#cbd5e1',
    // Boreal / Tundra
    'Russia': '#5c7c55', 'Canada': '#5c7c55', 'Norway': '#4d6a49', 'Sweden': '#567d46', 'Finland': '#567d46',
    // Temperate / Green
    'United States': '#658d53', 'China': '#8ba870', 'Japan': '#386641',
    'United Kingdom': '#4d7c38', 'France': '#5d8c47', 'Germany': '#507a3f', 'Poland': '#558242',
    'Ukraine': '#7a9e5e',
    // Desert / Arid
    'Egypt': '#dcb382', 'Saudi Arabia': '#d4a373', 'United Arab Emirates': '#d4a373', 'Iraq': '#d4a373', 'Iran': '#c29d6f',
    'Algeria': '#e0c092', 'Libya': '#e0c092', 'Australia': '#cca572',
    'Mexico': '#8a7d56',
    // Tropical / Rainforest
    'Brazil': '#1fa233', 'Indonesia': '#2f7532', 'India': '#7da061',
    'Congo': '#1e6b26', 'Dem. Rep. Congo': '#1e6b26', 'Peru': '#3e6b36',
    'Colombia': '#2d6a36',
    // Default fallback tones
    'Argentina': '#759458', 'South Africa': '#8ba665'
};

// Slovenian Country Name Translations
const SLOVENIAN_NAMES = {
    'Afghanistan': 'Afganistan',
    'Albania': 'Albanija',
    'Algeria': 'Alžirija',
    'Andorra': 'Andora',
    'Angola': 'Angola',
    'Antarctica': 'Antarktika',
    'Antigua and Barbuda': 'Antigva in Barbuda',
    'Argentina': 'Argentina',
    'Armenia': 'Armenija',
    'Australia': 'Avstralija',
    'Austria': 'Avstrija',
    'Azerbaijan': 'Azerbajdžan',
    'Bahamas': 'Bahami',
    'Bahrain': 'Bahrajn',
    'Bangladesh': 'Bangladeš',
    'Barbados': 'Barbados',
    'Belarus': 'Belorusija',
    'Belgium': 'Belgija',
    'Belize': 'Belize',
    'Benin': 'Benin',
    'Bhutan': 'Butan',
    'Bolivia': 'Bolivija',
    'Bosnia and Herzegovina': 'Bosna in Hercegovina',
    'Botswana': 'Bocvana',
    'Brazil': 'Brazilija',
    'Brunei': 'Brunej',
    'Bulgaria': 'Bolgarija',
    'Burkina Faso': 'Burkina Faso',
    'Burundi': 'Burundi',
    'Cambodia': 'Kambodža',
    'Cameroon': 'Kamerun',
    'Canada': 'Kanada',
    'Cape Verde': 'Zelenortski otoki',
    'Central African Republic': 'Srednjeafriška republika',
    'Chad': 'Čad',
    'Chile': 'Čile',
    'China': 'Kitajska',
    'Colombia': 'Kolumbija',
    'Comoros': 'Komori',
    'Congo': 'Kongo',
    'Dem. Rep. Congo': 'Demokratična republika Kongo',
    'Democratic Republic of the Congo': 'Demokratična republika Kongo',
    'Costa Rica': 'Kostarika',
    'Croatia': 'Hrvaška',
    'Cuba': 'Kuba',
    'Cyprus': 'Ciper',
    'Czech Republic': 'Češka',
    'Czechia': 'Češka',
    'Denmark': 'Danska',
    'Djibouti': 'Džibuti',
    'Dominica': 'Dominika',
    'Dominican Republic': 'Dominikanska republika',
    'East Timor': 'Vzhodni Timor',
    'Ecuador': 'Ekvador',
    'Egypt': 'Egipt',
    'El Salvador': 'Salvador',
    'Equatorial Guinea': 'Ekvatorialna Gvineja',
    'Eritrea': 'Eritreja',
    'Estonia': 'Estonija',
    'Ethiopia': 'Etiopija',
    'Fiji': 'Fidži',
    'Finland': 'Finska',
    'France': 'Francija',
    'Gabon': 'Gabon',
    'Gambia': 'Gambija',
    'Georgia': 'Gruzija',
    'Germany': 'Nemčija',
    'Ghana': 'Gana',
    'Greece': 'Grčija',
    'Greenland': 'Grenlandija',
    'Grenada': 'Grenada',
    'Guatemala': 'Gvatemala',
    'Guinea': 'Gvineja',
    'Guinea-Bissau': 'Gvineja Bissau',
    'Guyana': 'Gvajana',
    'Haiti': 'Haiti',
    'Honduras': 'Honduras',
    'Hungary': 'Madžarska',
    'Iceland': 'Islandija',
    'India': 'Indija',
    'Indonesia': 'Indonezija',
    'Iran': 'Iran',
    'Iraq': 'Irak',
    'Ireland': 'Irska',
    'Israel': 'Izrael',
    'Italy': 'Italija',
    'Ivory Coast': 'Slonokoščena obala',
    "Côte d'Ivoire": 'Slonokoščena obala',
    'Jamaica': 'Jamajka',
    'Japan': 'Japonska',
    'Jordan': 'Jordanija',
    'Kazakhstan': 'Kazahstan',
    'Kenya': 'Kenija',
    'Kiribati': 'Kiribati',
    'North Korea': 'Severna Koreja',
    'South Korea': 'Južna Koreja',
    'Kosovo': 'Kosovo',
    'Kuwait': 'Kuvajt',
    'Kyrgyzstan': 'Kirgizistan',
    'Laos': 'Laos',
    'Latvia': 'Latvija',
    'Lebanon': 'Libanon',
    'Lesotho': 'Lesoto',
    'Liberia': 'Liberija',
    'Libya': 'Libija',
    'Liechtenstein': 'Lihtenštajn',
    'Lithuania': 'Litva',
    'Luxembourg': 'Luksemburg',
    'Macedonia': 'Severna Makedonija',
    'North Macedonia': 'Severna Makedonija',
    'Madagascar': 'Madagaskar',
    'Malawi': 'Malavi',
    'Malaysia': 'Malezija',
    'Maldives': 'Maldivi',
    'Mali': 'Mali',
    'Malta': 'Malta',
    'Marshall Islands': 'Marshallovi otoki',
    'Mauritania': 'Mavretanija',
    'Mauritius': 'Mauritius',
    'Mexico': 'Mehika',
    'Micronesia': 'Mikronezija',
    'Moldova': 'Moldavija',
    'Monaco': 'Monako',
    'Mongolia': 'Mongolija',
    'Montenegro': 'Črna gora',
    'Morocco': 'Maroko',
    'Mozambique': 'Mozambik',
    'Myanmar': 'Mjanmar',
    'Burma': 'Mjanmar',
    'Namibia': 'Namibija',
    'Nauru': 'Nauru',
    'Nepal': 'Nepal',
    'Netherlands': 'Nizozemska',
    'New Zealand': 'Nova Zelandija',
    'Nicaragua': 'Nikaragva',
    'Niger': 'Niger',
    'Nigeria': 'Nigerija',
    'Norway': 'Norveška',
    'Oman': 'Oman',
    'Pakistan': 'Pakistan',
    'Palau': 'Palau',
    'Palestine': 'Palestina',
    'Panama': 'Panama',
    'Papua New Guinea': 'Papua Nova Gvineja',
    'Paraguay': 'Paragvaj',
    'Peru': 'Peru',
    'Philippines': 'Filipini',
    'Poland': 'Poljska',
    'Portugal': 'Portugalska',
    'Qatar': 'Katar',
    'Romania': 'Romunija',
    'Russia': 'Rusija',
    'Russian Federation': 'Rusija',
    'Rwanda': 'Ruanda',
    'Saint Kitts and Nevis': 'Sveti Krištof in Nevis',
    'Saint Lucia': 'Sveta Lucija',
    'Saint Vincent and the Grenadines': 'Sveti Vincencij in Grenadine',
    'Samoa': 'Samoa',
    'San Marino': 'San Marino',
    'Sao Tome and Principe': 'Sao Tome in Principe',
    'Saudi Arabia': 'Savdska Arabija',
    'Senegal': 'Senegal',
    'Serbia': 'Srbija',
    'Seychelles': 'Sejšeli',
    'Sierra Leone': 'Sierra Leone',
    'Singapore': 'Singapur',
    'Slovakia': 'Slovaška',
    'Slovenia': 'Slovenija',
    'Solomon Islands': 'Salomonovi otoki',
    'Somalia': 'Somalija',
    'South Africa': 'Južna Afrika',
    'South Sudan': 'Južni Sudan',
    'Spain': 'Španija',
    'Sri Lanka': 'Šrilanka',
    'Sudan': 'Sudan',
    'Suriname': 'Surinam',
    'Swaziland': 'Esvatini',
    'Eswatini': 'Esvatini',
    'Sweden': 'Švedska',
    'Switzerland': 'Švica',
    'Syria': 'Sirija',
    'Taiwan': 'Tajvan',
    'Tajikistan': 'Tadžikistan',
    'Tanzania': 'Tanzanija',
    'Thailand': 'Tajska',
    'Timor-Leste': 'Vzhodni Timor',
    'Togo': 'Togo',
    'Tonga': 'Tonga',
    'Trinidad and Tobago': 'Trinidad in Tobago',
    'Tunisia': 'Tunizija',
    'Turkey': 'Turčija',
    'Turkmenistan': 'Turkmenistan',
    'Tuvalu': 'Tuvalu',
    'Uganda': 'Uganda',
    'Ukraine': 'Ukrajina',
    'United Arab Emirates': 'Združeni arabski emirati',
    'United Kingdom': 'Združeno kraljestvo',
    'United States': 'Združene države Amerike',
    'United States of America': 'Združene države Amerike',
    'Uruguay': 'Urugvaj',
    'Uzbekistan': 'Uzbekistan',
    'Vanuatu': 'Vanuatu',
    'Vatican': 'Vatikan',
    'Vatican City': 'Vatikan',
    'Venezuela': 'Venezuela',
    'Vietnam': 'Vietnam',
    'Viet Nam': 'Vietnam',
    'Yemen': 'Jemen',
    'Zambia': 'Zambija',
    'Zimbabwe': 'Zimbabve',

    // Additional variations and "Republic of..." forms
    'Republic of Serbia': 'Srbija',
    'Republic of Croatia': 'Hrvaška',
    'Republic of Slovenia': 'Slovenija',
    'Republic of Poland': 'Poljska',
    'Republic of Austria': 'Avstrija',
    'Republic of Lithuania': 'Litva',
    'Republic of Latvia': 'Latvija',
    'Republic of Estonia': 'Estonija',
    'Republic of Belarus': 'Belorusija',
    'Republic of Moldova': 'Moldavija',
    'Republic of Bulgaria': 'Bolgarija',
    'Republic of Albania': 'Albanija',
    'Republic of Macedonia': 'Severna Makedonija',
    'Republic of Kosovo': 'Kosovo',
    'Republic of Cyprus': 'Ciper',
    'Republic of Turkey': 'Turčija',
    'Republic of Armenia': 'Armenija',
    'Republic of Georgia': 'Gruzija',
    'Republic of Azerbaijan': 'Azerbajdžan',
    'Republic of Kazakhstan': 'Kazahstan',
    'Republic of Uzbekistan': 'Uzbekistan',
    'Republic of Turkmenistan': 'Turkmenistan',
    'Republic of Tajikistan': 'Tadžikistan',
    'Republic of Kyrgyzstan': 'Kirgizistan',
    'Republic of Afghanistan': 'Afganistan',
    'Republic of Iraq': 'Irak',
    'Republic of Yemen': 'Jemen',
    'Republic of India': 'Indija',
    'Republic of Indonesia': 'Indonezija',
    'Republic of the Philippines': 'Filipini',
    'Republic of Singapore': 'Singapur',
    'Republic of Korea': 'Južna Koreja',
    'Republic of China': 'Kitajska',
    'People\'s Republic of China': 'Kitajska',
    'Republic of South Africa': 'Južna Afrika',
    'Republic of Kenya': 'Kenija',
    'Republic of Uganda': 'Uganda',
    'Republic of Tanzania': 'Tanzanija',
    'Republic of Zambia': 'Zambija',
    'Republic of Zimbabwe': 'Zimbabve',
    'Republic of Botswana': 'Bocvana',
    'Republic of Namibia': 'Namibija',
    'Republic of Angola': 'Angola',
    'Republic of Mozambique': 'Mozambik',
    'Republic of Madagascar': 'Madagaskar',
    'Republic of Cameroon': 'Kamerun',
    'Republic of Ghana': 'Gana',
    'Republic of Senegal': 'Senegal',
    'Republic of Mali': 'Mali',
    'Republic of Niger': 'Niger',
    'Republic of Chad': 'Čad',
    'Republic of Sudan': 'Sudan',
    'Republic of Tunisia': 'Tunizija',
    'Republic of Algeria': 'Alžirija',
    'Republic of Peru': 'Peru',
    'Republic of Chile': 'Čile',
    'Republic of Argentina': 'Argentina',
    'Republic of Paraguay': 'Paragvaj',
    'Republic of Uruguay': 'Urugvaj',
    'Republic of Ecuador': 'Ekvador',
    'Republic of Colombia': 'Kolumbija',
    'Republic of Venezuela': 'Venezuela',
    'Republic of Panama': 'Panama',
    'Republic of Costa Rica': 'Kostarika',
    'Republic of Nicaragua': 'Nikaragva',
    'Republic of Honduras': 'Honduras',
    'Republic of El Salvador': 'Salvador',
    'Republic of Guatemala': 'Gvatemala',
    'Federative Republic of Brazil': 'Brazilija',
    'French Republic': 'Francija',
    'Federal Republic of Germany': 'Nemčija',
    'Italian Republic': 'Italija',
    'Hellenic Republic': 'Grčija',
    'Portuguese Republic': 'Portugalska',
    'Kingdom of Spain': 'Španija',
    'Kingdom of Norway': 'Norveška',
    'Kingdom of Sweden': 'Švedska',
    'Kingdom of Denmark': 'Danska',
    'Kingdom of Belgium': 'Belgija',
    'Kingdom of the Netherlands': 'Nizozemska',
    'Kingdom of Thailand': 'Tajska',
    'Kingdom of Saudi Arabia': 'Savdska Arabija',
    'Kingdom of Morocco': 'Maroko',
    'Hashemite Kingdom of Jordan': 'Jordanija',
    'Swiss Confederation': 'Švica',
    'Republic of Finland': 'Finska',
    'Republic of Iceland': 'Islandija',
    'Islamic Republic of Iran': 'Iran',
    'Islamic Republic of Pakistan': 'Pakistan',
    'Islamic Republic of Afghanistan': 'Afganistan',
    'State of Libya': 'Libija',
    'State of Palestine': 'Palestina',
    'State of Israel': 'Izrael',
    'State of Kuwait': 'Kuvajt',
    'State of Qatar': 'Katar',
    'Lao People\'s Democratic Republic': 'Laos',
    'Socialist Republic of Vietnam': 'Vietnam',
    'Democratic People\'s Republic of Korea': 'Severna Koreja',
    'Democratic Socialist Republic of Sri Lanka': 'Šrilanka',
    'Union of Myanmar': 'Mjanmar',
    'Republic of the Union of Myanmar': 'Mjanmar',
    'Oriental Republic of Uruguay': 'Urugvaj',
    'Plurinational State of Bolivia': 'Bolivija',
    'Bolivarian Republic of Venezuela': 'Venezuela',
    'Co-operative Republic of Guyana': 'Gvajana',
    'Republic of Suriname': 'Surinam',
    'Gabonese Republic': 'Gabon',
    'Togolese Republic': 'Togo',
    'Republic of Benin': 'Benin',
    'Republic of Guinea': 'Gvineja',
    'Republic of Sierra Leone': 'Sierra Leone',
    'Republic of Liberia': 'Liberija',
    'Republic of Malawi': 'Malavi',
    'Republic of Rwanda': 'Ruanda',
    'Republic of Burundi': 'Burundi',
    'Somali Republic': 'Somalija',
    'Federal Democratic Republic of Ethiopia': 'Etiopija',
    'State of Eritrea': 'Eritreja',
    'Republic of Djibouti': 'Džibuti',
    'Sultanate of Oman': 'Oman',
    'Republic of Seychelles': 'Sejšeli',
    'Republic of Mauritius': 'Mauritius',
    'Islamic Republic of Mauritania': 'Mavretanija',
    'Republic of Cabo Verde': 'Zelenortski otoki',
    'Democratic Republic of Sao Tome and Principe': 'Sao Tome in Principe',
    'Republic of Equatorial Guinea': 'Ekvatorialna Gvineja',
    'Gabonese Republic': 'Gabon',
    'Republic of the Gambia': 'Gambija',
    'Republic of Guinea-Bissau': 'Gvineja Bissau',
    'Republic of Haiti': 'Haiti',
    'Dominican Republic': 'Dominikanska republika',
    'Commonwealth of Dominica': 'Dominika',
    'Republic of Cuba': 'Kuba',
    'Republic of Trinidad and Tobago': 'Trinidad in Tobago',
    'Barbados': 'Barbados',
    'Saint Lucia': 'Sveta Lucija',
    'Saint Vincent and the Grenadines': 'Sveti Vincencij in Grenadine',
    'Federation of Saint Kitts and Nevis': 'Sveti Krištof in Nevis',
    'Antigua and Barbuda': 'Antigva in Barbuda',
    'Commonwealth of the Bahamas': 'Bahami',
    'Jamaica': 'Jamajka',
    'Belize': 'Belize',
    'Republic of Fiji': 'Fidži',
    'Independent State of Papua New Guinea': 'Papua Nova Gvineja',
    'Solomon Islands': 'Salomonovi otoki',
    'Republic of Vanuatu': 'Vanuatu',
    'Independent State of Samoa': 'Samoa',
    'Kingdom of Tonga': 'Tonga',
    'Tuvalu': 'Tuvalu',
    'Republic of Kiribati': 'Kiribati',
    'Federated States of Micronesia': 'Mikronezija',
    'Republic of the Marshall Islands': 'Marshallovi otoki',
    'Republic of Palau': 'Palau',
    'Republic of Nauru': 'Nauru',
    'New Zealand': 'Nova Zelandija',
    'Commonwealth of Australia': 'Avstralija',
    'Republic of Maldives': 'Maldivi',
    'Democratic Socialist Republic of Sri Lanka': 'Šrilanka',
    'Federal Democratic Republic of Nepal': 'Nepal',
    'Kingdom of Bhutan': 'Butan',
    'People\'s Republic of Bangladesh': 'Bangladeš',
    'Republic of Malta': 'Malta',
    'Republic of San Marino': 'San Marino',
    'Principality of Andorra': 'Andora',
    'Principality of Monaco': 'Monako',
    'Principality of Liechtenstein': 'Lihtenštajn',
    'Grand Duchy of Luxembourg': 'Luksemburg',
    'Vatican City State': 'Vatikan',
    'Holy See': 'Vatikan',
    'Republic of Ireland': 'Irska',
    'United Kingdom of Great Britain and Northern Ireland': 'Združeno kraljestvo',
    'Great Britain': 'Združeno kraljestvo',
    'England': 'Anglija',
    'Scotland': 'Škotska',
    'Wales': 'Wales',
    'Northern Ireland': 'Severna Irska',
    'Kingdom of Lesotho': 'Lesoto',
    'Kingdom of Eswatini': 'Esvatini',
    'Republic of South Sudan': 'Južni Sudan',
    'Comoros': 'Komori',
    'Union of the Comoros': 'Komori',
    'Republic of the Congo': 'Kongo',
    'Congo-Brazzaville': 'Kongo',
    'Congo-Kinshasa': 'Demokratična republika Kongo',
    'DR Congo': 'Demokratična republika Kongo',
    'DRC': 'Demokratična republika Kongo',
    'Brunei Darussalam': 'Brunej',
    'Nation of Brunei': 'Brunej',
    'Malaysia': 'Malezija',
    'Timor-Leste': 'Vzhodni Timor',
    'Democratic Republic of Timor-Leste': 'Vzhodni Timor',
    'Republic of Cabo Verde': 'Zelenortski otoki',
    'Cabo Verde': 'Zelenortski otoki',

    // Territories and Dependencies
    'Northern Mariana Islands': 'Severni Marijanski otoki',
    'Commonwealth of the Northern Mariana Islands': 'Severni Marijanski otoki',
    'Guam': 'Guam',
    'American Samoa': 'Ameriška Samoa',
    'United States Virgin Islands': 'Ameriški Deviški otoki',
    'U.S. Virgin Islands': 'Ameriški Deviški otoki',
    'Puerto Rico': 'Portoriko',
    'Commonwealth of Puerto Rico': 'Portoriko',
    'Bermuda': 'Bermudi',
    'Cayman Islands': 'Kajmanski otoki',
    'British Virgin Islands': 'Britanski Deviški otoki',
    'Turks and Caicos Islands': 'Otoki Turks in Caicos',
    'Anguilla': 'Angvila',
    'Montserrat': 'Montserrat',
    'Falkland Islands': 'Falklandski otoki',
    'Islas Malvinas': 'Falklandski otoki',
    'Gibraltar': 'Gibraltar',
    'Saint Helena': 'Sveta Helena',
    'Ascension Island': 'Otok Ascension',
    'Tristan da Cunha': 'Tristan da Cunha',
    'French Guiana': 'Francoska Gvajana',
    'Guadeloupe': 'Guadeloupe',
    'Martinique': 'Martinik',
    'Réunion': 'Réunion',
    'Mayotte': 'Mayotte',
    'French Polynesia': 'Francoska Polinezija',
    'New Caledonia': 'Nova Kaledonija',
    'Wallis and Futuna': 'Wallis in Futuna',
    'Saint Pierre and Miquelon': 'Sveti Peter in Miquelon',
    'Saint Barthélemy': 'Sveti Bartolomej',
    'Saint Martin': 'Sveti Martin',
    'Aruba': 'Aruba',
    'Curaçao': 'Curaçao',
    'Sint Maarten': 'Sint Maarten',
    'Caribbean Netherlands': 'Karibska Nizozemska',
    'Bonaire': 'Bonaire',
    'Saba': 'Saba',
    'Sint Eustatius': 'Sint Eustatius',
    'Cook Islands': 'Cookovi otoki',
    'Niue': 'Niue',
    'Tokelau': 'Tokelau',
    'Pitcairn Islands': 'Pitcairnski otoki',
    'Norfolk Island': 'Otok Norfolk',
    'Christmas Island': 'Božični otok',
    'Cocos Islands': 'Kokosovi otoki',
    'Cocos (Keeling) Islands': 'Kokosovi otoki',
    'Heard Island and McDonald Islands': 'Heardov otok in McDonaldovi otoki',
    'Macau': 'Macao',
    'Macao': 'Macao',
    'Hong Kong': 'Hongkong',
    'Faroe Islands': 'Ferski otoki',
    'Svalbard and Jan Mayen': 'Svalbard in Jan Mayen',
    'Bouvet Island': 'Bouvetov otok',
    'South Georgia and the South Sandwich Islands': 'Južna Georgia in Južni Sandwichevi otoki',
    'French Southern and Antarctic Lands': 'Francoska južna in antarktična ozemlja',
    'British Indian Ocean Territory': 'Britansko ozemlje v Indijskem oceanu',
    'Åland Islands': 'Ålandski otoki',
    'Jersey': 'Jersey',
    'Guernsey': 'Guernsey',
    'Isle of Man': 'Otok Man',
    'Western Sahara': 'Zahodna Sahara',
    'Sahrawi Arab Democratic Republic': 'Zahodna Sahara',
    'Kosovo': 'Kosovo',
    'Republic of Kosovo': 'Kosovo',
    'Somaliland': 'Somaliland',
    'Abkhazia': 'Abhazija',
    'South Ossetia': 'Južna Osetija',
    'Transnistria': 'Pridnjestrovje',
    'Northern Cyprus': 'Severni Ciper',
    'Turkish Republic of Northern Cyprus': 'Severni Ciper',
    'Nagorno-Karabakh': 'Gorski Karabah',
    'Artsakh': 'Arcah'
};

function getSlovenianName(englishName) {
    return SLOVENIAN_NAMES[englishName] || englishName;
}

function getRealColor(name, lat) {
    if (REAL_COLORS[name]) return REAL_COLORS[name];

    // Satellite-like Heuristic based on Latitude
    if (lat !== undefined) {
        const absLat = Math.abs(lat);
        if (absLat > 60) return '#f1f5f9'; // Snow/Ice White
        if (absLat > 50) return '#5c7c55'; // Boreal Dark Green
        if (absLat > 35) return '#658d53'; // Temperate Green
        if (absLat > 23) return '#d4a373'; // Subtropical Desert (Beige)
        if (absLat >= 0) return '#2f7532'; // Tropical Deep Green
    }

    return '#658d53'; // Default Earth Green
}

let state = {
    money: 0,
    ownedCountries: new Set(),
    everOwned: new Set(), // Countries ever owned (for collection)
    ownedUpgrades: new Set(), // Global upgrades
    countries: {},
    stockProgress: 0, // ms progress towards next replenishment
    username: '',
    friends: [],
    pendingRequests: [],
    chats: {}, // friendName: [messages]
    lastRead: {}, // friendName: timestamp
    lastTick: Date.now(),
    challengeTimer: 600
};

let map;
let geoJsonLayer;

const moneyDisplay = document.getElementById('money-display');
const cpsDisplay = document.getElementById('cps-display');
const countryList = document.getElementById('country-list');
const logList = document.getElementById('log-list');
const asteroidOverlay = document.getElementById('asteroid-overlay');

async function initGame() {
    initMap();
    setupZoomControls();
    setupEventListeners();
    await loadCountryData();
    replenishStock();
    startGameLoop();
    scheduleAsteroidShower();
    updateUI();
}

function initMap() {
    map = L.map('map', {
        center: [30, 30], // Centered on Eurasia/Africa for desired framing
        zoom: 2.2,       // Fit world height better in the panel
        zoomControl: false,
        minZoom: 2.1,
        maxZoom: 6,
        attributionControl: false,
        maxBounds: [[-86, -180], [86, 180]],
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
        zoomSnap: 0.1,
        zoomDelta: 0.5
    });
}

function setupZoomControls() {
    const btnIn = document.getElementById('btn-zoom-in');
    const btnOut = document.getElementById('btn-zoom-out');

    // Add checks just in case elements are missing
    if (btnIn && btnOut) {
        btnIn.addEventListener('click', () => {
            if (map) map.zoomIn();
        });
        btnOut.addEventListener('click', () => {
            if (map) map.zoomOut();
        });
        // Stop propagation to prevent map clicks underneath (essential for mobile)
        L.DomEvent.disableClickPropagation(document.getElementById('zoom-controls'));
    }
}

async function loadCountryData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const data = await response.json();
        const allCountries = [];
        data.features.forEach(feature => {
            const area = getPolygonArea(feature.geometry);
            let lat = 0;
            try {
                if (feature.geometry.type === 'Polygon') lat = feature.geometry.coordinates[0][0][1];
                else if (feature.geometry.type === 'MultiPolygon') lat = feature.geometry.coordinates[0][0][0][1];
            } catch (e) { lat = 0; }

            const englishName = feature.properties.name || feature.properties.ADMIN || "Unknown";
            const name = getSlovenianName(englishName);
            const id = feature.id || englishName;

            allCountries.push({ feature: feature, area: area, name: name, id: id, lat: lat });
        });

        // Two-pass ranking: Find top naturally large countries
        const naturalSort = [...allCountries].sort((a, b) => b.area - a.area);
        const russia = naturalSort.find(c => c.name === 'Rusija');
        const canada = naturalSort.find(c => c.name === 'Kanada');

        // Russia is index 197 (OG), Antarctica is index 196 (1st Secret)
        // Canada is index 195 (2nd Secret)
        // We want Greenland to be in the Godly range (index ~185)

        allCountries.forEach(c => {
            if (c.name === 'Antarktika') {
                c.area = canada.area * 1.01; // Slightly larger than Canada
            } else if (c.name === 'Grenlandija') {
                // Godly range is roughly index 175 to 189. 
                // Let's place it around index 185.
                const godlyReference = naturalSort[12]; // Pick a mid-high country
                c.area = godlyReference.area;
            }
        });

        // Final sort of filtered set (198 countries)
        allCountries.sort((a, b) => a.area - b.area);
        const finalCountries = allCountries.slice(-198);
        const count = finalCountries.length;

        finalCountries.forEach((c, index) => {
            let rarityMode = 'COMMON';
            // Area-based rarity tiers
            if (index >= 197) rarityMode = 'OG';
            else if (index >= 190) rarityMode = 'SECRET';
            else if (index >= 175) rarityMode = 'GODLY';
            else if (index >= 152) rarityMode = 'MYTHIC';
            else if (index >= 122) rarityMode = 'LEGENDARY';
            else if (index >= 87) rarityMode = 'EPIC';
            else if (index >= 47) rarityMode = 'RARE';
            else rarityMode = 'COMMON';

            // Manual Overrides
            if (FIXED_RARITIES[c.name]) {
                rarityMode = FIXED_RARITIES[c.name];
            }

            const rarity = RARITIES[rarityMode];

            // Continuous scale: Every country has a unique price starting from 10€
            // Factor ~1.165 scales 10€ -> ~100T over 198 countries
            const baseCost = 10 * Math.pow(1.1655, index);

            // Check if we already have progress for this country (from loadGame)
            const existing = state.countries[c.id];

            state.countries[c.id] = {
                id: c.id,
                name: c.name,
                feature: c.feature,
                area: c.area,
                rarity: rarity,
                level: existing ? existing.level : 0,
                owned: existing ? existing.owned : false,
                destroyed: existing ? existing.destroyed : false,
                inStock: false,
                baseCost: baseCost,
                baseIncome: baseCost / 10,
                realColor: getRealColor(c.name, c.lat)
            };
        });
        // Create a set of IDs for the final 198 countries for efficient lookup
        const finalIds = new Set(finalCountries.map(c => c.id));

        // Filter the original GeoJSON features to only include those in finalIds
        const filteredFeatures = data.features.filter(f => finalIds.has(f.id || f.properties.name || f.properties.ADMIN));
        const filteredData = { ...data, features: filteredFeatures };

        geoJsonLayer = L.geoJSON(filteredData, { style: styleFeature, onEachFeature: onEachFeature }).addTo(map);
        renderShop();
    } catch (e) { console.error(e); }
}

// --- Stock Logic ---

function replenishStock() {
    // 1. Reset current stock
    Object.values(state.countries).forEach(c => c.inStock = false);
    // 2. Filter valid candidates (all countries can appear, even owned ones for upgrades)
    const candidates = Object.values(state.countries);
    if (candidates.length === 0) return;
    // 3. Shuffle
    candidates.sort(() => Math.random() - 0.5);
    // 4. Select
    let addedCount = 0;
    const maxStock = getEffectiveStockAmount();
    const rarityMultiplier = getEffectiveRarityMultiplier();

    for (const c of candidates) {
        if (addedCount >= maxStock) break;
        if (Math.random() * 100 < (c.rarity.weight * rarityMultiplier)) {
            c.inStock = true;
            addedCount++;
        }
    }
    // Fallback
    if (addedCount === 0 && candidates.length > 0) {
        for (let i = 0; i < Math.min(5, candidates.length); i++) candidates[i].inStock = true;
        addedCount = Math.min(5, candidates.length);
    }
    logEvent(`Nova zaloga: ${addedCount} držav!`, 'good');
    renderShop();
    renderUpgrades();
}

// --- Helper Area & Style ---

function getPolygonArea(geometry) {
    if (!geometry) return 0;
    let area = 0;
    let points = [];
    function extractPoints(coords) { return (typeof coords[0][0] === 'number') ? coords : coords[0]; }
    if (geometry.type === 'Polygon') { points = extractPoints(geometry.coordinates); area += ringArea(points); }
    else if (geometry.type === 'MultiPolygon') { geometry.coordinates.forEach(poly => { points = extractPoints(poly); area += ringArea(points); }); }
    return area;
}
function ringArea(points) {
    let area = 0;
    const R = 6378137; // Earth's radius in meters
    const toRad = Math.PI / 180;

    if (points.length > 2) {
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];

            // Standard spherical excess / chordal formula approximation for lat/lon area
            area += (p2[0] - p1[0]) * toRad * (2 + Math.sin(p1[1] * toRad) + Math.sin(p2[1] * toRad));
        }
    }
    return Math.abs(area * R * R / 2);
}

function styleFeature(feature) {
    const country = state.countries[feature.id || feature.properties.name];

    // Destroyed state - Flash Red/Yellow
    if (country && country.destroyed) {
        return { className: 'destroyed-country', weight: 1, opacity: 1, color: '#ef4444', fillOpacity: 0.8 };
    }

    if (country && country.owned) return { fillColor: country.realColor, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
    return { fillColor: '#334155', weight: 1, opacity: 1, color: '#475569', fillOpacity: 0.5 };
}

function onEachFeature(feature, layer) {
    const c = state.countries[feature.id || feature.properties.name];

    layer.on({
        click: (e) => {
            if (c) {
                showCountryInfo(c.name, c); // Show popup info

                if ((c.inStock || c.owned) && state.money >= getCurrentCost(c)) {
                    buyCountry(c.id);
                }
            }
        }
    });
}

// --- Game Logic ---

function setupEventListeners() {
    // Click button
    const clickBtn = document.getElementById('click-btn');
    if (clickBtn) {
        clickBtn.addEventListener('click', () => { addMoney(10); });
        // Add minimal animation
        clickBtn.addEventListener('mousedown', () => clickBtn.style.transform = 'scale(0.95)');
        clickBtn.addEventListener('mouseup', () => clickBtn.style.transform = 'scale(1)');
    }


    // Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            // Activate current
            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.remove('hidden');

            if (tab.dataset.tab === 'collection') {
                renderCollectionList();
            }
        });
    });
}

function addMoney(amount) {
    state.money += amount;
    updateUI();
}

function buyCountry(id) {
    const country = state.countries[id];
    const currentCost = getCurrentCost(country);

    console.log(`=== buyCountry called for ${country.name} ===`);
    console.log(`  owned: ${country.owned}, level: ${country.level}, inStock: ${country.inStock}`);

    if (state.money >= currentCost && (country.inStock || country.owned)) {
        state.money -= currentCost;

        const levelsGain = getLevelsPerUpgrade();

        if (country.owned) {
            // Upgrade existing country
            console.log(`  → UPGRADE: ${country.name} from level ${country.level} to ${country.level + levelsGain}`);
            country.level += levelsGain;
            logEvent(`Nadgradnja: ${country.name} → Level ${country.level} (+${levelsGain})`, 'good');
        } else {
            country.level += levelsGain;
            console.log(`  → FIRST PURCHASE: ${country.name}, level is now ${country.level}`);
            country.owned = true;
            country.destroyed = false; // Reset destroyed status
            state.ownedCountries.add(id);
            state.everOwned.add(id);
            logEvent(`Kupljeno: ${country.name} (Level ${country.level})`, 'good');
        }

        // Remove from stock after purchase/upgrade
        country.inStock = false;
        console.log(`  → After purchase: owned=${country.owned}, level=${country.level}`);

        geoJsonLayer.resetStyle();
        renderShop();
        renderUpgrades();
        renderCollection();
        updateUI();
    }
}

function startGameLoop() {
    // 10Hz Smooth Loop
    window.gameLoopInterval = setInterval(() => {
        // Challenge Timer Logic
        if (state.challengeTimer > 0) {
            state.challengeTimer -= 0.1;
            updateChallengeTimerDisplay();
            if (state.challengeTimer <= 0) {
                state.challengeTimer = 0;
                endGame();
                return;
            }
        }

        const totalIncome = getCurrentTotalIncome();
        if (totalIncome > 0) {
            state.money += totalIncome / 10;
        }

        // --- Stock Progress ---
        const effectiveInterval = getEffectiveStockInterval();
        const speedMultiplier = CONFIG.stockInterval / effectiveInterval;
        state.stockProgress += 100 * speedMultiplier;

        if (state.stockProgress >= CONFIG.stockInterval) {
            state.stockProgress = 0;
            replenishStock();
        }

        updateUI();
        updateStockTimer();

        // Update display CPS
        if (cpsDisplay) cpsDisplay.textContent = `${formatMoney(totalIncome)}/s`;

        // Update Restoration Display
        const destroyedIncome = getDestroyedIncome();
        const restorationDisplay = document.getElementById('restoration-display');
        if (restorationDisplay) {
            if (destroyedIncome > 0) {
                restorationDisplay.textContent = `-${formatMoney(destroyedIncome)}/s`;
            } else {
                restorationDisplay.textContent = `0 €/s`;
            }
        }

        // Auto-save every 10 seconds
        if (Date.now() % 10000 < 100) {
            saveGame();
        }

        // Check for new messages every 5 seconds
        if (Date.now() % 5000 < 100) {
            loadFriends(state.username);
            updateNotifications();
        }
    }, 100);
}

function updateStockTimer() {
    const diff = Math.max(0, CONFIG.stockInterval - state.stockProgress);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const shopElem = document.getElementById('shop-timer');
    if (shopElem) shopElem.textContent = timeStr;
}

function getCurrentTotalIncome() {
    let baseIncome = 0;
    state.ownedCountries.forEach(id => {
        const country = state.countries[id];
        baseIncome += getCurrentIncome(country);
    });

    const multiplier = getGlobalIncomeMultiplier();
    return Math.floor(baseIncome * multiplier);
}

function getDestroyedIncome() {
    let total = 0;
    Object.values(state.countries).forEach(c => {
        if (c.destroyed) {
            // Calculate potential income (Level 0 counts as Level 1 base income)
            total += getCurrentIncome(c);
        }
    });
    const multiplier = getGlobalIncomeMultiplier();
    return Math.floor(total * multiplier);
}

// Helper functions for level-based calculations
function getCurrentCost(country) {
    return Math.floor(country.baseCost * Math.pow(2, country.level));
}

function getCurrentIncome(country) {
    const effectiveLevel = Math.max(1, country.level);
    return Math.floor(country.baseIncome * Math.pow(2, effectiveLevel - 1));
}

// --- Asteroid Shower Logic ---

let nextAsteroidTime;
// asteroidStage removed, single cycle

function scheduleAsteroidShower() {
    startAsteroidTimer();
    setInterval(updateAsteroidTimer, 1000);
}

function startAsteroidTimer() {
    // Schedule the end of the current cycle
    const interval = getEffectiveAsteroidInterval();
    nextAsteroidTime = Date.now() + interval;

    // Clear existing if any
    if (window.asteroidTransitionTimer) clearTimeout(window.asteroidTransitionTimer);
    window.asteroidTransitionTimer = setTimeout(handleAsteroidCycleEnd, interval);
}

function handleAsteroidCycleEnd() {
    triggerAsteroidShower();
}

function updateAsteroidTimer() {
    const elem = document.getElementById('asteroid-timer');
    if (!elem) return;

    if (asteroidOverlay.classList.contains('active')) {
        elem.textContent = "V TEKU";
        elem.style.color = "var(--rarity-mythic)";
        elem.classList.add('blink');
        return;
    }

    const now = Date.now();
    const diff = Math.max(0, nextAsteroidTime - now);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    elem.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    elem.style.color = "var(--rarity-mythic)"; // Always red

    // Blink in last 10 seconds only
    if (diff < 10000 && diff > 0) {
        elem.classList.add('blink');
    } else {
        elem.classList.remove('blink');
    }
}

function triggerAsteroidShower() {
    asteroidOverlay.classList.add('active');
    logEvent("ASTEROIDNI ROJ SE JE ZAČEL!", "bad");

    setTimeout(() => {
        asteroidOverlay.classList.remove('active');
        processAsteroidHits();
        logEvent("Asteroidni roj se je končal.", "neutral");

        // Start new cycle
        startAsteroidTimer();
    }, 5000);
}

function animateAsteroid(latlng, callback) {
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid-fly';
    asteroid.innerHTML = '<div class="asteroid-head"></div><div class="asteroid-tail"></div>';
    document.body.appendChild(asteroid);

    // Play fly sound (clone to allow multiple overlaps)
    const sfxFly = document.getElementById('sfx-fly');
    if (sfxFly) {
        const sound = sfxFly.cloneNode();
        sound.volume = 0.3; // Lower volume for flying
        sound.play().catch(e => console.log("Audio play failed", e));
    }

    // Get pixel coordinates
    const targetPoint = map.latLngToContainerPoint(latlng);
    const mapBounds = document.getElementById('map').getBoundingClientRect();

    // Final position relative to viewport
    const finalX = mapBounds.left + targetPoint.x;
    const finalY = mapBounds.top + targetPoint.y;

    // Start position: slightly off-screen top left
    const startX = -200;
    const startY = -100;

    // Calculate angle
    const angle = Math.atan2(finalY - startY, finalX - startX) * 180 / Math.PI;

    // Set initial state
    asteroid.style.left = `${startX}px`;
    asteroid.style.top = `${startY}px`;
    asteroid.style.transform = `rotate(${angle}deg)`;
    asteroid.style.opacity = '1';

    // Force reflow
    asteroid.offsetHeight;

    // Transition to target
    asteroid.style.left = `${finalX}px`;
    asteroid.style.top = `${finalY}px`;

    setTimeout(() => {
        // Impact
        createImpactRipple(latlng);

        // Play explosion sound
        const sfxExplode = document.getElementById('sfx-explode');
        if (sfxExplode) {
            const sound = sfxExplode.cloneNode();
            sound.volume = 0.6;
            sound.play().catch(e => console.log("Audio play failed", e));
        }

        asteroid.remove();
        if (callback) callback();
    }, 1500);
}

function createImpactRipple(latlng) {
    const targetPoint = map.latLngToContainerPoint(latlng);
    const mapBounds = document.getElementById('map').getBoundingClientRect();

    const ripple = document.createElement('div');
    ripple.className = 'impact-ripple';
    ripple.style.left = `${mapBounds.left + targetPoint.x - 25}px`;
    ripple.style.top = `${mapBounds.top + targetPoint.y - 25}px`;
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 1000);
}

function processAsteroidHits() {
    const destructionChance = getEffectiveAsteroidChance();
    const moneyLost = Math.floor(state.money / 10);

    if (moneyLost > 0) {
        state.money -= moneyLost;
        logEvent(`Asteroidni roj je uničil ${formatMoney(moneyLost)} denarja! (-10%)`, 'bad');
    }

    const victims = [];
    state.ownedCountries.forEach(id => {
        if (Math.random() < destructionChance) {
            victims.push(id);
        }
    });

    const upgradesToDestroy = [];
    state.ownedUpgrades.forEach(id => {
        if (Math.random() < 0.1) {
            upgradesToDestroy.push(id);
        }
    });

    // Staggered animations for countries
    victims.forEach((id, index) => {
        setTimeout(() => {
            const country = state.countries[id];
            // Get center coord of country
            const center = L.geoJSON(country.feature).getBounds().getCenter();

            animateAsteroid(center, () => {
                const oldLevel = country.level;
                country.owned = false;
                country.destroyed = true; // Mark as destroyed
                country.level = 0;
                country.inStock = false;
                state.ownedCountries.delete(id);
                logEvent(`Asteroid je uničil ${country.name}! (Lvl.${oldLevel} → Lvl.0)`, 'bad');

                geoJsonLayer.resetStyle();
                renderShop();
                renderCollection();
                updateUI();
            });
        }, index * 400); // 400ms delay between asteroids
    });

    // Upgrades destruction (immediate or could be animated too, but countries are priority)
    upgradesToDestroy.forEach(id => {
        const upgrade = GLOBAL_UPGRADES[id];
        state.ownedUpgrades.delete(id);
        logEvent(`Asteroid je uničil nadgradnjo: ${upgrade.name}!`, 'bad');
    });

    if (upgradesToDestroy.length > 0 || moneyLost > 0) {
        renderUpgrades();
        updateUI();
    }
}

function updateUI() {
    moneyDisplay.innerText = formatMoney(state.money);
    updateShopState();
}

function updateShopState() {
    const upgradeList = document.getElementById('upgrade-list');
    const items = [...countryList.children, ...(upgradeList ? upgradeList.children : [])];

    for (let item of items) {
        // Skip basic structural checks, just assume simple layout
        const costVal = parseInt(item.dataset.cost || 0);
        if (costVal > 0) {
            const can = state.money >= costVal;
            if (can) {
                item.classList.remove('disabled');
                if (item.querySelector('.cost')) item.querySelector('.cost').style.color = '#fff';
            }
            else {
                item.classList.add('disabled');
                if (item.querySelector('.cost')) item.querySelector('.cost').style.color = '#ef4444';
            }
        }
    }
}

function renderShop() {
    countryList.innerHTML = '';
    const sorted = Object.values(state.countries).sort((a, b) => {
        // Sort by Rarity Rank, then Cost
        if (a.rarity.rank !== b.rarity.rank) return a.rarity.rank - b.rarity.rank;
        return a.baseCost - b.baseCost;
    });

    sorted.forEach(c => {
        if (!c.inStock) return; // Only show what is in stock
        const item = document.createElement('div');
        item.className = `country-item rarity-${c.rarity.id} ${c.owned ? 'owned' : ''}`;

        const currentCost = getCurrentCost(c);
        const currentIncome = getCurrentIncome(c);
        const canAfford = state.money >= currentCost;

        item.dataset.cost = currentCost;
        if (!canAfford) item.classList.add('disabled');
        item.onclick = () => { if (state.money >= currentCost) buyCountry(c.id); };

        const isGodly = c.rarity.id === 'godly';
        const levelBadge = `<span class="level-badge ${isGodly ? 'level-badge-godly' : ''}" style="font-size:0.75em; opacity:0.8; white-space:nowrap;">Lvl.${c.level}</span>`;
        const actionLabel = c.owned ? "NADGRADNJA" : c.rarity.name;

        const isLongName = c.name.length > 20;
        const nameStyle = isLongName ? 'font-size: 0.85rem;' : '';
        const nameClass = isGodly ? 'country-name country-name-godly' : 'country-name';

        const incomeClass = isGodly ? 'income text-rainbow' : 'income';
        const right = `<div class="item-right"><div class="cost" style="color:${canAfford ? '#fff' : '#ef4444'}">${formatMoney(currentCost)}</div><div class="${incomeClass}">+${formatMoney(currentIncome)}/s</div></div>`;

        item.innerHTML = `
            <div class="item-left">
                <span class="${nameClass}" style="${nameStyle}">${c.name}</span>
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <span class="country-rarity rarity-${c.rarity.id}"><span class="rarity-label-text">${actionLabel}</span></span>
                    ${levelBadge}
                </div>
            </div>
            ${right}
        `;
        countryList.appendChild(item);
    });
}

function buyGlobalUpgrade(id) {
    const upgrade = GLOBAL_UPGRADES[id];
    if (!upgrade || state.ownedUpgrades.has(id)) return;

    if (state.money < upgrade.cost) {
        logEvent(`Premalo denarja za: ${upgrade.name}`, 'bad');
        return;
    }

    state.money -= upgrade.cost;
    state.ownedUpgrades.add(id);

    logEvent(`Kupljeno: ${upgrade.name}`, 'good');

    if (upgrade.type === 'stock') {
        // startStockCycle(); // Removed - loop handles acceleration
    }

    renderUpgrades();
    updateUI();
}

function renderUpgrades() {
    const upgradeList = document.getElementById('upgrade-list');
    if (!upgradeList) return;
    upgradeList.innerHTML = '';

    // 1. Render Global Upgrades first (sorted by rarity rank)
    const sortedGlobals = Object.values(GLOBAL_UPGRADES).sort((a, b) => {
        const rankA = RARITIES[a.rarity.toUpperCase()]?.rank || 0;
        const rankB = RARITIES[b.rarity.toUpperCase()]?.rank || 0;
        if (rankA !== rankB) return rankA - rankB;
        return a.cost - b.cost;
    });

    sortedGlobals.forEach(u => {
        const isOwned = state.ownedUpgrades.has(u.id);
        const canAfford = state.money >= u.cost;
        const rar = RARITIES[u.rarity.toUpperCase()] || { color: '#fff', name: 'UNKNOWN' };

        const item = document.createElement('div');
        item.className = `country-item upgrade-item-global rarity-${u.rarity} ${isOwned ? 'owned' : ''}`;

        if (!isOwned) {
            item.dataset.cost = u.cost;
            item.onclick = () => buyGlobalUpgrade(u.id);
        }

        const isGodly = u.rarity === 'godly';
        const nameClass = isGodly ? 'text-rainbow' : '';

        const left = `
            <div class="item-left">
                <span class="country-name ${nameClass}" style="font-size: 0.9rem; ${!isGodly ? 'color:' + rar.color : ''}">${u.name}</span>
                <span class="country-rarity" style="color: var(--text-muted); font-size: 0.65rem;">${u.desc}</span>
            </div>
        `;

        const right = `
            <div class="item-right">
                <div class="cost" style="color:${isOwned ? 'var(--primary)' : (canAfford ? '#fff' : '#ef4444')}">
                    ${isOwned ? "KUPLJENO" : formatMoney(u.cost)}
                </div>
            </div>
        `;

        item.innerHTML = left + right;
        upgradeList.appendChild(item);
    });
}

function renderCollection() {
    // Optional: If you want to update collection in real time even if hidden
    if (!document.getElementById('tab-collection').classList.contains('hidden')) {
        renderCollectionList();
    }
}

function renderCollectionList() {
    const grid = document.getElementById('collection-sidebar-list');
    if (!grid) return;
    grid.innerHTML = '';
    const all = Object.values(state.countries).sort((a, b) => a.rarity.rank - b.rarity.rank);

    const totalCount = all.length;
    const ownedCount = state.everOwned.size;
    const counterElem = document.getElementById('collection-counter');
    if (counterElem) counterElem.textContent = `${ownedCount} / ${totalCount}`;

    all.forEach(c => {
        const isEverOwned = state.everOwned.has(c.id);
        const isCurrentlyOwned = c.owned;
        const card = document.createElement('div');
        card.className = `country-item collection-item rarity-${c.rarity.id} ${isEverOwned ? 'ever-owned' : 'locked'} ${isCurrentlyOwned ? 'owned' : ''}`;

        let content = '';
        if (isEverOwned) {
            const currentIncome = getCurrentIncome(c);
            const isGodly = c.rarity.id === 'godly';
            const isLongName = c.name.length > 20;
            const nameStyle = isLongName ? 'font-size: 0.85rem;' : '';
            const incomeDisplay = isGodly ? ` (${formatMoney(currentIncome)}/s)` : '';
            const nameClass = isGodly ? 'country-name country-name-godly' : 'country-name';
            const levelBadge = `<span class="level-badge ${isGodly ? 'level-badge-godly' : ''}" style="font-size:0.75em; opacity:0.8; white-space:nowrap;">Lvl.${c.level}</span>`;

            content = `
                <div class="item-left">
                     <span class="${nameClass}" style="${nameStyle}">${c.name}</span>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <span class="country-rarity rarity-${c.rarity.id}"><span class="rarity-label-text">${c.rarity.name}</span></span>
                        ${levelBadge}
                    </div>
                </div>
                <div class="item-right">
                    <div class="income ${isGodly ? 'text-rainbow' : ''}">+${formatMoney(currentIncome)}/s</div>
                    ${!c.owned ? `<div style="font-size:0.75rem; color:var(--rarity-mythic); font-weight:800; margin-top:2px;">(UNIČENO)</div>` : ''}
                </div>
            `;
        } else {
            const isGodly = c.rarity.id === 'godly';
            const isSecret = c.rarity.id === 'secret';
            const isPremium = isGodly || isSecret;

            // For Godly, we want the rainbow effect to be visible but slightly faded as requested
            const placeholderStyle = isGodly ? 'font-weight:900; opacity:0.7;' : (isPremium ? 'opacity:0.4; color:#000; font-weight:900;' : 'opacity:0.5');
            const incomeStyle = isGodly ? 'font-weight:800; opacity:0.6;' : (isPremium ? 'opacity:0.3; color:#000; font-weight:800;' : 'opacity:0.2');

            content = `
                <div class="item-left">
                    <span class="country-name ${isGodly ? 'text-rainbow' : ''}" style="${placeholderStyle}">???</span>
                    <span class="country-rarity rarity-common" style="filter:grayscale(1); opacity:0.3;"><span class="rarity-label-text">ZAKLENJENO</span></span>
                </div>
                <div class="item-right">
                    <div class="${isGodly ? 'text-rainbow' : ''}" style="${incomeStyle}">?? €/s</div>
                </div>
            `;
        }
        card.innerHTML = content;
        grid.appendChild(card);
    });
}

function logEvent(msg, type = 'neutral') {
    const li = document.createElement('li');
    li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    if (type !== 'neutral') li.classList.add(type);
    logList.prepend(li);
    if (logList.children.length > 20) logList.lastChild.remove();
}
function formatMoney(n) {
    if (n < 1000) {
        return n.toLocaleString('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    }
    const suffixes = ["", "K", "M", "B", "T", "QA", "QI", "SX", "SP", "OC", "NO", "DC", "UD", "DD", "TD", "QD", "QID", "SXD", "SPD", "OD", "ND", "V", "UV", "DV", "TV", "QAV", "QIV", "SXV", "SPV", "OV", "NV", "TG"];
    const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
    if (tier === 0) return n.toFixed(0) + " €";

    const suffix = suffixes[tier] || "e" + (tier * 3);
    const scale = Math.pow(10, tier * 3);
    const scaled = n / scale;

    return scaled.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + " " + suffix + " €";
}

// Save/Load System
function saveGame() {
    saveGameData();
    saveFriends();
}

function saveGameData() {
    if (!state.username) return;
    const saveData = {
        money: state.money,
        challengeTimer: state.challengeTimer,
        ownedCountries: Array.from(state.ownedCountries),
        everOwned: Array.from(state.everOwned),
        ownedUpgrades: Array.from(state.ownedUpgrades),
        countries: {}
    };

    Object.values(state.countries).forEach(c => {
        saveData.countries[c.id] = {
            level: c.level,
            owned: c.owned
        };
    });

    localStorage.setItem(`worldsim_save_${state.username}`, JSON.stringify(saveData));
    console.log(`Igra shranjena za ${state.username}`);
}

function saveFriends() {
    if (!state.username) return;
    const friendsData = {
        friends: state.friends,
        pendingRequests: state.pendingRequests,
        chats: state.chats,
        lastRead: state.lastRead
    };
    localStorage.setItem(`worldsim_friends_${state.username}`, JSON.stringify(friendsData));
}

function loadFriends(username) {
    const rawFriends = localStorage.getItem(`worldsim_friends_${username}`);
    if (rawFriends) {
        try {
            const fData = JSON.parse(rawFriends);
            state.friends = fData.friends || [];
            state.pendingRequests = fData.pendingRequests || [];
            state.chats = fData.chats || {};
            state.lastRead = fData.lastRead || {};
            updateNotifications();
            return true;
        } catch (e) {
            console.error("Napaka pri nalaganju prijateljev:", e);
        }
    }
    return false;
}

function loadGame(username) {
    const raw = localStorage.getItem(`worldsim_save_${username}`);
    loadFriends(username);

    if (!raw) return false;

    try {
        const data = JSON.parse(raw);
        state.username = username;
        state.username = username;
        state.money = data.money || 0;
        state.challengeTimer = (typeof data.challengeTimer === 'number') ? data.challengeTimer : 600;
        state.ownedCountries = new Set(data.ownedCountries || []);
        state.everOwned = new Set(data.everOwned || []);
        state.ownedUpgrades = new Set(data.ownedUpgrades || []);

        if (data.countries) {
            Object.keys(data.countries).forEach(id => {
                if (state.countries[id]) {
                    state.countries[id].level = data.countries[id].level || 0;
                    state.countries[id].owned = data.countries[id].owned || false;
                }
            });
        }

        return true;
    } catch (e) {
        console.error("Napaka pri nalaganju:", e);
        return false;
    }
}

// Initialize game when PLAY! is clicked
document.getElementById('play-button').addEventListener('click', () => {
    const nameInput = document.getElementById('username-input');
    const name = nameInput.value.trim();

    if (!name) {
        alert("Prosim vnesi svoje ime!");
        return;
    }

    state.username = name;
    lockUsername();
    // Hide language switcher when starting play

    const loaded = loadGame(name);

    // Check if previous game expired
    if (loaded && state.challengeTimer <= 0) {
        state.money = 0;
        state.ownedCountries = new Set();
        state.everOwned = new Set();
        state.ownedUpgrades = new Set();
        state.countries = {};
        state.challengeTimer = 600;
        state.stockProgress = 0;
        // Reset shop stock
        Object.values(state.countries).forEach(c => c.inStock = false);
        logEvent(`Začenjam nov 10-minutni izziv!`, 'good');
    } else if (loaded) {
        logEvent(`Dobrodošel nazaj, ${name}!`, 'good');
    } else {
        logEvent(`Nova igra za ${name}. Vso srečo!`, 'good');
    }

    document.getElementById('start-screen').classList.add('hidden');

    // Play Background Music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.4;
        bgMusic.play().catch(e => console.log("Music play failed:", e));
    }

    initGame();
});

function showLeaderboard() {
    let players = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('worldsim_save_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const name = key.replace('worldsim_save_', '');
                players.push({ name: name, money: data.money });
            } catch (e) {
                console.error("Napaka pri branju lestvice:", e);
            }
        }
    }

    if (players.length === 0) {
        alert("Lestvica je trenutno prazna!");
        return;
    }

    // Sort by money descending
    players.sort((a, b) => b.money - a.money);

    // Limit to 1000
    const topPlayers = players.slice(0, 1000);

    let message = "🏆 TOP 1000 IGRALCEV 🏆\n\n";
    topPlayers.forEach((p, index) => {
        message += `${index + 1}. ${p.name}: ${formatMoney(p.money)}\n`;
    });

    // Alert might be too small for 1000, but we follow the request. 
    // Usually, 1000 entries won't fit well in an alert, but the logic is there.
    alert(message);
}

document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
document.getElementById('friends-btn').addEventListener('click', () => {
    const inputName = document.getElementById('username-input').value.trim();
    if (!inputName) {
        alert("Prosim vnesi svoje ime najprej!");
        return;
    }

    state.username = inputName;
    lockUsername();

    // Load existing friends data if it exists for this name
    if (!loadFriends(state.username)) {
        // Reset friends state if no data found (new user)
        state.friends = [];
        state.pendingRequests = [];
        state.chats = {};
        state.lastRead = {};
    }

    renderFriendsList();
    updateNotifications();
    document.getElementById('friends-modal').classList.remove('hidden');
});

function lockUsername() {
    const input = document.getElementById('username-input');
    if (input) {
        input.readOnly = true;
        input.style.opacity = '0.7';
        input.style.pointerEvents = 'none';
        input.style.borderColor = 'var(--border)';
    }
}

// Add Enter listener for username
document.getElementById('username-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const inputName = e.target.value.trim();
        if (!inputName) {
            alert("Prosim vnesi svoje ime najprej!");
            return;
        }
        state.username = inputName;
        lockUsername();
        loadFriends(state.username);
        logEvent(`Dobrodošel, ${inputName}! Ime je zaklenjeno.`, 'good');
    }
});

function updateNotifications() {
    if (!state.username) return;

    let hasNewMessage = false;
    Object.keys(state.chats).forEach(friend => {
        const msgs = state.chats[friend];
        if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            const lastReadTime = state.lastRead[friend] || 0;

            if (lastMsg.from !== state.username && lastMsg.time > lastReadTime) {
                hasNewMessage = true;
            }
        }
    });

    const hasNewRequest = state.pendingRequests.length > 0;

    const dot = document.getElementById('friends-notification');
    if (hasNewMessage || hasNewRequest) {
        dot.classList.remove('hidden');
    } else {
        dot.classList.add('hidden');
    }
}

document.getElementById('close-friends-btn').addEventListener('click', () => {
    document.getElementById('friends-modal').classList.add('hidden');
});

document.getElementById('add-friend-btn').addEventListener('click', () => {
    const target = prompt("Vnesi ime prijatelja:");
    if (!target) return;
    if (target === state.username) {
        alert("Sam sebi ne moreš poslati prošnje!");
        return;
    }

    // Check if user exists
    if (!localStorage.getItem(`worldsim_save_${target}`)) {
        alert("Ta uporabnik ne obstaja!");
        return;
    }

    // Check if already friends
    if (state.friends.includes(target)) {
        alert("Že v prijateljih!");
        return;
    }

    // Send request (add to target's pending)
    let targetFriends = JSON.parse(localStorage.getItem(`worldsim_friends_${target}`) || '{"friends":[], "pendingRequests":[], "chats":{}}');
    if (targetFriends.pendingRequests.includes(state.username)) {
        alert("Prošnja že poslana!");
        return;
    }

    targetFriends.pendingRequests.push(state.username);
    localStorage.setItem(`worldsim_friends_${target}`, JSON.stringify(targetFriends));
    alert("Prošnja poslana!");
});

function renderFriendsList() {
    const requestsList = document.getElementById('requests-list');
    const friendsList = document.getElementById('friends-list');

    requestsList.innerHTML = '';
    friendsList.innerHTML = '';

    state.pendingRequests.forEach(from => {
        const div = document.createElement('div');
        div.className = 'request-item';
        div.innerHTML = `
            <span>${from}</span>
            <div class="actions">
                <button class="accept-btn" onclick="acceptFriend('${from}')">Sprejmi</button>
            </div>
        `;
        requestsList.appendChild(div);
    });

    state.friends.forEach(friend => {
        const msgs = state.chats[friend] || [];
        const lastReadTime = state.lastRead[friend] || 0;
        let hasUnread = false;
        if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.from !== state.username && lastMsg.time > lastReadTime) {
                hasUnread = true;
            }
        }

        const div = document.createElement('div');
        div.className = 'friend-item';
        div.innerHTML = `
            <div class="friend-name-container">
                <span class="friend-name">${friend}</span>
                ${hasUnread ? '<div class="unread-mark">!</div>' : ''}
            </div>
            <button class="view-btn" onclick="openChat('${friend}')">View Friend</button>
        `;
        friendsList.appendChild(div);
    });

    document.getElementById('friends-list-view').classList.remove('hidden');
    document.getElementById('chat-view').classList.add('hidden');
}

window.acceptFriend = function (name) {
    state.friends.push(name);
    state.pendingRequests = state.pendingRequests.filter(f => f !== name);

    // Also add current user to friend's friends list
    let friendData = JSON.parse(localStorage.getItem(`worldsim_friends_${name}`) || '{"friends":[], "pendingRequests":[], "chats":{}}');
    if (!friendData.friends.includes(state.username)) {
        friendData.friends.push(state.username);
        localStorage.setItem(`worldsim_friends_${name}`, JSON.stringify(friendData));
    }

    saveFriends();
    updateNotifications();
    renderFriendsList();
};

let activeChat = null;
window.openChat = function (name) {
    activeChat = name;
    state.lastRead[name] = Date.now();
    saveFriends();
    updateNotifications();
    document.getElementById('chat-friend-name').textContent = name;
    document.getElementById('friends-list-view').classList.add('hidden');
    document.getElementById('chat-view').classList.remove('hidden');
    renderMessages();
};

document.getElementById('back-to-friends').addEventListener('click', () => {
    activeChat = null;
    renderFriendsList();
});

function renderMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    const messages = state.chats[activeChat] || [];
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `msg ${msg.from === state.username ? 'sent' : 'received'}`;
        div.textContent = msg.text;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

document.getElementById('send-msg-btn').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !activeChat) return;

    const msg = { from: state.username, text: text, time: Date.now() };

    // Update local state
    if (!state.chats[activeChat]) state.chats[activeChat] = [];
    state.chats[activeChat].push(msg);

    // Update friend's state in localStorage
    let friendData = JSON.parse(localStorage.getItem(`worldsim_friends_${activeChat}`) || '{"friends":[], "pendingRequests":[], "chats":{}}');
    if (!friendData.chats[state.username]) friendData.chats[state.username] = [];
    friendData.chats[state.username].push(msg);
    localStorage.setItem(`worldsim_friends_${activeChat}`, JSON.stringify(friendData));

    input.value = '';
    saveFriends();
    renderMessages();
}

function showCountryInfo(name, country) {
    const popup = document.getElementById('country-info-popup');
    const content = document.getElementById('country-info-content');
    const closeBtn = document.getElementById('close-country-info');

    if (!popup || !content) return;

    // Reset classes
    content.className = '';

    // Determine content and style
    if (country.owned) {
        content.textContent = name; // Already translated in c.name
        content.classList.add('popup-owned');
    } else if (country.destroyed) {
        content.textContent = "UNIČENA DRŽAVA";
        content.classList.add('popup-destroyed');
    } else {
        content.textContent = "NEODKRITA DRŽAVA";
        content.classList.add('popup-undiscovered');
    }

    // Show popup
    popup.classList.remove('hidden');

    // Auto-hide after 3 seconds
    if (window.popupTimer) clearTimeout(window.popupTimer);
    window.popupTimer = setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);

    // Close button logic
    if (closeBtn) {
        closeBtn.onclick = () => {
            popup.classList.add('hidden');
            if (window.popupTimer) clearTimeout(window.popupTimer);
        };
    }
}

function updateChallengeTimerDisplay() {
    const display = document.getElementById('challenge-timer-display');
    if (!display) return;

    // Safety check
    if (state.challengeTimer < 0) state.challengeTimer = 0;

    const minutes = Math.floor(state.challengeTimer / 60);
    const seconds = Math.floor(state.challengeTimer % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    display.textContent = `Osvoji svet: ${timeStr}`;

    // Visual warning
    if (state.challengeTimer <= 60) {
        display.style.color = '#ef4444';
        display.style.borderColor = '#ef4444';
        if (state.challengeTimer % 1 < 0.5) display.style.opacity = '0.5';
        else display.style.opacity = '1';
    } else {
        display.style.color = 'var(--text-main)';
        display.style.borderColor = 'var(--border)';
        display.style.opacity = '1';
    }
}

function endGame() {
    if (window.gameLoopInterval) clearInterval(window.gameLoopInterval);

    // Stop Background Music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    saveGame(); // Final save

    const gameOverScreen = document.getElementById('game-over-screen');
    const rankDisplay = document.getElementById('user-rank-display');
    const leaderboardDiv = document.getElementById('game-over-leaderboard');

    if (!gameOverScreen) return;

    // Generate Leaderboard logic
    let players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('worldsim_save_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const name = key.replace('worldsim_save_', '');
                players.push({ name: name, money: data.money || 0 });
            } catch (e) {
                console.error("Error parsing save", e);
            }
        }
    }

    players.sort((a, b) => b.money - a.money);

    // Find user rank
    const userRankIndex = players.findIndex(p => p.name === state.username);
    const userRank = userRankIndex + 1;

    rankDisplay.innerHTML = `Tvoje mesto: <span style="color:var(--primary); font-size:1.5rem;">#${userRank}</span> <br> <span style="font-size:1rem; color:var(--text-muted);">Denar: ${formatMoney(state.money)}</span>`;

    // Render Top 10
    leaderboardDiv.innerHTML = '';
    const top10 = players.slice(0, 10);

    top10.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        if (p.name === state.username) row.classList.add('highlight');

        row.innerHTML = `
            <div style="display:flex; width:100%;">
                <span class="rank-num">${i + 1}.</span>
                <span class="player-name">${p.name}</span>
                <span class="player-money">${formatMoney(p.money)}</span>
            </div>
        `;
        leaderboardDiv.appendChild(row);
    });

    // Show Screen
    gameOverScreen.classList.remove('hidden');

    // Setup Restart Button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.onclick = () => {
            // Reset challenge timer status in save just in case, but usually reload handles it by waiting for input
            // Actually, if we reload, user types name to login.
            // If they type same name, loadGame() checks challengeTimer.
            // We need to ensure logic handles the "expired" state correctly.
            // We set state.challengeTimer = 0 at endGame call before this (in loop).
            // And saveGame() saved it as 0.
            // So next loadGame -> timer 0 -> triggers Reset logic we added.
            location.reload();
        };
    }

    // Setup Admin Reset Button
    const adminBtn = document.getElementById('admin-reset-btn');
    if (adminBtn) {
        adminBtn.onclick = () => {
            const pass = prompt("Vnesi administratorsko geslo za izbris vseh podatkov:");
            if (pass === "lukalesjak") {
                if (confirm("Ali si prepričan? Vsi rezultati in igralci bodo trajno izbrisani!")) {
                    localStorage.clear();
                    alert("Vsi podatki so bili izbrisani.");
                    location.reload();
                }
            } else {
                alert("Nepravilno geslo!");
            }
        };
    }
}
