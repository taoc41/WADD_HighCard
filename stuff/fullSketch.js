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

/**
 * This script holds all of the passive perks, packs, and debuffs
 */

/* —————————————————————————————— EFFECT LIST —————————————————————————————— */

// USE CTRL + F TO FIND PERKS, PASSIVE_PERKS, AND DEBUFFS


// PERKS —————————————— //
const PERKS = [
    {
        name: "Backup Plan",
        description: "Add 2 random cards to your deck.",
        rarity: "Common",
        apply: () => {
            for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
        }
    },
    {
        name: "Card Fountain",
        description: "Add 5 random cards to your deck.",
        rarity: "Rare",
        apply: () => {
            for (let i = 0; i < 5; i++) deck.push(generateRandomCard());
        }
    },
    {
        name: "Extra Shuffle",
        description: "Add +1 reshuffle.",
        rarity: "Common",
        apply: () => {
            reshuffleUses++;
        }
    },
    {
        name: "Card Mechanic",
        description: "Add +3 reshuffle.",
        rarity: "Rare",
        apply: () => {
            reshuffleUses += 3;
        }
    },
    {
        name: "Flush Finder",
        description: "Add 3 cards of the same suit.",
        rarity: "Common",
        apply: () => {
            let suit = random(suits);
            for (let i = 0; i < 3; i++) deck.push(generateRandomCard(suit));
        }
    },
    {
        name: "Straight Edge",
        description: "Add 3 sequential cards.",
        rarity: "Common",
        apply: () => {
            let start = floor(random(0, ranks.length - 2)); // avoid overflow
            let suit = random(suits);
            for (let i = 0; i < 3; i++) {
                deck.push(new Card(ranks[start + i], suit));
            }
        }
    },
    {
        name: "Balanced Hand",
        description: "Add 1 card of each suit.",
        rarity: "Uncommon",
        apply: () => {
            suits.forEach(suit => {
                deck.push(generateRandomCard(suit));
            });
        }
    },
    {
        name: "High Stakes",
        description: "Add 2 random face cards.",
        rarity: "Uncommon",
        apply: () => {
            let faceRanks = ['J', 'Q', 'K'];
            for (let i = 0; i < 2; i++) {
                let suit = random(suits);
                let rank = random(faceRanks);
                deck.push(new Card(rank, suit));
            }
        }
    },
    {
        name: "Duplicate",
        description: "Add 2 copies of a random card from your deck.",
        rarity: "Common",
        apply: () => {
            if (deck.length === 0) return;
            let c = random(deck);
            for (let i = 0; i < 2; i++) {
                deck.push(new Card(c.rank, c.suit));
            }
        }
    },
    {
        name: "Mytosis",
        description: "Add 5 copies of a random card from your deck.",
        rarity: "Rare",
        apply: () => {
            if (deck.length === 0) return;
            let c = random(deck);
            for (let i = 0; i < 5; i++) {
                deck.push(new Card(c.rank, c.suit));
            }
        }
    },
    {
        name: "Extra Card",
        description: "Add 1 card to the total amount displayed in your hand. (10 Max)",
        rarity: "Rare",
        apply: () => {
            if (handSize > 10) return;
            handSize++
        }
    },
    {
        name: "Elixir",
        description: "Remove a random debuff.",
        rarity: "Rare",
        apply: () => {
            if (activeDebuffs.length === 0) return;

            // filter out debuffs already removed or inactive
            let toRemove = random(activeDebuffs);

            // revert "once" debuff effects if applicable
            if (toRemove.type === "once" && typeof toRemove.revert === "function") {
                toRemove.revert();
            }

            // Remove from active list
            activeDebuffs.splice(activeDebuffs.indexOf(toRemove), 1);

            eventTextAnimations.push({
                text: `${toRemove.name} removed!`,
                x: width / 2,
                y: height / 2 - 50,
                opacity: 255,
                timer: 60
            });

            updateDebuffDisplay();
        }
    },
    {
        name: "Panacea",
        description: "Remove all debuffs.",
        rarity: "Rare",
        apply: () => {
            activeDebuffs.forEach(d => {
                if (d.type === "once" && typeof d.revert === "function") {
                    d.revert();
                }
            });

            activeDebuffs = [];

            eventTextAnimations.push({
                text: `All debuffs removed!`,
                x: width / 2,
                y: height / 2 - 50,
                opacity: 255,
                timer: 60
            });

            updateDebuffDisplay();
        }
    }
];

