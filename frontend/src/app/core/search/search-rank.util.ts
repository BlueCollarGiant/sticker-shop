/**
 * Ranking and scoring utilities for search results
 */

import { MatchType, ScoredItem } from './search-types';
import { tokenize } from './search-tokenize.util';

/**
 * Score weights for different match types
 */
const SCORE_WEIGHTS = {
  [MatchType.STARTS_WITH]: 1000,
  [MatchType.WORD_START]: 500,
  [MatchType.SUBSTRING]: 100,
  [MatchType.NO_MATCH]: 0
};

/**
 * Determine the match type for a token against a field value
 *
 * Priority order:
 * 1. StartsWith: token matches the beginning of the entire value
 * 2. Word-start: token matches the beginning of any word in the value
 * 3. Substring: token appears anywhere in the value
 * 4. No match
 *
 * @param token - The search token (already lowercase)
 * @param value - The field value (already lowercase)
 * @returns The match type
 */
export function getMatchType(token: string, value: string): MatchType {
  if (!token || !value) {
    return MatchType.NO_MATCH;
  }

  // Check if value starts with token
  if (value.startsWith(token)) {
    return MatchType.STARTS_WITH;
  }

  // Check if any word in the value starts with token
  const words = value.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(token)) {
      return MatchType.WORD_START;
    }
  }

  // Check if token appears anywhere in value
  if (value.includes(token)) {
    return MatchType.SUBSTRING;
  }

  return MatchType.NO_MATCH;
}

/**
 * Calculate the best match type across multiple field values
 *
 * @param token - The search token
 * @param fieldValues - Array of field values to check
 * @returns The best (highest priority) match type found
 */
export function getBestMatchType(token: string, fieldValues: string[]): MatchType {
  let bestMatch = MatchType.NO_MATCH;

  for (const value of fieldValues) {
    const matchType = getMatchType(token, value);

    // Early exit if we find the best possible match
    if (matchType === MatchType.STARTS_WITH) {
      return MatchType.STARTS_WITH;
    }

    // Update best match if this is better
    if (SCORE_WEIGHTS[matchType] > SCORE_WEIGHTS[bestMatch]) {
      bestMatch = matchType;
    }
  }

  return bestMatch;
}

/**
 * Score an item based on how well it matches the query tokens
 *
 * All tokens must match (AND logic). The final score is the sum of
 * individual token scores based on their match types.
 *
 * @param tokens - Array of search tokens
 * @param fieldValues - Array of searchable field values from the item
 * @returns Score (0 if any token doesn't match)
 */
export function scoreItem(tokens: string[], fieldValues: string[]): number {
  if (tokens.length === 0) {
    return 0;
  }

  let totalScore = 0;

  // Each token must match (AND logic)
  for (const token of tokens) {
    const matchType = getBestMatchType(token, fieldValues);

    // If any token doesn't match, the item doesn't match
    if (matchType === MatchType.NO_MATCH) {
      return 0;
    }

    totalScore += SCORE_WEIGHTS[matchType];
  }

  return totalScore;
}

/**
 * Score and rank items based on search query
 *
 * @param items - Array of items to score
 * @param query - Search query string
 * @param getValues - Function to extract searchable values from an item
 * @returns Array of scored items, sorted by score (descending)
 */
export function rankItems<T>(
  items: T[],
  query: string,
  getValues: (item: T) => string[]
): ScoredItem<T>[] {
  const tokens = tokenize(query);

  // If no tokens, return all items with zero score
  if (tokens.length === 0) {
    return items.map(item => ({
      item,
      score: 0,
      matchType: MatchType.NO_MATCH,
      matchedFields: []
    }));
  }

  // Score each item
  const scored: ScoredItem<T>[] = [];

  for (const item of items) {
    const fieldValues = getValues(item);
    const score = scoreItem(tokens, fieldValues);

    // Only include items with matches
    if (score > 0) {
      // Determine which fields matched
      const matchedFields: string[] = [];
      for (let i = 0; i < fieldValues.length; i++) {
        for (const token of tokens) {
          if (getMatchType(token, fieldValues[i]) !== MatchType.NO_MATCH) {
            matchedFields.push(fieldValues[i]);
            break;
          }
        }
      }

      // Determine overall match type (best match type found)
      let bestMatchType = MatchType.NO_MATCH;
      for (const token of tokens) {
        const matchType = getBestMatchType(token, fieldValues);
        if (SCORE_WEIGHTS[matchType] > SCORE_WEIGHTS[bestMatchType]) {
          bestMatchType = matchType;
        }
      }

      scored.push({
        item,
        score,
        matchType: bestMatchType,
        matchedFields
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Get top N items from ranked results
 *
 * @param rankedItems - Array of scored items
 * @param limit - Maximum number of items to return
 * @returns Top N items
 */
export function getTopItems<T>(rankedItems: ScoredItem<T>[], limit: number): T[] {
  return rankedItems.slice(0, limit).map(scored => scored.item);
}
