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