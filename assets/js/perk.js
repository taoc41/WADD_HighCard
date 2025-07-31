// Perks List, seperated for ease of access.
// USE CTRL + F TO FIND PERKS, PASSIVE_PERKS.

const PERKS = [
    {
      name: "Bonus Draw",
      description: "Add 2 random cards to your deck.",
      apply: () => {
        for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
      }
    },
    {
      name: "Flush Finder",
      description: "Add 3 cards of the same suit.",
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
      name: "Suit Stack",
      description: "Pick a suit and gain 4 cards of it.",
      apply: () => {
        let suit = prompt("Choose a suit: ♠, ♥, ♦, ♣") || "♠";
        if (!suits.includes(suit)) suit = "♠";
        for (let i = 0; i < 4; i++) deck.push(generateRandomCard(suit));
      }
    },
    {
      name: "Balanced Hand",
      description: "Add 1 card of each suit.",
      apply: () => {
        suits.forEach(suit => {
          deck.push(generateRandomCard(suit));
        });
      }
    },
    {
      name: "High Stakes",
      description: "Add 2 random face cards.",
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
      apply: () => {
        if (deck.length === 0) return;
        let c = random(deck);
        for (let i = 0; i < 2; i++) {
          deck.push(new Card(c.rank, c.suit));
        }
      }
    }
  ];

  // ----- PASSIVE PERKS -----
  /** TEMPLATE
   *  name: "NAME",
      description: "DESCRIPTION",
      condition: (playedCards) => playedCards.some(card => card.suit === '♣'),
      effect: (baseScore) => baseScore * 1.5
   */

  const PASSIVE_PERKS = [
    {
      name: "Lucky Clover",
      description: "Multiply score by 1.5 if hand contains at least one ♣.",
      condition: (playedCards) => playedCards.some(card => card.suit === '♣'),
      effect: (baseScore) => baseScore * 1.5
    },
    {
      name: "Flush Bonus",
      description: "Gain 50 bonus points if all cards are the same suit.",
      condition: (playedCards) => new Set(playedCards.map(c => c.suit)).size === 1,
      effect: (baseScore) => baseScore + 50
    },
    {
      name: "Face Card Fan",
      description: "Double score if hand contains only J, Q, K.",
      condition: (playedCards) => playedCards.every(c => ['J', 'Q', 'K'].includes(c.rank)),
      effect: (baseScore) => baseScore * 2
    },
    {
      name: "Low Roll",
      description: "Add 1 random card to your hand if all ranks are 6 or lower.",
      condition: (playedCards) => playedCards.every(c => ranks.indexOf(c.rank) <= 4),
      effect: (baseScore) => {
        if (hand.length < 5) hand.push(generateRandomCard());
        return baseScore;
      }
    },
    {
      name: "Repeated Rhythm",
      description: "Multiply score by 2 if you played the same hand type as last round.",
      condition: (playedCards) => currentHandInfo.name && lastHandInfo.name === currentHandType.currentHandInfo.name,
      effect: (baseScore) => baseScore * 2
    }
  ];

// All perks.

/**
 * Perk ideas
 * 
 * - add a random card for every X hand played into the deck.
 * - +1 to hand
 * - +1 to shuffle
 * 
 * - + SCORE for X hand played.
 *          High Card, Pair, Two Pair, Full House, Three of a Kind, 
 *          Straight Flush, Royal Flush,
 * 
 * - play X amount of SUIT card to add a random card into the deck.
 * 
 */
