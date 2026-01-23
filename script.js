// Firebase Configuration (Vstavite svoje podatke iz Firebase konzole!)
const firebaseConfig = {
    apiKey: "AIzaSyD8yRyrSX-9_HxgOSR_5CiwVq8jAjWLgNU",
    authDomain: "worldsim-luka.firebaseapp.com",
    databaseURL: "https://worldsim-luka-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "worldsim-luka",
    storageBucket: "worldsim-luka.firebasestorage.app",
    messagingSenderId: "688055877481",
    appId: "1:688055877481:web:63f8a4eff9a66b624b47f8"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

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

function getProtectedCountriesCount() {
    let protected = 0;
    Object.values(GLOBAL_UPGRADES).forEach(u => {
        if (state.ownedUpgrades.has(u.id) && u.type === 'shield_protection') {
            protected += u.value;
        }
    });
    return protected;
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
    COMMON: { id: 'common', name: 'REVNA', multiplier: 1, gdpThresh: 2000, color: '#22c55e', rank: 1, weight: 100 },
    RARE: { id: 'rare', name: 'SKROMNA', multiplier: 1.2, gdpThresh: 10000, color: '#3b82f6', rank: 2, weight: 50 },
    EPIC: { id: 'epic', name: 'V VZPONU', multiplier: 1.5, gdpThresh: 30000, color: '#a855f7', rank: 3, weight: 25 },
    LEGENDARY: { id: 'legendary', name: 'RAZVITA', multiplier: 2, gdpThresh: 60000, color: '#eab308', rank: 3.5, weight: 15 },
    MYTHIC: { id: 'mythic', name: 'BOGATA', multiplier: 3, gdpThresh: 120000, color: '#ef4444', rank: 4, weight: 5 },
    GODLY: { id: 'godly', name: 'ELITNA', multiplier: 5, gdpThresh: Infinity, color: '#ff00ff', rank: 5, weight: 2 },
    SECRET: { id: 'secret', name: 'SKRIVNA', multiplier: 8, color: '#000', rank: 6, weight: 0.8 },
    OG: { id: 'og', name: 'OG', multiplier: 12, color: '#b45309', rank: 7, weight: 0.3 }
};

const GDP_DATA = {
    // Exact Values from Database (Slovenian keys)
    "Afganistan": 412.79, "Albanija": 11377.78, "Alžirija": 8792.88, "Andora": 40303.45, "Angola": 2885.87,
    "Antigva in Barbuda": 23342.45, "Argentina": 14003.78, "Armenija": 8356.21, "Avstralija": 64805.55,
    "Avstrija": 56268.88, "Azerbajdžan": 7283.89, "Bahami": 38655.45, "Bahrajn": 29855.87, "Bangladeš": 2362.87,
    "Barbados": 20344.87, "Belorusija": 8302.83, "Belgija": 55624.57, "Belize": 7445.24, "Benin": 1483.24,
    "Butan": 3483.24, "Bolivija": 4423.87, "Bosna in Hercegovina": 8154.78, "Bocvana": 7855.75,
    "Brazilija": 11155.55, "Brunej": 33243.67, "Bolgarija": 17388.92, "Burkina Faso": 582.55, "Burundi": 233.42,
    "Zelenortski otoki": 5202.48, "Kambodža": 2627.88, "Kamerun": 1833.87, "Kanada": 54143.25,
    "Srednjeafriška republika": 558.21, "Čad": 960.36, "Čile": 16738.85, "Kitajska": 13343.35, "Kolumbija": 7523.21,
    "Komori": 1442.78, "Kongo, Demokratična r.": 638.35, "Kongo": 2482.25, "Kostarika": 18587.25,
    "Slonokoščena obala": 2722.88, "Hrvaška": 24083.45, "Kuba": 9535.21, "Ciper": 35874.24, "Češka": 29822.21,
    "Danska": 71038.45, "Džibuti": 3312.72, "Dominika": 10453.28, "Dominikanska republika": 10825.48,
    "Ekvador": 6074.72, "Egipt": 4444.67, "Salvador": 5373.44, "Ekvatorialna Gvineja": 6245.88, "Eritreja": 668.88,
    "Estonija": 32428.45, "Esvatini": 5022.34, "Etiopija": 1133.88, "Fidži": 6465.74, "Finska": 54344.77,
    "Francija": 48503.44, "Gabon": 9254.88, "Gambija": 871.34, "Gruzija": 8283.85, "Nemčija": 55212.72,
    "Gana": 2343.77, "Grčija": 24628.25, "Grenada": 13245.88, "Gvatemala": 6333.33, "Gvineja": 1445.44,
    "Gvineja Bissau": 1127.74, "Gvajana": 28425.25, "Haiti": 2242.32, "Vatikan": 502000.88, "Honduras": 3424.43,
    "Madžarska": 23292.55, "Islandija": 85542.55, "Indija": 2643.32, "Indonezija": 6323.43, "Iran": 5343.12,
    "Irak": 6573.11, "Irska": 113244.85, "Izrael": 54173.88, "Italija": 41245.82, "Jamajka": 7253.88,
    "Japonska": 32882.88, "Jordanija": 4528.23, "Kazahstan": 15243.32, "Kenija": 2313.43, "Kiribati": 2288.63,
    "Severna Koreja": 500, "Južna Koreja": 36243.66, "Kuvajt": 33722.72, "Kirgizija": 2029.13, "Laos": 2123.32,
    "Latvija": 24834.85, "Libanon": 3477.72, "Lesoto": 923.32, "Liberija": 831.52, "Libija": 6528.77,
    "Lihtenštajn": 204783.22, "Litva": 29503.22, "Luksemburg": 133742.66, "Madagaskar": 548.83, "Malavi": 723.32,
    "Malezija": 13824.21, "Maldivi": 23572.12, "Mali": 1054.42, "Malta": 43853.22, "Marshallovi otoki": 6724.44,
    "Mavretanija": 2333.32, "Mauritius": 11552.78, "Mehika": 14143.75, "Mikronezija": 4344.88, "Moldavija": 7573.23,
    "Monako": 255551.44, "Mongolija": 6732.43, "Črna gora": 12243.32, "Maroko": 4122.12, "Mozambik": 648.72,
    "Mjanmar": 1363.35, "Namibija": 4954.21, "Nauru": 13000.82, "Nepal": 1332.41, "Nizozemska": 65522.21,
    "Nova Zelandija": 48253.12, "Nikaragva": 2842.24, "Niger": 643.21, "Nigerija": 1084.12,
    "Severna Makedonija": 7423.88, "Norveška": 88785.45, "Oman": 22143.23, "Pakistan": 1478.77, "Palau": 15832.12,
    "Panama": 20143.22, "Papua Nova Gvineja": 2844.75, "Paragvaj": 5455.23, "Peru": 8342.67, "Filipini": 3984.85,
    "Poljska": 25552.57, "Portugalska": 28832.22, "Katar": 78848.33, "Romunija": 20552.22, "Rusija": 14885.82,
    "Ruanda": 981.12, "Samoa": 4232.88, "San Marino": 55872.12, "Sao Tome in Principe": 2472.51,
    "Savdska Arabija": 35121.66, "Senegal": 1775.22, "Srbija": 13572.21, "Sejšeli": 11833.82,
    "Sierra Leone": 855.45, "Singapur": 92853.87, "Slovaška": 22352.87, "Slovenija": 35832.55,
    "Salomonovi otoki": 2233.56, "Somalija": 825.21, "Južna Afrika": 6287.13, "Južni Sudan": 1085.11,
    "Španija": 35324.77, "Šrilanka": 4355.51, "Sveti Krištof in Nevis": 23963.85, "Sveta Lucija": 14185.85,
    "Sveti Vincencij in Grenadine": 11552.22, "Palestina": 2552.51, "Sudan": 984.62, "Surinam": 6385.73,
    "Švedska": 57127.42, "Švica": 105958.13, "Sirija": 1253.67, "Tadžikistan": 1345.28, "Tanzanija": 1188.72,
    "Tajska": 7833.82, "Timor-Leste": 1238.87, "Togo": 1222.38, "Tonga": 5855.92, "Trinidad in Tobago": 19733.42,
    "Tajvan": 33000.00,
    "Tajvan, Kitajska": 33000.00,
    "Tunizija": 4183.13, "Turčija": 13852.72, "Turkmenistan": 8858.88, "Tuvalu": 6333.78, "Uganda": 1077.31,
    "Ukrajina": 5585.82, "Združeni arabski emirati": 55273.51, "Združeno kraljestvo": 51243.37,
    "Združene države Amerike": 85554.84, "Urugvaj": 21953.51, "Uzbekistan": 2243.78, "Vanuatu": 3452.77,
    "Venezuela": 4212.55, "Vietnam": 4522.28, "Jemen": 632.88, "Zambija": 1187.11, "Zimbabve": 1432.23,
    "Severni Ciper": 14500.00, "Južna Georgia in otočje": 12500.00, "Somaliland": 850.00,
    "Ferski otoki": 65800.00, "Južnopatagonsko ledeno polje": 400.00
};

const GAME_RANKS = [
    { name: 'Bronasti I', minPoints: 0, color: '#cd7f32', reward: 0, icon: '🥉' },
    { name: 'Bronasti II', minPoints: 1000, color: '#cd7f32', reward: 10, icon: '🥉' },
    { name: 'Bronasti III', minPoints: 2500, color: '#cd7f32', reward: 15, icon: '🥉' },
    { name: 'Srebrni I', minPoints: 5000, color: '#c0c0c0', reward: 25, icon: '🥈' },
    { name: 'Srebrni II', minPoints: 12500, color: '#c0c0c0', reward: 35, icon: '🥈' },
    { name: 'Srebrni III', minPoints: 25000, color: '#c0c0c0', reward: 50, icon: '🥈' },
    { name: 'Zlati I', minPoints: 50000, color: '#ffd700', reward: 75, icon: '🥇' },
    { name: 'Zlati II', minPoints: 125000, color: '#ffd700', reward: 100, icon: '🥇' },
    { name: 'Zlati III', minPoints: 250000, color: '#ffd700', reward: 150, icon: '🥇' },
    { name: 'Diamantni I', minPoints: 500000, color: '#b9f2ff', reward: 250, icon: '💎' },
    { name: 'Diamantni II', minPoints: 1250000, color: '#b9f2ff', reward: 350, icon: '💎' },
    { name: 'Diamantni III', minPoints: 2500000, color: '#b9f2ff', reward: 500, icon: '💎' },
    { name: 'Legendarni I', minPoints: 5000000, color: '#ff4500', reward: 1000, icon: '🔥' },
    { name: 'Legendarni II', minPoints: 12500000, color: '#ff4500', reward: 1500, icon: '🔥' },
    { name: 'Legendarni III', minPoints: 25000000, color: '#ff4500', reward: 2500, icon: '🔥' },
    { name: 'Neresnični I', minPoints: 50000000, color: '#a855f7', reward: 5000, icon: '✨' },
    { name: 'Neresnični II', minPoints: 125000000, color: '#a855f7', reward: 10000, icon: '✨' },
    { name: 'Neresnični III', minPoints: 250000000, color: '#a855f7', reward: 25000, icon: '✨' },
    { name: 'Kralj', minPoints: 500000000, color: '#eab308', reward: 100000, icon: '👑' }
];

function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9-_]/g, '_');
}

function createFlagPatterns() {
    // Check if container exists
    let svgContainer = document.getElementById('flag-patterns-container');
    if (!svgContainer) {
        svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgContainer.id = 'flag-patterns-container';
        svgContainer.style.position = 'absolute';
        svgContainer.style.width = '0';
        svgContainer.style.height = '0';
        svgContainer.style.pointerEvents = 'none';

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.id = 'flag-patterns-defs';
        svgContainer.appendChild(defs);
        document.body.appendChild(svgContainer);
    }

    const defs = document.getElementById('flag-patterns-defs');
    defs.innerHTML = ''; // Clear existing

    Object.values(state.countries).forEach(c => {
        // Construct Flag URL
        // Prefer ISO2 for flagcdn (higher quality), fallback to flagsapi with ISO3 (feature.id)
        let flagUrl = '';
        if (c.iso2 && c.iso2.length === 2 && c.iso2 !== '-99') {
            flagUrl = `https://flagcdn.com/w320/${c.iso2.toLowerCase()}.png`;
        } else {
            // Fallback to flagsapi for 3-letter codes
            flagUrl = `https://flagsapi.com/${c.id}/flat/64.png`;
        }

        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        pattern.setAttribute('id', `flag-${sanitizeId(c.id)}`);
        pattern.setAttribute('patternUnits', 'objectBoundingBox');
        pattern.setAttribute('width', '1');
        pattern.setAttribute('height', '1');
        pattern.setAttribute('preserveAspectRatio', 'none'); // Stretch to fill

        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute('href', flagUrl);
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '1');
        image.setAttribute('height', '1');
        image.setAttribute('preserveAspectRatio', 'none'); // Stretch

        pattern.appendChild(image);
        defs.appendChild(pattern);
    });
}

const SKIN_ITEMS = {
    'classic': { id: 'classic', name: 'Standardno', desc: 'Standardne barve glede na redkost.', cost: 10, type: 'skin' },
    'neon': { id: 'neon', name: 'Neon Mesto', desc: 'Svetleče in močne futuristične barve.', cost: 10, type: 'skin' },
    'gold': { id: 'gold', name: 'Zlati Imperij', desc: 'Vse države postanejo prestižno zlate.', cost: 10, type: 'skin' },
    'cyber': { id: 'cyber', name: 'Cyberpunk', desc: 'Temno vijolične in modre barve.', cost: 10, type: 'skin' },
    'lava': { id: 'lava', name: 'Lava', desc: 'Države prekrite z vročo magmo.', cost: 10, type: 'skin' },
    'matrix': { id: 'matrix', name: 'Matrica', desc: 'Hekerski videz v zeleni kodi.', cost: 10, type: 'skin' },
    'flags': { id: 'flags', name: 'Zastave Sveta', desc: 'Barve nacionalnih zastav (najbolj priljubljeno).', cost: 10, type: 'skin' },
    'ghost': { id: 'ghost', name: 'Duh', desc: 'Prosojne in srhljivo modre države.', cost: 10, type: 'skin' },
    'nature': { id: 'nature', name: 'Narava', desc: 'Zeleni in rjavi toni divjine.', cost: 10, type: 'skin' },
    'ocean_skin': { id: 'ocean_skin', name: 'Morski Svet', desc: 'Svetlo modre in turkizne barve.', cost: 10, type: 'skin' },
    'sky_skin': { id: 'sky_skin', name: 'Nebesna Svoboda', desc: 'Barve neba ob sončnem zahodu.', cost: 10, type: 'skin' },
    'diamond_skin': { id: 'diamond_skin', name: 'Diamantni Sij', desc: 'Države sijejo kot diamant.', cost: 10, type: 'skin' },
    'retro_skin': { id: 'retro_skin', name: 'Retro 80s', desc: 'Roza in turkizna arkadna estetika.', cost: 10, type: 'skin' },
    'fire': { id: 'fire', name: 'Ognjeni Pekel', desc: 'Žareče rdeče in oranžne barve ognja.', cost: 10, type: 'skin' },
    'ice': { id: 'ice', name: 'Ledena Doba', desc: 'Zamrznjene modre in bele države.', cost: 10, type: 'skin' },
    'toxic': { id: 'toxic', name: 'Strupeni Odpadki', desc: 'Radioaktivno zelena in rumena.', cost: 10, type: 'skin' },
    'royal': { id: 'royal', name: 'Kraljevska Vijolična', desc: 'Prestižna vijolična z zlatimi robovi.', cost: 10, type: 'skin' },
    'shadow': { id: 'shadow', name: 'Senca', desc: 'Popolnoma črne države z belo obrobo.', cost: 10, type: 'skin' },
    'rainbow': { id: 'rainbow', name: 'Mavrica', desc: 'Vesela igra vseh barv hkrati.', cost: 10, type: 'skin' },
    'emerald': { id: 'emerald', name: 'Smaragd', desc: 'Globoki zeleni kristalni odtenki.', cost: 10, type: 'skin' },
    'ruby': { id: 'ruby', name: 'Rubin', desc: 'Veličastni rdeči kristalni toni.', cost: 10, type: 'skin' },
    'sapphire': { id: 'sapphire', name: 'Safir', desc: 'Globoko modri kristalni toni.', cost: 10, type: 'skin' },
    'blood_moon': { id: 'blood_moon', name: 'Krvava Luna', desc: 'Temno rdeče z črnimi robovi.', cost: 10, type: 'skin' },
    'spirit': { id: 'spirit', name: 'Duhovni Svet', desc: 'Svetlo modre mistične barve.', cost: 10, type: 'skin' },
    'void': { id: 'void', name: 'Praznina', desc: 'Popolna tema s temno vijolično obrobo.', cost: 10, type: 'skin' },
    'cyber_glow': { id: 'cyber_glow', name: 'Cyber Sij', desc: 'Neon turkizna s svetlečim učinkom.', cost: 10, type: 'skin' },
    'obsidian': { id: 'obsidian', name: 'Obsidijan', desc: 'Popolna črnina s škrlatnim sije.', cost: 10, type: 'skin' },
    'crystal': { id: 'crystal', name: 'Kristalna Čistost', desc: 'Prosojne države z mavričnim odsevom.', cost: 10, type: 'skin' },
    'sun_god': { id: 'sun_god', name: 'Sončni Bog', desc: 'Žareča bela in rumena energija.', cost: 10, type: 'skin' },
    'galaxy_skin': { id: 'galaxy_skin', name: 'Galaktična Koža', desc: 'Premikajoče se barve vesolja.', cost: 10, type: 'skin' },
    'ethereal': { id: 'ethereal', name: 'Eterični Duh', desc: 'Skoraj nevidne, a sijoče države.', cost: 10, type: 'skin' },
    'warlord': { id: 'warlord', name: 'Gospodar Vojne', desc: 'Krvavo rdeče z debelo črno obrobo.', cost: 10, type: 'skin' }
};

