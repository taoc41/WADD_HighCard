/**
 * This stores all the global variables needed by the game.
*/

let suits = ['♠', '♥', '♦', '♣'];                                                   // Defines all card suits.
let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];     // Defines all card ranks.
let playBtn, shuffleBtn;

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

let eventTextAnimations = [];   // Array to hold currently playing event text.

let totalScore = 0;             // Total score across the game
let score = 0;                  // Score earned in the current ante
let upgradePoints = 0;          // Number of upgrades allowed in this ante
let baseUpgradeThreshold = 300;     // Base threshold score for one upgrade

let round = 1;                  // Current round number.
let ante = 1;                   // Current ante number.
let maxRounds = 5;              // Maximum amount of rounds needed to play before proceeding onto the next ante.

let gameState = "playing";      // "playing", "upgrade", or "gameover"
let lastAction = "none"         // "none", "playhand", "reshuffle"

let passivePerks = [];          // Array to hold all acquired passive perks
let upgradeChoices = [];        // Array to hold all upgrade choices that the player can select, used for upgrade phase
let activeDebuffs = [];         // Array to hold all acquired debuff effects.

// Globals for effects;
let disabledPerk = [];        // Array to hold all currently disabled perks. For the "Perk Lockout" debuff

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

let playerName = ""; // for final score;

const MAX_PASSIVE_PERKS = 5;
let passivePerkDisplayDiv;
let debuffDisplayDiv;