const PASSIVE_PERKS = [
    {
        name: "Flush Bonus",
        description: "Gain 50 bonus points if all cards are the same suit.",
        rarity: "Common",
        condition: (playedCards, _) => new Set(playedCards.map(c => c.suit)).size === 1,
        effect: (score) => score + 50
    },
    {
        name: "Face Card Fan",
        description: "Double score if hand contains only J, Q, K.",
        rarity: "Uncommon",
        condition: (playedCards, _) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
        effect: (score) => score * 2
    },
    {
        name: "Low Roll",
        description: "Add 1 random card to your deck if all ranks are 6 or lower.",
        rarity: "Uncommon",
        condition: (playedCards, _) => playedCards.every(c => ranks.indexOf(c.rank) <= 4),
        effect: (score) => {
            deck.push(generateRandomCard());
            return score;
        }
    },
    {
        name: "Repeated Rhythm",
        description: "Multiply score by 2 if you played the same hand type as last round.",
        rarity: "Common",
        condition: (_, __) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
        effect: (score) => score * 2
    },
    {
        name: "Thick Stack",
        description: "At the start of every ante, gain 3 random cards to your deck.",
        rarity: "Uncommon",
        condition: () => round === 1,
        effect: (score) => {
            for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
            return score;
        }
    },

    // "EFFECT per X card in deck"
    // uses getters for the description to count how many specified suits are in the deck
    {
        name: "Heart's Embrace",
        suit: '♥',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === '♥').length;
            return score + (count * 50);
        }
    },
    {
        name: "Spade's Contract",
        suit: '♠',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },
    {
        name: "Diamond's Ambition",
        suit: '♦',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },
    {
        name: "Clover's Favor",
        suit: '♣',
        rarity: "Rare",
        get description() {
            const count = deck ? deck.filter(c => c.suit === this.suit).length : 0;
            return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
        },
        condition: () => true,
        effect: (score) => {
            const count = deck.filter(c => c.suit === this.suit).length;
            return score + (count * 50);
        }
    },

    // "Multiply score by 1.5 if hand contains at least one X Card" - PASSIVES
    {
        name: "Lucky Clover",
        description: "Multiply score by 1.5 if hand contains at least one ♣.",
        rarity: "Rare",
        condition: (playedCards, _) => playedCards.some(card => card.suit === '♣'),
        effect: (score) => score * 1.5
    },

];

const DEBUFFS = [
    {
        name: "Score Leak",
        description: "Lose 10% of your total score after every hand.",
        type: "perRound",
        effect: () => {
            score = floor(score * 0.9);
        },
    },
    {
        name: "Card Rot",
        description: "Removes 1 random card from your deck each round.",
        type: "perRound",
        effect: () => {
            if (deck.length > 0) {
                deck.splice(floor(random(deck.length)), 1)
            }
        },
    },
    {
        name: "Perk Lockout",
        description: "A random passive perk is disabled this round.",
        type: "perRound",
        effect: () => {
            if (passivePerks.length === 0) {
                disabledPerk = [];
                return;
            }

            // Find perks not already locked
            const availableToDisable = passivePerks.filter(p => !disabledPerk.includes(p));

            // All already locked? don't do anything.
            if (availableToDisable.length === 0) return;

            // Mark the perk as disabled.
            const newDisabled = random(availableToDisable);
            disabledPerk.push(newDisabled);
        },
    },

    {
        name: "Prolonged Rounds",
        description: "You need 1 extra round to progress.",
        type: "once",
        effect: () => {
            maxRounds += 1;
        },
        revert: () => {
            maxRounds = max(maxRounds - 1, 1)
        }
    },
    {
        name: "Cramped Hand",
        description: "Draw 2 fewer cards per hand (min 3).",
        type: "once",
        effect: () => {
            handSize = max(handSize - 2, 3);
        },
        revert: () => {
            handSize = min(handSize + 2, 10);
        }
    }
]


// Rarity weights, to handle what's more common
const RARITY_WEIGHTS = {
    Common: 0.6,
    Uncommon: 0.3,
    Rare: 0.75,
    Legendary: 0.25
}

