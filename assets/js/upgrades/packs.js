// this script stores all the booster upgrade info and code for the game

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
  