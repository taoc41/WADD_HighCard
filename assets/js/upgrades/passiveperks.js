// this script stores all the ability upgrade info and code for the game

//#region PASSIVE_PERKS
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
    { // Sharpened Arrow
      name: "Sharpened Arrow",
      description: "+3 Mult for every played ♠ card.",
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
      description: "+3 Mult for every played ♦ card.",
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
    },
    { // Firestarter
      name: "Firestarter",
      description: "Burning an upgrade adds a random card to the deck. Burning a Booster adds its cards instead.",
      rarity: "Rare",
  
      trigger: "onBurn",
      result: "unique",
  
      condition: () => true,
      effect: (burnedUpgrade) => {
        if (!burnedUpgrade || !burnedUpgrade.data) return 0;
        const type = burnedUpgrade.type;
        if (type === "pack" && typeof burnedUpgrade.data.apply === "function") {
          burnedUpgrade.data.apply();
        } else {
          deck.push(generateRandomCard());
        }
        return 0;
      }
    },
    { // Royal Tax
      name: "Royal Tax",
      description: "+250 points if your played hand contains a King, then destroy the lowest-ranked card in your hand.",
      rarity: "Rare",
      
      trigger: "playHand",
      result: "addScore",
  
      condition: (playedCards) => playedCards.some(c => c.rank === 'K'),
      effect: (playedCards) => {
        if (playedCards.length === 0) return 250;
        const sorted = [...playedCards].sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank));
        const toRemove = sorted[0];
        const idx = deck.findIndex(c => c.rank === toRemove.rank && c.suit === toRemove.suit);
        if (idx !== -1) deck.splice(idx, 1);
        return 250;
      }
    },
    { // Specialist
      name: "Specialist",
      description: "+100 points for every card played that matches the suit of your most frequent card in your deck.",
      rarity: "Rare",
      
      trigger: "playHand",
      result: "addScore",
  
      condition: (playedCards) => playedCards.length > 0,
      effect: (playedCards) => {
        const most = getMostFrequentCardInDeck();
        if (!most) return 0;
        const suit = most.slice(-1);
        const matching = playedCards.filter(c => c.suit === suit).length;
        return matching * 100;
      }
    },
    { // Repeat Loyalty
      name: "Repeat Loyalty",
      description: "If you play a face card and the last card played was a face card, gain +2 random cards.",
      rarity: "Rare",
  
      trigger: "playHand",
      result: "addCard",
     
      condition: (playedCards) => {
        const isFace = c => ['J', 'Q', 'K'].includes(c.rank);
        return playedCards.some(isFace) && lastPlayedCards && lastPlayedCards.some(isFace);
      },
      effect: () => {
        for (let i = 0; i < 2; i++) deck.push(generateRandomCard());
        return 0;
      }
    },
    { // Perfect Pattern
      name: "Perfect Pattern",
      description: "x4 Mult if your hand is a Straight Flush.",
      rarity: "Rare",
  
      trigger: "playHand",
      result: "xMult",
  
      condition: () => currentHandInfo.name === "Straight Flush",
      effect: () => 4
    },
    { // Card Crawler
      name: "Card Crawler",
      description: "Add a copy of the first selected card in a hand that was reshuffled back to the deck.",
      trigger: "onShuffle",
      result: "unique",
      rarity: "Rare",
      condition: (chosenCards) => chosenCards.length > 0,
      effect: (chosenCards) => {
        const c = chosenCards[0];
        deck.push(new Card(c.rank, c.suit));
        return 0;
      }
    },
  
    // Mythical
    { // Royal Decree
      name: "Royal Decree",
      rarity: "Mythical",
  
      get description() {
        return `x${this.mult.toFixed(2)} Mult. Gains x0.25 mult for every face card played.`;
      },
  
      mult: 1.25,
      trigger: "playHand",
      result: "xMult",
      
      condition: function(playedCards) {
        return playedCards.length > 0;
      },
      effect: function(playedCards) {
        const faceCount = playedCards.filter(c => ['J', 'Q', 'K'].includes(c.rank)).length;
        this.mult += faceCount * 0.25;
        return this.mult;
      }
    },
    { // Monochrome
      name: "Monochrome",
      description: "If all cards played are the same suit, add 5 cards of that suit and gain x3 Mult.",
      rarity: "Mythical",
      
      trigger: "playHand",
      result: "xMult",
      
      condition: (playedCards) => {
        if (!playedCards || playedCards.length === 0) return false;
        const suit = playedCards[0].suit;
        return playedCards.every(c => c.suit === suit);
      },
      effect: (playedCards) => {
        const suit = playedCards[0].suit;
        for (let i = 0; i < 5; i++) {
          deck.push(generateRandomCard(suit));
        }
        return 3;
      }
    },
    { // Royal Pact
      name: "Royal Pact",
      description: "Each face card played adds 1 random card. Playing J, Q, and K gives x3 Mult.",
      rarity: "Mythical",
  
      trigger: "playHand",
      result: "xMult",
  
      condition: (playedCards) => playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank)),
      effect: (playedCards) => {
        const hasJ = playedCards.some(c => c.rank === 'J');
        const hasQ = playedCards.some(c => c.rank === 'Q');
        const hasK = playedCards.some(c => c.rank === 'K');
    
        playedCards.forEach(c => {
          if (['J', 'Q', 'K'].includes(c.rank)) {
            deck.push(generateRandomCard());
          }
        });
    
        return (hasJ && hasQ && hasK) ? 3 : 1;
      }
    },
    { // All for One
      name: "All for One",
      description: "All played cards contribute to the rank multiplier.",
      rarity: "Mythical",
  
      trigger: "none",
      result: "unique",
    }
  ];