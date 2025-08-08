// this script stores all the helper functions for some upgrades

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