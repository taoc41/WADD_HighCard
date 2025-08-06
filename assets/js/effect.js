/**
 * this script holds all of the passive perks, packs, and debuffs
 * none of this is sorted
 * 
 * 
 */

/**
 * { // TEMPLATE
    name: "NAME",
    description: "DESC",
    rarity: "Common",
    apply: () => {
    }
  },
 */

//#region PACKS
const PACKS = [

  // COMMON --------------
  // add maybe 6 more.

  { // Booster Pack
    name: "Booster Pack",
    description: "Add 3 random cards to your deck.",
    rarity: "Common",
    apply: () => {
      let added = [];
      for (let i = 0; i < 2; i++) {
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
      for (let i = 0; i < 2; i++) {
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
    description: "Add 3 cards to your deck. 50% chance each to be high (10-A) or low (2-6).",
    rarity: "Common",
    apply: () => {
      let added = [];
      for (let i = 0; i < 2; i++) {
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

  // UNCOMMON ------------
  // add maybe 3 more

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
  { // Royal Pack
    name: "Face Pack",
    description: "Add 3 random face cards.",
    rarity: "Uncommon",
    apply: () => {
      let faceRanks = ['J', 'Q', 'K'];
      let added = [];
      for (let i = 0; i < 2; i++) {
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

  // RARE -----------------
  // 5 or 10?

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
  }
];

//#region PERKS
// stuff that effects things outside of cards
const PERKS = [
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
    rarity: "Legendary",
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
]

//#region PASSIVE_PERKS
const PASSIVE_PERKS = [
  {
    name: "Flush Bonus",
    description: "Gain 50 bonus points if all cards are the same suit.",
    trigger: "playHand",
    rarity: "Common",
    condition: (playedCards, _) => new Set(playedCards.map(c => c.suit)).size === 1,
    effect: (score) => score + 50
  },
  {
    name: "Face Card Fan",
    description: "Double score if hand contains only J, Q, K.",
    trigger: "playHand",
    rarity: "Uncommon",
    condition: (playedCards, _) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
    effect: (score) => score * 2
  },
  {
    name: "Low Roll",
    description: "Add 1 random card to your deck if all ranks are 6 or lower.",
    trigger: "playHand",
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
    trigger: "playHand",
    rarity: "Common",
    condition: (_, __) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
    effect: (score) => score * 2
  },
  {
    name: "Thick Stack",
    description: "At the start of every ante, gain 3 random cards to your deck.",
    condition: "playHand",
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

//#region EDIT_PERKS
const EDIT_PERKS = [

  // COMMON --------------

  { // Promotion
    name: "Promotion",
    description: "Increase the rank of up to 2 cards by 1",
    rarity: "Common",
    minReq: 1,
    maxReq: 2,
    apply: (selected) => {
      for (let card of selected) {
        let index = ranks.indexOf(card.rank);
        card.rank = ranks[(index + 1) % ranks.length];
      }
      sendEventText(`Promoted: ${selected.map(c => c.rank + c.suit).join(', ')}`);
    }
  },
  { // Reincarnation
    name: "Reincarnation",
    description: "Select up to 3 cards. Convert them into the same random suit.",
    rarity: "Common",
    minReq: 1,
    maxReq: 3,
    apply: (selected) => {
      let newSuit = random(suits);
      for (let card of selected) {
        card.suit = newSuit;
      }
      sendEventText(`All converted to ${newSuit}`);
    }
  },
  { // Colour Shift (A)
    name: "Colour Shift (A)",
    description: "Select up to 3 cards. Spades → Hearts, Clubs → Diamonds, and vice versa.",
    rarity: "Common",
    minReq: 1,
    maxReq: 3,
    apply: (selected) => {
      const map = { '♠': '♥', '♥': '♠', '♣': '♦', '♦': '♣' }; // (for A)
      for (let card of selected) {
        card.suit = map[card.suit] || card.suit;
      }
      sendEventText(`Shifted colours: ${selected.map(c => c.rank + c.suit).join(', ')}`);
    }
  },
  { // Colour Shift (B)
    name: "Colour Shift (B)",
    description: "Select up to 3 cards. Spades → Diamonds, Clubs → Hearts, and vice versa.",
    rarity: "Common",
    minReq: 1,
    maxReq: 3,
    apply: (selected) => {
      const map = { '♠': '♦', '♦': '♠', '♠': '♥', '♥': '♠' }; // (for B)
      for (let card of selected) {
        card.suit = map[card.suit] || card.suit;
      }
      sendEventText(`Shifted colours: ${selected.map(c => c.rank + c.suit).join(', ')}`);
    }
  },
  { // Mathematician
    name: "Mathematician",
    description: "Select two cards of the same suit below 6. Left card becomes the sum.",
    rarity: "Common",
    minReq: 2,
    maxReq: 2,
    apply: (selected) => {
      const lowIndex = ranks.findIndex(r => r === '6');
      const idx1 = ranks.indexOf(selected[0].rank);
      const idx2 = ranks.indexOf(selected[1].rank);

      if (selected[0].suit !== selected[1].suit || idx1 > lowIndex || idx2 > lowIndex) return;

      let sum = idx1 + idx2 + 4;
      let newRank = ranks[min(sum, ranks.length - 1)];
      selected[0].rank = newRank;

      sendEventText(`${selected[0].suit} sum = ${newRank}`);
    }
  },
  { // Mimicry
    name: "Mimicry",
    description: "Convert the right-most card into a copy of the left-most.",
    rarity: "Common",
    minReq: 2,
    maxReq: 2,
    apply: (cards) => {
      let [left, right] = cards;
      right.rank = left.rank;
      right.suit = left.suit;

      sendEventText(`Mimicked: ${right.rank}${right.suit}`)
    }
  },
  { // Rip Apart
    name: "Rip Apart",
    description: "Destroy up to 2 selected cards.",
    rarity: "Common",
    minReq: 1,
    maxReq: 2,
    apply: (selected) => {
      for (let card of selected) {
        hand.splice(hand.indexOf(card), 1);
      }
      sendEventText(`Destroyed: ${selected.map(c => c.rank + c.suit).join(', ')}`);
    }
  },
  { // Recycle
    name: "Recycle",
    description: "Destroy one card. Gain +2 upgrade points.",
    rarity: "Common",
    minReq: 1,
    maxReq: 1,
    apply: (selected) => {
      hand.splice(hand.indexOf(selected[0]), 1);
      upgradePoints += 2;
      sendEventText(`Recycled ${selected[0].rank + selected[0].suit} → +2 upgrades`);
    }
  },
  { // Kindling
    name: "Kindling",
    description: "Destroy one card. Gain +2 burns.",
    rarity: "Common",
    minReq: 1,
    maxReq: 1,
    apply: (selected) => {
      hand.splice(hand.indexOf(selected[0]), 1);
      burnsRemaining += 2;
      sendEventText(`Immolated ${selected[0].rank + selected[0].suit} → +2 burns`);
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

  // RARE ------------------



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

  // LEGENDARY -------------

  { // Fragment
    name: "Fragment",
    description: "Destroy one card. Add random cards of the same suit equal to half the rank value.",
    rarity: "Legendary",
    minReq: 1,
    maxReq: 1,
    apply: (cards) => {
      const card = cards[0];
      const rankIndex = ranks.indexOf(card.rank);
      if (rankIndex === -1) return;
  
      const numNewCards = floor((rankIndex + 2) / 2); // index 0 = '2' → value 2
      hand.splice(hand.indexOf(card), 1);
  
      let added = [];
      for (let i = 0; i < numNewCards; i++) {
        const newCard = new Card(random(ranks), card.suit);
        deck.push(newCard);
        added.push(newCard);
      }
  
      sendEventText(`Fragmented ${card.rank + card.suit} → +${added.length} ${card.suit} cards`);
    }
  },

  // CURSED ----------------
  
  {
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
  }

]

//#region EDIT_PERKS
const DEBUFFS = [
  { // Score Leak
    name: "Score Leak",
    max: 10,
    description: "Lose 5% of your total score after every hand.",
    type: "perRound",
    effect: () => {
      score = floor(score * 0.99);
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
    name: "Perk Lockout",
    description: "A random passive perk is disabled this round.",
    max: 5,
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
  { // Prolonged Rounds
    name: "Prolonged Rounds",
    description: "You need 1 extra round to progress.",
    max: 99,
    type: "once",
    effect: () => {
      maxRounds += 1;
    },
    revert: () => {
      maxRounds = max(maxRounds - 1, 1)
    }
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

function logAddedCards(cards) {
  if (cards.length === 0) return;
  const text = `Added: ${cards.map(c => c.rank + c.suit).join(', ')}`;

  const areaWidth = 400;
  const areaHeight = 200;

  const x = random((width - areaWidth) / 2, (width + areaWidth) / 2);
  const y = random((height - areaHeight) / 4, (height + areaHeight) / 4);

  eventTextAnimations.push({
    text,
    x,
    y,
    opacity: 255,
    timer: 60
  });
}