const BACKGROUND_ITEMS = {
    'default': { id: 'default', name: 'Standardno', desc: 'Običajno temno modro ozadje.', cost: 10, type: 'background' },
    'space': { id: 'space', name: 'Zvezdnato nebo', desc: 'Zvezdnato nebo', cost: 10, type: 'background' },
    'ocean': { id: 'ocean', name: 'Globok Ocean', desc: 'Temno modre globine morja.', cost: 10, type: 'background' },
    'magma': { id: 'magma', name: 'Vulkansko', desc: 'Vroče podzemlje polno lave.', cost: 10, type: 'background' },
    'matrix_bg': { id: 'matrix_bg', name: 'Digitalni Svet', desc: 'Zelena hakerska koda.', cost: 10, type: 'background' },
    'desert': { id: 'desert', name: 'Puščava', desc: 'Suhi pesek in vroče sipine.', cost: 10, type: 'background' },
    'arctic': { id: 'arctic', name: 'Arktika', desc: 'Snežno bela in ledeno modra.', cost: 10, type: 'background' },
    'forest': { id: 'forest', name: 'Gosta Divjina', desc: 'Mirni zeleni gozdovi.', cost: 10, type: 'background' },
    'city': { id: 'city', name: 'Nočno Mesto', desc: 'Silhuete nebotičnikov.', cost: 10, type: 'background' },
    'retro_bg': { id: 'retro_bg', name: 'Synthwave', desc: 'Mreža in sončni zahod.', cost: 10, type: 'background' },
    'clouds': { id: 'clouds', name: 'Oblaki', desc: 'Svetlo modro nebo s puhastimi oblaki.', cost: 10, type: 'background' },
    'sunset': { id: 'sunset', name: 'Sončni Zahod', desc: 'Tople oranžne in vijolične barve.', cost: 10, type: 'background' },
    'aurora': { id: 'aurora', name: 'Polarni Sij', desc: 'Čarobno zeleno in modro valovanje.', cost: 10, type: 'background' },
    'hell': { id: 'hell', name: 'Pekelski Ogenj', desc: 'Globoko rdeče in goreče ozadje.', cost: 10, type: 'background' },
    'galaxy': { id: 'galaxy', name: 'Galaksija', desc: 'Mistična vijolična galaksija.', cost: 10, type: 'background' },
    'moonlight': { id: 'moonlight', name: 'Mesečina', desc: 'Mirna modra noč.', cost: 10, type: 'background' },
    'retro_grid': { id: 'retro_grid', name: 'Retro Mreža', desc: '3D mreža v stilu 80-ih.', cost: 10, type: 'background' },
    'deep_sea': { id: 'deep_sea', name: 'Globoko Morje', desc: 'Temni ocean z mehurčki.', cost: 10, type: 'background' },
    'supernova': { id: 'supernova', name: 'Supernova', desc: 'Eksplozija neonskih barv.', cost: 10, type: 'background' },
    'dimension_x': { id: 'dimension_x', name: 'Dimenzija X', desc: 'Neznani portalni svet.', cost: 10, type: 'background' },
    'godly_realm': { id: 'godly_realm', name: 'Božansko Kraljestvo', desc: 'Čista svetloba in zlati sij.', cost: 10, type: 'background' },
    'cyber_core': { id: 'cyber_core', name: 'Cyber Jedro', desc: 'Animirano neonsko jedro.', cost: 10, type: 'background' },
    'infinite_nothing': { id: 'infinite_nothing', name: 'Neskončni Nič', desc: 'Globoka črnina s srebrnimi pikami.', cost: 10, type: 'background' }
};
const GLOBAL_UPGRADES = {
    // COMMON
    // STOCK SPEED (Custom 5 Tiers)
    STOCK_SPEED_I: { id: 'STOCK_SPEED_I', rarity: 'common', name: 'Hitrejša Zaloga I', cost: 1000, type: 'stock', value: 0.90, desc: 'Zaloga prihaja 10% hitreje' },
    STOCK_SPEED_II: { id: 'STOCK_SPEED_II', rarity: 'common', name: 'Hitrejša Zaloga II', cost: 2000, type: 'stock', value: 0.80, desc: 'Zaloga prihaja 20% hitreje' },
    STOCK_SPEED_III: { id: 'STOCK_SPEED_III', rarity: 'common', name: 'Hitrejša Zaloga III', cost: 5000, type: 'stock', value: 0.70, desc: 'Zaloga prihaja 30% hitreje' },
    STOCK_SPEED_IV: { id: 'STOCK_SPEED_IV', rarity: 'rare', name: 'Hitrejša Zaloga IV', cost: 10000, type: 'stock', value: 0.60, desc: 'Zaloga prihaja 40% hitreje' },
    STOCK_SPEED_V: { id: 'STOCK_SPEED_V', rarity: 'rare', name: 'Hitrejša Zaloga V', cost: 20000, type: 'stock', value: 0.50, desc: 'Zaloga prihaja 50% hitreje' },

    // INCOME BOOST (Custom 5 Tiers)
    INCOME_SPEED_I: { id: 'INCOME_SPEED_I', rarity: 'common', name: 'Večji Zaslužek I', cost: 5000, type: 'income', value: 0.05, desc: 'Skupni zaslužek +5%' },
    INCOME_SPEED_II: { id: 'INCOME_SPEED_II', rarity: 'common', name: 'Večji Zaslužek II', cost: 15000, type: 'income', value: 0.15, desc: 'Skupni zaslužek +15%' },
    INCOME_SPEED_III: { id: 'INCOME_SPEED_III', rarity: 'rare', name: 'Večji Zaslužek III', cost: 35000, type: 'income', value: 0.25, desc: 'Skupni zaslužek +25%' },
    INCOME_SPEED_IV: { id: 'INCOME_SPEED_IV', rarity: 'rare', name: 'Večji Zaslužek IV', cost: 60000, type: 'income', value: 0.35, desc: 'Skupni zaslužek +35%' },
    INCOME_SPEED_V: { id: 'INCOME_SPEED_V', rarity: 'epic', name: 'Večji Zaslužek V', cost: 100000, type: 'income', value: 0.50, desc: 'Skupni zaslužek +50%' },

    // ROCKET SHIELD (Custom 5 Tiers) - Protects countries from destruction
    SHIELD_I: { id: 'SHIELD_I', rarity: 'common', name: 'Raketni Ščit I', cost: 2000, type: 'shield_protection', value: 2, desc: 'Zaščiti 2 državi pred asteroidi' },
    SHIELD_II: { id: 'SHIELD_II', rarity: 'common', name: 'Raketni Ščit II', cost: 8000, type: 'shield_protection', value: 2, desc: 'Zaščiti dodatni 2 državi (skupaj 4)' },
    SHIELD_III: { id: 'SHIELD_III', rarity: 'rare', name: 'Raketni Ščit III', cost: 18000, type: 'shield_protection', value: 2, desc: 'Zaščiti dodatni 2 državi (skupaj 6)' },
    SHIELD_IV: { id: 'SHIELD_IV', rarity: 'rare', name: 'Raketni Ščit IV', cost: 32000, type: 'shield_protection', value: 2, desc: 'Zaščiti dodatni 2 državi (skupaj 8)' },
    SHIELD_V: { id: 'SHIELD_V', rarity: 'epic', name: 'Raketni Ščit V', cost: 50000, type: 'shield_protection', value: 2, desc: 'Zaščiti dodatni 2 državi (skupaj 10)' },

    // STOCK SIZE (Custom 5 Tiers)
    STOCK_SIZE_I: { id: 'STOCK_SIZE_I', rarity: 'common', name: 'Večja Zaloga I', cost: 5000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav' },
    STOCK_SIZE_II: { id: 'STOCK_SIZE_II', rarity: 'common', name: 'Večja Zaloga II', cost: 15000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav (Dodatno)' },
    STOCK_SIZE_III: { id: 'STOCK_SIZE_III', rarity: 'rare', name: 'Večja Zaloga III', cost: 35000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav (Dodatno)' },
    STOCK_SIZE_IV: { id: 'STOCK_SIZE_IV', rarity: 'rare', name: 'Večja Zaloga IV', cost: 60000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav (Dodatno)' },
    STOCK_SIZE_V: { id: 'STOCK_SIZE_V', rarity: 'epic', name: 'Večja Zaloga V', cost: 100000, type: 'stock_size', value: 5, desc: 'Zaloga +5 držav (Dodatno)' },

    // STOCK QUALITY (Custom 5 Tiers)
    STOCK_QUALITY_I: { id: 'STOCK_QUALITY_I', rarity: 'common', name: 'Kvalitetna Zaloga I', cost: 10000, type: 'stock_quality', value: 0.10, desc: 'Možnost za redke +10%' },
    STOCK_QUALITY_II: { id: 'STOCK_QUALITY_II', rarity: 'rare', name: 'Kvalitetna Zaloga II', cost: 25000, type: 'stock_quality', value: 0.10, desc: 'Možnost za redke +10% (Dodatno)' },
    STOCK_QUALITY_III: { id: 'STOCK_QUALITY_III', rarity: 'rare', name: 'Kvalitetna Zaloga III', cost: 45000, type: 'stock_quality', value: 0.10, desc: 'Možnost za redke +10% (Dodatno)' },
    STOCK_QUALITY_IV: { id: 'STOCK_QUALITY_IV', rarity: 'rare', name: 'Kvalitetna Zaloga IV', cost: 70000, type: 'stock_quality', value: 0.10, desc: 'Možnost za redke +10% (Dodatno)' },
    STOCK_QUALITY_V: { id: 'STOCK_QUALITY_V', rarity: 'epic', name: 'Kvalitetna Zaloga V', cost: 100000, type: 'stock_quality', value: 0.10, desc: 'Možnost za redke +10% (Dodatno)' },

    MULTI_LEVEL_R: { id: 'MULTI_LEVEL_R', rarity: 'rare', name: 'Dvojna Moč I', cost: 2500000, type: 'multi_level', value: 1, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +1 NIVO VEČ' },

    // EPIC
    MULTI_LEVEL_E: { id: 'MULTI_LEVEL_E', rarity: 'epic', name: 'Trojna Moč II', cost: 45000000, type: 'multi_level', value: 2, desc: 'VSAKIČ KO DRŽAVO KUPIŠ DOBIŠ +2 NIVOJA VEČ' },

    // LEVEL UNLOCKS (Required for upgrading countries)
    UNLOCK_LVL_1: { id: 'UNLOCK_LVL_1', rarity: 'common', name: 'Dovoljenje za Lvl 1', cost: 7500, type: 'unlock_level', value: 1, desc: 'Omogoči nadgradnjo držav na Level 1.' },
    UNLOCK_LVL_2: { id: 'UNLOCK_LVL_2', rarity: 'rare', name: 'Dovoljenje za Lvl 2', cost: 25000, type: 'unlock_level', value: 2, desc: 'Omogoči nadgradnjo držav na Level 2.' },
    UNLOCK_LVL_3: { id: 'UNLOCK_LVL_3', rarity: 'rare', name: 'Dovoljenje za Lvl 3', cost: 100000, type: 'unlock_level', value: 3, desc: 'Omogoči nadgradnjo držav na Level 3.' },
    UNLOCK_LVL_4: { id: 'UNLOCK_LVL_4', rarity: 'epic', name: 'Dovoljenje za Lvl 4', cost: 500000, type: 'unlock_level', value: 4, desc: 'Omogoči nadgradnjo držav na Level 4.' },
    UNLOCK_LVL_5: { id: 'UNLOCK_LVL_5', rarity: 'legendary', name: 'Dovoljenje za Lvl 5', cost: 2500000, type: 'unlock_level', value: 5, desc: 'Omogoči nadgradnjo držav na Level 5.' },

    // LEGENDARY+
    WORLD_MASTER: { id: 'WORLD_MASTER', rarity: 'og', name: 'Svetovni Mojster', cost: 2500000000, type: 'income', value: 9.0, desc: 'Celoten zaslužek se poveča za 10x' }
};

// Fixed assignments by Name
// User requested "Bigger = Better Rarity".
// We remove most hardcoded overrides to let Size determine Rarity.
// Keeping specific requests or corrections.
const FIXED_RARITIES = {
    // Specific user requests that might override logic if needed
    // 'Greenland': 'GODLY', // GDP logic should handle it if in GDP_DATA
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
    'Afghanistan': 'Afganistan', 'Albania': 'Albanija', 'Algeria': 'Alžirija', 'Andorra': 'Andora',
    'Angola': 'Angola', 'Antarctica': 'Antarktika', 'Antigua and Barbuda': 'Antigva in Barbuda',
    'Argentina': 'Argentina', 'Armenia': 'Armenija', 'Australia': 'Avstralija', 'Austria': 'Avstrija',
    'Azerbaijan': 'Azerbajdžan', 'Bahamas': 'Bahami', 'Bahamas, The': 'Bahami', 'Bahrain': 'Bahrajn',
    'Bangladesh': 'Bangladeš', 'Barbados': 'Barbados', 'Belarus': 'Belorusija', 'Belgium': 'Belgija',
    'Belize': 'Belize', 'Benin': 'Benin', 'Bhutan': 'Butan', 'Bolivia': 'Bolivija',
    'Bosnia and Herzegovina': 'Bosna in Hercegovina', 'Botswana': 'Bocvana', 'Brazil': 'Brazilija',
    'Brunei': 'Brunej', 'Brunei Darussalam': 'Brunej', 'Bulgaria': 'Bolgarija', 'Burkina Faso': 'Burkina Faso',
    'Burundi': 'Burundi', 'Cabo Verde': 'Zelenortski otoki', 'Cambodia': 'Kambodža', 'Cameroon': 'Kamerun',
    'Canada': 'Kanada', 'Central African Republic': 'Srednjeafriška republika', 'Chad': 'Čad',
    'Chile': 'Čile', 'China': 'Kitajska', 'Colombia': 'Kolumbija', 'Comoros': 'Komori',
    'Congo, Dem. Rep.': 'Kongo, Demokratična r.', 'Congo, Rep.': 'Kongo', 'Congo': 'Kongo',
    'Costa Rica': 'Kostarika', 'Cote d\'Ivoire': 'Slonokoščena obala', 'Côte d\'Ivoire': 'Slonokoščena obala',
    'Croatia': 'Hrvaška', 'Cuba': 'Kuba', 'Cyprus': 'Ciper', 'Czech Republic': 'Češka', 'Czechia': 'Češka',
    'Denmark': 'Danska', 'Djibouti': 'Džibuti', 'Dominica': 'Dominika', 'Dominican Republic': 'Dominikanska republika',
    'Ecuador': 'Ekvador', 'Egypt, Arab Rep.': 'Egipt', 'Egypt': 'Egipt', 'El Salvador': 'Salvador',
    'Equatorial Guinea': 'Ekvatorialna Gvineja', 'Eritrea': 'Eritreja', 'Estonia': 'Estonija',
    'Eswatini': 'Esvatini', 'Ethiopia': 'Etiopija', 'Fiji': 'Fidži', 'Finland': 'Finska',
    'France': 'Francija', 'Gabon': 'Gabon', 'Gambia, The': 'Gambija', 'Gambia': 'Gambija',
    'Georgia': 'Gruzija', 'Germany': 'Nemčija', 'Ghana': 'Gana', 'Greece': 'Grčija',
    'Greenland': 'Grenlandija', 'Grenada': 'Grenada', 'Guatemala': 'Gvatemala', 'Guinea': 'Gvineja',
    'Guinea-Bissau': 'Gvineja Bissau', 'Guyana': 'Gvajana', 'Haiti': 'Haiti',
    'Holy See (Vatican City)': 'Vatikan', 'Holy See': 'Vatikan', 'Vatican': 'Vatikan', 'Vatican City': 'Vatikan',
    'Honduras': 'Honduras', 'Hungary': 'Madžarska', 'Iceland': 'Islandija', 'India': 'Indija',
    'Indonesia': 'Indonezija', 'Iran, Islamic Rep.': 'Iran', 'Iran': 'Iran', 'Iraq': 'Irak',
    'Ireland': 'Irska', 'Israel': 'Izrael', 'Italy': 'Italija', 'Jamaica': 'Jamajka',
    'Japan': 'Japonska', 'Jordan': 'Jordanija', 'Kazakhstan': 'Kazahstan', 'Kenya': 'Kenija',
    'Kiribati': 'Kiribati', 'Korea, Dem. People\'s Rep.': 'Severna Koreja', 'North Korea': 'Severna Koreja',
    'Korea, Rep.': 'Južna Koreja', 'South Korea': 'Južna Koreja', 'Kuwait': 'Kuvajt',
    'Kyrgyz Republic': 'Kirgizija', 'Kyrgyzstan': 'Kirgizistan', 'Lao PDR': 'Laos', 'Laos': 'Laos',
    'Latvia': 'Latvija', 'Lebanon': 'Libanon', 'Lesotho': 'Lesoto', 'Liberia': 'Liberija',
    'Libya': 'Libija', 'Liechtenstein': 'Lihtenštajn', 'Lithuania': 'Litva', 'Luxembourg': 'Luksemburg',
    'Madagascar': 'Madagaskar', 'Malawi': 'Malavi', 'Malaysia': 'Malezija', 'Maldives': 'Maldivi',
    'Mali': 'Mali', 'Malta': 'Malta', 'Marshall Islands': 'Marshallovi otoki', 'Mauritania': 'Mavretanija',
    'Mauritius': 'Mauritius', 'Mexico': 'Mehika', 'Micronesia, Fed. Sts.': 'Mikronezija',
    'Micronesia': 'Mikronezija', 'Moldova': 'Moldavija', 'Monaco': 'Monako', 'Mongolia': 'Mongolija',
    'Montenegro': 'Črna gora', 'Morocco': 'Maroko', 'Mozambique': 'Mozambik', 'Myanmar': 'Mjanmar',
    'Namibia': 'Namibija', 'Nauru': 'Nauru', 'Nepal': 'Nepal', 'Netherlands': 'Nizozemska',
    'New Zealand': 'Nova Zelandija', 'Nicaragua': 'Nikaragva', 'Niger': 'Niger', 'Nigeria': 'Nigerija',
    'North Macedonia': 'Severna Makedonija', 'Norway': 'Norveška', 'Oman': 'Oman', 'Pakistan': 'Pakistan',
    'Palau': 'Palau', 'Panama': 'Panama', 'Papua New Guinea': 'Papua Nova Gvineja', 'Paraguay': 'Paragvaj',
    'Peru': 'Peru', 'Philippines': 'Filipini', 'Poland': 'Poljska', 'Portugal': 'Portugalska',
    'Qatar': 'Katar', 'Romania': 'Romunija', 'Russian Federation': 'Rusija', 'Russia': 'Rusija',
    'Rwanda': 'Ruanda', 'Samoa': 'Samoa', 'San Marino': 'San Marino', 'Sao Tome and Principe': 'Sao Tome in Principe',
    'Saudi Arabia': 'Savdska Arabija', 'Senegal': 'Senegal', 'Serbia': 'Srbija', 'Seychelles': 'Sejšeli',
    'Sierra Leone': 'Sierra Leone', 'Singapore': 'Singapur', 'Slovak Republic': 'Slovaška', 'Slovakia': 'Slovaška',
    'Slovenia': 'Slovenija', 'Solomon Islands': 'Salomonovi otoki', 'Somalia': 'Somalija',
    'South Africa': 'Južna Afrika', 'South Sudan': 'Južni Sudan', 'Spain': 'Španija', 'Sri Lanka': 'Šrilanka',
    'St. Kitts and Nevis': 'Sveti Krištof in Nevis', 'St. Lucia': 'Sveta Lucija',
    'St. Vincent and the Grenadines': 'Sveti Vincencij in Grenadine', 'State of Palestine': 'Palestina',
    'Palestine': 'Palestina', 'Sudan': 'Sudan', 'Suriname': 'Surinam', 'Sweden': 'Švedska',
    'Switzerland': 'Švica', 'Syrian Arab Republic': 'Sirija', 'Syria': 'Sirija', 'Tajikistan': 'Tadžikistan',
    'Tanzania': 'Tanzanija', 'Thailand': 'Tajska', 'Timor-Leste': 'Vzhodni Timor', 'Togo': 'Togo',
    'Tonga': 'Tonga', 'Trinidad and Tobago': 'Trinidad in Tobago', 'Tunisia': 'Tunizija',
    'Turkiye': 'Turčija', 'Turkey': 'Turčija', 'Turkmenistan': 'Turkmenistan', 'Tuvalu': 'Tuvalu',
    'Taiwan': 'Tajvan', 'Taiwan, China': 'Tajvan',
    'Uganda': 'Uganda', 'Ukraine': 'Ukrajina', 'United Arab Emirates': 'Združeni arabski emirati',
    'United Kingdom': 'Združeno kraljestvo', 'United States': 'Združene države Amerike', 'United States of America': 'Združene države Amerike',
    'Uruguay': 'Urugvaj', 'Uzbekistan': 'Uzbekistan', 'Vanuatu': 'Vanuatu', 'Venezuela, RB': 'Venezuela',
    'Venezuela': 'Venezuela', 'Viet Nam': 'Vietnam', 'Vietnam': 'Vietnam', 'Yemen, Rep.': 'Jemen',
    'Yemen': 'Jemen', 'Zambia': 'Zambija', 'Zimbabwe': 'Zimbabve',
    'United Republic of Tanzania': 'Tanzanija',
    'eSwatini': 'Esvatini', 'Democratic Republic of the Congo': 'Kongo, Demokratična r.',
    'Dem. Rep. Congo': 'Kongo, Demokratična r.', 'Somaliland': 'Somaliland',

    // Additional variations and "Republic of..." forms
    'Republic of Serbia': 'Srbija', 'Republic of Croatia': 'Hrvaška', 'Republic of Slovenia': 'Slovenija',
    'Republic of Poland': 'Poljska', 'Republic of Austria': 'Avstrija', 'Republic of Lithuania': 'Litva',
    'Republic of Latvia': 'Latvija', 'Republic of Estonia': 'Estonija', 'Republic of Belarus': 'Belorusija',
    'Republic of Moldova': 'Moldavija', 'Republic of Bulgaria': 'Bolgarija', 'Republic of Albania': 'Albanija',
    'Republic of Macedonia': 'Severna Makedonija', 'Republic of Kosovo': 'Kosovo', 'Republic of Cyprus': 'Ciper',
    'Republic of Turkey': 'Turčija', 'Republic of Armenia': 'Armenija', 'Republic of Georgia': 'Gruzija',
    'Republic of Azerbaijan': 'Azerbajdžan', 'Republic of Kazakhstan': 'Kazahstan', 'Republic of Uzbekistan': 'Uzbekistan',
    'Republic of Turkmenistan': 'Turkmenistan', 'Republic of Tajikistan': 'Tadžikistan', 'Republic of Kyrgyzstan': 'Kirgizistan',
    'Republic of Afghanistan': 'Afganistan', 'Republic of Iraq': 'Irak', 'Republic of Yemen': 'Jemen',
    'Republic of India': 'Indija', 'Republic of Indonesia': 'Indonezija', 'Republic of the Philippines': 'Filipini',
    'Republic of Singapore': 'Singapur', 'Republic of Korea': 'Južna Koreja', 'Republic of China': 'Kitajska',
    'People\'s Republic of China': 'Kitajska', 'Republic of South Africa': 'Južna Afrika', 'Republic of Kenya': 'Kenija',
    'Republic of Uganda': 'Uganda', 'Republic of Tanzania': 'Tanzanija', 'Republic of Zambia': 'Zambija',
    'Republic of Zimbabwe': 'Zimbabve', 'Republic of Botswana': 'Bocvana', 'Republic of Namibia': 'Namibija',
    'Republic of Angola': 'Angola', 'Republic of Mozambique': 'Mozambik', 'Republic of Madagascar': 'Madagaskar',
    'Republic of Cameroon': 'Kamerun', 'Republic of Ghana': 'Gana', 'Republic of Senegal': 'Senegal',
    'Republic of Mali': 'Mali', 'Republic of Niger': 'Niger', 'Republic of Chad': 'Čad',
    'Republic of Sudan': 'Sudan', 'Republic of Tunisia': 'Tunizija', 'Republic of Algeria': 'Alžirija',
    'Republic of Peru': 'Peru', 'Republic of Chile': 'Čile', 'Republic of Argentina': 'Argentina',
    'Republic of Paraguay': 'Paragvaj', 'Republic of Uruguay': 'Urugvaj', 'Republic of Ecuador': 'Ekvador',
    'Republic of Colombia': 'Kolumbija', 'Republic of Venezuela': 'Venezuela', 'Republic of Panama': 'Panama',
    'Republic of Costa Rica': 'Kostarika',
    'Republic of Nicaragua': 'Nikaragva', 'Republic of Honduras': 'Honduras',
    'Republic of El Salvador': 'Salvador', 'Republic of Guatemala': 'Gvatemala', 'Federative Republic of Brazil': 'Brazilija',
    'French Republic': 'Francija', 'Federal Republic of Germany': 'Nemčija', 'Italian Republic': 'Italija',
    'Hellenic Republic': 'Grčija', 'Portuguese Republic': 'Portugalska', 'Kingdom of Spain': 'Španija',
    'Kingdom of Norway': 'Norveška', 'Kingdom of Sweden': 'Švedska', 'Kingdom of Denmark': 'Danska',
    'Kingdom of Belgium': 'Belgija', 'Kingdom of the Netherlands': 'Nizozemska', 'Kingdom of Thailand': 'Tajska',
    'Kingdom of Saudi Arabia': 'Savdska Arabija', 'Kingdom of Morocco': 'Maroko', 'Hashemite Kingdom of Jordan': 'Jordanija',
    'Swiss Confederation': 'Švica', 'Republic of Finland': 'Finska', 'Republic of Iceland': 'Islandija',
    'Islamic Republic of Iran': 'Iran', 'Islamic Republic of Pakistan': 'Pakistan', 'Islamic Republic of Afghanistan': 'Afganistan',
    'State of Libya': 'Libija', 'State of Palestine': 'Palestina', 'State of Israel': 'Izrael',
    'State of Kuwait': 'Kuvajt', 'State of Qatar': 'Katar', 'Lao People\'s Democratic Republic': 'Laos',
    'Socialist Republic of Vietnam': 'Vietnam', 'Democratic People\'s Republic of Korea': 'Severna Koreja',
    'Democratic Socialist Republic of Sri Lanka': 'Šrilanka', 'Union of Myanmar': 'Mjanmar',
    'Republic of the Union of Myanmar': 'Mjanmar', 'Oriental Republic of Uruguay': 'Urugvaj',
    'Plurinational State of Bolivia': 'Bolivija', 'Bolivarian Republic of Venezuela': 'Venezuela',
    'Co-operative Republic of Guyana': 'Gvajana', 'Republic of Suriname': 'Surinam', 'Gabonese Republic': 'Gabon',
    'Togolese Republic': 'Togo', 'Republic of Benin': 'Benin', 'Republic of Guinea': 'Gvineja',
    'Republic of Sierra Leone': 'Sierra Leone', 'Republic of Liberia': 'Liberija', 'Republic of Malawi': 'Malavi',
    'Republic of Rwanda': 'Ruanda', 'Republic of Burundi': 'Burundi', 'Somali Republic': 'Somalija',
    'Federal Democratic Republic of Ethiopia': 'Etiopija', 'State of Eritrea': 'Eritreja', 'Republic of Djibouti': 'Džibuti',
    'Sultanate of Oman': 'Oman', 'Republic of Seychelles': 'Sejšeli',
    'Republic of Mauritius': 'Mauritius', 'Islamic Republic of Mauritania': 'Mavretanija', 'Republic of Cabo Verde': 'Zelenortski otoki',
    'Democratic Republic of Sao Tome and Principe': 'Sao Tome in Principe', 'Republic of Equatorial Guinea': 'Ekvatorialna Gvineja',
    'Republic of the Gambia': 'Gambija', 'Republic of Guinea-Bissau': 'Gvineja Bissau', 'Republic of Haiti': 'Haiti',
    'Commonwealth of Dominica': 'Dominika', 'Republic of Cuba': 'Kuba', 'Republic of Trinidad and Tobago': 'Trinidad in Tobago',
    'Federation of Saint Kitts and Nevis': 'Sveti Krištof in Nevis', 'Commonwealth of the Bahamas': 'Bahami',
    'Independent State of Papua New Guinea': 'Papua Nova Gvineja', 'Republic of Vanuatu': 'Vanuatu',
    'Independent State of Samoa': 'Samoa', 'Kingdom of Tonga': 'Tonga', 'Republic of Kiribati': 'Kiribati',
    'Federated States of Micronesia': 'Mikronezija', 'Republic of the Marshall Islands': 'Marshallovi otoki',
    'Republic of Palau': 'Palau', 'Republic of Nauru': 'Nauru', 'Commonwealth of Australia': 'Avstralija',
    'Republic of Maldives': 'Maldivi', 'Federal Democratic Republic of Nepal': 'Nepal', 'Kingdom of Bhutan': 'Butan',
    'People\'s Republic of Bangladesh': 'Bangladeš', 'Republic of Malta': 'Malta', 'Republic of San Marino': 'San Marino',
    'Principality of Andorra': 'Andora', 'Principality of Monaco': 'Monako', 'Principality of Liechtenstein': 'Lihtenštajn',
    'Grand Duchy of Luxembourg': 'Luksemburg', 'Vatican City State': 'Vatikan', 'Republic of Ireland': 'Irska',
    'United Kingdom of Great Britain and Northern Ireland': 'Združeno kraljestvo', 'Kingdom of Lesotho': 'Lesoto',
    'Kingdom of Eswatini': 'Esvatini', 'Republic of South Sudan': 'Južni Sudan', 'Union of the Comoros': 'Komori',
    'Republic of the Congo': 'Kongo', 'Democratic Republic of Timor-Leste': 'Vzhodni Timor',
    'Cabo Verde': 'Zelenortski otoki',

    // Territories and Dependencies
    'Northern Mariana Islands': 'Severni Marijanski otoki', 'US Virgin Islands': 'Ameriški Deviški otoki',
    'Saint Pierre and Miquelon': 'Sveti Peter in Miquelon', 'Saint Barthelemy': 'Sveti Bartolomej',
    'Saint Martin': 'Sveti Martin', 'Caribbean Netherlands': 'Karibska Nizozemska',
    'South Georgia and the South Sandwich Islands': 'Južna Georgia in Južni Sandwichevi otoki',
    'South Georgia and the Islands': 'Južna Georgia in otočje',
    'French Southern and Antarctic Lands': 'Francoska južna in antarktična ozemlja', 'British Indian Ocean Territory': 'Britansko ozemlje v Indijskem oceanu',
    'Aland Islands': 'Ålandski otoki', 'Western Sahara': 'Zahodna Sahara', 'Sahrawi Arab Democratic Republic': 'Zahodna Sahara',
    'Northern Cyprus': 'Severni Ciper', 'Faroe Islands': 'Ferski otoki', 'Southern Patagonian Ice Field': 'Južnopatagonsko ledeno polje'
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
    challengeTimer: 600,
    sanitationMultiplier: 1, // Legacy, kept for some compatibility
    sanitationPenalty: 0, // Accumulated 10% penalties from hits
    rankPoints: 0,
    rankCoins: 0,
    ownedSkins: ['classic'],
    equippedSkin: 'classic',
    ownedBackgrounds: ['default'],
    equippedBackground: 'default',
    uncollectedRewards: 0,
    newlyReachedRanks: [], // IDs of ranks reached but rewards not yet collected
    paused: false,
    asteroidTimeRemaining: 0,
    startingCountryClaimed: false,
    purchaseCount: 0
};

let map;
let geoJsonLayer;

const moneyDisplay = document.getElementById('money-display');
const cpsDisplay = document.getElementById('cps-display');
const countryList = document.getElementById('country-list');
const logList = document.getElementById('log-list');
const asteroidOverlay = document.getElementById('asteroid-overlay');
const rankDisplay = document.getElementById('rank-display');

function getCurrentRank() {
    let current = GAME_RANKS[0];
    for (let r of GAME_RANKS) {
        if (state.rankPoints >= r.minPoints) {
            current = r;
        } else {
            break;
        }
    }
    return current;
}

function updateRankDisplay() {
    if (!rankDisplay) return;
    const rank = getCurrentRank();
    rankDisplay.textContent = rank.name;
    rankDisplay.style.color = rank.color;

    // Add special effect for King
    if (rank.name === 'Kralj') {
        rankDisplay.classList.add('text-rainbow');
    } else {
        rankDisplay.classList.remove('text-rainbow');
    }
}

function addRankPoints(amount) {
    const oldRank = getCurrentRank();
    state.rankPoints += amount;
    const newRank = getCurrentRank();

    if (newRank.minPoints > oldRank.minPoints) {
        // Promoted! Find all ranks reached in between
        let foundOld = false;
        GAME_RANKS.forEach(r => {
            if (foundOld && state.rankPoints >= r.minPoints) {
                if (!state.newlyReachedRanks.includes(r.name)) {
                    state.newlyReachedRanks.push(r.name);
                    state.uncollectedRewards += (r.reward || 0);
                }
            }
            if (r.name === oldRank.name) foundOld = true;
        });

        // Silently update notifications but DON'T log if in game (or according to "nemoreš videti")
        // If we want it HIDDEN during game, we avoid LOGGING it too.
        // logEvent(`DOSEGEL SI NOV RANK: ${newRank.name}! Odpri 'Pregled Rankov', da prevzameš nagrado.`, 'good'); 
        updateRankNotifications();
    }

    // updateRankDisplay(); // DISABLED during game as requested: "ga ne vidiš"
    updateUI();
}

function updateRankNotifications() {
    const dot = document.getElementById('rank-notification');
    if (!dot) return;

    if (state.uncollectedRewards > 0) {
        dot.classList.remove('hidden');
    } else {
        dot.classList.add('hidden');
    }
}

async function initGame() {
    initMap();
    setupZoomControls();
    setupEventListeners();
    replenishStock();
    startGameLoop();
    scheduleAsteroidShower();
    updateUI();

    // Auto-pause on resume
    if (state.challengeTimer > 0 && state.challengeTimer < 600) {
        if (!state.paused) togglePause();
    }
}

function initMap() {
    if (map) return; // Already initialized
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

let zoomControlsInitialized = false;
function setupZoomControls() {
    if (zoomControlsInitialized) return;
    zoomControlsInitialized = true;
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
            const iso2 = feature.properties.ISO_A2 || feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2'] || null;

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

        // Process all final countries
        finalCountries.forEach((c, index) => {
            // GDP Lookup
            let gdp = GDP_DATA[c.name] || GDP_DATA[c.id] || 0;

            // Fallback for missing GDP (consistent with lower end of data)
            if (!gdp) {
                gdp = 1000;
            }

            // Determine Rarity by GDP
            let rarityMode = 'COMMON';
            if (gdp >= 120000) rarityMode = 'GODLY';
            else if (gdp >= 60000) rarityMode = 'MYTHIC';
            else if (gdp >= 30000) rarityMode = 'LEGENDARY';
            else if (gdp >= 10000) rarityMode = 'EPIC';
            else if (gdp >= 2000) rarityMode = 'RARE';
            else rarityMode = 'COMMON';

            // Manual Overrides
            if (FIXED_RARITIES[c.name]) {
                rarityMode = FIXED_RARITIES[c.name];
            }

            const rarity = RARITIES[rarityMode];

            // Cost IS the GDP per capita
            const baseCost = gdp;

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
                baseIncome: (baseCost / 100) * (rarity.multiplier || 1), // 1% ROI weighted by rarity
                baseIncome: (baseCost / 100) * (rarity.multiplier || 1), // 1% ROI weighted by rarity
                realColor: getRealColor(c.name, c.lat),
                iso2: c.feature.properties.ISO_A2 || c.feature.properties.iso_a2 || null
            };
        });
        // Create a set of IDs for the final 198 countries for efficient lookup
        const finalIds = new Set(finalCountries.map(c => c.id));

        // Filter the original GeoJSON features to only include those in finalIds
        const filteredFeatures = data.features.filter(f => finalIds.has(f.id || f.properties.name || f.properties.ADMIN));
        const filteredData = { ...data, features: filteredFeatures };

        if (geoJsonLayer && map) map.removeLayer(geoJsonLayer);
        // createFlagPatterns(); // Removed as requested to revert to colors
        geoJsonLayer = L.geoJSON(filteredData, { style: styleFeature, onEachFeature: onEachFeature }).addTo(map);
        renderShop();
    } catch (e) { console.error(e); }
}

// --- Stock Logic ---

function isCountryLocked(c) {
    if (!c.owned) return false;

    // We want Permit X to allow upgrading FROM Level X.
    // e.g. Permit 1 allows Lvl 1 -> Lvl 2.
    // Permit 5 allows Lvl 5 -> Lvl 6 (and beyond).
    const levelParams = Math.min(c.level, 5);
    return !state.ownedUpgrades.has(`UNLOCK_LVL_${levelParams}`);
}

function replenishStock() {
    // 1. Reset current stock
    Object.values(state.countries).forEach(c => c.inStock = false);

    const maxStock = getEffectiveStockAmount();
    let currentStockCount = 0;

    // 2. Guaranteed Stock: All destroyed countries (Priority)
    // We treat them as part of the stock quota? 
    // Usually destroyed items appear ON TOP of normal stock or ARE the stock.
    // Let's include them.
    const destroyedCountries = Object.values(state.countries).filter(c => c.destroyed);
    destroyedCountries.forEach(c => {
        c.inStock = true;
        currentStockCount++;
    });

    // 3. Separate Candidates
    const candidates = Object.values(state.countries).filter(c => !c.destroyed && !c.inStock);
    // (Excluding those we just added)

    const lockedCandidates = candidates.filter(c => isCountryLocked(c));
    const unlockedCandidates = candidates.filter(c => !isCountryLocked(c));

    // 4. Fill Locked Quota (Max 10% of maxStock)
    const maxLockedParams = Math.floor(maxStock * 0.1); // e.g. 30 * 0.1 = 3

    // Shuffle locked candidates to pick random ones
    lockedCandidates.sort(() => Math.random() - 0.5);

    for (const c of lockedCandidates) {
        if (currentStockCount >= maxStock) break; // Should unlikely happen so early
        // Check if we already have enough locked items?
        // We just started filling non-destroyed. 
        // We only want to add a *few* locked ones.
        // Let's count how many we add in this loop.
        // Actually, we should check `lockedCandidates` added count.
        // Let's iterate `maxLockedParams` times.
    }

    let lockedAdded = 0;
    for (const c of lockedCandidates) {
        if (lockedAdded >= maxLockedParams) break;
        if (currentStockCount >= maxStock) break;
        c.inStock = true;
        currentStockCount++;
        lockedAdded++;
    }

    // 5. Fill remaining with Unlocked Candidates
    // Strategy: Prefer Affordable (Cheap) ones first, then Random.
    // Sort unlocked by Cost
    unlockedCandidates.sort((a, b) => a.baseCost - b.baseCost); // Base sort by cost

    // Pick a mix: 
    // We want to fill `stockNeeded` slots.
    // Let's take the first N cheapest to ensure playability.
    // But also mix in some expensive/rare ones.
    // Let's shuffle the *list* but loosely?
    // Actually `unlockedCandidates` includes Unowned (Cheap) and Owned-Unlocked (Upgrades).
    // Let's just pick strictly affordable ones first to help progression?
    // Or just shuffle?
    // Default logic was: 30 affordable ones, pick 10. Then random.

    // Let's stick to: Shuffle affordable subset.
    const affordableSubset = unlockedCandidates.slice(0, 30);
    affordableSubset.sort(() => Math.random() - 0.5);

    // Pick from affordable
    const slotsForAffordable = Math.min(affordableSubset.length, Math.max(5, Math.floor((maxStock - currentStockCount) * 0.6)));
    // Fill 60% of remaining space with cheap stuff

    for (const c of affordableSubset) {
        if (!c.inStock && currentStockCount < maxStock && slotsForAffordable > 0) {
            c.inStock = true;
            currentStockCount++;
            // Remove from main candidate list to avoid duplicates logic? 
            // `c.inStock` is the flag.
        }
    }

    // Fill the VERY rest with completely random remaining unlocked
    const remainingUnlocked = unlockedCandidates.filter(c => !c.inStock);
    remainingUnlocked.sort(() => Math.random() - 0.5);

    for (const c of remainingUnlocked) {
        if (currentStockCount >= maxStock) break;
        // Use rarity weight
        const rarityMult = getEffectiveRarityMultiplier();
        if (Math.random() * 100 < (c.rarity.weight * rarityMult)) {
            c.inStock = true;
            currentStockCount++;
        }
    }

    // Force fill if understocked (Fallback)
    if (currentStockCount < maxStock) {
        const stillRemaining = unlockedCandidates.filter(c => !c.inStock);
        for (const c of stillRemaining) {
            if (currentStockCount >= maxStock) break;
            c.inStock = true;
            currentStockCount++;
        }
    }

    logEvent(`Nova zaloga: ${currentStockCount} držav (Locked: ${lockedAdded})`, 'good');
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
        return { fillColor: '#050505', color: '#ff0000', weight: 2, fillOpacity: 1, opacity: 1, dashArray: '' };
    }

    if (country && country.owned) {
        let fillColor = country.realColor;

        // Apply Skin logic
        if (state.equippedSkin === 'neon') {
            const neonColors = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff0000'];
            fillColor = neonColors[Math.floor(country.rarity.rank) % neonColors.length];
        } else if (state.equippedSkin === 'gold') {
            const goldColors = ['#ffd700', '#e6c200', '#b8860b', '#daa520', '#fce883'];
            fillColor = goldColors[Math.floor(country.rarity.rank) % goldColors.length];
        } else if (state.equippedSkin === 'cyber') {
            const cyberColors = ['#2d004d', '#1a0033', '#004d4d', '#4d0026', '#330033'];
            fillColor = cyberColors[Math.floor(country.rarity.rank) % cyberColors.length];
        } else if (state.equippedSkin === 'lava') {
            const lavaColors = ['#991b1b', '#b91c1c', '#dc2626', '#f87171', '#fbbf24'];
            fillColor = lavaColors[Math.floor(country.rarity.rank) % lavaColors.length];
        } else if (state.equippedSkin === 'matrix') {
            const greenTones = ['#052e16', '#14532d', '#166534', '#15803d', '#16a34a'];
            fillColor = greenTones[Math.floor(country.rarity.rank) % greenTones.length];
        } else if (state.equippedSkin === 'flags') {
            const flagColors = ['#ef4444', '#3b82f6', '#ffffff', '#22c55e', '#eab308', '#000000'];
            fillColor = flagColors[country.id.length % flagColors.length];
        } else if (state.equippedSkin === 'ghost') {
            const ghostColors = ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];
            fillColor = ghostColors[Math.floor(country.rarity.rank) % ghostColors.length];
            return { fillColor: fillColor, weight: 1, opacity: 0.4, color: '#93c5fd', fillOpacity: 0.3, dashArray: '3' };
        } else if (state.equippedSkin === 'nature') {
            const natureColors = ['#166534', '#15803d', '#3f6212', '#4d7c0f', '#854d0e'];
            fillColor = natureColors[Math.floor(country.rarity.rank) % natureColors.length];
        } else if (state.equippedSkin === 'ocean_skin') {
            const oceanSkinColors = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
            fillColor = oceanSkinColors[Math.floor(country.rarity.rank) % oceanSkinColors.length];
        } else if (state.equippedSkin === 'sky_skin') {
            const skySkinColors = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'];
            fillColor = skySkinColors[Math.floor(country.rarity.rank) % skySkinColors.length];
        } else if (state.equippedSkin === 'diamond_skin') {
            const diamondColors = ['#b9f2ff', '#e0f2fe', '#f0f9ff', '#d1d5db', '#ffffff'];
            fillColor = diamondColors[Math.floor(country.rarity.rank) % diamondColors.length];
        } else if (state.equippedSkin === 'retro_skin') {
            const retroColors = ['#f472b6', '#db2777', '#9333ea', '#7c3aed', '#2563eb'];
            fillColor = retroColors[Math.floor(country.rarity.rank) % retroColors.length];
        } else if (state.equippedSkin === 'fire') {
            const fireColors = ['#991b1b', '#b91c1c', '#ea580c', '#f97316', '#fbbf24'];
            fillColor = fireColors[Math.floor(country.rarity.rank) % fireColors.length];
        } else if (state.equippedSkin === 'ice') {
            const iceColors = ['#0891b2', '#06b6d4', '#67e8f9', '#cffafe', '#ffffff'];
            fillColor = iceColors[Math.floor(country.rarity.rank) % iceColors.length];
        } else if (state.equippedSkin === 'toxic') {
            const toxicColors = ['#14532d', '#166534', '#65a30d', '#a3e635', '#bef264'];
            fillColor = toxicColors[Math.floor(country.rarity.rank) % toxicColors.length];
        } else if (state.equippedSkin === 'royal') {
            const royalColors = ['#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa'];
            fillColor = royalColors[Math.floor(country.rarity.rank) % royalColors.length];
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#ffd700', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'rainbow') {
            const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
            fillColor = rainbowColors[Math.floor(country.rarity.rank) % rainbowColors.length];
        } else if (state.equippedSkin === 'blood_moon') {
            const bloodColors = ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#500724'];
            fillColor = bloodColors[Math.floor(country.rarity.rank) % bloodColors.length];
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#000000', fillOpacity: 1 };
        } else if (state.equippedSkin === 'spirit') {
            const spiritColors = ['#ffffff', '#f0f9ff', '#e0f2fe', '#dbeafe', '#eff6ff'];
            fillColor = spiritColors[Math.floor(country.rarity.rank) % spiritColors.length];
            return { fillColor: fillColor, weight: 1.5, opacity: 0.8, color: '#60a5fa', fillOpacity: 0.6, dashArray: '5,5' };
        } else if (state.equippedSkin === 'silver') {
            const silverColors = ['#d1d5db', '#9ca3af', '#6b7280', '#e5e7eb', '#f3f4f6'];
            fillColor = silverColors[Math.floor(country.rarity.rank) % silverColors.length];
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#9ca3af', fillOpacity: 0.9 };
            const royalColors = ['#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa'];
            fillColor = royalColors[country.rarity.rank % royalColors.length];
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#ffd700', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'shadow') {
            fillColor = '#000000';
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#ffffff', fillOpacity: 1 };
        } else if (state.equippedSkin === 'rainbow') {
            const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
            fillColor = rainbowColors[Math.floor(country.rarity.rank) % rainbowColors.length];
        } else if (state.equippedSkin === 'emerald') {
            const emeraldColors = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981'];
            fillColor = emeraldColors[Math.floor(country.rarity.rank) % emeraldColors.length];
        } else if (state.equippedSkin === 'ruby') {
            const rubyColors = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444'];
            fillColor = rubyColors[Math.floor(country.rarity.rank) % rubyColors.length];
        } else if (state.equippedSkin === 'sapphire') {
            const sapphireColors = ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'];
            fillColor = sapphireColors[Math.floor(country.rarity.rank) % sapphireColors.length];
        } else if (state.equippedSkin === 'blood_moon') {
            fillColor = '#450a0a';
            return { fillColor: fillColor, weight: 1.5, opacity: 1, color: '#000', fillOpacity: 1 };
        } else if (state.equippedSkin === 'spirit') {
            fillColor = '#ffffff';
            return { fillColor: fillColor, weight: 1, opacity: 0.6, color: '#60a5fa', fillOpacity: 0.5, dashArray: '5,5' };
        } else if (state.equippedSkin === 'void') {
            fillColor = '#000000';
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#4c1d95', fillOpacity: 1 };
        } else if (state.equippedSkin === 'cyber_glow') {
            fillColor = '#06b6d4';
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#22d3ee', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'obsidian') {
            fillColor = '#000000';
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#a855f7', fillOpacity: 1 };
        } else if (state.equippedSkin === 'crystal') {
            fillColor = '#e0f2fe';
            return { fillColor: fillColor, weight: 1, opacity: 0.5, color: '#f8fafc', fillOpacity: 0.3 };
        } else if (state.equippedSkin === 'sun_god') {
            fillColor = '#fef08a';
            return { fillColor: fillColor, weight: 3, opacity: 1, color: '#fbbf24', fillOpacity: 1 };
        } else if (state.equippedSkin === 'galaxy_skin') {
            const galaxyColors = ['#2e1065', '#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6'];
            fillColor = galaxyColors[country.rarity.rank % galaxyColors.length];
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#f0f9ff', fillOpacity: 0.8 };
        } else if (state.equippedSkin === 'ethereal') {
            fillColor = '#f8fafc';
            return { fillColor: fillColor, weight: 1.5, opacity: 0.3, color: '#fff', fillOpacity: 0.2, dashArray: '2,4' };
        } else if (state.equippedSkin === 'warlord') {
            fillColor = '#7f1d1d';
            return { fillColor: fillColor, weight: 4, opacity: 1, color: '#000', fillOpacity: 1 };
        }

        return { fillColor: fillColor, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.9 };
    }

    // Unowned Countries - Styling based on equipped skin for better immersion
    let unownedFill = '#1e293b'; // Default standard dark blue-grey
    let unownedStroke = '#334155';

    if (state.equippedSkin === 'neon') {
        unownedFill = '#2e1065'; // Dark Purple
        unownedStroke = '#4c1d95';
    } else if (state.equippedSkin === 'gold') {
        unownedFill = '#422006'; // Dark Bronze
        unownedStroke = '#713f12';
    } else if (state.equippedSkin === 'cyber') {
        unownedFill = '#0f172a'; // Deep Navy
        unownedStroke = '#1e293b';
    } else if (state.equippedSkin === 'lava' || state.equippedSkin === 'fire') {
        unownedFill = '#2a0a0a'; // Dark Red/Brown
        unownedStroke = '#450a0a';
    } else if (state.equippedSkin === 'matrix') {
        unownedFill = '#052005'; // Very dark green
        unownedStroke = '#14532d';
    } else if (state.equippedSkin === 'ghost') {
        unownedFill = '#0f172a';
        unownedStroke = '#1e293b';
    } else if (state.equippedSkin === 'nature') {
        unownedFill = '#14532d'; // Dark Green
        unownedStroke = '#166534';
    } else if (state.equippedSkin === 'ocean_skin') {
        unownedFill = '#0c4a6e'; // Dark Ocean
        unownedStroke = '#075985';
    } else if (state.equippedSkin === 'ice') {
        unownedFill = '#164e63'; // Dark Cyan
        unownedStroke = '#155e75';
    } else if (state.equippedSkin === 'royal') {
        unownedFill = '#2e1065'; // Royal Dark
        unownedStroke = '#5b21b6';
    } else if (state.equippedSkin === 'blood_moon') {
        unownedFill = '#2a0a0a';
        unownedStroke = '#450a0a';
    } else if (state.equippedSkin === 'sun_god') {
        unownedFill = '#422006';
        unownedStroke = '#a16207';
    } else if (state.equippedSkin === 'galaxy_skin') {
        unownedFill = '#1e1b4b'; // Deep Indigo
        unownedStroke = '#312e81';
    } else if (state.equippedSkin === 'void') {
        unownedFill = '#000000';
        unownedStroke = '#262626';
    }

    return { fillColor: unownedFill, weight: 0.5, opacity: 1, color: unownedStroke, fillOpacity: 1 };
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

let eventListenersInitialized = false;
function setupEventListeners() {
    if (eventListenersInitialized) return;
    eventListenersInitialized = true;
    // Click button
    const clickBtn = document.getElementById('click-btn');
    if (clickBtn) {
        clickBtn.addEventListener('click', () => {
            addMoney(10);
        });
        // Add minimal animation
        clickBtn.addEventListener('mousedown', () => clickBtn.style.transform = 'scale(0.95)');
        clickBtn.addEventListener('mouseup', () => clickBtn.style.transform = 'scale(1)');
    }


    // Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const isMobile = window.innerWidth < 768;
            const targetTab = tab.dataset.tab;

            if (isMobile) {
                openMobileTab(targetTab);
                return;
            }

            // Deactivate all
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            // Activate current
            tab.classList.add('active');
            const targetId = `tab-${targetTab}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.remove('hidden');

            if (targetTab === 'collection') {
                renderCollectionList();
            }
        });
    });

    // Mobile modal close
    const closeMobileTabBtn = document.getElementById('close-mobile-tab-btn');
    if (closeMobileTabBtn) {
        closeMobileTabBtn.addEventListener('click', () => {
            const modalBody = document.getElementById('mobile-tab-body');
            const controlsPanel = document.getElementById('controls-panel');
            if (modalBody && controlsPanel && modalBody.firstChild) {
                // Move content back to sidebar/bottom panel
                controlsPanel.appendChild(modalBody.firstChild);
            }
            document.getElementById('mobile-tab-modal').classList.add('hidden');
        });
    }

    // Pause / Resume
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
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

        // Removed dynamic zoom every 5th purchase as requested
        state.purchaseCount++;
    }
}

function startGameLoop() {
    // 10Hz Smooth Loop
    window.gameLoopInterval = setInterval(() => {
        if (state.paused) return;

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
        const sanitationCost = getDestroyedIncome();
        const netIncomeTick = (totalIncome - sanitationCost) / 10;

        state.money += netIncomeTick;

        if (state.money < 0) {
            state.money = 0;
            updateUI();
            endGame(true); // Pass true to indicate bankruptcy
            return;
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
        const restorationDisplay = document.getElementById('restoration-display');
        if (restorationDisplay) {
            restorationDisplay.style.color = '#ef4444'; // Always red as requested
            if (sanitationCost > 0) {
                restorationDisplay.textContent = `-${formatMoney(sanitationCost)}/s`;
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
    let basePenalty = 0;
    Object.values(state.countries).forEach(c => {
        if (c.destroyed) {
            // Requirement 1: Penalty equals the income it would give
            basePenalty += getCurrentIncome(c);
        }
    });
    // Requirement 2: Plus the accumulated permanent penalty (10% per hit)
    return Math.floor(basePenalty + (state.sanitationPenalty || 0));
}

// Helper functions for level-based calculations
function getCurrentCost(country) {
    if (country.destroyed) return Math.floor(country.baseCost * 3);
    if (!country.owned) return country.baseCost;
    // Upgrade Cost: "1x dražja kot lvl 0" per level
    // Linear Scaling: Base * (Level + 1)
    // Example: Base 1000. Lvl 0 Buy = 1000. Lvl 1 Upgrade = 2000. Lvl 2 Upgrade = 3000.
    return Math.floor(country.baseCost * (country.level + 1));
}

function getCurrentIncome(country) {
    if (!country.owned) return country.baseIncome;
    // Linear scaling: Each level adds 1x the base income.
    // Lvl 1 = 1 * Base, Lvl 2 = 2 * Base, Lvl 3 = 3 * Base...
    return Math.floor(country.baseIncome * country.level);
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
    if (state.paused) return; // Should not happen due to clearTimeout on pause
    triggerAsteroidShower();
}

function togglePause() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen && !startScreen.classList.contains('hidden')) return; // No pause on main screen
    if (state.challengeTimer <= 0) return; // Game not active or ended

    state.paused = !state.paused;
    const overlay = document.getElementById('pause-overlay');

    if (state.paused) {
        overlay.classList.remove('hidden');
        // Stop asteroid timer
        if (window.asteroidTransitionTimer) {
            state.asteroidTimeRemaining = Math.max(0, nextAsteroidTime - Date.now());
            clearTimeout(window.asteroidTransitionTimer);
            window.asteroidTransitionTimer = null;
        }
        // Stop shower timer if active
        if (window.asteroidShowerTimer) {
            clearTimeout(window.asteroidShowerTimer);
            window.asteroidShowerTimer = null;
            asteroidOverlay.classList.remove('active');
        }
        // Stop music maybe? Optional, user didn't ask but "everything stops"
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) bgMusic.pause();
    } else {
        overlay.classList.add('hidden');
        // Resume asteroid timer
        if (state.asteroidTimeRemaining > 0) {
            nextAsteroidTime = Date.now() + state.asteroidTimeRemaining;
            window.asteroidTransitionTimer = setTimeout(handleAsteroidCycleEnd, state.asteroidTimeRemaining);
        }
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) bgMusic.play().catch(() => { });
    }
}

function updateAsteroidTimer() {
    const elem = document.getElementById('asteroid-timer');
    if (!elem) return;

    if (state.paused) {
        elem.textContent = "PAVZA";
        return;
    }

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
    // Clear previous breaking news
    clearBreakingNews();

    asteroidOverlay.classList.add('active');
    logEvent("ASTEROIDNI ROJ SE JE ZAČEL!", "bad");

    window.asteroidShowerTimer = setTimeout(() => {
        asteroidOverlay.classList.remove('active');
        window.asteroidShowerTimer = null;
        if (!state.paused) {
            // Start new cycle first to establish nextAsteroidTime for the ticker
            startAsteroidTimer();
            processAsteroidHits();
        } else {
            startAsteroidTimer();
        }
        logEvent("Asteroidni roj se je končal.", "neutral");
    }, 5000);
}

function animateAsteroid(target, callback) {
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

    let finalX, finalY;
    if (target.lat !== undefined) {
        // Target is latlng
        const targetPoint = map.latLngToContainerPoint(target);
        const mapBounds = document.getElementById('map').getBoundingClientRect();
        finalX = mapBounds.left + targetPoint.x;
        finalY = mapBounds.top + targetPoint.y;
    } else {
        // Target is screen coords {x, y}
        finalX = target.x;
        finalY = target.y;
    }

    // Start position: slightly off-screen top left
    const startX = -200;
    const startY = -100;

    // Calculate angle
    const angle = Math.atan2(finalY - startY, finalX - startX) * 180 / Math.PI;

    // Set initial state
    asteroid.style.left = `${startX - 100}px`;
    asteroid.style.top = `${startY - 2}px`;
    asteroid.style.transform = `rotate(${angle}deg)`;
    asteroid.style.opacity = '1';

    // Force reflow
    asteroid.offsetHeight;

    // Transition to target
    asteroid.style.left = `${finalX - 100}px`;
    asteroid.style.top = `${finalY - 2}px`;

    setTimeout(() => {
        // Impact ripple only for map hits
        if (target.lat !== undefined) {
            createImpactRipple(target);
        } else {
            // Screen hit (like money banner) - add some flavor
            const targetElem = document.elementFromPoint(finalX, finalY);
            if (targetElem) {
                targetElem.style.animation = 'impactShake 0.5s ease-in-out';
                setTimeout(() => targetElem.style.animation = '', 500);
            }
        }

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
    if (state.paused) return; // SAFETY: Never hit anything while paused

    // Endgame Scaling Logic
    const timeElapsed = 600 - state.challengeTimer;
    // Multiplier starts at 1.0 and grows based on time (up to 3x) and income (up to +2x)
    const endgameMultiplier = 1 + (timeElapsed / 200) + Math.max(0, Math.log10(Math.max(1, getCurrentTotalIncome() / 1000)) * 0.5);

    const baseChance = getEffectiveAsteroidChance();
    const destructionChance = baseChance * endgameMultiplier;

    // Decimate savings: scale from 5% up to 25% (zdesetkajo privarčevana sredstva)
    const moneyLostPercent = Math.min(0.25, 0.05 * endgameMultiplier);
    const moneyLost = Math.floor(state.money * moneyLostPercent);

    // --- BATCH NEWS GATHERING ---
    const cycleNews = [];

    // 1. Money Loss
    if (moneyLost > 0) {
        cycleNews.push(`IZGUBA: Asteroid je uničil ${formatMoney(moneyLost)} tvojega premoženja!`);

        const moneyDisplay = document.getElementById('money-display');
        const rect = moneyDisplay.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        animateAsteroid({ x: centerX, y: centerY }, () => {
            state.money -= moneyLost;
            logEvent(`Asteroidni roj je uničil ${formatMoney(moneyLost)} denarja! (-5%)`, 'bad');
            // News already pushed
            updateUI();
        });
    }

    // Get protected countries count from shield upgrades
    const protectedCount = getProtectedCountriesCount();

    // Sort owned countries by income (ascending) to find middle-tier countries
    const ownedCountriesArray = Array.from(state.ownedCountries).map(id => state.countries[id]);
    ownedCountriesArray.sort((a, b) => getCurrentIncome(a) - getCurrentIncome(b));

    // Create set of protected country IDs (middle-tier countries with average value)
    const protectedCountries = new Set();
    if (protectedCount > 0 && ownedCountriesArray.length > 0) {
        // Calculate the middle range to protect
        const totalCountries = ownedCountriesArray.length;
        const actualProtected = Math.min(protectedCount, totalCountries);
        const middleStart = Math.floor((totalCountries - actualProtected) / 2);
        const middleEnd = middleStart + actualProtected;

        for (let i = middleStart; i < middleEnd; i++) {
            protectedCountries.add(ownedCountriesArray[i].id);
        }

        // Show protected countries in GREEN shield ticker
        showShieldTicker(protectedCountries);

        logEvent(`Raketni ščit aktiviran: ${protectedCountries.size} držav je zaščitenih!`, 'good');
    }

    const victims = [];
    const shieldedCountries = []; // Track which countries were actually saved by shield

    state.ownedCountries.forEach(id => {
        const wouldBeHit = Math.random() < destructionChance;

        // Skip if country is protected by shield
        if (protectedCountries.has(id)) {
            // Only add to shielded list if it would have been hit
            if (wouldBeHit) {
                shieldedCountries.push(id);
            }
            return;
        }

        if (wouldBeHit) {
            victims.push(id);
        }
    });

    // Additional log if shield actually saved countries from destruction
    if (shieldedCountries.length > 0) {
        logEvent(`Raketni ščit je rešil ${shieldedCountries.length} držav pred uničenjem!`, 'good');
    }

    // 2. Upgrades Destruction
    const upgradesToDestroy = [];
    state.ownedUpgrades.forEach(id => {
        // Check if upgrade is of type shield_protection
        const upgrade = GLOBAL_UPGRADES[id];
        if (upgrade && upgrade.type === 'shield_protection') {
            return; // Shield upgrades cannot be destroyed
        }

        // 10% chance to destroy generic upgrades
        if (Math.random() < 0.10) {
            upgradesToDestroy.push(id);
        }
    });

    upgradesToDestroy.forEach(id => {
        const upgrade = GLOBAL_UPGRADES[id];
        cycleNews.push(`Pozor ${upgrade.name} ni več na voljo`);
        // Actual deletion happens below
    });

    // 3. Country Destruction News (Add to batch)
    victims.forEach(id => {
        const country = state.countries[id];
        cycleNews.push(`Opustošena država: ${country.name}`);
    });

    // --- PUSH ALL NEWS TO TICKER ---
    if (cycleNews.length > 0) {
        newsQueue.push(...cycleNews);
        updateNewsTicker();

        // Ensure visible
        const ticker = document.getElementById('breaking-news-ticker');
        if (ticker && !tickerVisible) {
            ticker.classList.remove('hidden');
            tickerVisible = true;
        }

        // Timer Logic (matches showBreakingNews but manual trigger)
        clearTimeout(window.tickerHideTimer);
        let hideDelay = 30000;
        if (typeof nextAsteroidTime !== 'undefined' && nextAsteroidTime > Date.now()) {
            const timeUntilNext = nextAsteroidTime - Date.now();
            const calculated = timeUntilNext - 15000;
            if (calculated > 1000) hideDelay = calculated;
        }

        window.tickerHideTimer = setTimeout(() => {
            if (ticker) {
                ticker.classList.add('hidden');
                tickerVisible = false;
            }
        }, hideDelay);
    }

    // Staggered animations for countries
    victims.forEach((id, index) => {
        setTimeout(() => {
            if (state.paused) return; // Stop if we paused during the animations
            const country = state.countries[id];
            // Get center coord of country
            const center = L.geoJSON(country.feature).getBounds().getCenter();

            animateAsteroid(center, () => {
                if (state.paused) return; // Final check before destruction
                const oldLevel = country.level;
                country.owned = false;
                country.destroyed = true; // Mark as destroyed
                country.level = 0;
                country.inStock = false;
                state.ownedCountries.delete(id);

                // Increase permanent sanitation penalty (scales with difficulty)
                const hitPenaltyScale = 0.1 * endgameMultiplier;
                const hitPenalty = getCurrentIncome(country) * hitPenaltyScale;
                state.sanitationPenalty = (state.sanitationPenalty || 0) + hitPenalty;

                logEvent(`Asteroid je uničil ${country.name}! (Lvl.${oldLevel} → Lvl.0)`, 'bad');

                // News handled in batch above

                geoJsonLayer.resetStyle();
                renderShop();
                renderCollection();
                updateUI();
            });
        }, index * 400); // 400ms delay between asteroids
    });

    // Upgrades destruction (immediate state update)
    upgradesToDestroy.forEach(id => {
        const upgrade = GLOBAL_UPGRADES[id];
        state.ownedUpgrades.delete(id);
        logEvent(`Pozor ${upgrade.name} ni več na voljo`, 'bad');
        // News handled in batch above
    });

    if (upgradesToDestroy.length > 0 || moneyLost > 0) {
        renderUpgrades();
        updateUI();
    }
}

// Breaking News Ticker System
let newsQueue = [];
let tickerVisible = false;

function clearBreakingNews() {
    // Clear all previous news (called at start of new asteroid attack)
    newsQueue = [];
    updateNewsTicker();
}

function showBreakingNews(message) {
    // Add message to queue
    newsQueue.push(message);

    // Update ticker content
    updateNewsTicker();

    // Show ticker if hidden
    const ticker = document.getElementById('breaking-news-ticker');
    if (ticker && !tickerVisible) {
        ticker.classList.remove('hidden');
        tickerVisible = true;
    }

    // Keep ticker visible based on asteroid cycle if possible
    clearTimeout(window.tickerHideTimer);

    let hideDelay = 30000;

    // Try to sync with asteroid cycle (15s buffer before next)
    if (typeof nextAsteroidTime !== 'undefined' && nextAsteroidTime > Date.now()) {
        const timeUntilNext = nextAsteroidTime - Date.now();
        const calculated = timeUntilNext - 15000;
        if (calculated > 1000) {
            hideDelay = calculated;
        }
    }

    window.tickerHideTimer = setTimeout(() => {
        if (ticker) {
            ticker.classList.add('hidden');
            tickerVisible = false;
        }
    }, hideDelay);
}

function updateNewsTicker() {
    const tickerContent = document.getElementById('ticker-content');
    if (!tickerContent) return;

    // If no news, hide ticker
    if (newsQueue.length === 0) {
        const ticker = document.getElementById('breaking-news-ticker');
        if (ticker) {
            ticker.classList.add('hidden');
            tickerVisible = false;
        }
        return;
    }

    // Build ticker HTML with all news items
    let html = '';
    newsQueue.forEach((news, index) => {
        html += `<span class="ticker-item">${news}</span>`;
        if (index < newsQueue.length - 1) {
            html += '<span class="ticker-separator"></span>';
        }
    });

    // Duplicate content for seamless loop
    tickerContent.innerHTML = html + html;
}

// Shield Ticker System (Green) - Shows protected countries
let shieldTickerVisible = false;

function showShieldTicker(protectedCountries) {
    const ticker = document.getElementById('shield-ticker');
    const tickerContent = document.getElementById('shield-ticker-content');
    if (!ticker || !tickerContent) return;

    // Build ticker HTML with protected countries
    let html = '';
    const countriesArray = Array.from(protectedCountries);
    countriesArray.forEach((id, index) => {
        const country = state.countries[id];
        html += `<span class="ticker-item">${country.name} 🛡️</span>`;
        if (index < countriesArray.length - 1) {
            html += '<span class="ticker-separator"></span>';
        }
    });

    // Duplicate content for seamless loop
    tickerContent.innerHTML = html + html;

    // Show ticker
    ticker.classList.remove('hidden');
    shieldTickerVisible = true;

    // Hide after 10 seconds (before attack starts)
    clearTimeout(window.shieldTickerHideTimer);
    window.shieldTickerHideTimer = setTimeout(() => {
        ticker.classList.add('hidden');
        shieldTickerVisible = false;
    }, 10000);
}

function hideShieldTicker() {
    const ticker = document.getElementById('shield-ticker');
    if (ticker) {
        ticker.classList.add('hidden');
        shieldTickerVisible = false;
    }
}

// Show good news in green ticker (for positive events like getting first country)
function showGoodNews(message) {
    const ticker = document.getElementById('shield-ticker');
    const tickerContent = document.getElementById('shield-ticker-content');
    if (!ticker || !tickerContent) return;

    // Build ticker HTML with message
    let html = `<span class="ticker-item">${message}</span>`;

    // Duplicate content for seamless loop
    tickerContent.innerHTML = html + html;

    // Show ticker
    ticker.classList.remove('hidden');
    shieldTickerVisible = true;

    // Hide after 15 seconds
    clearTimeout(window.shieldTickerHideTimer);
    window.shieldTickerHideTimer = setTimeout(() => {
        ticker.classList.add('hidden');
        shieldTickerVisible = false;
    }, 15000);
}



function updateUI() {
    moneyDisplay.innerText = formatMoney(state.money);

    // Update Rank Coins display
    const rcDisplay = document.getElementById('rank-coins-display');
    if (rcDisplay) rcDisplay.textContent = state.rankCoins.toLocaleString();

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

function isCountryLocked(country) {
    if (!country.owned) return false;
    // Permit X allows upgrading FROM Level X.
    const levelParams = Math.min(country.level, 5);
    return !state.ownedUpgrades.has(`UNLOCK_LVL_${levelParams}`);
}

function replenishStock() {
    // 1. Reset current stock
    Object.values(state.countries).forEach(c => c.inStock = false);

    const maxStock = getEffectiveStockAmount();
    // Cap destroyed at maxStock just in case, though unlikely to exceed
    let currentStockCount = 0;

    // 2. Guaranteed Stock: All destroyed countries (Priority)
    // We treat them as part of the stock quota.
    const destroyedCountries = Object.values(state.countries).filter(c => c.destroyed);
    destroyedCountries.forEach(c => {
        if (currentStockCount < maxStock) {
            c.inStock = true;
            currentStockCount++;
        }
    });

    if (currentStockCount >= maxStock) {
        logEvent(`Nova zaloga: ${currentStockCount} držav (Samo uničene)!`, 'neutral');
        renderShop();
        renderUpgrades();
        return;
    }

    // 3. Separate Candidates
    const candidates = Object.values(state.countries).filter(c => !c.destroyed && !c.inStock);

    // Group into Locked vs Unlocked
    const lockedCandidates = candidates.filter(c => isCountryLocked(c));
    const unlockedCandidates = candidates.filter(c => !isCountryLocked(c));

    // 4. Fill Locked Quota (User requested: Only ONE locked country max)
    const maxLockedAlloc = 1;
    let lockedAdded = 0;

    // Shuffle locked candidates to pick random ones
    lockedCandidates.sort(() => Math.random() - 0.5);

    for (const c of lockedCandidates) {
        if (lockedAdded >= maxLockedAlloc) break;
        if (currentStockCount >= maxStock) break;

        c.inStock = true;
        currentStockCount++;
        lockedAdded++;
    }

    // 5. Fill remaining with Unlocked Candidates
    // Strategy: Prefer Affordable (Cheap) ones first, then Random.
    // Sort unlocked by Cost
    unlockedCandidates.sort((a, b) => getCurrentCost(a) - getCurrentCost(b));

    // Pick a mix:
    // We want to fill `slotsRemaining` slots.
    // Let's ensure at least 50% of the *remaining* slots are affordable ones.
    const slotsRemaining = maxStock - currentStockCount;
    if (slotsRemaining > 0) {
        const affordableCount = Math.ceil(slotsRemaining * 0.6); // 60% affordable

        // Take first N cheapest
        const affordableSubset = unlockedCandidates.slice(0, affordableCount);
        // Add them to stock
        affordableSubset.forEach(c => c.inStock = true);

        // Update counts
        currentStockCount += affordableSubset.length;

        // If we still need more, pick purely random from the rest
        if (currentStockCount < maxStock) {
            const rest = unlockedCandidates.slice(affordableCount).filter(c => !c.inStock); // Candidates we didn't pick yet
            rest.sort(() => Math.random() - 0.5); // Shuffle

            for (const c of rest) {
                if (currentStockCount >= maxStock) break;
                // Weighted chance or just fill? Let's just fill to ensure full shop.
                c.inStock = true;
                currentStockCount++;
            }
        }
    }

    logEvent(`Nova zaloga: ${currentStockCount} držav (Zaklenjenih: ${lockedAdded})`, 'good');
    renderShop();
    renderUpgrades();
}

function renderShop() {
    countryList.innerHTML = '';

    // Sort Logic: Locked = Bottom, then Cost Ascending
    const sorted = Object.values(state.countries).sort((a, b) => {
        const lockedA = isCountryLocked(a);
        const lockedB = isCountryLocked(b);

        if (lockedA !== lockedB) return lockedA ? 1 : -1; // True (Locked) > False (Unlocked) -> Bottom

        // Secondary: Cost Ascending
        return getCurrentCost(a) - getCurrentCost(b);
    });

    sorted.forEach(c => {
        if (!c.inStock) return; // Only show what is in stock

        const item = document.createElement('div');
        const locked = isCountryLocked(c);

        let lockedReason = null;
        if (locked) {
            const levelParams = Math.min(c.level, 5);
            lockedReason = `POTREBUJEŠ DOVOLJENJE ${levelParams}`;
        }

        // Handle destroyed state styling
        const isDestroyed = c.destroyed;
        const rarityId = isDestroyed ? 'destroyed-shop' : c.rarity.id;
        item.className = `country-item rarity-${rarityId} ${c.owned ? 'owned' : ''} ${isDestroyed ? 'destroyed-in-shop' : ''}`;

        const currentCost = getCurrentCost(c);
        const currentIncome = getCurrentIncome(c);
        const canAfford = state.money >= currentCost;

        item.dataset.cost = currentCost;

        let isDisabled = !canAfford;
        if (lockedReason) isDisabled = true;

        if (isDisabled) item.classList.add('disabled');

        item.onclick = () => {
            if (lockedReason) {
                logEvent(`Za to nadgradnjo potrebuješ '${lockedReason}' iz trgovine!`, 'bad');
                return;
            }
            if (state.money >= currentCost) buyCountry(c.id);
        };

        const isGodly = c.rarity.id === 'godly' && !isDestroyed;
        const levelBadge = `<span class="level-badge ${isGodly ? 'level-badge-godly' : ''}" style="font-size:0.75em; opacity:0.8; white-space:nowrap;">Lvl.${c.level}</span>`;

        // If destroyed, force label to "SANACIJA" (3x Price)
        let actionLabel = isDestroyed ? "SANACIJA" : (c.owned ? "NADGRADNJA" : c.rarity.name);
        if (lockedReason) actionLabel = "ZAKLENJENO";

        const isLongName = c.name.length > 20;
        const nameStyle = isLongName ? 'font-size: 0.85rem;' : '';
        const nameClass = isGodly ? 'country-name country-name-godly' : 'country-name';

        const incomeClass = isGodly ? 'income text-rainbow' : 'income';
        const right = `<div class="item-right"><div class="cost" style="color:${canAfford && !lockedReason ? '#fff' : '#ef4444'}">${lockedReason ? '---' : formatMoney(currentCost)}</div><div class="${incomeClass}">+${formatMoney(currentIncome)}/s</div></div>`;

        item.innerHTML = `
            <div class="item-left">
                <span class="${nameClass}" style="${nameStyle}">${c.name}</span>
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <span class="country-rarity rarity-${rarityId}"><span class="rarity-label-text">${actionLabel}</span></span>
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

    // 1. Render Global Upgrades first (sorted by cost)
    const sortedGlobals = Object.values(GLOBAL_UPGRADES).sort((a, b) => {
        return a.cost - b.cost;
    });

    sortedGlobals.forEach(u => {
        const isOwned = state.ownedUpgrades.has(u.id);

        // Hide owned upgrades immediately as requested
        if (isOwned) return;

        // Special Sequential Logic for Stock Speed Upgrades
        if (u.id === 'STOCK_SPEED_II' && !state.ownedUpgrades.has('STOCK_SPEED_I')) return;
        if (u.id === 'STOCK_SPEED_III' && !state.ownedUpgrades.has('STOCK_SPEED_II')) return;
        if (u.id === 'STOCK_SPEED_IV' && !state.ownedUpgrades.has('STOCK_SPEED_III')) return;
        if (u.id === 'STOCK_SPEED_V' && !state.ownedUpgrades.has('STOCK_SPEED_IV')) return;

        // Special Sequential Logic for Income Speed Upgrades
        if (u.id === 'INCOME_SPEED_II' && !state.ownedUpgrades.has('INCOME_SPEED_I')) return;
        if (u.id === 'INCOME_SPEED_III' && !state.ownedUpgrades.has('INCOME_SPEED_II')) return;
        if (u.id === 'INCOME_SPEED_IV' && !state.ownedUpgrades.has('INCOME_SPEED_III')) return;
        if (u.id === 'INCOME_SPEED_V' && !state.ownedUpgrades.has('INCOME_SPEED_IV')) return;

        // Special Sequential Logic for Rocket Shield Upgrades
        if (u.id === 'SHIELD_II' && !state.ownedUpgrades.has('SHIELD_I')) return;
        if (u.id === 'SHIELD_III' && !state.ownedUpgrades.has('SHIELD_II')) return;
        if (u.id === 'SHIELD_IV' && !state.ownedUpgrades.has('SHIELD_III')) return;
        if (u.id === 'SHIELD_V' && !state.ownedUpgrades.has('SHIELD_IV')) return;

        // Special Sequential Logic for Stock Size Upgrades
        if (u.id === 'STOCK_SIZE_II' && !state.ownedUpgrades.has('STOCK_SIZE_I')) return;
        if (u.id === 'STOCK_SIZE_III' && !state.ownedUpgrades.has('STOCK_SIZE_II')) return;
        if (u.id === 'STOCK_SIZE_IV' && !state.ownedUpgrades.has('STOCK_SIZE_III')) return;
        if (u.id === 'STOCK_SIZE_V' && !state.ownedUpgrades.has('STOCK_SIZE_IV')) return;

        // Special Sequential Logic for Stock Quality Upgrades
        if (u.id === 'STOCK_QUALITY_II' && !state.ownedUpgrades.has('STOCK_QUALITY_I')) return;
        if (u.id === 'STOCK_QUALITY_III' && !state.ownedUpgrades.has('STOCK_QUALITY_II')) return;
        if (u.id === 'STOCK_QUALITY_IV' && !state.ownedUpgrades.has('STOCK_QUALITY_III')) return;
        if (u.id === 'STOCK_QUALITY_V' && !state.ownedUpgrades.has('STOCK_QUALITY_IV')) return;

        // Level Unlock Sequencing
        if (u.id === 'UNLOCK_LVL_2' && !state.ownedUpgrades.has('UNLOCK_LVL_1')) return;
        if (u.id === 'UNLOCK_LVL_3' && !state.ownedUpgrades.has('UNLOCK_LVL_2')) return;
        if (u.id === 'UNLOCK_LVL_4' && !state.ownedUpgrades.has('UNLOCK_LVL_3')) return;
        if (u.id === 'UNLOCK_LVL_5' && !state.ownedUpgrades.has('UNLOCK_LVL_4')) return;

        const canAfford = state.money >= u.cost;
        const rar = RARITIES[u.rarity.toUpperCase()] || { color: '#fff', name: 'UNKNOWN' };

        const item = document.createElement('div');
        item.className = `country-item upgrade-item-global rarity-${u.rarity}`;

        item.dataset.cost = u.cost;
        item.onclick = () => buyGlobalUpgrade(u.id);

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
                <div class="cost" style="color:${canAfford ? '#fff' : '#ef4444'}">
                    ${formatMoney(u.cost)}
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
    if (Math.abs(n) < 1000000) {
        return n.toLocaleString('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    }
    const suffixes = ["", "K", "M", "B", "T", "QA", "QI", "SX", "SP", "OC", "NO", "DC", "UD", "DD", "TD", "QD", "QID", "SXD", "SPD", "OD", "ND", "V", "UV", "DV", "TV", "QAV", "QIV", "SXV", "SPV", "OV", "NV", "TG"];
    const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
    const suffix = suffixes[tier] || "e" + (tier * 3);
    const scale = Math.pow(10, tier * 3);
    const scaled = n / scale;

    return scaled.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + " " + suffix + " €";
}

// Save/Load System
async function saveGame() {
    await saveGameData();
    saveFriends();
}

async function saveGameData() {
    if (!state.username) return;
    const saveData = {
        money: state.money,
        challengeTimer: state.challengeTimer,
        ownedCountries: Array.from(state.ownedCountries),
        everOwned: Array.from(state.everOwned),
        ownedUpgrades: Array.from(state.ownedUpgrades),
        sanitationMultiplier: state.sanitationMultiplier,
        sanitationPenalty: state.sanitationPenalty || 0,
        rankPoints: state.rankPoints,
        rankCoins: state.rankCoins,
        ownedSkins: Array.from(state.ownedSkins),
        equippedSkin: state.equippedSkin,
        ownedBackgrounds: Array.from(state.ownedBackgrounds),
        equippedBackground: state.equippedBackground,
        uncollectedRewards: state.uncollectedRewards || 0,
        newlyReachedRanks: state.newlyReachedRanks || [],
        paused: false,
        startingCountryClaimed: state.startingCountryClaimed,
        purchaseCount: state.purchaseCount || 0,
        countries: {}
    };

    Object.values(state.countries).forEach(c => {
        saveData.countries[c.id] = {
            level: c.level,
            owned: c.owned
        };
    });

    localStorage.setItem(`worldsim_save_${state.username}`, JSON.stringify(saveData));

    // Sync with Firebase (Global Highscore & Full Save)
    if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
        try {
            const userRefId = state.username.replace(/\./g, '_');

            // 1. Full Save (Private/User specific)
            await db.ref('users/' + userRefId + '/save').set(saveData);

            // 2. Leaderboard Entry (Public) - Only update if money is HIGHER than current record
            const lbRef = db.ref('leaderboard/' + userRefId);
            const snapshot = await lbRef.once('value');
            const existing = snapshot.val();

            // Update if no record yet OR if current money is better OR if rank points increased
            if (!existing || state.money > (existing.money || 0) || state.rankPoints > (existing.rankPoints || 0)) {
                let currentRankObj = GAME_RANKS[0];
                for (let r of GAME_RANKS) {
                    if (state.rankPoints >= r.minPoints) currentRankObj = r;
                    else break;
                }

                await lbRef.set({
                    name: state.username,
                    money: Math.max(state.money, (existing ? existing.money : 0)),
                    rankPoints: state.rankPoints,
                    rankCoins: state.rankCoins,
                    rankName: currentRankObj.name,
                    rankIcon: currentRankObj.icon,
                    rankColor: currentRankObj.color,
                    lastUpdate: Date.now()
                });
            }
        } catch (err) {
            console.error("Firebase sync error:", err);
        }
    }

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

    // Sync with Firebase (Social / Friends)
    if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
        const userRefId = state.username.replace(/\./g, '_');
        db.ref('users/' + userRefId + '/social').set(friendsData).catch(err => console.error("Cloud social save failed:", err));
    }
}

function loadFriends(username, cloudSocial = null) {
    const dataObj = cloudSocial || JSON.parse(localStorage.getItem(`worldsim_friends_${username}`) || 'null');

    if (dataObj) {
        try {
            state.friends = dataObj.friends || [];
            state.pendingRequests = dataObj.pendingRequests || [];
            state.chats = dataObj.chats || {};
            state.lastRead = dataObj.lastRead || {};
            updateNotifications();
            return true;
        } catch (e) {
            console.error("Napaka pri nalaganju prijateljev:", e);
        }
    }
    return false;
}

function loadGame(username, cloudData = null, cloudSocial = null) {
    const dataObj = cloudData || JSON.parse(localStorage.getItem(`worldsim_save_${username}`) || 'null');
    loadFriends(username, cloudSocial);

    if (!dataObj) return false;

    try {
        const data = dataObj;
        state.username = username;
        state.money = data.money || 0;
        state.challengeTimer = (typeof data.challengeTimer === 'number') ? data.challengeTimer : 600;
        state.ownedCountries = new Set(data.ownedCountries || []);
        state.everOwned = new Set(data.everOwned || []);
        state.ownedUpgrades = new Set(data.ownedUpgrades || []);
        state.sanitationMultiplier = data.sanitationMultiplier || 1;
        state.sanitationPenalty = data.sanitationPenalty || 0;
        state.rankPoints = data.rankPoints || 0;
        state.rankCoins = data.rankCoins || 0;
        state.ownedSkins = data.ownedSkins || ['classic'];
        state.equippedSkin = data.equippedSkin || 'classic';
        state.ownedBackgrounds = data.ownedBackgrounds || ['default'];
        state.equippedBackground = data.equippedBackground || 'default';
        state.uncollectedRewards = data.uncollectedRewards || 0;
        state.newlyReachedRanks = data.newlyReachedRanks || [];
        state.startingCountryClaimed = data.startingCountryClaimed || false;
        state.purchaseCount = data.purchaseCount || 0;

        updateRankNotifications();

        updateBackgroundEffect();

        updateRankDisplay();

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
// Initialize game when PLAY! is clicked
document.getElementById('play-button').addEventListener('click', async () => {
    const nameInput = document.getElementById('username-input');
    const name = nameInput.value.trim();

    if (!name) {
        alert("Prosim vnesi svoje ime!");
        return;
    }

    state.username = name;
    lockUsername();

    // 1. Hide the start screen and show game-ui (needed for map initialization)
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');

    // 2. Initialize map and controls
    initMap();
    setupZoomControls();
    if (map) map.invalidateSize();

    // 3. Load country data FIRST (this will populate state.countries)
    if (Object.keys(state.countries).length < 50) {
        await loadCountryData();
    }

    // 4. Load saved game (Cloud prioritized)
    let cloudData = null;
    let cloudSocial = null;
    if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
        try {
            const userRefId = name.replace(/\./g, '_');
            const dataSnap = await db.ref('users/' + userRefId + '/save').once('value');
            cloudData = dataSnap.val();
            const socialSnap = await db.ref('users/' + userRefId + '/social').once('value');
            cloudSocial = socialSnap.val();
        } catch (err) {
            console.error("Cloud load failed:", err);
        }
    }

    const loaded = loadGame(name, cloudData, cloudSocial);
    if (geoJsonLayer) geoJsonLayer.resetStyle(); // Ensure skin/owned colors apply immediately

    // Check if previous game expired
    if (loaded && state.challengeTimer <= 0) {
        state.money = 10000; // Realistic start for GDP scale (can buy some Burundis or Indias)
        state.ownedCountries = new Set();
        state.everOwned = new Set();
        state.ownedUpgrades = new Set();
        Object.values(state.countries).forEach(c => {
            c.level = 0;
            c.owned = false;
            c.destroyed = false;
            c.inStock = false;
        });
        state.challengeTimer = 600;
        state.stockProgress = 0;
        state.sanitationMultiplier = 1;
        state.sanitationPenalty = 0;
        state.startingCountryClaimed = false;
        state.purchaseCount = 0;
        logEvent(`Začenjam nov 10-minutni izziv!`, 'good');
    } else if (loaded) {
        // Anti-stuck: If player has very little money and low income, give them enough for a cheap country
        if (state.money < 1000 && getCurrentTotalIncome() < 10) {
            state.money = 5000;
            logEvent("Prejel si nujno pomoč za zagon ekonomije!", "neutral");
        }
        logEvent(`Dobrodošel nazaj, ${name}!`, 'good');
    } else {
        state.money = 10000; // Starting money: 10k EUR
        logEvent(`Nova igra za ${name}. Vso srečo!`, 'good');
    }

    if (!state.startingCountryClaimed) {
        // Hide game-ui and show spinner
        document.getElementById('game-ui').classList.add('hidden');
        showStartingSpinner();
    } else {
        // Game UI already visible, just start music and game
        switchMusicToGame();
        initGame();
    }
});

function switchMusicToGame() {
    // Stop Intro Music
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
        introMusic.pause();
        introMusic.currentTime = 0;
    }

    // Start Game Music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.7;
        bgMusic.play().catch(e => console.log("Music play failed:", e));
    }
}


function getWheelCountries() {
    // Return all countries sorted by Cost (value), implying rarity/desirability
    return Object.values(state.countries)
        .filter(c => !c.destroyed)
        .sort((a, b) => a.baseCost - b.baseCost);
}

function showStartingSpinner() {
    const overlay = document.getElementById('starting-spinner-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('spin-start-btn').classList.remove('hidden');
    document.getElementById('spin-result').classList.add('hidden');

    // Create visual rarity wheel
    const wheel = document.getElementById('starting-wheel');
    // Style wheel with blue-purple aesthetic handled in CSS now
    wheel.style.transform = 'rotate(0deg)';

    // Dynamic Gradient Generation
    const wheelCountries = getWheelCountries();
    const total = wheelCountries.length;
    let gradientParts = [];

    // Gradient Palette: Light Blue -> Dark Violet -> Deep Purple
    // We Map index 0..total to a color interpolation

    wheelCountries.forEach((c, i) => {
        const progress = i / total;
        let color;
        // Interpolate color manually or use steps
        // Simple lerp approach for RGB not robust here, let's use HSL
        // Start: Light Blue (200, 100%, 80%)
        // End: Deep Purple (270, 100%, 20%)
        const h = 200 + (progress * 70); // 200 to 270
        const l = 80 - (progress * 60);  // 80% to 20%
        color = `hsl(${h}, 80%, ${l}%)`;

        const startDeg = (i / total) * 360;
        const endDeg = ((i + 1) / total) * 360;
        gradientParts.push(`${color} ${startDeg}deg ${endDeg}deg`);
    });

    wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}

let isSpinning = false;
let selectedStartingCountry = null;

document.getElementById('spin-start-btn').addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;

    const wheelCountries = getWheelCountries();
    const total = wheelCountries.length;

    // Pick a country based on weights (Rarity)
    let picked = null;
    let totalRate = 0;
    // We pick from the same pool we displayed
    wheelCountries.forEach(c => totalRate += (RARITIES[c.rarity.id.toUpperCase()]?.weight || 1));

    let r = Math.random() * totalRate;
    for (const c of wheelCountries) {
        const w = RARITIES[c.rarity.id.toUpperCase()]?.weight || 1;
        if (r < w) {
            picked = c;
            break;
        }
        r -= w;
    }
    if (!picked) picked = wheelCountries[0];
    selectedStartingCountry = picked;

    // Calculate rotation to land on this country
    const index = wheelCountries.findIndex(c => c.id === picked.id);
    const sliceDeg = 360 / total;
    // Target is center of the slice
    const targetAngle = (index * sliceDeg) + (sliceDeg / 2);

    // Add randomness within the slice (keep it inside boundaries)
    // +/- 40% of slice width to avoid border
    const randomOffset = (Math.random() * 0.8 - 0.4) * sliceDeg;
    const finalTargetAngle = targetAngle + randomOffset;

    // Spin!
    const spins = 5 + Math.floor(Math.random() * 3);
    // Rotating clockwise means we subtract the angle to bring it to 0
    const finalRotation = (spins * 360) + (360 - finalTargetAngle);

    const wheel = document.getElementById('starting-wheel');
    wheel.style.transition = 'transform 6s cubic-bezier(0.1, 0, 0.2, 1)'; // Force easing style
    // Add a tiny random offset to rotation to look organic
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        document.getElementById('spin-start-btn').classList.add('hidden');
        document.getElementById('spin-result').classList.remove('hidden');
        document.getElementById('spin-country-card').innerHTML = `
            <span style="color:${picked.rarity.color}">${picked.name}</span><br>
            <small style="font-size: 0.5em; opacity: 0.7;">${picked.rarity.name}</small>
        `;

        // Automatically start game immediately after spin (as in earlier versions)
        claimStartingCountry();
    }, 5000);
});

function claimStartingCountry() {
    if (!selectedStartingCountry) return;

    const country = state.countries[selectedStartingCountry.id];
    country.owned = true;
    country.level = 1;
    state.ownedCountries.add(country.id);
    state.everOwned.add(country.id);
    state.startingCountryClaimed = true;

    document.getElementById('starting-spinner-overlay').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');

    switchMusicToGame();
    initGame();

    // Show in GREEN ticker for positive news
    showGoodNews(`Tvoja začetna država je ${country.name}! 🎉`);
    logEvent(`Kolo sreče: Dobil si državo ${country.name}!`, 'good');

    // Zoom/Mark on map
    if (map && country.feature) {
        setTimeout(() => {
            const bounds = L.geoJSON(country.feature).getBounds();
            map.flyToBounds(bounds, { padding: [100, 100], duration: 2 });
            if (geoJsonLayer) geoJsonLayer.resetStyle();

            // Zoom out after 3 seconds
            setTimeout(() => {
                if (map) map.flyTo([30, 30], 2.2, { duration: 2 });
            }, 3000);
        }, 500);
    }

    saveGame();
}

document.getElementById('claim-starting-btn').addEventListener('click', claimStartingCountry);

const lbModal = document.getElementById('leaderboard-modal');
const lbList = document.getElementById('leaderboard-list-container');
let currentLbType = 'rank';

function showLeaderboard() {
    lbModal.classList.remove('hidden');

    // Fetch global data if firebase initialized
    if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
        db.ref('leaderboard').once('value').then(snapshot => {
            const data = snapshot.val();
            if (data) {
                state.globalPlayers = Object.values(data);
                renderLeaderboard();
            }
        });
    } else {
        renderLeaderboard();
    }
}

