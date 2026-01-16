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

const GAME_RANKS = [
    { name: 'Bronasti I', minPoints: 0, color: '#cd7f32', reward: 0, icon: '🥉' },
    { name: 'Bronasti II', minPoints: 5000, color: '#cd7f32', reward: 10, icon: '🥉' },
    { name: 'Bronasti III', minPoints: 15000, color: '#cd7f32', reward: 15, icon: '🥉' },
    { name: 'Srebrni I', minPoints: 50000, color: '#c0c0c0', reward: 25, icon: '🥈' },
    { name: 'Srebrni II', minPoints: 125000, color: '#c0c0c0', reward: 35, icon: '🥈' },
    { name: 'Srebrni III', minPoints: 300000, color: '#c0c0c0', reward: 50, icon: '🥈' },
    { name: 'Zlati I', minPoints: 750000, color: '#ffd700', reward: 75, icon: '🥇' },
    { name: 'Zlati II', minPoints: 1800000, color: '#ffd700', reward: 100, icon: '🥇' },
    { name: 'Zlati III', minPoints: 4500000, color: '#ffd700', reward: 150, icon: '🥇' },
    { name: 'Diamantni I', minPoints: 12000000, color: '#b9f2ff', reward: 250, icon: '💎' },
    { name: 'Diamantni II', minPoints: 30000000, color: '#b9f2ff', reward: 350, icon: '💎' },
    { name: 'Diamantni III', minPoints: 75000000, color: '#b9f2ff', reward: 500, icon: '💎' },
    { name: 'Legendarni I', minPoints: 200000000, color: '#ff4500', reward: 1000, icon: '🔥' },
    { name: 'Legendarni II', minPoints: 500000000, color: '#ff4500', reward: 1500, icon: '🔥' },
    { name: 'Legendarni III', minPoints: 1200000000, color: '#ff4500', reward: 2500, icon: '🔥' },
    { name: 'Neresnični I', minPoints: 4000000000, color: '#a855f7', reward: 5000, icon: '✨' },
    { name: 'Neresnični II', minPoints: 10000000000, color: '#a855f7', reward: 10000, icon: '✨' },
    { name: 'Neresnični III', minPoints: 25000000000, color: '#a855f7', reward: 25000, icon: '✨' },
    { name: 'Kralj', minPoints: 100000000000, color: '#eab308', reward: 100000, icon: '👑' }
];

