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

const EDIT_PERKS = [
  {
    name: "Rank Up",
    description: "Increase a card's rank by one.",
    effect: (card) => {
      let suitsCopy = suits.filter(s => s !== suit)
    }
  }
]

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