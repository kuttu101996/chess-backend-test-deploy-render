// src/matchmaking.ts
// In-memory matchmaking pool for online chess

import { Socket } from "socket.io";

/**
 * Represents a player waiting for a match.
 */
export interface MatchmakingEntry {
  userId: string;
  rating: number;
  socket: Socket;
  timeout?: NodeJS.Timeout;
}

/**
 * Matchmaking pool, grouped by time option.
 * Key: timeOption, Value: array of waiting players.
 */
const matchmakingPool: Record<string, MatchmakingEntry[]> = {};

/**
 * Add a player to the matchmaking pool for a given time option.
 * Prevents duplicate entries for the same user.
 * @param timeOption - The time control option (e.g., '5min')
 * @param entry - The player entry to add
 * @returns true if added, false if duplicate
 */
export function addToPool(
  timeOption: string,
  entry: MatchmakingEntry
): boolean {
  if (!matchmakingPool[timeOption]) matchmakingPool[timeOption] = [];

  // Prevent duplicate entries
  if (matchmakingPool[timeOption].some((e) => e.userId === entry.userId))
    return false;

  matchmakingPool[timeOption].push(entry);
  return true;
}

/**
 * Remove a player from the pool for a given time option.
 * Cleans up any timeouts.
 * @param timeOption - The time control option
 * @param userId - The user's ID
 */
export function removeFromPool(timeOption: string, userId: string) {
  if (!matchmakingPool[timeOption]) return;
  matchmakingPool[timeOption] = matchmakingPool[timeOption].filter((e) => {
    if (e.userId === userId && e.timeout) clearTimeout(e.timeout);

    return e.userId !== userId;
  });
  if (matchmakingPool[timeOption].length === 0) {
    delete matchmakingPool[timeOption];
  }
}

/**
 * Find and remove a match for the given time option and rating.
 * @param timeOption - The time control option
 * @param rating - The player's rating
 * @param ratingRange - Acceptable rating difference
 * @returns The matched entry or null
 */
export function findMatch(
  timeOption: string,
  rating: number,
  ratingRange: number = 100
): MatchmakingEntry | null {
  if (!matchmakingPool[timeOption]) return null;
  // Find a player within rating range
  const idx = matchmakingPool[timeOption].findIndex(
    (e) => Math.abs(e.rating - rating) <= ratingRange
  );
  if (idx !== -1) {
    const [entry] = matchmakingPool[timeOption].splice(idx, 1);
    if (entry.timeout) clearTimeout(entry.timeout);
    if (matchmakingPool[timeOption].length === 0) {
      delete matchmakingPool[timeOption];
    }
    return entry;
  }
  return null;
}

/**
 * Remove a user from all pools (used on disconnect/cancel).
 * Cleans up all timeouts.
 * @param userId - The user's ID
 */
export function removeUserFromAllPools(userId: string) {
  for (const timeOption in matchmakingPool) {
    removeFromPool(timeOption, userId);
  }
}

/**
 * Get a shallow copy of the current pool state (for monitoring).
 */
export function getPoolState() {
  // Do not expose sockets/timeouts
  const safePool: Record<string, { userId: string; rating: number }[]> = {};
  for (const timeOption in matchmakingPool) {
    safePool[timeOption] = matchmakingPool[timeOption].map((e) => ({
      userId: e.userId,
      rating: e.rating,
    }));
  }
  return safePool;
}

/**
 * Gracefully clear the matchmaking pool (for server shutdown).
 */
export function shutdownMatchmaking() {
  for (const timeOption in matchmakingPool) {
    matchmakingPool[timeOption].forEach((e) => {
      if (e.timeout) clearTimeout(e.timeout);
    });
    delete matchmakingPool[timeOption];
  }
}
// --- Duplicates removed below ---