function weightedRandomRarity() {
    let r = random();
    let cumulative = 0;
    for (let rarity in RARITY_WEIGHTS) {
        cumulative += RARITY_WEIGHTS[rarity];
        if (r < cumulative) return rarity;
    }
    return "Common";
}

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
            mx >= this.x &&
            mx <= this.x + this.w &&
            my >= this.y &&
            my <= this.y + this.h
        );
    }

    onClick() {
        // To be overridden in subclass.
        throw new Error("onClick () must be overriden by subclass");
    }
}

/**
 * The play button object, should trigger "playHand()" when clicked.
 */
class PlayHandButton extends GameButton {

    constructor(x, y) {
        super(x, y, 120, 40, "Play Hand");
    }

    onClick() {
        playHand();
    }
}

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

/**
 * 
 * This script handles the rendering and UI elements of the game.
 * 
 * 
 * 
*/

console.error(`%cOI GET OUT OF THE CONSOLE GET THE FUCK OUT GET OUT GET OUT GET OUT`, 'color: red; font-size: 50px; background-color: white;')


function preload() {
    cardSpriteSheet = loadImage("assets/deck.png");
}

function setup() {
    let canvasWidth = max(windowWidth, 1200);
    let canvasHeight = max(windowHeight, 800);

    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.position(0, 0)
    canvas.style('z-index', '-1')
    canvas.id("gameCanvas");

    passivePerkDisplayDiv = document.getElementById('perkDisplay');
    debuffDisplayDiv = document.getElementById('debuffDisplay')
    updatePassivePerkDisplay();

    playBtn = new PlayHandButton(width / 2 - 65, height - 75);
    shuffleBtn = new ShuffleButton(width - 200, height - 75);

    noSmooth();
    textAlign(CENTER, CENTER);
    textSize(20);
    generateDeck();
    drawHand();

    // background stuff
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
    drawGradientBackground();

    blendMode(SOFT_LIGHT);
    for (let b of blobs) {
        let t = millis() * b.speed + b.offset;
        let pulse = sin(millis() * b.pulseSpeed + b.offset) * 20;

        let x = b.x + sin(t) * 30;
        let y = b.y + cos(t * 1.1) * 30;
        let r = b.baseR + pulse;

        drawGlowingBlob(x, y, r);
    }
    blendMode(BLEND);
    drawUI();
}

function windowResized() {
    let newWidth = max(windowWidth, 1200);
    let newHeight = max(windowHeight, 800);
    resizeCanvas(newWidth, newHeight);
}

function drawGlowingBlob(x, y, r) {
    let layers = 4;
    let c = lerpColor(bgColours[0], bgColours[1], 0.5);

    for (let i = layers; i >= 1; i--) {
        let radius = r * (i / layers);
        let alpha = 15 * i;

        // Optional: fade out edges near canvas border
        let d = dist(x, y, width / 2, height / 2);
        let edgeFade = map(d, 0, width * 0.75, 1, 0);
        edgeFade = constrain(edgeFade, 0, 1);
        fill(red(c), green(c), blue(c), alpha * edgeFade);

        ellipse(x, y, radius);
    }
}

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

function drawUI() {
    if (gameState === "playing") {
        textSize(20);
        fill(255);
        text(`[ Score: ${score} ] [ Total Score: ${totalScore} ]`, width / 2, 90);
        text(`[ Upgrade Threshold: ${getUpgradeThreshold()} ]`, width / 2, 120);
        text(`[ Round: ${round}/${maxRounds} ] [ Ante: ${ante} ]`, width / 2, 150);
        text(`Deck: ${deck.length} cards left`, width / 2, 180);

        if (previewHandInfo && previewHandInfo.usedCards) {
            let baseScore = previewHandInfo.score;
            let multiplier = calculateRankMultiplier(previewHandInfo.usedCards);
            text(`Selected Hand: ${previewHandInfo.name} (${baseScore} x ${multiplier})`, width / 2, height - 100);
        }

        //
        drawHandUI();

        // Reshuffle button
        if (gameState === "playing" && reshuffleUses > 0 && selected.length >= 1 && selected.length <= 5) {
            shuffleBtn.updatePosition(width - 200, height - 75);
            shuffleBtn.draw();
        }

        // Play Hand button
        if (gameState === "playing" && selected.length >= 1 && selected.length <= 5) {
            playBtn.updatePosition(width / 2 - 65, height - 75);
            playBtn.draw();
        }
    }

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
        anim.timer--;

        if (anim.timer <= 0 || 0) {
            eventTextAnimations.splice(i, 1);
        }
    }
}