function closeLeaderboard() {
    lbModal.classList.add('hidden');
}

function renderLeaderboard() {
    // If firebase is configured, it will be handled by syncHighscoresWithFirebase
    // Let's use a local copy of global players
    const players = state.globalPlayers || getAllPlayers();

    if (currentLbType === 'money') {
        players.sort((a, b) => b.money - a.money);
    } else {
        players.sort((a, b) => (b.rankPoints || 0) - (a.rankPoints || 0));
    }

    const top100 = players.slice(0, 100);
    lbList.innerHTML = '';

    top100.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'lb-item';
        if (p.name === state.username) item.classList.add('is-user');

        // Identify rank (Try to use data from DB, otherwise calculate)
        let rName = p.rankName;
        let rIcon = p.rankIcon;
        let rColor = p.rankColor;

        if (!rName || !rIcon) {
            let rankObj = GAME_RANKS[0];
            for (let r of GAME_RANKS) {
                if ((p.rankPoints || 0) >= r.minPoints) rankObj = r;
                else break;
            }
            rName = rankObj.name;
            rIcon = rankObj.icon;
            rColor = rankObj.color;
        }

        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

        item.innerHTML = `
            <div class="lb-left">
                <div class="lb-medal">${medal}</div>
                <div class="lb-avatar">${rIcon}</div>
                <div class="lb-info">
                    <div class="lb-name-row">
                        <span class="lb-name">${p.name}</span>
                        ${p.name === state.username ? '<span class="lb-badge">Ti</span>' : ''}
                    </div>
                    <div class="lb-rank-label" style="color:${rColor}">${rName}</div>
                    <div class="lb-coins-label">🪙 ${(p.rankCoins || 0).toLocaleString()}</div>
                </div>
            </div>
            <div class="lb-right">
                <div class="lb-value">${currentLbType === 'money' ? formatMoney(p.money || 0) : (p.rankPoints || 0).toLocaleString() + ' pts'}</div>
            </div>
        `;
        lbList.appendChild(item);
    });
}

