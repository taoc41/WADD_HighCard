/**
 * This stores all the global variables needed by the game.
*/

const suits = ['♠', '♥', '♦', '♣'];                                                   // Defines all card suits.
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];     // Defines all card ranks.

let playBtn, shuffleBtn, confirmBtn, skipBtn, burnBtn, freezeBtn, playAgainBtn, saveScoreBtn;  // Defines all game buttons

// Game States
const PLAYING = "playing";
const UPGRADE = "upgrade";
const GAMEOVER = "gameover";

let gameState = PLAYING;  // "playing", "upgrade", or "gameover"

// Rank Value Map, used for multiplier calculations
const rankValueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}; // This is like this because I don't want to keep scrolling down a massive list of numbers

// Card Sprite Variables.
let cardSpriteSheet;
const cardWidth = 71;
const cardHeight = 95;

let deck = [];                  // Array to hold all cards within the deck.
let hand = [];                  // Array to hold all cards drawn into the hand.
let selected = [];              // Array to hold all cards currently selected by the player.
let handSize = 7;               // Amount of cards drawn into the hand.

let reshuffleUses = 10;         // Amount of reshuffles the player can use.
let burnsRemaining = 3;         // Amount of "burns" the player can use.
let burnUsed = false;
let freezesRemaining = 3;       // Amount of "freezes" the player can use.

let eventTextAnimations = [];   // Array to hold currently playing event text.

let totalScore = 0;                 // Total score across the game
let score = 0;                      // Score earned in the current ante
let upgradePoints = 0;              // Number of upgrades allowed in this ante
let storedUpgradePoints = 0;        // Amount of upgrades that were skipped and stored.
let baseUpgradeThreshold = 300;     // Base threshold score for one upgrade

let round = 1;                  // Current round number.
let ante = 1;                   // Current ante number.
let maxRounds = 5;              // Maximum amount of rounds needed to play before proceeding onto the next ante.
let lastAction = "none"         // "none", "playhand", "reshuffle"

let passivePerks = [];          // Array to hold all acquired passive perks
let activeDebuffs = [];         // Array to hold all acquired debuff effects.
let burnedUpgrades = [];        // Array to record all "burned" upgrades
let frozenUpgrades = new Map();

let selectedUpgradeIndex = null;  // To record which upgrade choice is currently selected.
let upgradeChoices = [];          // Array to hold all upgrade choices that the player can select, used for upgrade phase
let upgradeChoiceAmount = 3;

// Globals for effects;
let disabledPerk = [];        // Array to hold all currently disabled perks. For the "Perk Lockout" debuff
let forcedCursedCount = 0;    // Amount of times that upgrades should be Cursed.
let skipUpgradePhase = false; // defines whether the upgrade phase is skipped this ante.

// Preview and Current hand info are seperated as to not cause issues with overwriting.
let previewHandInfo = null;
let currentHandInfo = null;
let lastHandInfo = null; // for repeated rhythm perk

// Card sorting globals
let heldCard = null;
let holdStartTime = 0;
let holdingCardIndex = -1;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// add cards to deck
let pickedCards = 0;
let pickedIndices = [];

// Background stuff
let bgColours;
let blobs = [];

let playerName = ""; // leaderboard

let MAX_PASSIVE_PERKS = 5;
let passivePerkDisplayDiv;
let debuffDisplayDiv;

/**
 * this script holds all of the passive perks, packs, and debuffs
 * none of this is sorted or documented properly because im too lazy
 * 
 */