function drawHandUI() {
    let size = hand.length;
    let spacing;

    if (size > 1) {
        spacing = Math.min((width - 2 * 15 - cardWidth) / (size - 1), cardWidth + 20);
    } else {
        spacing = 0;
    }

    let totalWidth = spacing * (size - 1) + cardWidth;
    let startX = (width - totalWidth) / 2;

    for (let i = 0; i < hand.length; i++) {
        let card = hand[i];
        if (!card) continue; // stops the game from crashing if there's no more cards to draw
        if (isDragging && card === heldCard) continue; // do not render the card if it is being dragged

        let x = startX + i * spacing;
        let y = height / 2;
        card.draw(x, y);
    }

    // Draw the dragged card last so it appears on top
    if (heldCard && isDragging) {
        heldCard.draw(mouseX - dragOffsetX, mouseY - dragOffsetY);
    }
}

function getRarityColor(rarity) {
    switch (rarity) {
        case "Common": return color(200);
        case "Uncommon": return color(100, 200, 255); // blue
        case "Rare": return color(255, 100, 200); // pinkish purple
        default: return color(255);
    }
}

function drawUpgradeScreen() {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    text("Choose an Upgrade", width / 2, 110);
    text(`Upgrades remaining: ${upgradePoints}`, width / 2, 140);

    for (let i = 0; i < upgradeChoices.length; i++) {
        let x = width / 2 - 250 + i * 250;
        let y = height / 2;

        fill(60);
        rect(x - 100, y - 100, 200, 200, 20);

        let choice = upgradeChoices[i];
        let rarityColor = getRarityColor(choice.data.rarity);

        // Draw name
        fill(rarityColor);
        textSize(16);
        text(choice.data.name, x, y - 40);

        // Draw rarity label
        textSize(12);
        text(`[${choice.data.rarity}]`, x, y - 20);

        // Draw description
        fill(255);
        textSize(12);
        text(choice.data.description, x - 90, y + 10, 180, 100);
    }
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

        if (disabledPerk.includes(perk)) {
            perkDiv.style.opacity = "0.5";
            perkDiv.style.textDecoration = "line-through";
            perkDescDiv.style.textDecoration = "line-through";
            perkDiv.title = "Locked this round";
        }

        // sets the divs into the perk display.
        passivePerkDisplayDiv.appendChild(perkDiv);
        perkDiv.appendChild(perkDescDiv);
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

function generateDeck() {
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            deck.push(new Card(r, s));
        }
    }
    shuffle(deck, true);
}

function generateRandomCard(suit = null) {
    let chosenSuit = suit || random(suits);
    let rank = random(ranks); // uses string values like '7' or 'K'
    return new Card(rank, chosenSuit);
}

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

    // Handle play button click
    if (playBtn && playBtn.visible && playBtn.contains(mouseX, mouseY)) {
        playBtn.onClick();
        return;
    }

    // Handle shuffle button click
    if (shuffleBtn && shuffleBtn.visible && shuffleBtn.contains(mouseX, mouseY)) {
        shuffleBtn.onClick();
        return;
    }

    if (gameState === "upgrade") {
        for (let i = 0; i < upgradeChoices.length; i++) {
            let x = width / 2 - 250 + i * 250;
            let y = height / 2;
            if (mouseX > x - 100 && mouseX < x + 100 && mouseY > y - 100 && mouseY < y + 100) {
                chooseUpgrade(i);
                return;
            }
        }
    }
}

function mouseDragged() {
    if (heldCard && !isDragging && millis() - holdStartTime > 200) {
        isDragging = true;
    }

    if (isDragging && heldCard) {
        heldCard.x = mouseX - dragOffsetX;
        heldCard.y = mouseY - dragOffsetY;
    }
}