function getAllPlayers() {
    let players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('worldsim_save_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const name = key.replace('worldsim_save_', '');

                // Determine game rank name
                let gameRankName = 'Bronasti I';
                if (data.rankPoints !== undefined) {
                    for (let r of GAME_RANKS) {
                        if (data.rankPoints >= r.minPoints) gameRankName = r.name;
                        else break;
                    }
                }

                players.push({
                    name: name,
                    money: data.money || 0,
                    rankPoints: data.rankPoints || 0,
                    gameRankName: gameRankName
                });
            } catch (e) {
                console.error("Error parsing save", e);
            }
        }
    }
    return players;
}

function updateStartScreenProgress(e) {
    const nameInput = document.getElementById('username-input');
    const name = nameInput.value.trim();

    // Only proceed if triggered by Enter
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;

    // Elements
    const progressOuter = document.getElementById('start-progress-outer');
    const curRankEl = document.getElementById('start-current-rank');
    const pointsSumEl = document.getElementById('start-points-summary');
    const coinsSumEl = document.getElementById('start-coins-summary');
    const progressFill = document.getElementById('start-progress-fill');
    const nextRankEl = document.getElementById('start-next-rank-text');
    const rankIconEl = document.getElementById('rank-icon-display');

    if (!name) {
        progressOuter.classList.add('hidden');
        return;
    } else {
        progressOuter.classList.remove('hidden');
    }

    let currentPoints = 0;
    let currentCoins = 0;

    const savedData = localStorage.getItem(`worldsim_save_${name}`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            currentPoints = data.rankPoints || 0;
            currentCoins = data.rankCoins || 0;
        } catch (e) { }
    }

    // Find current and next rank
    let currentRank = GAME_RANKS[0];
    let nextRank = GAME_RANKS[1];

    for (let i = 0; i < GAME_RANKS.length; i++) {
        if (currentPoints >= GAME_RANKS[i].minPoints) {
            currentRank = GAME_RANKS[i];
            nextRank = GAME_RANKS[i + 1] || null;
        } else {
            break;
        }
    }

    // Update UI
    curRankEl.textContent = currentRank.name;
    curRankEl.style.color = currentRank.color;
    if (rankIconEl) rankIconEl.textContent = currentRank.icon;
    if (coinsSumEl) coinsSumEl.textContent = currentCoins.toLocaleString();

    // Top right badge
    const topRightCoins = document.getElementById('top-right-coins');
    if (topRightCoins) {
        topRightCoins.textContent = `${currentCoins.toLocaleString()} 🪙`;
        topRightCoins.classList.remove('hidden');
    }

    if (nextRank) {
        const needed = nextRank.minPoints - currentRank.minPoints;
        const progress = currentPoints - currentRank.minPoints;
        const percent = Math.min(100, Math.max(0, (progress / needed) * 100));

        pointsSumEl.textContent = `${currentPoints.toLocaleString()} / ${nextRank.minPoints.toLocaleString()} pts`;
        progressFill.style.width = `${percent}%`;
        nextRankEl.textContent = `Naslednji: ${nextRank.name} (manjka še ${(nextRank.minPoints - currentPoints).toLocaleString()} točk)`;
    } else {
        // Max rank (King)
        pointsSumEl.textContent = `${currentPoints.toLocaleString()} pts (MAX RANK)`;
        progressFill.style.width = `100%`;
        nextRankEl.textContent = `Dosegli ste najvišji naziv!`;
    }
}