const SKIN_ITEMS = {
    'classic': { id: 'classic', name: 'Standardno', desc: 'Standardne barve glede na redkost.', cost: 0, type: 'skin' },
    'neon': { id: 'neon', name: 'Neon Mesto', desc: 'Svetleče in močne futuristične barve.', cost: 50, type: 'skin' },
    'gold': { id: 'gold', name: 'Zlati Imperij', desc: 'Vse države postanejo prestižno zlate.', cost: 250, type: 'skin' },
    'cyber': { id: 'cyber', name: 'Cyberpunk', desc: 'Temno vijolične in modre barve.', cost: 100, type: 'skin' },
    'lava': { id: 'lava', name: 'Lava', desc: 'Države prekrite z vročo magmo.', cost: 300, type: 'skin' },
    'matrix': { id: 'matrix', name: 'Matrica', desc: 'Hekerski videz v zeleni kodi.', cost: 200, type: 'skin' },
    'flags': { id: 'flags', name: 'Zastave Sveta', desc: 'Barve nacionalnih zastav.', cost: 500, type: 'skin' },
    'ghost': { id: 'ghost', name: 'Duh', desc: 'Prosojne in srhljivo modre države.', cost: 150, type: 'skin' },
    'nature': { id: 'nature', name: 'Narava', desc: 'Zeleni in rjavi toni divjine.', cost: 100, type: 'skin' },
    'ocean_skin': { id: 'ocean_skin', name: 'Morski Svet', desc: 'Svetlo modre in turkizne barve.', cost: 250, type: 'skin' },
    'sky_skin': { id: 'sky_skin', name: 'Nebesna Svoboda', desc: 'Barve neba ob sončnem zahodu.', cost: 350, type: 'skin' },
    'diamond_skin': { id: 'diamond_skin', name: 'Diamantni Sij', desc: 'Države sijejo kot diamant.', cost: 1000, type: 'skin' },
    'retro_skin': { id: 'retro_skin', name: 'Retro 80s', desc: 'Roza in turkizna arkadna estetika.', cost: 400, type: 'skin' },
    'fire': { id: 'fire', name: 'Ognjeni Pekel', desc: 'Žareče rdeče in oranžne barve ognja.', cost: 450, type: 'skin' },
    'ice': { id: 'ice', name: 'Ledena Doba', desc: 'Zamrznjene modre in bele države.', cost: 350, type: 'skin' },
    'toxic': { id: 'toxic', name: 'Strupeni Odpadki', desc: 'Radioaktivno zelena in rumena.', cost: 300, type: 'skin' },
    'royal': { id: 'royal', name: 'Kraljevska Vijolična', desc: 'Prestižna vijolična z zlatimi robovi.', cost: 500, type: 'skin' },
    'shadow': { id: 'shadow', name: 'Senca', desc: 'Popolnoma črne države z belo obrobo.', cost: 600, type: 'skin' },
    'rainbow': { id: 'rainbow', name: 'Mavrica', desc: 'Vesela igra vseh barv hkrati.', cost: 800, type: 'skin' },
    'emerald': { id: 'emerald', name: 'Smaragd', desc: 'Globoki zeleni kristalni odtenki.', cost: 700, type: 'skin' },
    'ruby': { id: 'ruby', name: 'Rubin', desc: 'Veličastni rdeči kristalni toni.', cost: 700, type: 'skin' },
    'sapphire': { id: 'sapphire', name: 'Safir', desc: 'Globoko modri kristalni toni.', cost: 700, type: 'skin' },
    'blood_moon': { id: 'blood_moon', name: 'Krvava Luna', desc: 'Temno rdeče z črnimi robovi.', cost: 550, type: 'skin' },
    'spirit': { id: 'spirit', name: 'Duhovni Svet', desc: 'Svetlo modre mistične barve.', cost: 600, type: 'skin' },
    'void': { id: 'void', name: 'Praznina', desc: 'Popolna tema s temno vijolično obrobo.', cost: 900, type: 'skin' },
    'cyber_glow': { id: 'cyber_glow', name: 'Cyber Sij', desc: 'Neon turkizna s svetlečim učinkom.', cost: 450, type: 'skin' },
    'obsidian': { id: 'obsidian', name: 'Obsidijan', desc: 'Popolna črnina s škrlatnim sije.', cost: 1500, type: 'skin' },
    'crystal': { id: 'crystal', name: 'Kristalna Čistost', desc: 'Prosojne države z mavričnim odsevom.', cost: 2000, type: 'skin' },
    'sun_god': { id: 'sun_god', name: 'Sončni Bog', desc: 'Žareča bela in rumena energija.', cost: 3000, type: 'skin' },
    'galaxy_skin': { id: 'galaxy_skin', name: 'Galaktična Koža', desc: 'Premikajoče se barve vesolja.', cost: 5000, type: 'skin' },
    'ethereal': { id: 'ethereal', name: 'Eterični Duh', desc: 'Skoraj nevidne, a sijoče države.', cost: 7500, type: 'skin' },
    'warlord': { id: 'warlord', name: 'Gospodar Vojne', desc: 'Krvavo rdeče z debelo črno obrobo.', cost: 10000, type: 'skin' }
};

