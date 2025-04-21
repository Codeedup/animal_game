/**
 * Analytics service for who_will_win?
 * Tracks key events: votes, vote results, level ups, purchases, and notification clicks
 */

// Track when a user casts a vote
export function trackVoteCast(
  userId: string,
  fightId: string,
  pickedId: string
): void {
  console.log(`ANALYTICS - vote_cast: user=${userId}, fight=${fightId}, side=${pickedId}`);
  
  // In a real implementation, you would send this data to your analytics provider
  // Example with Firebase Analytics:
  /*
  firebaseAnalytics.logEvent('vote_cast', {
    user_id: userId,
    fight_id: fightId,
    picked_side: pickedId,
    timestamp: new Date().toISOString()
  });
  */
}

// Track when a vote result is determined
export function trackVoteResult(
  userId: string,
  fightId: string,
  pickedId: string,
  winnerId: string,
  xpAwarded: number,
  underdogBonus: boolean
): void {
  const correct = pickedId === winnerId;
  
  console.log(`ANALYTICS - vote_result: user=${userId}, fight=${fightId}, correct=${correct}, xp=${xpAwarded}, underdog=${underdogBonus}`);
  
  // In a real implementation, you would send this data to your analytics provider
  // Example with Firebase Analytics:
  /*
  firebaseAnalytics.logEvent('vote_result', {
    user_id: userId,
    fight_id: fightId,
    correct,
    xp_awarded: xpAwarded,
    underdog_bonus: underdogBonus,
    timestamp: new Date().toISOString()
  });
  */
}

// Track when a user levels up
export function trackLevelUp(
  userId: string,
  newLevel: number,
  totalXp: number
): void {
  console.log(`ANALYTICS - level_up: user=${userId}, level=${newLevel}, xp=${totalXp}`);
  
  // In a real implementation, you would send this data to your analytics provider
  // Example with Firebase Analytics:
  /*
  firebaseAnalytics.logEvent('level_up', {
    user_id: userId,
    new_level: newLevel,
    total_xp: totalXp,
    timestamp: new Date().toISOString()
  });
  */
}

// Track when a user makes a purchase
export function trackPurchase(
  userId: string,
  sku: string,
  itemType: string,
  amountUsd: number
): void {
  console.log(`ANALYTICS - purchase: user=${userId}, sku=${sku}, type=${itemType}, amount=${amountUsd}`);
  
  // In a real implementation, you would send this data to your analytics provider
  // Example with Firebase Analytics:
  /*
  firebaseAnalytics.logEvent('purchase', {
    user_id: userId,
    sku,
    item_type: itemType,
    amount_usd: amountUsd,
    timestamp: new Date().toISOString()
  });
  */
}

// Track when a user clicks a notification
export function trackNotificationClick(
  userId: string,
  notificationType: string,
  fightId?: string
): void {
  console.log(`ANALYTICS - notification_click: user=${userId}, type=${notificationType}${fightId ? `, fight=${fightId}` : ''}`);
  
  // In a real implementation, you would send this data to your analytics provider
  // Example with Firebase Analytics:
  /*
  firebaseAnalytics.logEvent('notification_click', {
    user_id: userId,
    type: notificationType,
    fight_id: fightId || null,
    timestamp: new Date().toISOString()
  });
  */
} 