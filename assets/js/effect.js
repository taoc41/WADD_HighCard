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
  // {
  //   name: "Short Fuse",
  //   description: "Gain +10 upgrade points. Gain the 'Oblivious' debuff.",
  //   rarity: "Cursed",
  //   apply: () => {
  //     upgradePoints += 10;
  //     addDebuff("Oblivious");
  //   }
  // }

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

  // +3 Mult for every played X card.
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

  { // Flush Bonus
    name: "Flush Bonus",
    description: "+50 points if all cards are the same suit.",
    trigger: "playHand",
    result: "addScore",
    rarity: "Common",
    condition: (playedCards) => new Set(playedCards.map(c => c.suit)).size === 1,
    effect: () => 50
  },
  { // Repeated Rhythm
    name: "Repeated Rhythm",
    description: "x2 Mult if you played the same hand type as last round.",
    trigger: "playHand",
    result: "xMult",
    rarity: "Common",
    condition: (_) => currentHandInfo.name && lastHandInfo.name === currentHandInfo.name,
    effect: () => 2
  },
  { // Even Odds
    name: "Even Odds",
    description: "+20 points for every even card played.",
    trigger: "playHand",
    result: "addScore",
    rarity: "Common",
    condition: (playedCards) => playedCards.some(c => ['2', '4', '6', '8', '10'].includes(c.rank)),
    effect: (playedCards) => {
      const evens = playedCards.filter(c => ['2', '4', '6', '8', '10'].includes(c.rank)).length;
      return evens * 20;
    }
  },

  // UNCOMMON
  { // Face Card Fan
    name: "Face Card Fan",
    description: "+20 Mult if hand contains only J, Q, K.",
    trigger: "playHand",
    result: "addMult",
    rarity: "Uncommon",
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
    trigger: "playHand",
    rarity: "Uncommon",
    condition: () => round === 1,
    effect: () => {
      for (let i = 0; i < 3; i++) deck.push(generateRandomCard());
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
      return `Gain 50 points per ${this.suit} card in deck. (${count} currently)`;
    },
    condition: () => true,
    effect: (score) => {
      const count = deck.filter(c => c.suit === '♥').length;
      return score + (count * 50);
    }
  },
  { // Spade's Contract
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
  { // Diamond's Ambition
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
  { // Clover's Favor
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

  //


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