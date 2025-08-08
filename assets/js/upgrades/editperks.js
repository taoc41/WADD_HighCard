// this script stores all the refinement upgrade info and code for the game

//#region EDIT_PERKS
const EDIT_PERKS = [

  // COMMON

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

  // UNCOMMON
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

  // RAR

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

  // MYTHICAL
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
    description: "Select up to 3 cards of a low rank (2-4). Convert them into an Ace.",
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

  // LEGENDARY
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

  // CURSED
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
      generateDeck();
      sendEventText(`Your entire deck was replaced...`);
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

