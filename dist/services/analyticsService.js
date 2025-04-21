"use strict";
/**
 * Analytics service for who_will_win?
 * Tracks key events: votes, vote results, level ups, purchases, and notification clicks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackVoteCast = trackVoteCast;
exports.trackVoteResult = trackVoteResult;
exports.trackLevelUp = trackLevelUp;
exports.trackPurchase = trackPurchase;
exports.trackNotificationClick = trackNotificationClick;
// Track when a user casts a vote
function trackVoteCast(userId, fightId, pickedId) {
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
function trackVoteResult(userId, fightId, pickedId, winnerId, xpAwarded, underdogBonus) {
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
function trackLevelUp(userId, newLevel, totalXp) {
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
function trackPurchase(userId, sku, itemType, amountUsd) {
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
function trackNotificationClick(userId, notificationType, fightId) {
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