const BACKGROUND_ITEMS = {
    'default': { id: 'default', name: 'Standardno', desc: 'Običajno temno modro ozadje.', cost: 0, type: 'background' },
    'space': { id: 'space', name: 'Vesolje', desc: 'Zvezdnato nebo in galaksije.', cost: 150, type: 'background' },
    'ocean': { id: 'ocean', name: 'Globok Ocean', desc: 'Temno modre globine morja.', cost: 100, type: 'background' },
    'magma': { id: 'magma', name: 'Vulkansko', desc: 'Vroče podzemlje polno lave.', cost: 250, type: 'background' },
    'matrix_bg': { id: 'matrix_bg', name: 'Digitalni Svet', desc: 'Zelena hakerska koda.', cost: 300, type: 'background' },
    'desert': { id: 'desert', name: 'Puščava', desc: 'Suhi pesek in vroče sipine.', cost: 120, type: 'background' },
    'arctic': { id: 'arctic', name: 'Arktika', desc: 'Snežno bela in ledeno modra.', cost: 140, type: 'background' },
    'forest': { id: 'forest', name: 'Gosta Divjina', desc: 'Mirni zeleni gozdovi.', cost: 180, type: 'background' },
    'city': { id: 'city', name: 'Nočno Mesto', desc: 'Silhuete nebotičnikov.', cost: 350, type: 'background' },
    'retro_bg': { id: 'retro_bg', name: 'Synthwave', desc: 'Mreža in sončni zahod.', cost: 450, type: 'background' },
    'clouds': { id: 'clouds', name: 'Oblaki', desc: 'Svetlo modro nebo s puhastimi oblaki.', cost: 200, type: 'background' },
    'sunset': { id: 'sunset', name: 'Sončni Zahod', desc: 'Tople oranžne in vijolične barve.', cost: 250, type: 'background' },
    'aurora': { id: 'aurora', name: 'Polarni Sij', desc: 'Čarobno zeleno in modro valovanje.', cost: 500, type: 'background' },
    'hell': { id: 'hell', name: 'Pekelski Ogenj', desc: 'Globoko rdeče in goreče ozadje.', cost: 600, type: 'background' },
    'galaxy': { id: 'galaxy', name: 'Galaksija', desc: 'Mistična vijolična galaksija.', cost: 550, type: 'background' },
    'moonlight': { id: 'moonlight', name: 'Mesečina', desc: 'Mirna modra noč.', cost: 300, type: 'background' },
    'retro_grid': { id: 'retro_grid', name: 'Retro Mreža', desc: '3D mreža v stilu 80-ih.', cost: 400, type: 'background' },
    'deep_sea': { id: 'deep_sea', name: 'Globoko Morje', desc: 'Temni ocean z mehurčki.', cost: 350, type: 'background' },
    'supernova': { id: 'supernova', name: 'Supernova', desc: 'Eksplozija neonskih barv.', cost: 1500, type: 'background' },
    'dimension_x': { id: 'dimension_x', name: 'Dimenzija X', desc: 'Neznani portalni svet.', cost: 2500, type: 'background' },
    'godly_realm': { id: 'godly_realm', name: 'Božansko Kraljestvo', desc: 'Čista svetloba in zlati sij.', cost: 5000, type: 'background' },
    'cyber_core': { id: 'cyber_core', name: 'Cyber Jedro', desc: 'Animirano neonsko jedro.', cost: 8000, type: 'background' },
    'infinite_nothing': { id: 'infinite_nothing', name: 'Neskončni Nič', desc: 'Globoka črnina s srebrnimi pikami.', cost: 15000, type: 'background' }
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
    lastTick: Date.now(),
    challengeTimer: 600,
    sanitationMultiplier: 1, // Increases when asteroid hits
    rankPoints: 0,
    rankCoins: 0,
    ownedSkins: ['classic'],
    equippedSkin: 'classic',
    ownedBackgrounds: ['default'],
    equippedBackground: 'default',
    uncollectedRewards: 0,
    newlyReachedRanks: [], // IDs of ranks reached but rewards not yet collected
    paused: false,
    asteroidTimeRemaining: 0
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
    await loadCountryData();
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

    if (country && country.owned) {
        let fillColor = country.realColor;

        // Apply Skin logic
        if (state.equippedSkin === 'neon') {
            const neonColors = ['#ff00ff', '#00ffff', '#39ff14', '#ffff00', '#ff0000'];
            fillColor = neonColors[country.rarity.rank % neonColors.length];
        } else if (state.equippedSkin === 'gold') {
            fillColor = '#ffd700';
        } else if (state.equippedSkin === 'cyber') {
            const cyberColors = ['#2d004d', '#1a0033', '#004d4d', '#4d0026'];
            fillColor = cyberColors[country.rarity.rank % cyberColors.length];
        } else if (state.equippedSkin === 'lava') {
            const lavaColors = ['#991b1b', '#b91c1c', '#dc2626', '#f87171', '#fbbf24'];
            fillColor = lavaColors[country.rarity.rank % lavaColors.length];
        } else if (state.equippedSkin === 'matrix') {
            const greenTones = ['#052e16', '#14532d', '#166534', '#15803d', '#16a34a'];
            fillColor = greenTones[country.rarity.rank % greenTones.length];
        } else if (state.equippedSkin === 'flags') {
            const flagColors = ['#ef4444', '#3b82f6', '#ffffff', '#22c55e', '#eab308', '#000000'];
            fillColor = flagColors[country.id.length % flagColors.length];
        } else if (state.equippedSkin === 'ghost') {
            fillColor = '#60a5fa';
            return { fillColor: fillColor, weight: 1, opacity: 0.4, color: '#93c5fd', fillOpacity: 0.3, dashArray: '3' };
        } else if (state.equippedSkin === 'nature') {
            const natureColors = ['#166534', '#15803d', '#3f6212', '#4d7c0f', '#854d0e'];
            fillColor = natureColors[country.rarity.rank % natureColors.length];
        } else if (state.equippedSkin === 'ocean_skin') {
            const oceanSkinColors = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
            fillColor = oceanSkinColors[country.rarity.rank % oceanSkinColors.length];
        } else if (state.equippedSkin === 'sky_skin') {
            const skySkinColors = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'];
            fillColor = skySkinColors[country.rarity.rank % skySkinColors.length];
        } else if (state.equippedSkin === 'diamond_skin') {
            const diamondColors = ['#b9f2ff', '#e0f2fe', '#f0f9ff', '#d1d5db', '#ffffff'];
            fillColor = diamondColors[country.rarity.rank % diamondColors.length];
        } else if (state.equippedSkin === 'retro_skin') {
            const retroColors = ['#f472b6', '#db2777', '#9333ea', '#7c3aed', '#2563eb'];
            fillColor = retroColors[country.rarity.rank % retroColors.length];
        } else if (state.equippedSkin === 'fire') {
            const fireColors = ['#991b1b', '#b91c1c', '#ea580c', '#f97316', '#fbbf24'];
            fillColor = fireColors[country.rarity.rank % fireColors.length];
        } else if (state.equippedSkin === 'ice') {
            const iceColors = ['#0891b2', '#06b6d4', '#67e8f9', '#cffafe', '#ffffff'];
            fillColor = iceColors[country.rarity.rank % iceColors.length];
        } else if (state.equippedSkin === 'toxic') {
            const toxicColors = ['#14532d', '#166534', '#65a30d', '#a3e635', '#bef264'];
            fillColor = toxicColors[country.rarity.rank % toxicColors.length];
        } else if (state.equippedSkin === 'royal') {
            const royalColors = ['#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa'];
            fillColor = royalColors[country.rarity.rank % royalColors.length];
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#ffd700', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'rainbow') {
            const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
            fillColor = rainbowColors[country.rarity.rank % rainbowColors.length];
        } else if (state.equippedSkin === 'blood_moon') {
            fillColor = '#450a0a';
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#000000', fillOpacity: 1 };
        } else if (state.equippedSkin === 'spirit') {
            fillColor = '#ffffff';
            return { fillColor: fillColor, weight: 1.5, opacity: 0.8, color: '#60a5fa', fillOpacity: 0.6, dashArray: '5,5' };
        } else if (state.equippedSkin === 'silver') {
            fillColor = '#d1d5db';
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#9ca3af', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'fire') {
            const fireColors = ['#991b1b', '#b91c1c', '#ea580c', '#f97316', '#fbbf24'];
            fillColor = fireColors[country.rarity.rank % fireColors.length];
        } else if (state.equippedSkin === 'ice') {
            const iceColors = ['#0891b2', '#06b6d4', '#67e8f9', '#cffafe', '#ffffff'];
            fillColor = iceColors[country.rarity.rank % iceColors.length];
        } else if (state.equippedSkin === 'toxic') {
            const toxicColors = ['#14532d', '#166534', '#65a30d', '#a3e635', '#bef264'];
            fillColor = toxicColors[country.rarity.rank % toxicColors.length];
        } else if (state.equippedSkin === 'royal') {
            const royalColors = ['#4c1d95', '#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa'];
            fillColor = royalColors[country.rarity.rank % royalColors.length];
            return { fillColor: fillColor, weight: 2, opacity: 1, color: '#ffd700', fillOpacity: 0.9 };
        } else if (state.equippedSkin === 'shadow') {
            fillColor = '#000000';
            return { fillColor: fillColor, weight: 1, opacity: 1, color: '#ffffff', fillOpacity: 1 };
        } else if (state.equippedSkin === 'rainbow') {
            const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
            fillColor = rainbowColors[country.rarity.rank % rainbowColors.length];
        } else if (state.equippedSkin === 'emerald') {
            const emeraldColors = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981'];
            fillColor = emeraldColors[country.rarity.rank % emeraldColors.length];
        } else if (state.equippedSkin === 'ruby') {
            const rubyColors = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444'];
            fillColor = rubyColors[country.rarity.rank % rubyColors.length];
        } else if (state.equippedSkin === 'sapphire') {
            const sapphireColors = ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'];
            fillColor = sapphireColors[country.rarity.rank % sapphireColors.length];
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
        clickBtn.addEventListener('click', () => {
            addMoney(10);
            addRankPoints(1); // 1 point per click
        });
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

            // Points based on rarity rank - nerfed to make it harder
            addRankPoints(Math.floor(country.rarity.rank * 5));
        }

        // Add points for any purchase/upgrade - nerfed
        addRankPoints(levelsGain);

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

        if (state.money <= 0) {
            state.money = 0;
            updateUI();
            alert("BANKROT! Stroški sanacije uničenih držav so presegli vaš proračun.");
            endGame();
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
    let total = 0;
    Object.values(state.countries).forEach(c => {
        if (c.destroyed) {
            // "sanacija uničene države taka kot je država stala"
            total += c.baseCost;
        }
    });
    return Math.floor(total * state.sanitationMultiplier);
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
    asteroidOverlay.classList.add('active');
    logEvent("ASTEROIDNI ROJ SE JE ZAČEL!", "bad");

    window.asteroidShowerTimer = setTimeout(() => {
        asteroidOverlay.classList.remove('active');
        window.asteroidShowerTimer = null;
        if (!state.paused) processAsteroidHits();
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
    if (state.paused) return; // SAFETY: Never hit anything while paused

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

                // Double the sanitation cost/penalty globally
                state.sanitationMultiplier *= 2;

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

    // Points for global upgrades - nerfed
    const rar = RARITIES[upgrade.rarity.toUpperCase()];
    if (rar) addRankPoints(Math.floor(rar.rank * 10));

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
        sanitationMultiplier: state.sanitationMultiplier,
        rankPoints: state.rankPoints,
        rankCoins: state.rankCoins,
        ownedSkins: Array.from(state.ownedSkins),
        equippedSkin: state.equippedSkin,
        ownedBackgrounds: Array.from(state.ownedBackgrounds),
        equippedBackground: state.equippedBackground,
        uncollectedRewards: state.uncollectedRewards || 0,
        newlyReachedRanks: state.newlyReachedRanks || [],
        paused: state.paused,
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
        state.money = data.money || 0;
        state.challengeTimer = (typeof data.challengeTimer === 'number') ? data.challengeTimer : 600;
        state.ownedCountries = new Set(data.ownedCountries || []);
        state.everOwned = new Set(data.everOwned || []);
        state.ownedUpgrades = new Set(data.ownedUpgrades || []);
        state.sanitationMultiplier = data.sanitationMultiplier || 1;
        state.rankPoints = data.rankPoints || 0;
        state.rankCoins = data.rankCoins || 0;
        state.ownedSkins = data.ownedSkins || ['classic'];
        state.equippedSkin = data.equippedSkin || 'classic';
        state.ownedBackgrounds = data.ownedBackgrounds || ['default'];
        state.equippedBackground = data.equippedBackground || 'default';
        state.uncollectedRewards = data.uncollectedRewards || 0;
        state.newlyReachedRanks = data.newlyReachedRanks || [];

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
        state.countries = {};
        state.challengeTimer = 600;
        state.stockProgress = 0;
        state.sanitationMultiplier = 1;
        // Reset shop stock
        Object.values(state.countries).forEach(c => c.inStock = false);
        logEvent(`Začenjam nov 10-minutni izziv!`, 'good');
    } else if (loaded) {
        logEvent(`Dobrodošel nazaj, ${name}!`, 'good');
    } else {
        logEvent(`Nova igra za ${name}. Vso srečo!`, 'good');
    }

    document.getElementById('start-screen').classList.add('hidden');

    // Stop Intro Music
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
        introMusic.pause();
        introMusic.currentTime = 0;
    }

    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.15;
        bgMusic.play().catch(e => console.log("Music play failed:", e));
    }

    initGame();
});

