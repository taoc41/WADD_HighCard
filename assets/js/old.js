function drawCard(card, x, y, isSelected) {
  if (!cardSpriteSheet) return;

  let sx = rankMap[card.rank] * cardWidth;
  let sy = suitMap[card.suit] * cardHeight;
  
  if (isSelected) {
    fill(255, 255, 0, 100);
    rect(x, y, cardWidth, cardHeight, 10);
  }

  // Card background rectangle
  fill(isSelected ? 'gold' : 'white');
  rect(x, y, cardWidth, cardHeight, 5);

  // Card Sprite
  image(cardSpriteSheet, x, y, cardWidth, cardHeight, sx, sy, cardWidth, cardHeight)
}


function evaluateHand(cards) {
  let ranksOnly = cards.map(c => c.rank);
  let suitsOnly = cards.map(c => c.suit);
  let rankCounts = {};
  let rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let faceCards = ['J', 'Q', 'K']; // deprecated

  for (let r of ranksOnly) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }

  let counts = Object.values(rankCounts).sort((a, b) => b - a);
  let isFlush = suitsOnly.every(s => s === suitsOnly[0]);
  let sortedIndices = ranksOnly.map(r => rankOrder.indexOf(r)).sort((a, b) => a - b);
  let isStraight = sortedIndices[2] - sortedIndices[0] === 2 && sortedIndices[1] - sortedIndices[0] === 1;

  switch (cards.length) {
    case 1:
      return { name: "High Card", score: 50};

    case 2:
      if (counts[0] === 2) return { name: "Pair", score: 100 };
      return { name: "High Card", score: 50 };

    case 3:
      if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
      if (counts[0] === 2) return { name: "Pair", score: 100}
      return { name: "High Card", score: 50 }

    case 4: 
    if (counts[0] === 4) return { name: "Four of a Kind", score: 500 };
    if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
    if (counts[0] === 2 && counts[1] === 2) return {name: "Two Pair", score: 200}
    if (counts[0] === 2) return { name: "Pair", score: 100}
    return { name: "High Card", score: 50 }

    case 5: 
    if (isFlush && counts[0] === 5) return { name: "Flush Five", score: 1500 };
    if (counts[0] === 5) return { name: "Five of a Kind", score: 1250};
    if (isFlush && isStraight && sortedIndices[4] === 12) return { name: "Royal Flush", score: 1000};
    if (isFlush && isStraight) return { name: "Straight Flush", score: 700};
    if (counts[0] === 4) return { name: "Four of a Kind", score: 600 };
    if (isFlush) return { name: "Flush", score: 500}
    if (isStraight) return { name: "Straight", score: 450 }
    if (counts[0] === 3) return { name: "Three of a Kind", score: 300 };
    if (counts[0] === 2 && counts[1] === 2) return {name: "Two Pair", score: 200};
    if (counts[0] === 2) return { name: "Pair", score: 100 };
    return { name: "High Card", score: 50 };
  }
}


// DEBUG
function choosePassivePerk() {
  // Filter: only show perks not already owned
  let availablePerks = PASSIVE_PERKS.filter(
    perk => !passivePerks.some(p => p.name === perk.name)
  );

  // Randomly pick 3 options
  let choices = shuffle([...availablePerks]).slice(0, 3);

  // Prompt user to choose
  let choice = prompt(
    "Choose a passive perk:\n" +
    choices.map((p, i) => `${i + 1}. ${p.name}: ${p.description}`).join("\n")
  ) || "1";

  let selectedPerk = choices[parseInt(choice) - 1];

  // Add it if it's valid and not already owned
  if (selectedPerk && !passivePerks.some(p => p.name === selectedPerk.name)) {
    passivePerks.push(selectedPerk);
  }

  gameState = "playing";
  ante++;
  round = 1;
  drawHand();
}