//#region PACKS
const PACKS = [

    // COMMON --------------
    { // Booster Pack
        name: "Booster Pack",
        description: "Add 3 random cards to your deck.",
        rarity: "Common",
        apply: () => {
            let added = [];
            for (let i = 0; i < 3; i++) {
                let card = generateRandomCard()
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Flush Pack
        name: "Flush Pack",
        description: "Add 3 cards of the same suit.",
        rarity: "Common",
        apply: () => {
            let suit = random(suits);
            let added = [];
            for (let i = 0; i < 3; i++) {
                let card = generateRandomCard(suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Repeat Pack
        name: "Repeat Pack",
        description: "Add 3 copies of a random card from your hand.",
        rarity: "Common",
        apply: () => {
            if (hand.length === 0) return;
            let c = random(hand);
            let added = [];
            for (let i = 0; i < 3; i++) {
                let copy = new Card(c.rank, c.suit);
                deck.push(copy);
                added.push(copy);
            }
            logAddedCards(added);
        }
    },
    { // Balanced Pack
        name: "Balanced Pack",
        description: "Add 1 card of a random rank of each suit.",
        rarity: "Common",
        apply: () => {
            let added = [];
            suits.forEach(suit => {
                let card = generateRandomCard(suit);
                deck.push(card);
                added.push(card);
            });
            logAddedCards(added);
        }
    },
    { // Straight Pack
        name: "Straight Pack",
        rarity: "Common",
        description: "Add 3 sequential cards.",
        apply: () => {
            let start = floor(random(0, ranks.length - 2));
            let suit = random(suits);
            let added = [];
            for (let i = 0; i < 3; i++) {
                let card = new Card(ranks[start + i], suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Gambler's Pack
        name: "Gambler's Pack",
        description: "Add 3 cards to your deck. 50% chance for each to be high (10-A) or low (2-6).",
        rarity: "Common",
        apply: () => {
            let added = [];
            for (let i = 0; i < 3; i++) {
                const high = random() < 0.5;
                const rankPool = high ? ranks.slice(8) : ranks.slice(0, 5);
                const rank = random(rankPool);
                const suit = random(suits);
                const card = new Card(rank, suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Even Pack
        name: "Even Pack",
        description: "Add 2 cards with even-numbered ranks.",
        rarity: "Common",
        apply: () => {
            const evenRanks = ['2', '4', '6', '10', 'Q', 'A']
            let added = [];
            for (let i = 0; i < 2; i++) {
                let card = new Card(random(evenRanks), random(suits));
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Odd Pack
        name: "Odd Pack",
        description: "Add 2 cards with odd-numbered ranks.",
        rarity: "Common",
        apply: () => {
            const evenRanks = ['3', '5', '7', '9', 'J', 'K',]
            let added = [];
            for (let i = 0; i < 2; i++) {
                let card = new Card(random(evenRanks), random(suits));
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Double Down Pack
        name: "Double Down Pack",
        description: "Add 2 random cards. If they're the same rank, add a third.",
        rarity: "Common",
        apply: () => {
            let added = [];
            let c1 = generateRandomCard();
            let c2 = generateRandomCard();
            deck.push(c1, c2);
            added.push(c1, c2);

            if (c1.rank === c2.rank) {
                let c3 = new Card(c1.rank, random(suits));
                deck.push(c3)
                added.push(c3);
            }

            logAddedCards(added);
        }
    },
    { // Ace Pack
        name: "Ace Pack",
        description: "Add 1 random Ace",
        rarity: "Common",
        apply: () => {
            let card = new Card('A', random(suits));
            deck.push(card);
            logAddedCards([card]);
        }
    },
    { // Underdog Pack
        name: "Underdog Pack",
        description: "Add four low ranking cards (2-6) of random suits.",
        rarity: "Common",
        apply: () => {
            const lowRanks = ['2', '3', '4', '5', '6'];
            let added = [];
            for (let i = 0; i < 4; i++) {
                const rank = random(lowRanks);
                const suit = random(suits);
                const card = new Card(rank, suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Pair Pack
        name: "Pair Pack",
        description: "Add 2 cards with the same suit and rank.",
        rarity: "Common",
        apply: () => {
            const rank = random(ranks);
            const suit = random(suits);
            const card1 = new Card(rank, suit);
            const card2 = new Card(rank, suit);
            deck.push(card1, card2);
            logAddedCards([card1, card2]);
        }
    },
    { // Offsuit Pack
        name: "Offsuit Pack",
        description: "Add 3 cards of the same rank but different suits.",
        rarity: "Common",
        apply: () => {
            const rank = random(ranks);
            const shuffledSuits = shuffle([...suits]);
            let added = [];
            for (let i = 0; i < 3; i++) {
                const card = new Card(rank, shuffledSuits[i % suits.length]);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },

    // UNCOMMON ------------
    { // Booster Box
        name: "Booster Box",
        description: "Add 5 random cards to your deck.",
        rarity: "Uncommon",
        apply: () => {
            let added = [];
            for (let i = 0; i < 5; i++) {
                let card = generateRandomCard();
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Flush Box
        name: "Flush Box",
        description: "Add 5 cards of a randomly chosen suit.",
        rarity: "Uncommon",
        apply: () => {
            const suit = random(suits);
            let added = [];
            for (let i = 0; i < 5; i++) {
                const rank = random(ranks);
                const card = new Card(rank, suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Face Pack
        name: "Face Pack",
        description: "Add 3 random face cards.",
        rarity: "Uncommon",
        apply: () => {
            let faceRanks = ['J', 'Q', 'K'];
            let added = [];
            for (let i = 0; i < 3; i++) {
                let suit = random(suits);
                let rank = random(faceRanks);
                let card = new Card(rank, suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Mirror Pack
        name: "Mirror Pack",
        get description() {
            const most = getMostFrequentCardInDeck();
            return most
                ? `Add 2 cards of the most frequent card: ${most}`
                : "Add 2 cards of the most frequent card in your deck.";
        },
        rarity: "Uncommon",
        apply: () => {
            const most = getMostFrequentCardInDeck();
            if (!most) return;

            const rank = most.slice(0, -1);
            const suit = most.slice(-1);

            const added = [new Card(rank, suit), new Card(rank, suit)];
            deck.push(...added);
            logAddedCards(added);
        }
    },
    { // Spade Pack
        name: "Spade Pack",
        description: "Add 3 random ♠ cards.",
        rarity: "Uncommon",
        apply: () => {
            const added = [];
            for (let i = 0; i < 3; i++) {
                const card = new Card(random(ranks), '♠');
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Clubs Pack
        name: "Clubs Pack",
        description: "Add 3 random ♣ cards.",
        rarity: "Uncommon",
        apply: () => {
            const added = [];
            for (let i = 0; i < 3; i++) {
                const card = new Card(random(ranks), '♣');
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Hearts Pack
        name: "Hearts Pack",
        description: "Add 3 random ♥ cards.",
        rarity: "Uncommon",
        apply: () => {
            const added = [];
            for (let i = 0; i < 3; i++) {
                const card = new Card(random(ranks), '♥');
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Diamonds Pack
        name: "Diamonds Pack",
        description: "Add 3 random ♦ cards.",
        rarity: "Uncommon",
        apply: () => {
            const added = [];
            for (let i = 0; i < 3; i++) {
                const card = new Card(random(ranks), '♦');
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Two Pair Pack
        name: "Two Pair Pack",
        description: "Add 2 pairs (4 cards total) with random suits and ranks.",
        rarity: "Uncommon",
        apply: () => {
            let added = [];
            for (let i = 0; i < 2; i++) {
                const rank = random(ranks);
                const suit1 = random(suits);
                let suit2;
                do {
                    suit2 = random(suits);
                } while (suit2 === suit1);
                const card1 = new Card(rank, suit1);
                const card2 = new Card(rank, suit2);
                deck.push(card1, card2);
                added.push(card1, card2);
            }
            logAddedCards(added);
        }
    },
    { // Pulse Pack
        name: "Pulse Pack",
        description: "Add 3 cards, all ranked 5, 7, and 9.",
        rarity: "Uncommon",
        apply: () => {
            const pulseRanks = ['5', '7', '9'];
            let added = [];
            for (let rank of pulseRanks) {
                const suit = random(suits);
                const card = new Card(rank, suit);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Tier Pack
        name: "Tier Pack",
        description: "Add 1 low (2-4), 1 mid (6-8), and 1 high (10-K) card.",
        rarity: "Uncommon",
        apply: () => {
            const lowRanks = ['2', '3', '4'];
            const midRanks = ['6', '7', '8'];
            const highRanks = ['10', 'J', 'Q', 'K'];
            let added = [];
            added.push(new Card(random(lowRanks), random(suits)));
            added.push(new Card(random(midRanks), random(suits)));
            added.push(new Card(random(highRanks), random(suits)));
            added.forEach(card => deck.push(card));
            logAddedCards(added);
        }
    },

    // RARE ----------------
    { // Mytosis Pack
        name: "Mytosis Pack",
        description: "Add 5 copies of a random card from your hand.",
        rarity: "Rare",
        apply: () => {
            if (hand.length === 0) return;
            let c = random(hand);
            let added = [];
            for (let i = 0; i < 5; i++) {
                let copy = new Card(c.rank, c.suit);
                deck.push(copy);
                added.push(copy);
            }
            logAddedCards(added);
        }
    },
    { // Face Box
        name: "Face Box",
        description: "Add 5 random face cards.",
        rarity: "Rare",
        apply: () => {
            const faceRanks = ['J', 'Q', 'K'];
            let added = [];
            for (let i = 0; i < 5; i++) {
                const card = new Card(random(faceRanks), random(suits));
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Quad Pack
        name: "Quad Pack",
        description: "Add 4 cards of the same rank, each a different suit.",
        rarity: "Rare",
        apply: () => {
            const rank = random(ranks);
            const shuffledSuits = shuffle([...suits]);
            let added = [];
            for (let i = 0; i < 4; i++) {
                const card = new Card(rank, shuffledSuits[i]);
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Royal Pack
        name: "Royal Pack",
        description: "Add a Jack, Queen, and King, of the same suit.",
        rarity: "Rare",
        apply: () => {
            const suit = random(suits);
            const added = [
                new Card('J', suit),
                new Card('Q', suit),
                new Card('K', suit)
            ];
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Unity Pack
        name: "Unity Pack",
        description: "Add 5 random cards of the same suit.",
        rarity: "Rare",
        apply: () => {
            const suit = random(suits);
            let added = [];
            for (let i = 0; i < 5; i++) {
                added.push(new Card(random(ranks), suit));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Cascade Pack
        name: "Cascade Pack",
        description: "Add 5 cards consisting of a Full House.",
        rarity: "Rare",
        apply: () => {
            const tripleRank = random(ranks);
            let pairRank;
            do {
                pairRank = random(ranks);
            } while (pairRank === tripleRank);
            const suitsShuffled = shuffle([...suits]);
            const added = [
                new Card(tripleRank, suitsShuffled[0]),
                new Card(tripleRank, suitsShuffled[1]),
                new Card(tripleRank, suitsShuffled[2]),
                new Card(pairRank, suitsShuffled[3]),
                new Card(pairRank, suitsShuffled[0])
            ];
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Gradient Pack
        name: "Gradient Pack",
        description: "Add 5 cards of ascending ranks, all with random suits.",
        rarity: "Rare",
        apply: () => {
            const startIdx = floor(random(ranks.length - 4));
            const added = [];
            for (let i = 0; i < 5; i++) {
                added.push(new Card(ranks[startIdx + i], random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },

    { // High Ace Pack
        name: "High Ace's Pack",
        description: "Add 2 Aces and increase your reshuffles, burns, and freezes by 1.",
        rarity: "Mythical",
        apply: () => {
            let added = [];
            for (let i = 0; i < 2; i++) {
                const card = new Card('A', random(suits));
                deck.push(card);
                added.push(card);
            }
            reshuffleUses++;
            burnsRemaining++;
            freezesRemaining++;
            logAddedCards(added);
        }
    },
    { // Echo Pack
        name: "Echo Pack",
        description: "Add 3 of the highest-scoring card from your hand.",
        rarity: "Mythical",
        apply: () => {
            if (hand.length === 0) return;
            const rankOrder = ranks.reduce((map, r, i) => (map[r] = i, map), {});
            const bestCard = [...hand].sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank])[0];
            const added = [new Card(bestCard.rank, bestCard.suit), new Card(bestCard.rank, bestCard.suit), new Card(bestCard.rank, bestCard.suit)];
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Crowned Pack
        name: "Crowned Pack",
        description: "Add a 10, J, Q, K, and A of a random suit to your deck.",
        rarity: "Mythical",
        apply: () => {
            const suit = random(suits);
            const added = ['10', 'J', 'Q', 'K', 'A'].map(rank => new Card(rank, suit));
            added.forEach(card => deck.push(card));
            logAddedCards(added);
        }
    },
    { // Blooming Flush Pack
        name: "Blooming Flush Pack",
        description: "Add 6 cards of the same suit, all in random sequential order.",
        rarity: "Mythical",
        apply: () => {
            const suit = random(suits);
            const startIdx = floor(random(ranks.length - 5));
            const added = [];
            for (let i = 0; i < 6; i++) {
                added.push(new Card(ranks[startIdx + i], suit));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },

    // LEGENDARY
    { // Grandmaster Pack
        name: "Grandmaster Pack",
        description: "Add 5 cards of the same rank and suit.",
        rarity: "Legendary",
        apply: () => {
            const rank = random(ranks);
            const suit = random(suits);
            const added = Array(5).fill().map(() => new Card(rank, suit));
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Four Kingdoms Pack
        name: "Four Kingdoms Pack",
        description: "Add 1 J, K, Q for each suit.",
        rarity: "Legendary",
        apply: () => {
            const added = [];
            ['J', 'Q', 'K'].forEach(rank => {
                suits.forEach(suit => {
                    added.push(new Card(rank, suit));
                });
            });
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // First Edition Pack
        name: "First Edition Pack",
        description: "Add 13 cards: One of each rank (2-A) of the same suit.",
        rarity: "Legendary",
        apply: () => {
            const suit = random(suits);
            const added = ranks.map(r => new Card(r, suit));
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },

    // CURSED
    { // Crimson Pack
        name: "Crimson Pack",
        description: "Add 5 random red cards (Hearts/Diamonds).",
        rarity: "Cursed",
        apply: () => {
            const redSuits = ['♥', '♦'];
            let added = [];
            for (let i = 0; i < 5; i++) {
                const card = new Card(random(ranks), random(redSuits));
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Shadow Pack
        name: "Shadow Pack",
        description: "Add 5 random black cards (Clubs/Spades).",
        rarity: "Cursed",
        apply: () => {
            const blackSuits = ['♣', '♠'];
            let added = [];
            for (let i = 0; i < 5; i++) {
                const card = new Card(random(ranks), random(blackSuits));
                deck.push(card);
                added.push(card);
            }
            logAddedCards(added);
        }
    },
    { // Tarnished Pack
        name: "Tarnished Pack",
        description: "Add a J, Q, and K (each different suits), and 2 low cards.",
        rarity: "Cursed",
        apply: () => {
            let added = [];
            let usedSuits = shuffle([...suits]);
            ['J', 'Q', 'K'].forEach((rank, i) => {
                added.push(new Card(rank, usedSuits[i % usedSuits.length]));
            });
            for (let i = 0; i < 2; i++) {
                added.push(new Card(random(['2', '3', '4']), random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Rotten Pack
        name: "Rotten Pack",
        description: "Add one high ranking card (10-A) and four '2' cards.",
        rarity: "Cursed",
        apply: () => {
            const highRanks = ['10', 'J', 'Q', 'K', 'A'];
            let added = [new Card(random(highRanks), random(suits))];
            for (let i = 0; i < 4; i++) {
                added.push(new Card('2', random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // "Oops, all 2s!" Pack
        name: `"Oops, all 2s!" Pack`,
        description: "Add 10 cards of the '2' rank.",
        rarity: "Cursed",
        apply: () => {
            let added = [];
            for (let i = 0; i < 10; i++) {
                added.push(new Card('2', random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Fractured Pack
        name: "Fractured Pack",
        description: "Add 5 unique cards of random suits and ranks.",
        rarity: "Cursed",
        apply: () => {
            let added = [];
            const used = new Set();
            while (added.length < 5) {
                const rank = random(ranks);
                const suit = random(suits);
                const key = rank + suit;
                if (!used.has(key)) {
                    const card = new Card(rank, suit);
                    deck.push(card);
                    added.push(card);
                    used.add(key);
                }
            }
            logAddedCards(added);
        }
    },
    { // Driftwood Pack
        name: "Driftwood Pack",
        description: "Add 6 cards of ranks 2 through 7.",
        rarity: "Cursed",
        apply: () => {
            const driftRanks = ['2', '3', '4', '5', '6', '7'];
            let added = [];
            for (let i = 0; i < 6; i++) {
                added.push(new Card(random(driftRanks), random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    },
    { // Overgrowth Pack
        name: "Overgrowth Pack",
        description: "Add 10-20 low ranking (2-4) cards.",
        rarity: "Cursed",
        apply: () => {
            const count = floor(random(10, 21));
            const lowRanks = ['2', '3', '4'];
            let added = [];
            for (let i = 0; i < count; i++) {
                added.push(new Card(random(lowRanks), random(suits)));
            }
            added.forEach(c => deck.push(c));
            logAddedCards(added);
        }
    }
];

/* ---------------------------------------------------------------------------------------------- */

//#region PERKS
// stuff that effects things outside of cards
const PERKS = [
    // COMMON
    { // Quick Palm
        name: "Quick Palm",
        description: "Increase your reshuffles by 1.",
        rarity: "Common",
        apply: () => {
            reshuffleUses++
            sendEventText("+1 Reshuffle");
        }
    },
    { // Frost
        name: "Frost",
        description: "Increase your Freezes by 1.",
        rarity: "Common",
        apply: () => {
            freezesRemaining++;
            sendEventText("+1 Freeze");
        }
    },
    { // Flicker
        name: "Flicker",
        description: "Increase your Burns by 1.",
        rarity: "Common",
        apply: () => {
            burnsRemaining++
            sendEventText("+1 Burn");
        }
    },

    // UNCOMMON
    { // Loaded Sleeve
        name: "Loaded Sleeve",
        description: "Increase your reshuffles by 3.",
        rarity: "Uncommon",
        apply: () => {
            reshuffleUses += 3
            sendEventText("+3 Reshuffles");
        }
    },
    { // Wildfire
        name: "Wildfire",
        description: "Increase your Burns by 3.",
        rarity: "Uncommon",
        apply: () => {
            burnsRemaining += 3
            sendEventText("+3 Burns");
        }
    },
    { // Blizzard
        name: "Blizzard",
        description: "Increase your Freezes by 3.",
        rarity: "Uncommon",
        apply: () => {
            freezesRemaining++
            sendEventText("+3 Freezes");
        }
    },

    // RARE
    { // Phantom Thief
        name: "Phantom Thief",
        description: "Increase your reshuffles by 5.",
        rarity: "Rare",
        apply: () => {
            reshuffleUses += 5;
            sendEventText("+5 Reshuffles");
        }
    },
    { // Arsonist
        name: "Arsonist",
        description: "Increase your Burns by 5.",
        rarity: "Rare",
        apply: () => {
            burnsRemaining += 5;
            sendEventText("+5 Burns");
        }
    },
    { // Perfrigerist
        name: "Perfrigerist",
        description: "Increase your Freezes by 5.",
        rarity: "Rare",
        apply: () => {
            freezesRemaining += 5;
            sendEventText("+5 Freezes");
        }
    },
    { // Open Mind
        name: "Open Mind",
        description: "Increase the amount of knowable Abilities by 1.",
        rarity: "Rare",
        apply: () => MAX_PASSIVE_PERKS++
    },
    { // Elixir
        name: "Elixir",
        description: "Remove a random debuff.",
        rarity: "Rare",
        apply: () => {
            if (activeDebuffs.length === 0) return;
            let toRemove = random(activeDebuffs);
            if (toRemove.type === "once" && typeof toRemove.revert === "function") {
                toRemove.revert();
            }
            activeDebuffs.splice(activeDebuffs.indexOf(toRemove), 1);
            updateDebuffDisplay();
            sendEventText(`${toRemove.name} removed!`);
        }
    },
    { // Bonus Draw
        name: "Bonus Draw",
        description: "Your hand size increases by 1. (Max 10.)",
        rarity: "Rare",
        apply: () => {
            if (handSize < 10) handSize++;
        }
    },

    // MYTHICAL
    { // Cautious
        name: "Cautious",
        description: "Decrease the current ante by 1.",
        rarity: "Mythical",
        apply: () => {
            ante = max(1, ante - 1);
            sendEventText(`-1 Ante. You are now on Ante ${ante}`);
        }
    },
    { // Librarian
        name: "Librarian",
        description: "Increase the amount of knowable Abilities by 2.",
        rarity: "Mythical",
        apply: () => {
            MAX_PASSIVE_PERKS += 2;
            sendEventText("Increased knowable abilities by 2.")
        }
    },
    { // Scholar
        name: "Scholar",
        description: "Increase upgrade choice by 1 (Max 5)",
        rarity: "Mythical",
        apply: () => {
            upgradeChoiceAmount = min(5, upgradeChoiceAmount + 1);
            sendEventText("+1 Upgrade Choice");
        }
    },
    { // Kleptomaniac
        name: "Kleptomaniac",
        description: "Increase your reshuffles by 10.",
        rarity: "Mythical",
        apply: () => {
            reshuffleUses += 10;
            sendEventText("+10 Reshuffles");
        }
    },
    { // Pyromaniac
        name: "Pyromaniac",
        description: "Increase your Burns amount by 10.",
        rarity: "Mythical",
        apply: () => {
            burnsRemaining += 10;
            sendEventText("+10 Burns");
        }
    },
    { // Cryomaniac
        name: "Cryomaniac",
        description: "Increase your Freezes amount by 10.",
        rarity: "Mythical",
        apply: () => {
            burnsRemaining += 10;
            sendEventText("+10 Freezes");
        }
    },

    // LEGENDARY
    { // Elementalist
        name: "Elementalist",
        description: "Increase your Reshuffles, Burns, and Freezes by 10.",
        rarity: "Legendary",
        apply: () => {
            reshuffleUses += 10;
            burnsRemaining += 10;
            freezesRemaining += 10;
            sendEventText("+10 Reshuffles, Burns, and Freezes");
        }
    },
    { // Blueprint
        name: "Blueprint",
        description: "Gain a random Legendary Ability.",
        rarity: "Legendary",
        apply: () => {
            const legendary = availablePassives.filter(p => p.rarity === "Legendary");
            if (legendary.length > 0) passivePerks.push(random(legendary));
        }
    },
    { // Panacea
        name: "Panacea",
        description: "Remove all debuffs.",
        rarity: "Legendary",
        apply: () => {
            activeDebuffs.forEach(d => {
                if (d.type === "once" && typeof d.revert === "function") d.revert();
            });
            activeDebuffs = [];
            updateDebuffDisplay();
            sendEventText("All debuffs removed!");
        }
    },
    { // Safety First
        name: "Safety First",
        description: "Decrease the current ante by 3.",
        rarity: "Legendary",
        apply: () => {
            ante = max(1, ante - 3);
            sendEventText(`-3 Ante. You are now on Ante ${ante}`);
        }
    },

    // CURSED
    { // Devil's Deal (A)
        name: "Devil's Deal (A)",
        description: "Increase your knowable Abilities by 1, decrease your upgrade choices by 1.",
        rarity: "Cursed",
        apply: () => {
            MAX_PASSIVE_PERKS++;
            upgradeChoiceAmount = max(1, upgradeChoiceAmount - 1);
            sendEventText(`+1 Knowable Ability, -1 Upgrade Choice.`);
        }
    },
    { // Devil's Deal (B)
        name: "Devil's Deal (B)",
        description: "Increase your upgrade choices by 1, decrease your knowable Abilities by 1.",
        rarity: "Cursed",
        apply: () => {
            upgradeChoiceAmount++;
            MAX_PASSIVE_PERKS = max(1, MAX_PASSIVE_PERKS - 1);
            sendEventText(`+1 Upgrade Choice, -1 Knowable Ability.`);
        }
    },
    { // Elemental Mishap
        name: "Elemental Mishap",
        description: "Swap the amounts of your Burns and Freezes around.",
        rarity: "Cursed",
        apply: () => {
            const temp = burnsRemaining;
            burnsRemaining = freezesRemaining;
            freezesRemaining = temp;
            sendEventText(`Burns and Freezes were swapped.`);
        }
    },
    { // Ice Age
        name: "Ice Age",
        description: "Your amount of Burns is merged into your Freezes.",
        rarity: "Cursed",
        apply: () => {
            freezesRemaining += burnsRemaining;
            sendEventText(`+ ${burnsRemaining} Freezes. Burns are now 0.`);
            burnsRemaining = 0;
        }
    },
    { // Hellscape
        name: "Hellscape",
        description: "Your amount of Freezes is merged into your Burns.",
        rarity: "Cursed",
        apply: () => {
            burnsRemaining += freezesRemaining;
            sendEventText(`+ ${freezesRemaining} Burns. Freezes are now 0.`)
            freezesRemaining = 0;
        }
    },
    { // Time Dilation
        name: "Time Dilation",
        description: "Increase the amount of rounds needed to progress by 1.",
        rarity: "Cursed",
        apply: () => {
            maxRounds++
            sendEventText(`Rounds required to progess are now ${maxRounds}`)
        }
    },
    { // Luck Rot
        name: "Luck Rot",
        description: "Gain +10 upgrade points. Your next 3 upgrade choices become Cursed.",
        rarity: "Cursed",
        apply: () => {
            upgradePoints += 10;
            nextUpgradeCursed = 9;
        }
    },
    { // Time Tax
        name: "Time Tax",
        description: "Gain +5 Upgrade Points. Ante increases by 1.",
        rarity: "Cursed",
        apply: () => {
            upgradePoints += 5;
            ante++;
        }
    },
    { // Short Fuse
        name: "Short Fuse",
        description: "Gain +10 upgrade points. Gain the 'Oblivious' debuff (The next upgrade phase is skipped).",
        rarity: "Cursed",
        apply: () => {
            upgradePoints += 10;
            const oblivious = activeDebuffs.find(d => d.name === "Oblivious");
            activeDebuffs.push(oblivious);
        }
    }

]

/* ---------------------------------------------------------------------------------------------- */

//#region PASSIVE_PERKS

// TEMPLATE
/**
    name: "",                          // self explanatory
    description: "",                   // self explanatory
    trigger: "",                       // "playHand", "perRound", "perAnte", "shuffle", "upgradeSelect".
    result: "",                        // "addScore", "addMult", or "xMult", nothing assumes that its not score related.
    rarity: ,                          // "Common", "Uncommon", "Rare", "Mythical", or "Legendary"
    condition: (playedCards) => {},    // boolean that returns true or false based on played cards, or just `() => true` if not needed
    effect: () => {}                   // effect. either returns a number (score/mult to add) or method to add cards/something else.
 */

const PASSIVE_PERKS = [

    // COMMON

    { // Pair Up
        name: "Pair Up",
        description: "+40 points if your hand contained a Pair.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Pair",
        effect: () => 40
    },
    {// Twinning
        name: "Twinning",
        description: "+80 points if your hand contained a Two Pair.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Two Pair",
        effect: () => 80
    },
    { // Thrice is Nice
        name: "Thrice is Nice",
        description: "+120 points if your hand contained a Three of a Kind.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Three of a Kind",
        effect: () => 120
    },
    { // Suit Yourself
        name: "Suit Yourself",
        description: "+160 points if your hand contained a Flush.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Flush",
        effect: () => 160
    },
    { // Stair Step
        name: "Stair Step",
        description: "+160 points if your hand contained a Straight.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Straight",
        effect: () => 160
    },
    { // Housekeeping
        name: "Housekeeping",
        description: "+200 points if your hand contained a Full House.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Full House",
        effect: () => 200
    },
    { // Minimalist
        name: "Minimalist",
        description: "+5 mult if you played 3 or fewer cards.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Common",
        condition: (playedCards) => playedCards.length <= 3,
        effect: () => 5
    },
    { // Lone Star
        name: "Lone Star",
        description: "+25 points if you played a high card (J-A) and no other cards.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => playedCards.length === 1 && ['J', 'Q', 'K', 'A'].includes(playedCards[0].rank),
        effect: () => 25
    },
    { // Royal Parade
        name: "Royal Parade",
        description: "+30 points for every face card played.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: (playedCards) => playedCards.filter(c => ['J', 'Q', 'K'].includes(c.rank)).length * 30
    },
    { // Royal Banquet
        name: "Royal Banquet",
        description: "+5 mult for every face card played.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: (playedCards) => playedCards.filter(c => ['J', 'Q', 'K'].includes(c.rank)).length * 5
    },
    { // Even Odds
        name: "Even Odds",
        description: "+4 mult for every even card played.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(c => ['2', '4', '6', '8', '10'].includes(c.rank)),
        effect: (playedCards) => {
            const evens = playedCards.filter(c => ['2', '4', '6', '8', '10'].includes(c.rank)).length;
            return evens * 20;
        }
    },
    { // Oddball
        name: "Oddball",
        description: "+30 score for every odd card played.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(c => ['3', '5', '7', '9',].includes(c.rank)),
        effect: (playedCards) => {
            const evens = playedCards.filter(c => ['3', '5', '7', '9',].includes(c.rank)).length;
            return evens * 20;
        }
    },
    { // Lucky Clover
        name: "Lucky Clover",
        description: "+3 Mult for every played ♣ card.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(card => card.suit === '♣'),
        effect: (playedCards) => {
            const clubs = playedCards.filter(c => c.suit === '♣').length;
            return clubs * 3;
        }
    },
    { // Love Letter
        name: "Love Letter",
        description: "+3 Mult for every played ♥ card.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Uncommon",
        condition: (playedCards) => playedCards.some(card => card.suit === '♥'),
        effect: (playedCards) => {
            const hearts = playedCards.filter(c => c.suit === '♥').length;
            return hearts * 3;
        }
    },
    { // Sharpened Arrowhead
        name: "Sharpened Arrow",
        description: "+3 Mult for every ♠ in hand.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Uncommon",
        condition: (playedCards) => playedCards.some(card => card.suit === '♠'),
        effect: (playedCards) => {
            const spades = playedCards.filter(c => c.suit === '♠').length;
            return spades * 3;
        },
    },
    { // Lucky Diamond
        name: "Shining Gemstone",
        description: "+3 Mult for every ♦ in hand.",
        trigger: "playHand",
        result: "addMult",
        rarity: "Uncommon",
        condition: (playedCards) => playedCards.some(card => card.suit === '♦'),
        effect: (playedCards) => {
            const diamonds = playedCards.filter(c => c.suit === '♦').length;
            return diamonds * 3;
        }
    },
    { // Lone Wolf
        name: "Lone Wolf",
        description: "Add 2 random cards if you play only a single card.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => playedCards.length === 1,
        effect: () => {
            for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
            return;
        }
    },
    { // Back Up Draw
        name: "Backup Draw",
        description: "Add 1 random card if you played 3 or fewer cards.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => playedCards.length <= 3,
        effect: () => {
            deck.push(generateRandomCard());
            return;
        }
    },
    { // Flush Growth
        name: "Flush Growth",
        description: "Add 1 random card of the same suit if you play a Flush.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => currentHandInfo.name === "Flush",
        effect: (playedCards) => {
            if (playedCards.length === 0) return 0;
            let suit = playedCards[0].suit;
            deck.push(generateRandomCard(suit));
            return 0;
        }
    },
    { // Crowd Favourite
        name: "Crowd Favourite",
        get description() {
            const mostCommon = getMostFrequentCardInDeck();
            return mostCommon
                ? `Add 1 copy of your most frequent card (${mostCommon}) in your deck if played.`
                : "Add 1 copy of your most frequent card in your deck if played.";
        },
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => {
            const mostCommon = getMostFrequentCardInDeck();
            return mostCommon && playedCards.some(c => c.rank + c.suit === mostCommon);
        },
        effect: () => {
            const mostCommon = getMostFrequentCardInDeck();
            if (mostCommon) {
                const [rank, ...suitParts] = mostCommon.split("");
                const suit = suitParts.join("");
                deck.push(new Card(rank, suit));
            }
            return 0;
        },
    },
    { // Bookends
        name: "Bookends",
        description: "Add a card of the same rank if you play a hand with both a 2 and an A.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => playedCards.some(c => c.rank === '2') && playedCards.some(c => c.rank === 'A'),
        effect: () => {
            let rank = random(ranks);
            deck.push(new Card(rank, random(suits)));
        }
    },
    { // Card Collector
        name: "Card Collector",
        description: "Every 3 hands played, add a random card.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: () => totalHandsPlayed % 3 === 0,
        effect: () => {
            deck.push(generateRandomCard());
        }
    },
    { // Multiplicity
        name: "Multiplicity",
        description: "Add 1 card for every duplicate rank played this hand.",
        trigger: "playHand",
        result: "addScore",
        rarity: "Common",
        condition: (playedCards) => {
            let rankCounts = {};
            playedCards.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);
            return Object.values(rankCounts).some(count => count > 1);
        },
        effect: (playedCards) => {
            let rankCounts = {};
            playedCards.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);
            let duplicates = Object.values(rankCounts).filter(count => count > 1);
            let totalAdds = duplicates.length;
            for (let i = 0; i < totalAdds; i++) deck.push(generateRandomCard());
            return 0;
        }
    },


    // UNCOMMON
    { // Court of Royals
        name: "Court of Royals",
        description: "x2 Mult if hand contains only J, Q, K.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "xMult",

        condition: (playedCards) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: () => 2
    },
    { // Low Roll
        name: "Low Roll",
        description: "Add 1 random card to your deck if all ranks are 6 or lower.",
        trigger: "playHand",
        rarity: "Uncommon",
        condition: (playedCards) => playedCards.every(c => ranks.indexOf(c.rank) <= 4),
        effect: () => {
            deck.push(generateRandomCard());
            return;
        }
    },
    { // Thick Stack
        name: "Thick Stack",
        description: "At the start of every ante, gain 3 random cards to your deck.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",
        condition: () => round === 1,
        effect: () => {
            for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
            return;
        }
    },
    { // Set Bonus
        name: "Set Bonus",
        description: "Add 1 random card if you play a Three of a Kind, 2 if it's a Four of a Kind.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",

        condition: () => ["Three of a Kind", "Four of a Kind"].includes(currentHandInfo.name),
        effect: () => {
            const amount = currentHandInfo.name === "Four of a Kind" ? 2 : 1;
            for (let i = 0; i < amount; i++) deck.push(generateRandomCard());
            return 0;
        }
    },
    { // Repetitive Rhythm
        name: "Repetitive Rhythm",
        description: "x3 Mult if the played hand was the same as last round.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "xMult",

        condition: () => lastHandInfo.name === currentHandInfo.name,
        effect: () => 3
    },
    { // Conservative
        name: "Conservative",
        description: "+20 points for every reshuffle remaining.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",
        condition: () => reshuffleUses > 0,
        effect: () => reshuffleUses * 20
    },
    { // Lucky Find
        name: "Lucky Find",
        description: "50% chance every round to add 1 random card to your deck.",
        rarity: "Uncommon",

        trigger: "everyRound",
        result: "addCard",

        condition: () => random() < 0.5,
        effect: () => {
            deck.push(generateRandomCard());
            return 0;
        }
    },
    { // Favour of the Court
        name: "Favour of the Court",
        description: "Add 1 random face card if your played hand contains a face card.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: (playedCards) => playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: () => {
            const faceRanks = ['J', 'Q', 'K'];
            deck.push(new Card(random(faceRanks), random(suits)));
            return 0;
        }
    },
    { // Fan Favourite
        name: "Fan Favourite",
        description: "If you play a single card, add a copy of it and a random card of the same suit.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: (playedCards) => playedCards.length === 1,
        effect: (playedCards) => {
            const c = playedCards[0];
            deck.push(new Card(c.rank, c.suit));
            deck.push(generateRandomCard(c.suit));
            return 0;
        }
    },
    { // Face to Face
        name: "Face to Face",
        description: "+100 points if the hand contains both Jack and Queen.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",

        condition: (playedCards) => playedCards.some(c => c.rank === 'J') && playedCards.some(c => c.rank === 'Q'),
        effect: () => 100
    },
    { // Lucky Spread
        name: "Lucky Spread",
        description: "+5 Mult for each different suit played.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addMult",

        condition: (playedCards) => playedCards.length > 0,
        effect: (playedCards) => {
            const suitsPlayed = new Set(playedCards.map(c => c.suit)).size;
            return suitsPlayed * 5;
        }
    },
    { // Crestling Wave
        name: "Crestling Wave",
        description: "Add 2 cards to your deck if the played hand was a Straight or Flush.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: () => ["Straight", "Flush"].includes(currentHandInfo.name),
        effect: () => {
            for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
            return;
        }
    },
    { // Last Stand
        name: "Last Stand",
        description: "+250 points if your played hand contains exactly 1 card and it's an Ace.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",

        condition: (playedCards) => playedCards.length === 1 && playedCards[0].rank === 'A',
        effect: () => 250
    },
    { // Revolution
        name: "Revolution",
        description: "Add a random face card if your played hand contained 4 or more cards under rank 6.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: (playedCards) => playedCards.filter(c => ranks.indexOf(c.rank) < 4).length >= 4,
        effect: () => {
            const faceRanks = ['J', 'Q', 'K'];
            deck.push(new Card(random(faceRanks), random(suits)));
            return;
        }
    },
    { // Speedrun
        name: "Speedrun",
        description: "+150 points if your played hand contained 3 or fewer cards for 2 turns (or more) in a row.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",

        condition: () => lastHandInfo.cardCount <= 3 && currentHandInfo.cardCount <= 3,
        effect: () => 150
    },
    { // Blunt Edge
        name: "Blunt Edge",
        description: "+100 points if your played hand didn't contain any face cards.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addScore",

        condition: (playedCards) => playedCards.every(c => !['J', 'Q', 'K'].includes(c.rank)),
        effect: () => 100
    },
    { // Queen's Blessing
        name: "Queen's Blessing",
        description: "Add 2 cards if your played hand contained a Queen as your highest ranked card.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: (playedCards) => playedCards.some(c => c.rank === 'Q') && !playedCards.some(c => ['K', 'A'].includes(c.rank)),
        effect: () => {
            for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
            return;
        }
    },
    { // Family Tree
        name: "Family Tree",
        description: "Add 1 face card if you play a hand that contains both a Pair and a face card.",
        rarity: "Uncommon",

        trigger: "playHand",
        result: "addCard",

        condition: () => currentHandInfo.name === "Pair" && chosenCards.some(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: () => {
            const faceRanks = ['J', 'Q', 'K'];
            deck.push(new Card(random(faceRanks), random(suits)));
            return;
        }
    },

    // RARE
    { // Heart's Embrace
        name: "Heart's Embrace",
        suit: '♥',
        rarity: "Rare",

        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            const added = Math.floor(count / 3);
            return `For every 3 ${this.suit} cards in the deck, add 1 random card. (+${added} cards / ${count} '${this.suit}' cards)`;
        },

        trigger: "playHand",
        result: "addCard",

        condition: () => true,
        effect: () => {
            const count = deck.filter(c => c.suit === '♥').length;
            const addCount = Math.floor(count / 3);
            for (let i = 0; i < addCount; i++) {
                deck.push(generateRandomCard());
            }
            return 0;
        },
    },
    { // Spade's Contract
        name: "Spade's Contract",
        suit: '♠',
        rarity: "Rare",

        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            const score = count * 50;
            return `+${score} points. 
        This card gains +50 points per ${this.suit} card in the deck. (${count} ${this.suit})`;
        },

        trigger: "playHand",
        result: "addScore",

        condition: () => true,
        effect: function (playedCards) {
            const count = deck.filter(c => c.suit === '♠').length;
            return count * 50;
        }
    },
    { // Diamond's Ambition
        name: "Diamond's Ambition",
        suit: '♦',
        rarity: "Rare",

        get description() {
            return `x${this.mult.toFixed(2)} Mult.
        This card gains x0.5 mult for every ${this.suit} played, and loses x0.25 every non ${this.suit} played.`;
        },

        mult: 1.5,
        trigger: "playHand",
        result: "xMult",

        /**
         * NOTE: for some reason arrow functions dont bind "this." so "function" keyword 
          is used instead of "=>"
          thx js for being stupid
    
         * Documentation:
          https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
          "However, arrow functions do not have their own this binding. Therefore, their 
          this value cannot be set by bind(), apply() or call() methods, nor does it point 
          to the current object in object methods."
        */
        condition: (playedCards) => playedCards.length > 0,
        effect: function (playedCards) {
            let diamondCount = playedCards.filter(c => c.suit === this.suit).length;
            let nonDiamondCount = playedCards.length - diamondCount;

            this.mult += diamondCount * 0.5;
            this.mult -= nonDiamondCount * 0.25;
            this.mult = Math.max(1, this.mult);

            return this.mult;
        }
    },
    { // Clover's Fortune
        name: "Clover's Fortune",
        suit: '♣',
        rarity: "Rare",

        get description() {
            const count = chosenCards ? chosenCards.filter(c => c.suit === this.suit).length : 0;
            const gained = count * 10;
            return `+${gained} points.
        This card gains +10 points for every ${this.suit} played in your hand. (${count} played)`;
        },

        trigger: "playHand",
        result: "addScore",

        condition: (playedCards) => playedCards.some(c => c.suit === '♣'),
        effect: function (playedCards) {
            const count = playedCards.filter(c => c.suit === this.suit).length;
            return count * 10;
        }
    }



];

//#region EDIT_PERKS
const EDIT_PERKS = [

    // COMMON --------------

    { // Promotion
        name: "Promotion",
        description: "Increase the rank of up to 2 cards by 1",
        rarity: "Common",
        minReq: 1,
        maxReq: 2,
        apply: (cards) => {
            for (let card of cards) {
                let index = ranks.indexOf(card.rank);
                card.rank = ranks[(index + 1) % ranks.length];
            }
            sendEventText(`Promoted: ${cards.map(c => c.rank + c.suit).join(', ')}`);
        }
    },
    { // Reincarnation
        name: "Reincarnation",
        description: "Select up to 3 cards. Convert them into the same random suit.",
        rarity: "Common",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            let newSuit = random(suits);
            for (let card of cards) {
                card.suit = newSuit;
            }
            sendEventText(`All converted to ${newSuit}`);
        }
    },
    { // Trade
        name: "Trade",
        description: "Select up to 2 cards. Swap their suits.",
        rarity: "Common",
        minReq: 2,
        maxReq: 2,
        apply: (cards) => {
            const [a, b] = cards;
            const oldA = `${a.rank}${a.suit}`;
            const oldB = `${b.rank}${b.suit}`;
            const temp = a.suit;
            a.suit = b.suit;
            b.suit = temp;

            sendEventText(`Trade: ${oldA} ↔ ${a.rank}${a.suit}, ${oldB} ↔ ${b.rank}${b.suit}`);
        }
    },
    { // Barter
        name: "Barter",
        description: "Select up to 2 cards. Swap their ranks.",
        rarity: "Common",
        minReq: 2,
        maxReq: 2,
        apply: (cards) => {
            const [a, b] = cards;
            const oldA = `${a.rank}${a.suit}`;
            const oldB = `${b.rank}${b.suit}`;
            const temp = a.rank;
            a.rank = b.rank;
            b.rank = temp;

            sendEventText(`Barter: ${oldA} ↔ ${a.rank}${a.suit}, ${oldB} ↔ ${b.rank}${b.suit}`);
        }
    },
    { // Mathematician
        name: "Mathematician",
        description: "Select two cards of the same suit below 6. Left card becomes the sum.",
        rarity: "Common",
        minReq: 2,
        maxReq: 2,
        apply: (cards) => {
            const lowIndex = ranks.findIndex(r => r === '6');
            const idx1 = ranks.indexOf(cards[0].rank);
            const idx2 = ranks.indexOf(cards[1].rank);

            if (cards[0].suit !== cards[1].suit || idx1 > lowIndex || idx2 > lowIndex) return;

            let sum = idx1 + idx2 + 4;
            let newRank = ranks[min(sum, ranks.length - 1)];
            cards[0].rank = newRank;

            sendEventText(`${cards[0].suit} sum = ${newRank}`);
        }
    },
    { // Rip Apart
        name: "Rip Apart",
        description: "Destroy up to 2 selected cards.",
        rarity: "Common",
        minReq: 1,
        maxReq: 2,
        apply: (cards) => {
            for (let card of cards) {
                hand.splice(hand.indexOf(card), 1);
            }
            sendEventText(`Destroyed: ${cards.map(c => c.rank + c.suit).join(', ')}`);
        }
    },
    { // Recycle
        name: "Recycle",
        description: "Destroy one card. Gain +2 upgrade points.",
        rarity: "Common",
        minReq: 1,
        maxReq: 1,
        apply: (cards) => {
            hand.splice(hand.indexOf(cards[0]), 1);
            upgradePoints += 2;
            sendEventText(`Recycled ${cards[0].rank + cards[0].suit} → +2 upgrades`);
        }
    },
    { // Kindling
        name: "Kindling",
        description: "Destroy one card. Gain +2 burns.",
        rarity: "Common",
        minReq: 1,
        maxReq: 1,
        apply: (cards) => {
            hand.splice(hand.indexOf(cards[0]), 1);
            burnsRemaining += 2;
            sendEventText(`Immolated ${cards[0].rank + cards[0].suit} → +2 burns`);
        }
    },
    { // Shatter
        name: "Shatter",
        description: "Destroy one card. Gain +2 freezes.",
        rarity: "Common",
        minReq: 1,
        maxReq: 1,
        apply: (selected) => {
            hand.splice(hand.indexOf(selected[0]), 1);
            freezesRemaining += 2;
            sendEventText(`Shattered ${selected[0].rank + selected[0].suit} → +2 freezes`);
        }
    },
    { // Give and Take
        name: "Give and Take",
        description: "Destroy one card. Gain +2 Reshuffles.",
        rarity: "Common",
        minReq: 1,
        maxReq: 1,
        apply: (cards) => {
            const c = cards[0];
            const str = `${c.rank}${c.suit}`;

            // Remove from deck if it's in there
            const index = deck.indexOf(c);
            if (index !== -1) deck.splice(index, 1);

            reshuffleUses += 2;
            sendEventText(`Destroyed ${str}, gained +2 reshuffles`);
        }
    },


    // UNCOMMON --------------


    { // Midas' Touch
        name: "Midas' Touch",
        description: "Select up to 3 cards, convert them into the ♦ suit.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const changes = [];
            for (let card of cards) {
                const before = card.rank + card.suit;
                card.suit = '♦';
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }
            sendEventText(`${changes.join('; ')}`);
        }
    },
    { // Gambler's Luck
        name: "Gambler's Luck",
        description: "Select up to 3 cards, convert them into the ♣ suit.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const changes = [];
            for (let card of cards) {
                const before = card.rank + card.suit;
                card.suit = '♣';
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }
            sendEventText(`${changes.join('; ')}`);
        }
    },
    { // Lovers' Romance
        name: "Lovers' Romance",
        description: "Select up to 3 cards, convert them into the ♥ suit.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const changes = [];
            for (let card of cards) {
                const before = card.rank + card.suit;
                card.suit = '♥';
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }
            sendEventText(`${changes.join('; ')}`);
        }
    },
    { // Warriors' Courage
        name: "Warriors' Courage",
        description: "Select up to 3 cards, convert them into the ♠ suit.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const changes = [];
            for (let card of cards) {
                const before = card.rank + card.suit;
                card.suit = '♠';
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }
            sendEventText(`${changes.join('; ')}`);
        }
    },
    { // Usurper
        name: "Usurper",
        description: "Convert up to 2 cards into random face cards.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 2,
        apply: (cards) => {
            const faceRanks = ['J', 'Q', 'K'];
            const changes = [];

            for (let card of cards) {
                const old = card.rank + card.suit;
                card.rank = random(faceRanks);
                const updated = card.rank + card.suit;
                changes.push(`${old} → ${updated}`);
            }

            sendEventText(`Usurped: ${changes.join(', ')}`);
        }
    },
    { // Mimicry
        name: "Mimicry",
        description: "Convert the right-most card into a copy of the left-most.",
        rarity: "Uncommon",
        minReq: 2,
        maxReq: 2,
        apply: (cards) => {
            let [left, right] = cards;
            right.rank = left.rank;
            right.suit = left.suit;

            sendEventText(`Mimicked: ${right.rank}${right.suit}`)
        }
    },
    { // Synchronize
        name: "Synchronize",
        description: "Select up to 3 cards. They all become the same randomly chosen rank.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const newRank = random(ranks);
            cards.forEach(c => c.rank = newRank);

            const summary = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`All cards now ${newRank}. ${summary}`);
        }
    },
    { // Unify
        name: "Unify",
        description: "Select up to 3 cards. They become the same randomly chosen suit.",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const newSuit = random(suits);
            cards.forEach(c => c.suit = newSuit);

            const summary = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`All cards now ${newSuit}. ${summary}`);
        }
    },
    { // Colour Shift
        name: "Colour Shift",
        description: "Select up to 3 cards. Convert them into the next suit in rotation (♠ → ♥ → ♦ → ♣ → ♠).",
        rarity: "Uncommon",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const suitCycle = ['♠', '♥', '♦', '♣'];
            const before = cards.map(c => `${c.rank}${c.suit}`);

            cards.forEach(card => {
                let index = suitCycle.indexOf(card.suit);
                card.suit = suitCycle[(index + 1) % 4];
            });

            const after = cards.map(c => `${c.rank}${c.suit}`);
            sendEventText(`${before.join(', ')} → ${after.join(', ')}`);
        }
    },

    // RARE ------------------

    { // Echochamber
        name: "Echochamber",
        description: "Select up to 2 cards. Convert them into the most common card in your deck.",
        rarity: "Rare",
        minReq: 1,
        maxReq: 2,
        apply: (cards) => {
            const counts = {};
            deck.forEach(c => {
                const key = `${c.rank}${c.suit}`;
                counts[key] = (counts[key] || 0) + 1;
            });

            let mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (!mostCommon) return;

            const [rank, ...suitParts] = mostCommon;
            const suit = suitParts.join("");

            cards.forEach(c => {
                c.rank = rank;
                c.suit = suit;
            });

            const result = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`All set to ${rank}${suit} → ${result}`);
        }
    },
    { // Mass Promotion
        name: "Mass Promotion",
        description: "Increase the rank of all cards in the hand by 1.",
        rarity: "Rare",
        apply: () => {
            hand.forEach(c => {
                let idx = ranks.indexOf(c.rank);
                c.rank = (c.rank === 'A' || idx === -1 || idx + 1 >= ranks.length) ? '2' : ranks[idx + 1];
            });

            const newHand = hand.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`New hand → ${newHand}`);
        }
    },
    { // Sequencing
        name: "Sequencing",
        description: "Convert up to 5 selected cards into a perfect straight (random starting rank & suit).",
        rarity: "Rare",
        minReq: 3,
        maxReq: 5,
        apply: (cards) => {
            const start = floor(random(0, ranks.length - cards.length));
            const suit = random(suits);

            cards.forEach((c, i) => {
                c.rank = ranks[start + i];
                c.suit = suit;
            });

            const result = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Sequencing: ${result}`);
        }
    },
    { // Competition
        name: "Competition",
        description: "Select up to 5 cards. Convert them into the same rank as the leftmost selected card.",
        rarity: "Rare",
        minReq: 2,
        maxReq: 5,
        apply: (cards) => {
            const newRank = cards[0].rank;
            cards.forEach(c => c.rank = newRank);

            const result = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Competition: Rank → ${newRank} → ${result}`);
        }
    },
    { // Mob Mentality
        name: "Mob Mentality",
        description: "Select up to 5 cards. Convert them into the same suit as the leftmost selected card.",
        rarity: "Rare",
        minReq: 2,
        maxReq: 5,
        apply: (cards) => {
            const newSuit = cards[0].suit;
            cards.forEach(c => c.suit = newSuit);

            const result = cards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Mob Mentality: Suit → ${newSuit} → ${result}`);
        }
    },
    { // Bloodline
        name: "Bloodline",
        description: "All face cards in the hand are converted into the same suit.",
        rarity: "Rare",
        apply: () => {
            const faceCards = hand.filter(c => ['J', 'Q', 'K'].includes(c.rank));
            if (faceCards.length === 0) return;

            const newSuit = random(suits);
            faceCards.forEach(c => c.suit = newSuit);

            const result = faceCards.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Bloodline: Face cards converted to ${newSuit} → ${result}`);
        }
    },

    // MYTHICAL --------------

    { // Strength in Unity
        name: "Strength in Unity",
        description: "Convert all cards in hand into a random suit.",
        rarity: "Mythical",
        minReq: 0,
        maxReq: 0,
        apply: () => {
            const newSuit = random(suits);
            const changes = [];

            for (let card of hand) {
                const before = card.rank + card.suit;
                card.suit = newSuit;
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }

            sendEventText(`Unity: ${changes.join(', ')}`);
        }
    },
    { // Strength in Numbers
        name: "Strength in Numbers",
        description: "Convert all cards in hand into a random rank.",
        rarity: "Mythical",
        minReq: 0,
        maxReq: 0,
        apply: () => {
            const newRank = random(ranks);
            const changes = [];

            for (let card of hand) {
                const before = card.rank + card.suit;
                card.rank = newRank;
                const after = card.rank + card.suit;
                changes.push(`${before} → ${after}`);
            }

            sendEventText(`Strength in Numbers: ${changes.join(', ')}`);
        }
    },
    { // Requiem
        name: "Requiem",
        description: "Select up to 3 cards of a low rank (2–4). Convert them into an Ace.",
        rarity: "Mythical",
        minReq: 1,
        maxReq: 3,
        apply: (cards) => {
            const changed = [];
            cards.forEach(c => {
                if (['2', '3', '4'].includes(c.rank)) {
                    c.rank = 'A';
                    changed.push(`${c.rank}${c.suit}`);
                }
            });
            if (changed.length > 0) {
                sendEventText(`Requiem: Converted to Aces → ${changed.join(', ')}`);
            }
        }
    },
    { // Tithe
        name: "Tithe",
        description: "Destroy 10 random cards. Add 5 Aces to your deck.",
        rarity: "Mythical",
        apply: () => {
            const destroyed = [];
            for (let i = 0; i < 10 && deck.length > 0; i++) {
                const index = floor(random(deck.length));
                const removed = deck.splice(index, 1)[0];
                destroyed.push(`${removed.rank}${removed.suit}`);
            }

            for (let i = 0; i < 5; i++) {
                const suit = random(suits);
                deck.push(new Card('A', suit));
            }

            sendEventText(`Tithe: Destroyed → ${destroyed.join(', ')} | +5 Aces added`);
        }
    },
    { // Royal Blood
        name: "Royal Blood",
        description: "Convert all cards in the hand into a random face card, keeping their suits.",
        rarity: "Mythical",
        apply: () => {
            const faceRanks = ['J', 'Q', 'K'];
            const newRank = random(faceRanks);
            hand.forEach(c => c.rank = newRank);

            const result = hand.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Royal Blood: All ranks set to ${newRank} → ${result}`);
        }
    },
    { // Perfected Suit
        name: "Perfected Suit",
        description: "Convert the entire hand into the suit with the highest count in your deck.",
        rarity: "Mythical",
        apply: () => {
            const suitCounts = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };
            deck.forEach(c => suitCounts[c.suit]++);
            const topSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0][0];

            hand.forEach(c => c.suit = topSuit);
            const result = hand.map(c => `${c.rank}${c.suit}`).join(', ');
            sendEventText(`Perfected Suit: All suits → ${topSuit} → ${result}`);
        }
    },

    // LEGENDARY -------------

    { // Purge
        name: "Purge",
        description: "Destroy the 13 lowest-ranked cards in your deck.",
        rarity: "Legendary",
        apply: () => {
            if (deck.length === 0) return;

            const rankIndex = r => ranks.indexOf(r.rank);
            const sorted = [...deck].sort((a, b) => rankIndex(a) - rankIndex(b));
            const toRemove = sorted.slice(0, min(13, sorted.length));
            toRemove.forEach(c => deck.splice(deck.indexOf(c), 1));

            sendEventText(`Purge: Removed → ${toRemove.map(c => `${c.rank}${c.suit}`).join(', ')}`);
        }
    },
    { // Crystalize
        name: "Crystalize",
        description: "Select a card. Convert 10 random cards in the deck into the selected card.",
        rarity: "Legendary",
        minReq: 1,
        maxReq: 1,
        apply: (cards) => {
            if (!cards[0] || deck.length === 0) return;

            const ref = cards[0];
            const changed = [];
            for (let i = 0; i < 10 && deck.length > 0; i++) {
                const c = random(deck);
                c.rank = ref.rank;
                c.suit = ref.suit;
                changed.push(`${c.rank}${c.suit}`);
            }

            sendEventText(`Crystalize: 10 cards set to → ${ref.rank}${ref.suit}`);
        }
    },
    { // Bloom
        name: "Bloom",
        description: "Choose one card. Convert all other cards in the hand into the selected card.",
        rarity: "Legendary",
        minReq: 1,
        maxReq: 1,
        apply: (cards) => {
            const source = cards[0];
            const changed = [];

            for (let c of hand) {
                if (c !== source) {
                    c.rank = source.rank;
                    c.suit = source.suit;
                    changed.push(`${c.rank}${c.suit}`);
                }
            }

            sendEventText(`Bloom: All hand cards became → ${source.rank}${source.suit}`);
        },

    },
    { // Immolate
        name: "Immolate",
        description: "Select up to 5 cards. Destroy them, and gain 3 Burns for each card destroyed.",
        rarity: "Legendary",
        minReq: 1,
        maxReq: 5,
        apply: (cards) => {
            const destroyed = cards.map(c => `${c.rank}${c.suit}`);
            hand = hand.filter(c => !cards.includes(c));
            burnsRemaining += cards.length * 3;

            sendEventText(`Immolate: Burned ${destroyed.join(', ')} | +${cards.length * 3} Burns`);
        }
    },
    { // Frostbitten
        name: "Frostbitten",
        description: "Select up to 5 cards. Destroy them, and gain 3 Freezes for each card destroyed.",
        rarity: "Legendary",
        minReq: 1,
        maxReq: 5,
        apply: (cards) => {
            const destroyed = cards.map(c => `${c.rank}${c.suit}`);
            hand = hand.filter(c => !cards.includes(c));
            freezesRemaining += cards.length * 3;

            sendEventText(`Frostbitten: Shattered ${destroyed.join(', ')} | +${cards.length * 3} Freezes`);
        }
    },

    // CURSED ----------------

    { // Amnesia
        name: "Amnesia",
        description: "Randomize your entire deck.",
        rarity: "Cursed",
        minReq: 0,
        maxReq: 0,
        apply: () => {
            for (let i = 0; i < deck.length; i++) {
                deck[i].rank = random(ranks);
                deck[i].suit = random(suits);
            }

            sendEventText(`Your entire deck was randomized.`);
        }
    },
    { // Factory Reset
        name: "Factory Reset",
        description: "Your current hand is destroyed. Your entire deck is replaced with a fresh 52-card deck.",
        rarity: "Cursed",
        apply: () => {
            hand = [];
            deck = [];
            for (let suit of suits) {
                for (let rank of ranks) {
                    deck.push(new Card(rank, suit));
                }
            }
            shuffle(deck, true);
            sendEventText(`Factory Reset: Hand wiped. New deck initialized.`);
        }
    },
    { // Hivemind
        name: "Hivemind",
        description: "Convert all cards in hand into a single random suit.",
        rarity: "Cursed",
        apply: () => {
            const suit = random(suits);
            hand.forEach(c => c.suit = suit);
            sendEventText(`Hivemind: All suits became → ${suit}`);
        }
    },
    { // Singularity
        name: "Singularity",
        description: "Convert all cards in hand into a single random rank.",
        rarity: "Cursed",
        apply: () => {
            const rank = random(ranks);
            hand.forEach(c => c.rank = rank);
            sendEventText(`Singularity: All ranks became → ${rank}`);
        }
    },
    { // Erosion
        name: "Erosion",
        description: "Lower the ranks of all cards in the hand by 1.",
        rarity: "Cursed",
        apply: () => {
            const result = hand.map(c => {
                const i = ranks.indexOf(c.rank);
                const newIndex = i - 1 < 0 ? ranks.length - 1 : i - 1;
                c.rank = ranks[newIndex];
                return `${c.rank}${c.suit}`;
            });

            sendEventText(`Erosion: Hand ranks lowered → ${result.join(', ')}`);
        }
    }

]

//#region DEBUFFS
const DEBUFFS = [
    { // Score Leak
        name: "Score Leak",
        max: 10,
        description: "Lose 5% of your played score after every hand.",
        type: "perRound",
        effect: () => {
            score = floor(score * 0.95);
        },
    },
    { // Card Rot
        name: "Card Rot",
        description: "Removes 1 random card from your deck each round.",
        max: 99,
        type: "perRound",
        effect: () => {
            if (deck.length > 0) {
                deck.splice(floor(random(deck.length)), 1)
            }
        },
    },
    { // Perk Lockout
        name: "Silenced",
        description: "A random ability is disabled this round.",
        max: 5,
        type: "perRound",
        effect: () => {

            // no passive perks? dont do anything.
            if (passivePerks.length === 0) {
                disabledPerk = [];
                return;
            }

            // find perks not already locked
            const availableToDisable = passivePerks.filter(p => !disabledPerk.includes(p));

            // all already locked? don't do anything.
            if (availableToDisable.length === 0) return;

            // mark the perk as disabled.
            const newDisabled = random(availableToDisable);
            disabledPerk.push(newDisabled);
        },
    },
    { // Cramped Hand
        name: "Cramped Hand",
        description: "Draw 2 fewer cards per hand (min 3).",
        max: 5,
        type: "once",
        effect: () => {
            handSize = max(handSize - 2, 3);
        },
        revert: () => {
            handSize = min(handSize + 2, 10);
        }
    },
    { // Oblivious
        name: "Oblivious",
        description: "Skip the next upgrade phase.",
        max: 1,
        effect: () => {
            sendEventText("Upgrade phase was skipped...");
            activeDebuffs = activeDebuffs.filter(d => d.name !== "Oblivious"); // remove immediately.
            updateDebuffDisplay(); // update HTML debuff display
        }
    }
]


//#region RARITY_WEIGHTS
// Rarity weights, to handle what's more common
const RARITY_WEIGHTS = {
    Common: 0.70,
    Uncommon: 0.15,
    Rare: 0.06,
    Mythical: 0.025,
    Legendary: 0.005,
    Cursed: 0.015
};

//#region Helpers
function getMostFrequentCardInDeck() {
    if (!deck || deck.length === 0) return null;

    const countMap = {};
    for (const card of deck) {
        const key = `${card.rank}${card.suit}`;
        countMap[key] = (countMap[key] || 0) + 1;
    }

    let mostFrequent = null;
    let max = 0;
    for (const key in countMap) {
        if (countMap[key] > max) {
            max = countMap[key];
            mostFrequent = key;
        }
    }

    return mostFrequent; // e.g., "10♣"
}

// Event Text but for adding cards
function logAddedCards(cards) {
    if (cards.length === 0) return;
    const text = `Added: ${cards.map(c => c.rank + c.suit).join(', ')}`;

    sendEventText(text);
}

/**
* 
* THIS FILE STORES ALL THE CLASSES WITHIN THE GAME
* 
* The following classes in game are:
* Card - Playing card object for both drawing, and also storing rank/suit information
* Upgrade Choice - Object for the upgrade phase that stores upgrade choice info. handles applying them, etc.
* Game Button - the main button class, extends into multiple children
* 
*/


//#region Suit & Rank Maps
const suitMap = {
    '♥': 0, // Hearts
    '♣': 1, // Clubs
    '♦': 2, // Diamonds
    '♠': 3  // Spades
};

const rankMap = {
    '2': 0,
    '3': 1,
    '4': 2,
    '5': 3,
    '6': 4,
    '7': 5,
    '8': 6,
    '9': 7,
    '10': 8,
    'J': 9,
    'Q': 10,
    'K': 11,
    'A': 12
};


//#region Card
/**
 * 
 */
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.selected = false;
        this.x = 0;
        this.y = 0;
        this.width = cardWidth;
        this.height = cardHeight;
    }

    /** 
     * Draws the playing card into the UI.
     * @param {*} x The X position of the card.
     * @param {*} y The Y position of the card. */
    draw(x, y) {

        // Sets the origin X and Y of each card.
        this.x = x;
        this.y = y;

        // Sets the origin X and Y positions of the specific sprite within the sprite sheet.
        let sx = rankMap[this.rank] * this.width;
        let sy = suitMap[this.suit] * this.height;

        /** 
         * Is the card selected? (Shortened If statement for clarity.)
         * Change the color of the card to gold if YES.
         * Otherwise default to white if NO. */
        fill(this.selected ? 'gold' : 'white');
        rect(x, y, cardWidth, cardHeight, 5);

        // Draws the sprite over the rect.
        image(cardSpriteSheet, x, y, this.width, this.height, sx, sy, this.width, this.height);;
    }

    contains(mx, my) {
        return mx > this.x && mx < this.x + this.width &&
            my > this.y && my < this.y + this.height;
    }
}

// ------ UPGRADE ------------------------------------------------------------------------------------------------

//#region Upgrade Choice
class UpgradeChoice {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.x = 0;
        this.y = 0;
        this.w = 200;
        this.h = 200;
    }

    get name() { return this.data.name; }
    get description() { return this.data.description; }
    get rarity() { return this.data.rarity || "Common" }

    draw(i) {
        const count = upgradeChoices.length;
        const pad = 15;
        const stepMax = this.w + 20;

        const spacing = (count > 1)
            ? Math.min((width - 2 * pad - this.w) / (count - 1), stepMax)
            : 0;

        const totalWidth = spacing * (count - 1) + this.w;
        const startX = (width - totalWidth) / 2;

        // Center position for this upgrade choice
        this.x = startX + (this.w / 2) + i * spacing;
        this.y = height / 3 + 50;

        // card
        fill(selectedUpgradeIndex === i ? 40 : 60); // if logic encapsulated within fill method.
        rect(this.x - 100, this.y - 100, this.w, this.h, 20);

        // if frozen
        if (frozenUpgrades.has(i)) {
            noFill();
            stroke(0, 200, 255);
            strokeWeight(3);
            rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h, 20);
            noStroke();
        }

        // text
        const rarityColour = getRarityColor(this.rarity);
        const typeText = () => {
            switch (this.type) {
                case "passive": return "Passive Ability";
                case "pack": return "Booster"
                case "edit": return "Refinement"
                case "perk": return "Perk"
                default: throw Error("Type not correctly defined.");
            }
        }

        fill(rarityColour);
        textAlign(CENTER, CENTER);

        textSize(10);
        text(`${typeText()}`, this.x, this.y - 60)

        textSize(16);
        text(this.name, this.x, this.y - 40);

        textSize(12);
        text(`[${this.rarity}]`, this.x, this.y - 20);

        fill(255);
        textSize(12);
        text(this.description, this.x - 90, this.y + 10, 180, 100);
    }

    contains(mx, my) {
        return (
            mx >= this.x - 100 && mx <= this.x - 100 + this.w &&
            my >= this.y - 100 && my <= this.y - 100 + this.h
        );
    }

    isBurnable() {
        return this.rarity !== "Cursed";
    }

    apply() {

        // if perk type is "passive"
        if (this.type === "passive") {
            if (passivePerks.length >= MAX_PASSIVE_PERKS) {
                alert("You already have 5 passive perks. Remove one before adding another.");
                return false;
            }
            passivePerks.push(this.data);
            updatePassivePerkDisplay?.();
            return true;
        }

        // if perk type is "pack"
        if (this.type === "pack" || this.type === "perk") {
            this.data.apply?.(); // apply pack
            this.type === "pack" ? shuffle(deck, true) : null; // shuffle the deck if pack
            updatePassivePerkDisplay?.(); // update perk display
            return true;
        }

        // if the perk type is "edit"
        if (this.type === "edit") {
            const selectedCards = selected.map(i => hand[i]);
            const req = this.data;

            if (selectedCards.length < req.minReq) {
                eventTextAnimations.push({
                    text: `You need to select at least ${req.minReq} first!`,
                    x: width / 2,
                    y: height / 2 - 100 + (eventTextAnimations.length * 30),
                    opacity: 255,
                    timer: 60
                });
                return;
            } else if (selectedCards.length > req.maxReq) {
                eventTextAnimations.push({
                    text: `You can only selected a max of ${req.maxReq} cards!`,
                    x: width / 2,
                    y: height / 2 - 100 + (eventTextAnimations.length * 30),
                    opacity: 255,
                    timer: 60
                });
                return;
            }

            this.data.apply?.(selectedCards);
            updatePassivePerkDisplay?.();
            shuffle(deck, true);
            return true;
        }

        return false;
    }
}

//#region Game Button
/**
* Base class for the game UI buttons.
* @param {*} x The X position of the Button.
* @param {*} y The Y position of the Button.
* @param {*} w The width of the button
* @param {*} h 
* @param {*} label 
*/
class GameButton {

    constructor(x, y, w, h, label) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.label = label;
        this.visible = true;
    }

    draw() {
        if (!this.visible) return; // If "visible" is false, stop the function here.
        fill(0, 200, 0);
        rect(this.x, this.y, this.w, this.h, 10);
        fill(255);
        text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    contains(mx, my) {
        return (
            mx >= this.x && mx <= this.x + this.w &&
            my >= this.y && my <= this.y + this.h
        );
    }

    onClick() {
        // To be overridden in subclass.
        throw new Error("onClick () must be overriden by subclass");
    }
}

//#region Play Hand Button
/**
* The play button object, should trigger "playHand()" when clicked.
*/
class PlayHandButton extends GameButton {

    constructor() {
        super(width / 2 - 65, height - 75, 120, 40, "Play Hand");
    }

    draw() {
        this.updatePosition(width / 2 - 65, height - 75)
        super.draw();
    }

    onClick() {
        playHand();
    }
}

//#region Shuffle Button
/**
* The play button object, should trigger "reshuffleHand()" when clicked.
*/
class ShuffleButton extends GameButton {
    constructor(x, y) {
        super(x, y, 140, 40, `Reshuffle (${reshuffleUses})`);
    }

    draw() {
        this.label = `Reshuffle (${reshuffleUses})`; // update label each frame.
        super.draw();
    }

    onClick() {
        reshuffleHand();
    }
}

//#region Upgrade Confirm Button
class ConfirmButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, "Confirm");
    }

    draw() {
        this.updatePosition(width / 2 - 130, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        if (selectedUpgradeIndex === null) return;

        const choice = upgradeChoices[selectedUpgradeIndex];
        const ok = choice.apply();
        if (!ok) return;

        if (ok) {
            frozenUpgrades.delete(selectedUpgradeIndex);
            upgradePoints--;
            upgradePoints > 0 ? generateUpgradeChoice() : nextAnte();
        }
    }
}

//#region Skip / Store Button
class SkipButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Skip and Store`);
    }

    draw() {
        this.updatePosition(width / 2 + 10, height / 1.3 + 20)
        super.draw();
    }

    onClick() {
        storedUpgradePoints++;
        upgradePoints--;
        generateUpgradeChoice();

        if (upgradePoints <= 0) nextAnte();
    }
}

//#region Burn Button
class BurnButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Burn (${burnsRemaining})`);
    }

    draw() {
        this.updatePosition(width / 2 + 150, height / 1.3 + 20)
        this.label = `Burn (${burnsRemaining})`
        super.draw();
    }


    onClick() {
        if (burnUsed) {
            eventTextAnimations.push({
                text: "You can only burn once per upgrade point!",
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        if (selectedUpgradeIndex == null) return;

        const selectedUpgrade = upgradeChoices[selectedUpgradeIndex];

        if (!selectedUpgrade.isBurnable()) {
            eventTextAnimations.push({
                text: `Cannot burn a Cursed upgrade!`,
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        if (burnsRemaining <= 0) {
            eventTextAnimations.push({
                text: `No burns remaining!!`,
                x: width / 2,
                y: height / 2 - 80,
                opacity: 255,
                timer: 60
            });
            return;
        }

        // i hate how ugly this looks
        const burned = upgradeChoices[selectedUpgradeIndex]; // get the selected upgrade
        burnedUpgrades.push(burned.name); // push it into the list of burned upgrades
        frozenUpgrades.delete(selectedUpgradeIndex); // get rid of the freeze if there is one.
        sendEventText(`${burned.name} has been burned!`)
        upgradeChoices.splice(selectedUpgradeIndex, 1); // remove from selectable list
        selectedUpgradeIndex = null; // reset burned index back to null
        burnsRemaining--; // decrease amount of burns by 1
        burnUsed = true // cannot use burn again until another upgrade is chosen, or the upgrade is skipped.
    }
}

//#region Freeze Button
class FreezeButton extends GameButton {
    constructor() {
        super(0, 0, 120, 40, `Freeze (${freezesRemaining})`);
    }

    draw() {
        this.updatePosition(width / 2 - 270, height / 1.3 + 20)

        const hasSelection = selectedUpgradeIndex !== null && upgradeChoices[selectedUpgradeIndex];
        const isFrozen = hasSelection && frozenUpgrades.has(selectedUpgradeIndex)

        this.label = (hasSelection && isFrozen)
            ? "Unfreeze"
            : `Freeze (${freezesRemaining})`;

        super.draw();
    }

    onClick() {
        if (selectedUpgradeIndex == null) return;

        const idx = selectedUpgradeIndex;

        if (frozenUpgrades.has(idx)) {
            frozenUpgrades.delete(idx);
            this.label = `Freeze (${freezesRemaining})`
            return;
        }

        if (freezesRemaining <= 0) {
            sendEventText(`No more freezes remaining!`);
            return;
        }

        const choice = upgradeChoices[idx];
        if (!choice) return;
        frozenUpgrades.set(idx, choice);
        this.label = "Unfreeze"
        freezesRemaining--;
    }
}

/**
* 
* This script handles the rendering and UI elements of the game.
*
*/

console.error(`%cfuck off`, 'color: red; font-size: 50px; background-color: white;')


function preload() {
    cardSpriteSheet = loadImage("assets/deck.png");
}

function setup() {

    // canvas setup;
    let canvasWidth = max(windowWidth, 1200);
    let canvasHeight = max(windowHeight, 800);
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.position(0, 0)
    canvas.style('z-index', '-1')
    canvas.id("gameCanvas");

    // HTML perk/debuff display setup.
    passivePerkDisplayDiv = document.getElementById('perkDisplay');
    debuffDisplayDiv = document.getElementById('debuffDisplay')
    updatePassivePerkDisplay();

    // button setup
    // positions are set within the class because i am lazy and having it out here is pretty redundant imo
    playBtn = new PlayHandButton();
    shuffleBtn = new ShuffleButton();
    confirmBtn = new ConfirmButton();
    skipBtn = new SkipButton();
    burnBtn = new BurnButton();
    freezeBtn = new FreezeButton();

    // ui setup.
    noSmooth();
    textAlign(CENTER, CENTER);
    textSize(20);

    // game setup
    generateDeck();
    drawHand();

    // debug stuff goes here for testing
    // upgradePoints = 999999
    // debugUpgrade(); // temp

    // background setup
    bgColours = [
        color(128, 15, 60),  // deep purple
        color(50, 5, 25)    // dark blue
    ];

    for (let i = 0; i < 15; i++) {
        blobs.push({
            x: random(width),
            y: random(height),
            baseR: random(100, 250),          // used for pulsing radius
            speed: random(0.0001, 0.0010),    // used for motion
            pulseSpeed: random(0.005, 0.001), // used for pulsing animation
            offset: random(TWO_PI)
        });
    }

}

function draw() {

    // draws the background
    drawGradientBackground();

    // makes it look nicer
    blendMode(SOFT_LIGHT);

    // go thru all blobs in bg
    for (let b of blobs) {
        let t = millis() * b.speed + b.offset; // define the time
        let pulse = sin(millis() * b.pulseSpeed + b.offset) * 20; // pulsing


        let x = b.x + sin(t) * 30;
        let y = b.y + cos(t * 1.1) * 30;
        let r = b.baseR + pulse;

        drawGlowingBlob(x, y, r); // draws the blob
    }
    blendMode(BLEND);

    // draws the game ui
    drawUI();

}

// resizes the canvas + limits it to a minimum size of 1200 x 800
// the html displays would overlap onto the actual play area.
function windowResized() {
    let newWidth = max(windowWidth, 1200);
    let newHeight = max(windowHeight, 800);
    resizeCanvas(newWidth, newHeight);
}

// draws the glowing pulsing blobs in the backgrounds
function drawGlowingBlob(x, y, r) {
    let layers = 4;
    let c = lerpColor(bgColours[0], bgColours[1], 0.5);

    for (let i = layers; i >= 1; i--) {
        let radius = r * (i / layers);
        let alpha = 15 * i;

        // fade out edges near canvas border
        let d = dist(x, y, width / 2, height / 2);
        let edgeFade = map(d, 0, width * 0.75, 1, 0);
        edgeFade = constrain(edgeFade, 0, 1);
        fill(red(c), green(c), blue(c), alpha * edgeFade);

        ellipse(x, y, radius);
    }
}

// draws and shifts the gradient background colours.
function drawGradientBackground() {
    noStroke();

    let t = millis() * 0.0005; // slow time
    let colorShift = sin(t) * 0.5 + 0.5; // 0 to 1 range

    let topColour = lerpColor(bgColours[0], bgColours[1], colorShift);
    let bottomColour = lerpColor(bgColours[1], bgColours[0], colorShift);

    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(topColour, bottomColour, inter);
        fill(c);
        rect(0, y, width, 1);
    }
}

// draws the whole game ui
function drawUI() {
    if (gameState === "playing") {
        textSize(20);
        fill(255);
        text(`[ Score: ${score} / ${getUpgradeThreshold()} ] [ Total Score: ${totalScore} ]`, width / 2, 90);
        text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width / 2, 120);
        text(`Deck: ${deck.length} cards left`, width / 2, 150);

        if (previewHandInfo && previewHandInfo.usedCards) {
            let baseScore = previewHandInfo.score;
            let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
            text(`Selected Hand: ${previewHandInfo.name} (${baseScore} x ${multiplier})`, width / 2, height - 100);
        }

        // Reshuffle button
        if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
            shuffleBtn.updatePosition(width - 200, height - 75);
            shuffleBtn.draw();
        }

        // Play Hand button
        if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
            // playBtn.updatePosition(width / 2 - 65, height - 75);
            playBtn.draw();
        }
    }

    drawHandUI(); // draw the hand UI

    if (gameState === "upgrade") {
        drawUpgradeScreen();
    }

    if (gameState === "gameover") {
        drawGameOver();
    }

    // Event Text
    for (let i = eventTextAnimations.length - 1; i >= 0; i--) {
        let anim = eventTextAnimations[i];

        push(); // isolate text styles.
        fill(255, anim.opacity);
        textAlign(CENTER);
        textSize(24);
        text(anim.text, anim.x, anim.y);
        pop(); // restore previous text styles

        anim.opacity -= 4;
        anim.y -= 0.5;
        anim.timer--; // probably shouldn't be tied to frame rate but im lazy

        if (anim.timer <= 0 || 0) {
            eventTextAnimations.splice(i, 1); // remove the text from the array when timer expires.
        }
    }
}

// sends the event text because i realise writing this exact same code everywhere is a pain.
function sendEventText(text) {
    const areaWidth = 400;
    const areaHeight = 200;

    const x = random((width - areaWidth) / 2, (width + areaWidth) / 2);
    const y = random((height - areaHeight) / 4, (height + areaHeight) / 4);

    eventTextAnimations.push({
        text: text,
        x,
        y,
        opacity: 255,
        timer: 60
    });
}

function drawHandUI() {
    let size = hand.length;
    const pad = 15;
    const stepMax = cardWidth + 20;

    let spacing;


    if (size > 1) {
        spacing = Math.min((width - 2 * pad - cardWidth) / (size - 1), stepMax);
    } else {
        spacing = 0;
    }

    let totalWidth = spacing * (size - 1) + cardWidth;
    let startX = (width - totalWidth) / 2;

    for (let i = 0; i < hand.length; i++) {
        let card = hand[i];
        if (!card) continue; // stops the game from crashing if there's no more cards to draw
        if (isDragging && card === heldCard) continue; // do not render the card if it is being dragged

        // calcuate the start
        let x = startX + i * spacing;
        let y = height / 2;

        if (gameState === "playing") {
            y = height / 2;
        } else if (gameState === "upgrade") {
            y = height / 2 + 75;
        }

        card.draw(x, y);
    }

    // Draw the dragged card last so it appears on top
    if (heldCard && isDragging) {
        heldCard.draw(mouseX - dragOffsetX, mouseY - dragOffsetY);
    }
}

// just a switch statement that returns colors lol
function getRarityColor(rarity) {
    switch (rarity) {
        case "Common": return color(200);                     // light gray
        case "Uncommon": return color(100, 200, 255);           // blue
        case "Rare": return color(255, 100, 200);           // pinkish purple
        case "Mythical": return color(255, 215, 0);             // gold (bright)
        case "Legendary": return color(255, 140, 0);             // orange (burnished gold)
        case "Cursed": return color(150, 0, 255);             // vivid purple
        default: return color(255);                     // fallback white
    }
}

function drawUpgradeScreen() {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    text("Choose an Upgrade", width / 2, 110);
    text(`Upgrades remaining: ${upgradePoints}`, width / 2, 140);

    for (let i = 0; i < upgradeChoices.length; i++) {
        upgradeChoices[i].draw(i);
    }

    confirmBtn.draw();
    skipBtn.draw();
    burnBtn.draw();
    freezeBtn.draw();
}

function drawGameOver() {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Game Over", width / 2, height / 2 - 100);
    textSize(20);
    text(`Final Score: ${totalScore}`, width / 2, height / 2 - 60);

    textSize(16);
    text("Enter your name (max 12 characters):", width / 2, height / 2);
    text(playerName, width / 2, height / 2 + 30);
}

function updatePassivePerkDisplay() {
    if (!passivePerkDisplayDiv) return;
    passivePerkDisplayDiv.innerHTML = '';

    passivePerks.forEach((perk, index) => {

        // defines the divs for the perks.
        const perkDiv = document.createElement('div');
        const perkDescDiv = document.createElement('div');

        // defines and sets 'perk-item' entries
        perkDiv.className = 'perk-item';
        perkDiv.innerHTML = `<strong>${perk.name}</strong>`;

        // defines and sets 'perk-desc' entries
        perkDescDiv.className = 'perk-desc';
        perkDescDiv.innerHTML = `<p>${perk.description}</p>
    <button id="removePerk" onclick="removePassivePerk(${index})">Remove</button>`;

        // changes style to reflect disabled state
        if (disabledPerk.includes(perk)) {
            perkDiv.style.opacity = "0.5";
            perkDiv.style.textDecoration = "line-through";
            perkDescDiv.style.textDecoration = "line-through";
            perkDiv.title = "Locked this round";
        }

        // sets the divs into the perk display.
        passivePerkDisplayDiv.appendChild(perkDiv);
        perkDiv.appendChild(perkDescDiv);
        document.getElementById("perkCount").textContent =
            `Abilities [ ${passivePerks.length} / ${MAX_PASSIVE_PERKS} ]:`
    })
}

function removePassivePerk(index) {
    passivePerks.splice(index, 1);
    updatePassivePerkDisplay();
}

function updateDebuffDisplay() {
    if (!debuffDisplayDiv) return;
    debuffDisplayDiv.innerHTML = '';

    const debuffMap = new Map();

    // checks if the buff exists already, +1 to the counter for the first instance.
    activeDebuffs.forEach(debuff => {
        if (!debuffMap.has(debuff.name)) {
            debuffMap.set(debuff.name, { count: 1, description: debuff.description });
        } else {
            debuffMap.get(debuff.name).count++;
        }
    });

    // Display each unique debuff with count
    debuffMap.forEach((value, name) => {
        const debuffDiv = document.createElement('div');
        const debuffDescDiv = document.createElement('div');

        debuffDiv.className = 'debuff-item';
        debuffDescDiv.className = 'debuff-desc';

        const displayName = value.count > 1 ? `${name} (x${value.count})` : name;

        debuffDiv.innerHTML = `<strong>${displayName}</strong>`;
        debuffDescDiv.innerHTML = `<p>${value.description}</p>`;

        debuffDisplayDiv.appendChild(debuffDiv);
        debuffDiv.appendChild(debuffDescDiv);
    });
}

/**
 * 
 * this script stores the main game functions and code
 * witness insanity and a lot of ramblings
 * 
 */

//#region generateDeck()
function generateDeck() {
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            deck.push(new Card(r, s));
        }
    }
    shuffle(deck, true);
}

//#region generateRandomCard()
function generateRandomCard(suit = null) {
    let chosenSuit = suit || random(suits);
    let rank = random(ranks); // uses string values like '7' or 'K'
    return new Card(rank, chosenSuit);
}

//#region drawHand()
function drawHand() {
    // if hand has more than allowed size
    if (hand.length > handSize) {
        let excess = hand.splice(handSize); // remove extra cards at the end
        deck = deck.concat(excess); // put back into deck
        shuffle(deck); // shuffle the deck
    }

    // if hand has fewer than allowed size, draw the difference
    let needed = handSize - hand.length;
    if (needed > 0) {
        let drawn = deck.splice(0, needed);
        hand = hand.concat(drawn);
    }
}

//#region mousePressed()
function mousePressed() {

    // Check if a card is being clicked (drag start)
    for (let i = 0; i < hand.length; i++) {
        let card = hand[i];
        if (card && card.contains(mouseX, mouseY)) {
            heldCard = card;
            holdingCardIndex = i;
            holdStartTime = millis();
            dragOffsetX = mouseX - card.x;
            dragOffsetY = mouseY - card.y;
            break;
        }
    }

    if (gameState === "playing") {
        // Handle play button click
        if (playBtn && playBtn.contains(mouseX, mouseY)) {
            playBtn.onClick();
            return;
        }

        // Handle shuffle button click
        if (shuffleBtn && shuffleBtn.contains(mouseX, mouseY)) {
            shuffleBtn.onClick();
            return;
        }
    }


    // upgrade phase - handle upgrade selection
    if (gameState === "upgrade") {
        for (let i = 0; i < upgradeChoices.length; i++) {
            if (upgradeChoices[i].contains(mouseX, mouseY)) {
                // select and deselect the current upgrade. 
                selectedUpgradeIndex !== i
                    ? selectedUpgradeIndex = i
                    : selectedUpgradeIndex = null;
            }
        }

        if (confirmBtn && confirmBtn.contains(mouseX, mouseY)) {
            confirmBtn.onClick();
        }

        if (skipBtn && skipBtn.contains(mouseX, mouseY)) {
            skipBtn.onClick();
        }

        if (burnBtn && burnBtn.contains(mouseX, mouseY)) {
            burnBtn.onClick();
        }

        if (freezeBtn && freezeBtn.contains(mouseX, mouseY)) {
            freezeBtn.onClick();
        }

    }
}

//#region mouseDragged()
function mouseDragged() {
    if (heldCard && !isDragging && millis() - holdStartTime > 200) {
        isDragging = true;
    }

    if (isDragging && heldCard) {
        heldCard.x = mouseX - dragOffsetX;
        heldCard.y = mouseY - dragOffsetY;
    }
}

//#region mouseReleased()

function mouseReleased() {
    if (isDragging && heldCard) {

        // calculate insertion index using midpoints of between current slots

        // find the closest index
        let minDist = Infinity;
        let targetIndex = holdingCardIndex;

        for (let i = 0; i < hand.length; i++) {
            if (i === holdingCardIndex) continue;
            const card = hand[i];
            const d = dist(heldCard.x, heldCard.y, card.x, card.y);
            if (d < minDist) {
                minDist = d;
                targetIndex = i;
            }
        }

        if (minDist <= 150 && targetIndex !== holdingCardIndex) {
            // remove held card
            const movedCard = hand.splice(holdingCardIndex, 1)[0];

            // if removed before target, target index shifts left by 1
            const insertAt = (targetIndex > holdingCardIndex) ? targetIndex - 1 : targetIndex;

            // insert currently held card in new spot
            hand.splice(insertAt, 0, movedCard);

            // reindex `selected` array to reflect the move
            selected = selected.map(idx => {
                if (idx === holdingCardIndex) return insertAt;

                // moved foward: shift indices in (oldIdx, new Idx] left by 1
                if (holdingCardIndex < insertAt && idx > holdingCardIndex && idx <= insertAt) return idx - 1;
                if (insertAt < holdingCardIndex && idx >= insertAt && idx < holdingCardIndex) return idx + 1;

                return idx;
            });

            // dedupe, clamp, sort
            selected = Array.from(new Set(selected))
                .filter(i => i >= 0 && i < hand.length)
                .sort((a, b) => a - b);
        }

    } else if (heldCard) {
        // click based selection toggle (no drag)
        const idx = holdingCardIndex;
        if (heldCard.selected) {
            selected = selected.filter(n => n !== idx);
            heldCard.selected = false;
        } else if (selected.length < 5) {
            selected.push(idx);
            heldCard.selected = true;
        }
    }

    // resync `selected` from card flags to avoid ghosting
    selected = hand.reduce((arr, c, i) => {
        if (c && c.selected) arr.push(i);
        return arr;
    }, []);

    if (gameState === "playing" && selected.length >= 1) {
        const chosenCards = selected.map(i => hand[i]).filter(Boolean);
        previewHandInfo = evaluateHand(chosenCards);
        previewHandInfo.cards = chosenCards;
        previewHandInfo.baseScore = previewHandInfo.score;
    } else {
        previewHandInfo = null;
    }

    // reset drag state
    isDragging = false;
    heldCard = null;
    holdingCardIndex = -1;
}

//#region keyTyped()
function keyTyped() {
    if (gameState === "gameover") {
        if (playerName.length < 12 && key.match(/^[a-zA-Z0-9 ]$/)) {
            playerName += key;
        }
    }
}

//#region keyPressed()
function keyPressed() {
    if (gameState === "gameover") {
        if (keyCode === BACKSPACE) {
            playerName = playerName.slice(0, -1);
        }
        if (keyCode === ENTER && playerName.trim() !== "") {
            saveScore(playerName.trim(), totalScore);
            window.location.href = "leaderboard.html"; // redirect to leaderboard
        }
    }
}

//#region saveScore()
function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

//#region playHand()
function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    currentHandInfo = evaluateHand(chosenCards);

    let baseScore = currentHandInfo.score;
    let passiveAddScore = 0;
    let passiveAddMult = 1;
    let passiveXMult = 1;
    let rankMult = calculateRankMultiplier(currentHandInfo.usedCards);

    // activate all current perks
    passivePerks.forEach(perk => {
        if (disabledPerk.includes(perk)) return;

        if (perk.trigger === "playHand" && perk.condition(chosenCards)) {
            const result = perk.effect(chosenCards); // playedCards inputs 

            switch (perk.result) {
                case "addScore": passiveAddScore += result; break;
                case "addMult": passiveAddMult += result; break;
                case "xMult": passiveXMult *= result; break;
                default: perk.effect(); break; // if not specified, then effect is not score related.
            }

            sendEventText(`${perk.name} activated!`);
        }
    });

    // math for how scoring should be calculated
    // should be simple enough to understand
    let finalScore = Math.floor
        ((baseScore + passiveAddScore) * ((rankMult + passiveAddMult) * passiveXMult));

    // for "silenced" debuff - clears previous round's locks
    disabledPerk = [];

    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    updatePassivePerkDisplay();
    updateDebuffDisplay();

    score += finalScore
    lastHandInfo = currentHandInfo;
    currentHandInfo = null;
    previewHandInfo = null;
    round++;

    // Replace only the selected card indices
    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        hand[handIndex] = deck.length > 0 ? deck.shift() : null;
    }

    selected = [];
    gameStateLogic();
}

//#
function scoringLogic(baseScore, playedCards) {
}

//#region gameStateLogic()
// handles what should happen after rounds = maxRound, and also game over condition
// just a bunch of if statements really
function gameStateLogic() {

    if (deck.length === 0 && hand.every(card => card === null)) {
        gameState = "gameover";
    }

    if (round > maxRounds) {
        let baseThreshold = getUpgradeThreshold();

        if (score >= baseThreshold) {

            // convert ante score into upgrades
            let gainedUpgrades = Math.floor(score / baseThreshold);
            upgradePoints = gainedUpgrades + storedUpgradePoints;
            storedUpgradePoints = 0;

            // transfer score to totalScore
            totalScore += score;
            score = 0;

            // if there's more than 0 upgrade points, then choose another upgrade.
            if (upgradePoints > 0) {

                // logic for "oblivious" debuff. skips the upgrade phase
                const oblivious = activeDebuffs.find(d => d.name === "Oblivious"); // checks if oblivious exists in activeDebuff array.
                if (oblivious) {
                    oblivious.effect();
                    nextAnte();
                    return;
                }

                gameState = "upgrade";
                generateUpgradeChoice();
            } else {
                nextAnte();
            }

        } else {

            // reset stored points if player didn't meet the threshold.
            if (storedUpgradePoints > 0) {
                sendEventText(`Failed to reach score requirement, ${storedUpgradePoints} stored upgrades lost!`)
            } else if (round === maxRounds + 1) {
                sendEventText(`You must meet the score requirement to progress!`);
            }
            storedUpgradePoints = 0;
            drawHand();
        }

    } else {
        drawHand(); // new hand if its not a new ante.
    }
}

//#region reshuffleHand()
function reshuffleHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);

    if (selected.length === 0 || reshuffleUses <= 0) return;

    let chosenCards = selected.map(i => hand[i]);
    chosenCards.forEach(c => c.selected = false);
    deck.push(...chosenCards);
    shuffle(deck, true);

    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        if (deck.length > 0) {
            hand[handIndex] = deck.shift();
            hand[handIndex].selected = false;
        } else {
            hand[handIndex] = null;
        }
    }

    selected = [];
    currentHandInfo = null;
    previewHandInfo = null;
    reshuffleUses--;

    // For shuffle based perks (Card Crawler for now)
    passivePerks.forEach(perk => {
        if (perk.name === "Card Crawler") {
            perk.effect(0); // score doesn't matter here
            eventTextAnimations.push({
                text: `${perk.name} activated!`,
                x: width / 2,
                y: height / 2 - 100 + (eventTextAnimations.length * 30),
                opacity: 255,
                timer: 60
            });
        }
    });
}

//#region returnHand()
function returnHand() {
    for (let card of hand) {
        card.selected = false; // unmark all cards as selected
    }
    selected = []; // clear selected cards
    deck = deck.concat(hand); // move hand back into the deck
    hand = []; // clear the hand
    shuffle(deck, true); // shuffle the deck
}

function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1);
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}

//#region weightedRandomRarity()
function weightedRandomRarity() {
    let r = random();
    let cumulative = 0;
    for (let rarity in RARITY_WEIGHTS) {
        cumulative += RARITY_WEIGHTS[rarity];
        if (r < cumulative) return rarity;
    }
    return "Common";
}

//#region generateUpgradeChoice()

// this has genuinely caused me the most headaches
// i wish death upon javascript
// chatGPT was used here for debugging -> ended up being typos & generation returns null as a choice for some reason
function generateUpgradeChoice() {
    selectedUpgradeIndex = null;
    burnUsed = false;
    returnHand();
    drawHand();

    const frozenNames = new Set(
        [...frozenUpgrades.values()]
            .map(choice => choice?.data?.name)
            .filter(Boolean)
    );

    // filters -> no duplicate choices with already owned passives + burned upgrades
    const availablePassives = PASSIVE_PERKS.filter(p =>
        !passivePerks.some(pp => pp.name === p.name) &&
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availablePacks = PACKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availableEdits = EDIT_PERKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );
    const availablePerks = PERKS.filter(p =>
        !burnedUpgrades.includes(p.name) &&
        !frozenNames.has(p.name)
    );

    const slots = new Array(upgradeChoiceAmount).fill(null); // prepare output array & keep frozen upgrades
    const usedNames = new Set(frozenNames); // already appeared in this roll

    // place frozen upgrades back into their respective slots
    // burned upgrade? get rid of it
    // frozen upgrade is overflowing? get rid of it
    for (const [slotIdx, choice] of [...frozenUpgrades.entries()]) {
        if (
            slotIdx < upgradeChoiceAmount &&
            choice &&
            !burnedUpgrades.includes(choice.data?.name)
        ) {
            slots[slotIdx] = choice;
            usedNames.add(choice.data.name);
        } else {
            // invalid/overflowed frozen – drop it
            frozenUpgrades.delete(slotIdx);
        }
    }

    // helper - pick from a pool by rarity while avoiding duplicates
    const tryPickByRarity = (pool, rarity) => {
        const candidates = pool.filter(p => p.rarity === rarity
            && !usedNames.has(p.name)
        );
        if (!candidates.length) return null;
        const pick = random(candidates);
        usedNames.add(pick.name);
        return pick;
    };

    const tryPickAny = (pool) => {
        const pick = pool.find(p => !usedNames.has(p.name));
        if (!pick) return null;
        usedNames.add(pick.name);
        return pick;
    };

    // fill empty slots.
    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue;

        const roll = random();
        let rarity = weightedRandomRarity();

        if (forcedCursedCount > 0) {
            rarity = "Cursed";
            forcedCursedCount--
            sendEventText(`An upgrade had become cursed!`);
        }

        const typePools = [
            { chance: 0.55, type: "pack", pool: availablePacks }, // 55% chance
            { chance: 0.75, type: "edit", pool: availableEdits }, // 25% chance
            { chance: 0.9, type: "passive", pool: availablePassives }, // 10% chance
            { change: 1.0, type: "perk", pool: availablePerks } // 10% chance
        ];

        for (let { chance, type, pool } of typePools) {
            if (roll < chance && pool.length > 0) {
                const filteredPool = rarity === "Cursed"
                    ? pool.filter(p => p.rarity === "Cursed")
                    : pool;

                const pick = tryPickByRarity(filteredPool, rarity) || tryPickAny(filteredPool);
                if (pick) {
                    slots[i] = new UpgradeChoice(type, pick);
                    break;
                }
            }
        }
    }

    // fall back to prevent "nulls" from being generated
    // i hate this so much
    const classifyType = (item) => {
        if (availablePacks.some(p => p.name === item.name)) return "pack";
        if (availableEdits.some(p => p.name === item.name)) return "edit";
        if (availablePassives.some(p => p.name === item.name)) return "passive";
        if (availablePerks.some(p => p.name === item.name)) return "perk";
    };

    let fallbackPool = [
        ...availablePacks,
        ...availableEdits,
        ...availablePassives,
        ...availablePerks
    ].filter(u => !usedNames.has(u.name)); // no dupes

    if (forcedCursedCount > 0) {
        fallbackPool = fallbackPool.filter(u => u.rarity === "Cursed");
    }

    for (let i = 0; i < slots.length; i++) {
        if (slots[i]) continue; // already filled

        if (fallbackPool.length === 0) break;

        //pick one at random, classify and place
        const pick = random(fallbackPool);
        const type = classifyType(pick);

        slots[i] = new UpgradeChoice(type, pick);
        usedNames.add(pick.name);

        fallbackPool = fallbackPool.filter(u => u.name !== pick.name);
    }

    upgradeChoices = slots.filter(Boolean); // last fallback to not return any nulls
    upgradeChoices = slots;
}

//#region addDebuffPer5Ante()
function addDebuffAnte() {
    if (ante % 5 !== 0) return; // do nothing if ante is not a multiple of 5

    // filter debuffs that haven't hit the max count
    const validDebuffs = DEBUFFS.filter(d => {
        const count = activeDebuffs.filter(ad => ad.name === d.name).length;
        return !d.max || count < d.max;
    });

    // do nothing if there's no debuffs available to add / all debuffs hit max limit.
    if (validDebuffs.length === 0) return;

    // add the debuff (push into activeDebuff array)
    const debuff = random(validDebuffs);
    activeDebuffs.push(debuff);

    // activate the debuff effect now if the type is defined as "once"
    if (debuff.type === "once" && typeof debuff.effect === "function") {
        debuff.effect();
    }

    // event text for visual clarity
    sendEventText(`Difficulty increase... the "${debuff.name}" debuff was added.`)

    // update the HTMl display
    updateDebuffDisplay();
}

//#region nextAnte()
// literally so i dont have to keep repeating this code over and over
function nextAnte() {
    addDebuffAnte();
    gameState = "playing";
    ante++;
    round = 1;
    upgradePoints = 0;
    selectedUpgradeIndex = null
    returnHand();
    drawHand();
}


//#region evaluateHand()
/**
    * Evaluates the hand for scoring/typing
    * @param {*} cards The hand to evaluate, often always used with the hand variable.
    * @returns The type of hand the player has selected, the score, and what cards make up the hand.
*/
function evaluateHand(cards) {
    let ranksOnly = cards.map(c => c.rank);
    let suitsOnly = cards.map(c => c.suit);
    let rankCounts = {};
    let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let r of ranksOnly) {
        rankCounts[r] = (rankCounts[r] || 0) + 1;
    }

    // hand type checks.
    let counts = Object.values(rankCounts).sort((a, b) => b - a);                                                          // Tells how much of each rank is present. Identifies pairs, Three -> Five of a Kind, Etc.
    let isFlush = suitsOnly.every(s => s === suitsOnly[0]);                                                                // Checks if all cards are the same rank.
    let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);                                    // Creates a numerically sorted list of ranks.
    let isStraight = sortedIndices.length >= 2 && sortedIndices.every((val, i, arr) => i === 0 || val - arr[i - 1] === 1); // Checks if sortedIndices form a consecutive sequence. Confirms if hand is a straight.

    // arrow functions to check what cards make up the hand type (pair, straight, etc)
    const getCardsByRank = (rank) => cards.filter(c => c.rank === rank);        // return all cards from `cards` that match a specific rank
    const getUsedCards = (rankCountMap, count) =>                               // return all cards that appears `count` times in the hand.
        Object.entries(rankCountMap)                                            // rankCountMap is an object, e.g. { 'A': 2, '10, 'J': 2 }, this line converts it to [['A', 2], ['10', 1], ['J', 2]].
            .filter(([_, cnt]) => cnt === count)                                // keeps entries where the count matches the value that we are interested in
            .flatMap(([rank]) => getCardsByRank(rank));                         // for each matching rank, pull all cards with that rank using `getCardByRank`. flatMap flattens the array into single card objects.

    // checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // genuinely going to kms this looks ugly
    switch (cards.length) {
        case 1: // 1 card selected ————————————————————————————————————————————————————————

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected ——————————————————————————————————————————————————————

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected —————————————————————————————————————————————————

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 4: // 4 Cards selected ———————

            // Four of a Kind
            if (counts[0] === 4) {
                let used = getUsedCards(rankCounts, 4);
                return { name: "Four of a Kind", score: 60, usedCards: used };
            }

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Two Pair
            if (counts[0] === 2 && counts[1] === 2) {
                let pairs = getUsedCards(rankCounts, 2);
                return { name: "Two Pair", score: 20, usedCards: pairs };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 5: // 5 Cards selected —————————————————————————————————————————————————

            // Flush Five
            if (isFlush && counts[0] === 5) {
                return { name: "Flush Five", score: 160, usedCards: cards };
            }

            // Flush House
            if (isFlush && counts[0] === 3 && counts[1] === 2) {
                let usedThree = getUsedCards(rankCounts, 3);
                let usedPair = getUsedCards(rankCounts, 2);
                let used = [...usedThree, ...usedPair];
                return { name: "Flush House", score: 140, usedCards: used };
            }

            // Five of a Kind
            if (counts[0] === 5) {
                let used = getUsedCards(rankCounts, 5);
                return { name: "Five of a Kind", score: 120, usedCards: used };
            }

            // Royal Flush and Straight Flush
            if (isFlush && isStraight && sortedIndices[4] === 12) return { name: "Royal Flush", score: 100, usedCards: cards };
            if (isFlush && isStraight) return { name: "Straight Flush", score: 75, usedCards: cards };

            // Four of a Kind
            if (counts[0] === 4) {
                let used = getUsedCards(rankCounts, 4);
                return { name: "Four of a Kind", score: 70, usedCards: used };
            }

            // Full House
            if (counts[0] === 3 && counts[1] === 2) {
                let usedThree = getUsedCards(rankCounts, 3);
                let usedPair = getUsedCards(rankCounts, 2);
                let used = [...usedThree, ...usedPair];
                return { name: "Full House", score: 50, usedCards: used };
            }

            // Flush and Straight
            if (isFlush) return { name: "Flush", score: 40, usedCards: cards };
            if (isStraight) return { name: "Straight", score: 35, usedCards: cards };

            // Three of a Kind
            if (counts[0] === 3) {
                let used = getUsedCards(rankCounts, 3);
                return { name: "Three of a Kind", score: 30, usedCards: used };
            }

            // Two Pair
            if (counts[0] === 2 && counts[1] === 2) {
                let pairs = getUsedCards(rankCounts, 2);
                return { name: "Two Pair", score: 20, usedCards: pairs };
            }

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };
    }
}

//#region calculateRankMultiplier()
function calculateRankMultiplier(cards) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let total = 0;

    for (let card of cards) {
        let value = rankOrder.indexOf(card.rank) + 2;
        total += value;
    }

    return Math.max(1, total); // Ensure multiplier is at least 1
}