// Add event listeners for leaderboard tabs
document.querySelectorAll('.lb-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lb-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLbType = btn.dataset.lbType;
        renderLeaderboard();
    });
});

document.getElementById('username-input').addEventListener('keydown', updateStartScreenProgress);
document.getElementById('username-input').addEventListener('input', (e) => {
    if (!e.target.value.trim()) {
        document.getElementById('start-progress-outer').classList.add('hidden');
    }
});

document.getElementById('close-leaderboard-btn').addEventListener('click', closeLeaderboard);
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

// Skin Shop Logic
let currentSkinTab = 'skins';

function showSkinShop() {
    const inputName = document.getElementById('username-input').value.trim();
    if (!inputName) {
        alert("Prosim vnesi svoje ime najprej, da vidimo tvoje stanje kovančkov!");
        return;
    }
    state.username = inputName;
    const loaded = loadGame(inputName);

    document.getElementById('skin-shop-modal').classList.remove('hidden');
    renderSkinShopList();
    updateSkinShopCoins();
}

function showRankRewards() {
    const list = document.getElementById('rank-rewards-list');
    list.innerHTML = '';

    // Find player points
    let playerPoints = 0;
    const name = document.getElementById('username-input').value.trim();
    if (name) {
        const savedData = localStorage.getItem(`worldsim_save_${name}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                playerPoints = data.rankPoints || 0;
            } catch (e) { }
        }
    }

    // Find player's current rank index
    let currentPlayerRankIndex = -1;
    for (let i = GAME_RANKS.length - 1; i >= 0; i--) {
        if (playerPoints >= GAME_RANKS[i].minPoints) {
            currentPlayerRankIndex = i;
            break;
        }
    }

    GAME_RANKS.forEach((rank, index) => {
        const isReached = playerPoints >= rank.minPoints;
        const isCurrent = index === currentPlayerRankIndex;

        const div = document.createElement('div');
        div.className = `rank-reward-item ${isReached ? 'current' : ''} ${isCurrent ? 'user-rank' : ''}`;

        div.innerHTML = `
            <div class="rank-reward-icon">${rank.icon}</div>
            <div class="rank-reward-info">
                <div class="rank-reward-name" style="color:${rank.color}">${rank.name}</div>
                <div class="rank-reward-pts">${rank.minPoints.toLocaleString()} pts</div>
            </div>
            <div class="rank-reward-value">
                +${rank.reward.toLocaleString()} 🪙
            </div>
            ${isCurrent ? '<div class="user-rank-tag">TI SI TUKAJ</div>' : ''}
        `;
        list.appendChild(div);

        // Scroll into view if it's the current rank
        if (isCurrent) {
            setTimeout(() => div.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    });

    // COLLECT REWARDS if any
    if (state.uncollectedRewards > 0) {
        state.rankCoins += state.uncollectedRewards;
        logEvent(`Prevzel si ${state.uncollectedRewards} kovančkov!`, 'good');
        state.uncollectedRewards = 0;
        state.newlyReachedRanks = [];
        updateRankNotifications();
        updateUI();
        saveGame();
    }

    document.getElementById('rank-rewards-modal').classList.remove('hidden');
}

document.getElementById('rank-info-trigger').addEventListener('click', showRankRewards);
document.getElementById('close-rank-rewards-btn').addEventListener('click', () => {
    document.getElementById('rank-rewards-modal').classList.add('hidden');
});


function updateSkinShopCoins() {
    const coinDisplay = document.getElementById('skin-shop-coins');
    if (coinDisplay) coinDisplay.textContent = state.rankCoins.toLocaleString();
}

function renderSkinShopList() {
    const list = document.getElementById('skin-shop-list');
    list.innerHTML = '';

    const items = currentSkinTab === 'skins' ? SKIN_ITEMS : BACKGROUND_ITEMS;
    const owned = currentSkinTab === 'skins' ? state.ownedSkins : state.ownedBackgrounds;
    const equipped = currentSkinTab === 'skins' ? state.equippedSkin : state.equippedBackground;

    Object.values(items).forEach(item => {
        const isOwned = owned.includes(item.id);
        const isEquipped = equipped === item.id;

        const div = document.createElement('div');
        div.className = `skin-item ${isEquipped ? 'equipped' : ''}`;

        // Preview Circle logic
        let previewStyle = '';
        if (currentSkinTab === 'skins') {
            if (item.id === 'neon') previewStyle = 'background: magenta; box-shadow: 0 0 10px magenta;';
            else if (item.id === 'gold') previewStyle = 'background: gold; box-shadow: inset 0 0 5px orange;';
            else if (item.id === 'cyber') previewStyle = 'background: #2d004d; border: 1px solid #00ffff;';
            else if (item.id === 'lava') previewStyle = 'background: radial-gradient(#dc2626, #7f1d1d); border: 1px solid #fbbf24;';
            else if (item.id === 'matrix') previewStyle = 'background: #000; color: #0f0; border: 1px solid #0f0; display:flex; align-items:center; justify-content:center; font-size:10px; font-family:monospace;';
            else if (item.id === 'flags') previewStyle = 'background: linear-gradient(45deg, #ff0000 33%, #ffffff 33%, #ffffff 66%, #0000ff 66%);';
            else if (item.id === 'ghost') previewStyle = 'background: rgba(147, 197, 253, 0.3); border: 2px dashed #3b82f6;';
            else if (item.id === 'nature') previewStyle = 'background: linear-gradient(#15803d, #3f6212);';
            else if (item.id === 'fire') previewStyle = 'background: linear-gradient(#fbbf24, #b91c1c); box-shadow: 0 0 8px #f97316;';
            else if (item.id === 'ice') previewStyle = 'background: linear-gradient(#ffffff, #06b6d4); box-shadow: 0 0 5px #cffafe;';
            else if (item.id === 'toxic') previewStyle = 'background: linear-gradient(#bef264, #14532d); outline: 1px solid #a3e635;';
            else if (item.id === 'royal') previewStyle = 'background: #7c3aed; border: 2px solid #ffd700;';
            else if (item.id === 'shadow') previewStyle = 'background: #000; border: 1px solid #fff;';
            else if (item.id === 'rainbow') previewStyle = 'background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);';
            else if (item.id === 'emerald') previewStyle = 'background: #10b981; box-shadow: inset 0 0 10px #064e3b;';
            else if (item.id === 'ruby') previewStyle = 'background: #ef4444; box-shadow: inset 0 0 10px #7f1d1d;';
            else if (item.id === 'sapphire') previewStyle = 'background: #2563eb; box-shadow: inset 0 0 10px #1e3a8a;';
            else if (item.id === 'blood_moon') previewStyle = 'background: #450a0a; border: 1px solid #000; box-shadow: 0 0 5px #ff0000;';
            else if (item.id === 'spirit') previewStyle = 'background: #fff; border: 1px dashed #60a5fa; opacity: 0.8;';
            else if (item.id === 'void') previewStyle = 'background: #000; border: 2px solid #4c1d95;';
            else if (item.id === 'cyber_glow') previewStyle = 'background: #06b6d4; box-shadow: 0 0 10px #22d3ee;';
            else if (item.id === 'obsidian') previewStyle = 'background: #000; border: 2px solid #a855f7; box-shadow: 0 0 10px #a855f7;';
            else if (item.id === 'crystal') previewStyle = 'background: rgba(255,255,255,0.2); border: 1px solid #fff; box-shadow: inset 0 0 10px #fff;';
            else if (item.id === 'sun_god') previewStyle = 'background: #fef08a; border: 2px solid #fbbf24; box-shadow: 0 0 15px #fbbf24, 0 0 30px #f59e0b;';
            else if (item.id === 'galaxy_skin') previewStyle = 'background: radial-gradient(circle, #5b21b6, #1e1b4b); border: 1px solid #fff;';
            else if (item.id === 'ethereal') previewStyle = 'background: rgba(255,255,255,0.1); border: 1.5px dashed #fff; box-shadow: 0 0 10px #fff;';
            else if (item.id === 'warlord') previewStyle = 'background: #991b1b; border: 3px solid #000; box-shadow: inset 0 0 10px #000;';
            else previewStyle = 'background: #658d53;';
        } else {
            if (item.id === 'space') previewStyle = 'background: #090A0F; outline: 1px solid #fff;';
            else if (item.id === 'ocean') previewStyle = 'background: #075985; box-shadow: inset 0 0 10px #0c4a6e;';
            else if (item.id === 'magma') previewStyle = 'background: #7f1d1d; border: 1px solid #fbbf24;';
            else if (item.id === 'matrix_bg') previewStyle = 'background: #000; outline: 1px solid #0f0;';
            else if (item.id === 'desert') previewStyle = 'background: #eab308; border-bottom: 4px solid #854d0e;';
            else if (item.id === 'arctic') previewStyle = 'background: #f1f5f9; box-shadow: inset 0 0 10px #94a3b8;';
            else if (item.id === 'forest') previewStyle = 'background: #14532d; border: 2px solid #064e3b;';
            else if (item.id === 'city') previewStyle = 'background: #1f2937; position:relative; overflow:hidden;';
            else if (item.id === 'retro_bg') previewStyle = 'background: #000; background-image: linear-gradient(#ff00ff 1px, transparent 1px), linear-gradient(90deg, #ff00ff 1px, transparent 1px); background-size: 5px 5px;';
            else if (item.id === 'clouds') previewStyle = 'background: #0ea5e9; box-shadow: inset -5px -5px 10px #fff;';
            else if (item.id === 'sunset') previewStyle = 'background: linear-gradient(#fb923c, #8b5cf6);';
            else if (item.id === 'aurora') previewStyle = 'background: linear-gradient(to top, #1e1b4b, #22c55e);';
            else if (item.id === 'hell') previewStyle = 'background: #450a0a; box-shadow: 0 0 15px #991b1b;';
            else if (item.id === 'galaxy') previewStyle = 'background: #2e1065; box-shadow: inset 0 0 10px #000;';
            else if (item.id === 'moonlight') previewStyle = 'background: #1e3a8a; border-top: 5px solid #fff;';
            else if (item.id === 'retro_grid') previewStyle = 'background: #000; border: 1px solid #ff00ff;';
            else if (item.id === 'deep_sea') previewStyle = 'background: #0c4a6e; border-bottom: 3px solid #082f49;';
            else if (item.id === 'supernova') previewStyle = 'background: radial-gradient(#ef4444, #f59e0b, #3b82f6); border: 1px solid #fff;';
            else if (item.id === 'dimension_x') previewStyle = 'background: repeating-conic-gradient(#000 0% 25%, #4c1d95 25% 50%);';
            else if (item.id === 'godly_realm') previewStyle = 'background: #fff; box-shadow: 0 0 20px #fbbf24; border: 2px solid #fbbf24;';
            else if (item.id === 'cyber_core') previewStyle = 'background: #000; box-shadow: 0 0 20px #06b6d4, inset 0 0 10px #22d3ee; border: 1px solid #06b6d4;';
            else if (item.id === 'infinite_nothing') previewStyle = 'background: #000; box-shadow: inset 0 0 5px #fff, inset 0 0 10px rgba(0,0,0,1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; content: "•";';
            else previewStyle = 'background: #1e293b;';
        }

        const previewContent = item.id === 'matrix' ? '01' : '';

        div.innerHTML = `
            <div class="skin-info">
                <div class="skin-title">
                    <span class="skin-preview-circle" style="${previewStyle}">${previewContent}</span>
                    ${item.name}
                </div>
                <div class="skin-desc">${item.desc}</div>
                <div class="skin-price" style="font-size:0.8rem; color:var(--accent); font-weight:700;">
                    ${isOwned ? '<span style="color:var(--success)">KUPLJENO</span>' : `Cena: ${item.cost} 🪙`}
                </div>
            </div>
            <button class="skin-buy-btn ${isOwned ? 'owned' : ''}" onclick="handleSkinAction('${item.id}', '${item.type}')">
                ${isEquipped ? 'OPREMLJENO' : (isOwned ? 'OPREMI' : 'Kupi')}
            </button>
        `;

        list.appendChild(div);
    });
}

function handleSkinAction(itemId, type) {
    const items = type === 'skin' ? SKIN_ITEMS : BACKGROUND_ITEMS;
    const owned = type === 'skin' ? state.ownedSkins : state.ownedBackgrounds;
    const item = items[itemId];

    if (owned.includes(itemId)) {
        // Equip
        if (type === 'skin') state.equippedSkin = itemId;
        else {
            state.equippedBackground = itemId;
            updateBackgroundEffect();
        }
        logEvent(`Opremljeno: ${item.name}`, 'good');
        saveGame();
    } else {
        // Buy
        if (state.rankCoins >= item.cost) {
            state.rankCoins -= item.cost;
            owned.push(itemId);

            // Auto-equip on purchase
            if (type === 'skin') state.equippedSkin = itemId;
            else {
                state.equippedBackground = itemId;
                updateBackgroundEffect();
            }

            logEvent(`Nakup uspešen in opremljeno: ${item.name}`, 'good');
            saveGame();
        } else {
            alert("Nimaš dovolj kovančkov!");
            return;
        }
    }
    renderSkinShopList();
    updateSkinShopCoins();
    updateUI(); // Updates currency displays
    if (geoJsonLayer) geoJsonLayer.resetStyle(); // Re-render map if active
}

function updateBackgroundEffect() {
    const body = document.body;
    body.classList.remove('bg-space', 'bg-ocean', 'bg-lava', 'bg-matrix', 'bg-forest', 'bg-city', 'bg-retro', 'bg-clouds', 'bg-sunset', 'bg-aurora', 'bg-hell', 'bg-galaxy', 'bg-moonlight', 'bg-retro-grid', 'bg-deep-sea', 'bg-supernova', 'bg-dimension-x', 'bg-godly-realm', 'bg-cyber-core', 'bg-infinite-nothing');
    if (state.equippedBackground === 'space') body.classList.add('bg-space');
    else if (state.equippedBackground === 'ocean') body.classList.add('bg-ocean');
    else if (state.equippedBackground === 'magma') body.classList.add('bg-lava');
    else if (state.equippedBackground === 'matrix_bg') body.classList.add('bg-matrix');
    else if (state.equippedBackground === 'forest') body.classList.add('bg-forest');
    else if (state.equippedBackground === 'city') body.classList.add('bg-city');
    else if (state.equippedBackground === 'retro_bg') body.classList.add('bg-retro');
    else if (state.equippedBackground === 'clouds') body.classList.add('bg-clouds');
    else if (state.equippedBackground === 'sunset') body.classList.add('bg-sunset');
    else if (state.equippedBackground === 'aurora') body.classList.add('bg-aurora');
    else if (state.equippedBackground === 'hell') body.classList.add('bg-hell');
    else if (state.equippedBackground === 'galaxy') body.classList.add('bg-galaxy');
    else if (state.equippedBackground === 'moonlight') body.classList.add('bg-moonlight');
    else if (state.equippedBackground === 'retro_grid') body.classList.add('bg-retro-grid');
    else if (state.equippedBackground === 'deep_sea') body.classList.add('bg-deep-sea');
    else if (state.equippedBackground === 'supernova') body.classList.add('bg-supernova');
    else if (state.equippedBackground === 'dimension_x') body.classList.add('bg-dimension-x');
    else if (state.equippedBackground === 'godly_realm') body.classList.add('bg-godly-realm');
    else if (state.equippedBackground === 'cyber_core') body.classList.add('bg-cyber-core');
    else if (state.equippedBackground === 'infinite_nothing') body.classList.add('bg-infinite-nothing');
}

document.getElementById('skin-shop-btn').addEventListener('click', showSkinShop);
document.getElementById('close-skin-shop-btn').addEventListener('click', () => {
    document.getElementById('skin-shop-modal').classList.add('hidden');
});

document.querySelectorAll('.skin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.skin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSkinTab = btn.dataset.tab;
        renderSkinShopList();
    });
});

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
    const timerText = document.getElementById('challenge-timer-text');
    const nameDisplay = document.getElementById('player-name-header');
    if (!display || !timerText) return;

    // Show name
    if (nameDisplay) nameDisplay.textContent = (state.username ? state.username + ',' : '');

    // Safety check
    if (state.challengeTimer < 0) state.challengeTimer = 0;

    const minutes = Math.floor(state.challengeTimer / 60);
    const seconds = Math.floor(state.challengeTimer % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    timerText.textContent = `osvoji svet: ${timeStr}`;

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

async function endGame(isBankrupt = false) {
    state.challengeTimer = 0;
    if (window.gameLoopInterval) clearInterval(window.gameLoopInterval);

    // Explicitly hide game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) gameUI.classList.add('hidden');

    // Stop Background Music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    // Play Intro Music (Game Over)
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
        introMusic.currentTime = 0; // Reset to start
        introMusic.play().catch(e => console.log("Intro music play failed:", e));
    }

    // Award points and coins: 1 point and 1 coin per owned, non-destroyed country
    const countryPoints = Object.values(state.countries || {}).filter(c => c && c.owned && !c.destroyed).length;

    // Show Screen FIRST so user sees something even if data processing lags
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');

    try {
        addRankPoints(countryPoints);
        state.rankCoins += countryPoints;
        await saveGame(); // NOW AWAITED
    } catch (e) {
        console.error("Error in post-game processing:", e);
    }

    const rankDisplayUI = document.getElementById('user-rank-display');
    const leaderboardDiv = document.getElementById('game-over-leaderboard');

    if (!gameOverScreen || !rankDisplayUI) return;

    // FETCH FRESH DATA FOR RANKING
    let players = [];
    if (firebaseConfig.apiKey !== "Vstavite-Tukaj") {
        try {
            const snapshot = await db.ref('leaderboard').once('value');
            const cloudData = snapshot.val();
            if (cloudData) players = Object.values(cloudData);
        } catch (err) {
            console.error("Firebase leaderboard fetch failed:", err);
        }
    }

    // Fallback/Merge with local saves
    if (players.length === 0) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('worldsim_save_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const name = key.replace('worldsim_save_', '');
                    players.push({ name: name, money: data.money || 0, rankPoints: data.rankPoints || 0 });
                } catch (e) { }
            }
        }
    }

    // Ensure CURRENT user is in the list with their CURRENT game score for ranking
    let userIndexInList = players.findIndex(p => p.name === state.username);
    if (userIndexInList === -1) {
        // Try case-insensitive fallback
        userIndexInList = players.findIndex(p => p.name && p.name.toLowerCase() === state.username.toLowerCase());
    }

    if (userIndexInList !== -1) {
        // For the end-game screen, we show the rank achieved in THIS game
        players[userIndexInList].money = state.money;
    } else {
        players.push({ name: state.username, money: state.money, rankPoints: state.rankPoints });
    }

    try {
        // Ensure all money values are Numbers for correct sorting
        players.forEach(p => { if (typeof p.money !== 'number') p.money = Number(p.money) || 0; });

        // Sort by money descending
        players.sort((a, b) => b.money - a.money);

        // Find user rank again
        let userRankIndex = players.findIndex(p => p.name === state.username);
        if (userRankIndex === -1) {
            userRankIndex = players.findIndex(p => p.name && p.name.toLowerCase() === state.username.toLowerCase());
        }

        const userRankNum = userRankIndex !== -1 ? userRankIndex + 1 : 1; // Default to 1 if still not found (shouldn't happen)

        console.log("EndGame Debug - Player:", state.username, "Money:", state.money, "Rank Index:", userRankIndex);

        const gameOverSubtitle = document.querySelector('.game-over-subtitle');
        if (gameOverSubtitle) {
            gameOverSubtitle.innerHTML = isBankrupt ?
                'Stroški sanacije uničenih držav so presegli vaš proračun!' :
                'Čas je potekel!';
            gameOverSubtitle.style.color = isBankrupt ? '#ef4444' : 'var(--text-muted)';
        }

        rankDisplayUI.innerHTML = `Tvoje mesto: <span style="color:var(--primary); font-size:1.5rem;">#${userRankNum}</span> <br> 
    <span style="font-size:1rem; color:var(--text-muted);">Denar: ${formatMoney(state.money)}</span> <br>
    <span style="font-size:1rem; color:var(--success);">Rank točke: +${countryPoints}</span><br>
    <span style="font-size:1rem; color:#ffd700;">Kovančki: +${countryPoints} 🪙</span><br>
    <span style="font-size:1.1rem; color:${getCurrentRank().color}; font-weight:800;">${getCurrentRank().name}</span>`;

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

        // Add user if they are NOT in the Top 10
        if (userRankNum > 10) {
            const separator = document.createElement('div');
            separator.style.borderTop = '1px dashed rgba(255,255,255,0.2)';
            separator.style.margin = '4px 0';
            leaderboardDiv.appendChild(separator);

            const row = document.createElement('div');
            row.className = 'leaderboard-row highlight';
            row.innerHTML = `
                <div style="display:flex; width:100%;">
                    <span class="rank-num">${userRankNum}.</span>
                    <span class="player-name">${state.username}</span>
                    <span class="player-money">${formatMoney(state.money)}</span>
                </div>
            `;
            leaderboardDiv.appendChild(row);
        }

    } catch (err) {
        console.error("Error rendering results:", err);
        rankDisplayUI.innerHTML = `Prišlo je do napake pri prikazu rezultatov, a tvoj napredek je shranjen.`;
    }

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

// Auto-start intro music on load
window.addEventListener('load', () => {
    updateStartScreenProgress();
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
        introMusic.volume = 0.5; // Set volume to 50%
        // Try to play immediately (might be blocked by browser policy)
        introMusic.play().catch(e => {
            console.log("Auto-play blocked, waiting for interaction", e);
            // Fallback: Play on first click anywhere if not yet playing
            const playOnInteraction = () => {
                // Check if map is not yet initialized (game not started)
                if (!document.getElementById('start-screen').classList.contains('hidden')) {
                    introMusic.play().catch(() => { });
                }
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('keydown', playOnInteraction);
        });
    }
});

// Auto-pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    const startScreen = document.getElementById('start-screen');
    const isGameActive = startScreen && startScreen.classList.contains('hidden');

    if (document.hidden && !state.paused && isGameActive && state.challengeTimer > 0 && state.challengeTimer < 600) {
        togglePause();
        saveGame();
    }
});

function openMobileTab(tab) {
    const modal = document.getElementById('mobile-tab-modal');
    const title = document.getElementById('mobile-tab-title');
    const body = document.getElementById('mobile-tab-body');
    const controlsPanel = document.getElementById('controls-panel');
    const targetId = `tab-${tab}`;
    const targetContent = document.getElementById(targetId);

    if (!modal || !targetContent || !body || !controlsPanel) return;

    // 1. If modal ALREADY has something, move it back to controls panel first!
    if (body.firstChild) {
        controlsPanel.appendChild(body.firstChild);
    }

    // 2. Set title
    const titles = { 'shop': 'Trgovina', 'collection': 'Zbirka', 'log': 'Dnevnik', 'upgrades': 'Nadgradnje' };
    title.textContent = titles[tab] || 'Meni';

    // 3. Renders
    if (tab === 'collection') renderCollectionList();
    if (tab === 'upgrades') renderUpgrades();
    if (tab === 'shop') replenishStock();

    // 4. Move content to modal
    body.innerHTML = ''; // This is now safe as we moved children out
    body.appendChild(targetContent);

    // 5. Show modal
    modal.classList.remove('hidden');
}