const lbModal = document.getElementById('leaderboard-modal');
const lbList = document.getElementById('leaderboard-list-container');
let currentLbType = 'rank';

function showLeaderboard() {
    lbModal.classList.remove('hidden');
    renderLeaderboard();
}

function closeLeaderboard() {
    lbModal.classList.add('hidden');
}

function renderLeaderboard() {
    const players = getAllPlayers();

    if (currentLbType === 'money') {
        players.sort((a, b) => b.money - a.money);
    } else {
        players.sort((a, b) => b.rankPoints - a.rankPoints);
    }

    const top100 = players.slice(0, 100);
    lbList.innerHTML = '';

    top100.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'lb-item';
        if (p.name === state.username) item.classList.add('is-user');

        let rankObj = GAME_RANKS[0];
        for (let r of GAME_RANKS) {
            if (p.rankPoints >= r.minPoints) rankObj = r;
            else break;
        }

        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

        item.innerHTML = `
            <div class="lb-left">
                <div class="lb-medal">${medal}</div>
                <div class="lb-avatar">${rankObj.icon}</div>
                <div class="lb-info">
                    <div class="lb-name-row">
                        <span class="lb-name">${p.name}</span>
                        ${p.name === state.username ? '<span class="lb-badge">Ti</span>' : ''}
                    </div>
                    <div class="lb-rank-label" style="color:${rankObj.color}">${rankObj.name}</div>
                </div>
            </div>
            <div class="lb-right">
                <div class="lb-value">${currentLbType === 'money' ? formatMoney(p.money) : p.rankPoints.toLocaleString() + ' pts'}</div>
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
    } else {
        // Buy
        if (state.rankCoins >= item.cost) {
            state.rankCoins -= item.cost;
            owned.push(itemId);
            logEvent(`Nakup uspešen: ${item.name}`, 'good');
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

    // Play Intro Music (Game Over)
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
        introMusic.currentTime = 0; // Reset to start
        introMusic.play().catch(e => console.log("Intro music play failed:", e));
    }

    // Award points based on performance - extremely nerfed
    const performancePoints = Math.floor(state.money / 100000000); // 1 point per 100 million
    addRankPoints(performancePoints);
    saveGame(); // Final save

    const gameOverScreen = document.getElementById('game-over-screen');
    const rankDisplayUI = document.getElementById('user-rank-display'); // Renamed to avoid confusion with globals
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
    const userRankNum = userRankIndex + 1;

    rankDisplayUI.innerHTML = `Tvoje mesto: <span style="color:var(--primary); font-size:1.5rem;">#${userRankNum}</span> <br> 
    <span style="font-size:1rem; color:var(--text-muted);">Denar: ${formatMoney(state.money)}</span> <br>
    <span style="font-size:1rem; color:var(--success);">Rank točke: +${performancePoints}</span><br>
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

// Auto-start intro music on load
window.addEventListener('load', () => {
    updateStartScreenProgress();
    const introMusic = document.getElementById('intro-music');
    if (introMusic) {
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