function mouseReleased() {
    if (isDragging && heldCard) {
        // Determine closest index
        let minDist = Infinity;
        let targetIndex = holdingCardIndex;

        for (let i = 0; i < hand.length; i++) {
            if (i === holdingCardIndex) continue;
            let card = hand[i];
            let distToSlot = dist(heldCard.x, heldCard.y, card.x, card.y);
            if (distToSlot < minDist) {
                minDist = distToSlot;
                targetIndex = i;
            }
        }

        if (minDist > 150) {
            // basically do nothing: too far - snap back
        } else {
            let movedCard = hand.splice(holdingCardIndex, 1)[0];
            hand.splice(targetIndex, 0, movedCard);
        }
    } else if (heldCard) {
        // click based selection fallback if drag is never triggered. 
        // previously in mousePressed (before 30/07/25)
        let idx = holdingCardIndex;
        if (heldCard.selected) {
            selected = selected.filter(n => n !== idx);
            heldCard.selected = false;
        } else if (selected.length < 5) {
            selected.push(idx);
            heldCard.selected = true;
        }
    }

    // Updates the preview hand info 
    if (selected.length >= 1) {
        let chosenCards = selected.map(i => hand[i]);
        previewHandInfo = evaluateHand(chosenCards);
        previewHandInfo.cards = chosenCards;
        previewHandInfo.baseScore = previewHandInfo.score;
    } else {
        previewHandInfo = null;
    }

    // Reset drag state
    isDragging = false;
    heldCard = null;
    holdingCardIndex = -1;
}

function keyTyped() {
    if (gameState === "gameover") {
        if (playerName.length < 12 && key.match(/^[a-zA-Z0-9 ]$/)) {
            playerName += key;
        }
    }
}

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

