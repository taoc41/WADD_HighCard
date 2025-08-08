// this script stores all global variables needed for the game

const suits = ['♠', '♥', '♦', '♣'];                                                   // Defines all card suits.
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];     // Defines all card ranks + the order.

let playBtn, shuffleBtn, confirmBtn, skipBtn, burnBtn, freezeBtn, playAgainBtn, saveScoreBtn, endUpgradeBtn;  // Defines all game buttons


let gameState = "playing";  // "playing", "upgrade", or "gameover"

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

let maxPassivePerks = 5;        // Maximum amount of passive perks able to have
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
let skipLock = 0;             // Amount of times that you can't skip upgrades.
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

// Background stuff
let bgColours;
let blobs = [];

let playerName = ""; // leaderboard

let passivePerkDisplayDiv; // define the HTML element (done in setup)
let debuffDisplayDiv; // define the HTML element (done in setup)

// rarity rates and how common a rarity should be based on percentage
const RARITY_WEIGHTS = {
  Common: 0.70, // this is actually 0.745 due to a 0.045 gap.
  Uncommon: 0.15,
  Rare: 0.06,
  Mythical: 0.025,
  Legendary: 0.005,
  Cursed: 0.015
};