function saveScore(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function playHand() {
    selected = selected.filter(i => hand[i] !== null && hand[i] !== undefined);
    let chosenCards = selected.map(i => hand[i]);

    currentHandInfo = evaluateHand(chosenCards);

    let baseScore = currentHandInfo.score;
    let multiplier = calculateRankMultiplier(currentHandInfo.usedCards);
    let finalScore = baseScore * multiplier;


    // Apply passive perks
    passivePerks.forEach(perk => {
        if (disabledPerk.includes(perk)) return; // Perk Lockout

        if (perk.condition(chosenCards, finalScore)) {
            finalScore = Math.floor(perk.effect(finalScore));
            let activeCount = eventTextAnimations.length;

            // Trigger text animations
            eventTextAnimations.push({
                text: perk.name + " activated!",
                x: width / 2,
                y: height / 2 - 100 + (activeCount * 30),
                opacity: 255,
                timer: 60
            });
        }
    });

    // for Perk Lockout - clears previous round's locks
    disabledPerk = [];

    activeDebuffs.forEach(debuff => {
        if (debuff.type === "perRound" && typeof debuff.effect === "function") {
            debuff.effect();
        }
    });

    updatePassivePerkDisplay();
    updateDebuffDisplay();

    score += finalScore
    previewHandInfo = null;
    lastHandInfo = currentHandInfo;
    round++;

    // Replace only the selected card indices
    for (let i = 0; i < selected.length; i++) {
        let handIndex = selected[i];
        hand[handIndex] = deck.length > 0 ? deck.shift() : null;
    }

    selected = [];

    if (deck.length === 0 && hand.every(card => card === null)) {
        gameState = "gameover";
    }

    if (round > maxRounds) {
        let baseThreshold = getUpgradeThreshold();

        if (score >= baseThreshold) {

            // Convert ante score into upgrades
            upgradePoints = Math.floor(score / baseThreshold);

            // Transfer score to totalScore
            totalScore += score;
            score = 0;

            // If there's more than 0 upgrade points, then choose another upgrade.
            if (upgradePoints > 0) {
                gameState = "upgrade";
                generateUpgradeChoice();
            } else {
                addDebuff();
                gameState = "playing";
                ante++
                round = 1;
                drawHand();
            }
        } else {
            drawHand();

        }
    } else {

        // New hand if its not a new ante.
        drawHand();
    }
}

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


function chooseUpgrade(index) {
    let choice = upgradeChoices[index];
    if (!choice) return;

    if (choice.type === "passive") {
        if (choice.type === "passive") {
            if (passivePerks.length >= MAX_PASSIVE_PERKS) {
                alert("You already have 5 passive perks. Remove one before adding another.");
                return; // Prevents overflow
            }

            passivePerks.push(choice.data);
            updatePassivePerkDisplay();
        }
    } else if (choice.type === "pack") {
        choice.data.apply();
        updatePassivePerkDisplay();
    }

    upgradePoints--;

    // If there are more upgrade points, generate the more upgrades.
    if (upgradePoints > 0) {
        generateUpgradeChoice();
    } else {
        addDebuff();
        gameState = "playing";
        ante++
        round = 1;
        drawHand();
    }
}

function addDebuff() {

    // Add a debuff every 5 antes
    if (ante % 5 === 0) {
        let debuff = random(DEBUFFS);
        activeDebuffs.push(debuff);

        if (debuff.type === "once" && typeof debuff.effect === "function") {
            debuff.effect();
        }

        // Optional animation or UI alert
        eventTextAnimations.push({
            text: `Debuff Gained: ${debuff.name}`,
            x: width / 2,
            y: height / 2 - 50,
            opacity: 255,
            timer: 60
        });
    }

    updateDebuffDisplay();
}

function generateUpgradeChoice() {
    const availablePerks = PASSIVE_PERKS.filter(p => !passivePerks.some(pp => pp.name === p.name));
    const availablePacks = [...PERKS];

    const mixedChoices = [];

    while (mixedChoices.length < 3) {
        let isPerk = random() < 0.25;
        let rarity = weightedRandomRarity();

        if (isPerk && availablePerks.length > 0) {
            let filtered = availablePerks.filter(p => p.rarity === rarity);
            if (filtered.length > 0) {
                let perk = random(filtered);
                mixedChoices.push({ type: "passive", data: perk });
                availablePerks.splice(availablePerks.indexOf(perk), 1);
                continue;
            }
        }

        if (!isPerk && availablePacks.length > 0) {
            let filtered = availablePacks.filter(p => p.rarity === rarity);
            if (filtered.length > 0) {
                let pack = random(filtered);
                mixedChoices.push({ type: "pack", data: pack });
                availablePacks.splice(availablePacks.indexOf(pack), 1);
                continue;
            }
        }
    }

    upgradeChoices = mixedChoices;
}

function getUpgradeThreshold() {
    const growthRate = 1.5; // Adjust to make the growth faster or slower

    const threshold = baseUpgradeThreshold * Math.pow(growthRate, ante - 1);
    return Math.round(threshold / 100) * 100; // Round to the nearest 100
}


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

    // Checks for how many cards are selected and returns the appropriate object depending on the type of hand selected using the hand type checks
    // genuinely going to kms this looks ugly
    switch (cards.length) {
        case 1: // 1 card selected ———————

            // High Card
            return {
                name: "High Card",
                score: 5,
                usedCards: [cards[0]]
            };

        case 2: // 2 cards selected ———————

            // Pair
            if (counts[0] === 2) {
                let used = getUsedCards(rankCounts, 2);
                return { name: "Pair", score: 10, usedCards: used };
            }

            // High Card
            return { name: "High Card", score: 5, usedCards: [cards[0]] };

        case 3: // Three cards selected ———————

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

        case 5: // 5 Cards selected ———————

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


function calculateRankMultiplier(cards) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let total = 0;

    for (let card of cards) {
        let value = rankOrder.indexOf(card.rank) + 2;
        total += value;
    }

    return Math.max(1, total); // Ensure multiplier is at least 1
}

// Debug functions

function debugUpgrade() {
    gameState = "upgrade";
    generateUpgradeChoice();
}

function debugSetHand(cardDataArray) {
    if (!Array.isArray(cardDataArray)) {
        console.error("Expected an array of card objects.");
        return;
    }

    hand = cardDataArray.map(data => {
        let { rank, suit } = data;
        return new Card(rank, suit);
    });

    drawHand();
}

function debugAddPassive(name) {
    const perk = PASSIVE_PERKS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!perk) {
        console.warn(`Perk "${name} not found`);
        return;
    }

    if (passivePerks.some(p => p.name === perk.name)) {
        console.warn(`Perk "${name}" is already active.`);
        return;
    }

    if (passivePerks.length >= 5) {
        console.warn(`Cannot add more than 5 passive perks.`);
        return;
    }

    passivePerks.push(perk);
    console.log(`Passive perk "${name} added.`);
    updatePassivePerkDisplay();
}

function debugAddDebuff(name) {
    const debuff = DEBUFFS.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!debuff) {
        console.warn(`Debuff "${name} not found`);
        return;
    }

    if (debuff.type === "once" && typeof debuff.effect === "function") {
        debuff.effect();
    }

    activeDebuffs.push(debuff);
    console.log(`Debuff "${name} added.`);

    updateDebuffDisplay();
    updatePassivePerkDisplay();
}