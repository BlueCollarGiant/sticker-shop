/**
 * Pure filter functions for search operations
 */

import { tokenize, extractSearchableValues } from './search-tokenize.util';
import { rankItems } from './search-rank.util';

/**
 * Filter items based on search query using AND logic for tokens
 *
 * This is a pure function that performs ranked filtering:
 * - Tokenizes the query
 * - Ranks items by match quality
 * - Returns only matching items in ranked order
 *
 * @param items - Array of items to filter
 * @param query - Search query string
 * @param fields - Fields to search across
 * @returns Filtered and ranked array of items
 */
export function filterAndRank<T>(
  items: T[],
  query: string,
  fields: string[]
): T[] {
  // If no query, return all items unfiltered
  if (!query || query.trim().length === 0) {
    return items;
  }

  // Extract searchable values and rank
  const ranked = rankItems(
    items,
    query,
    (item) => extractSearchableValues(item, fields)
  );

  // Return just the items (already sorted by rank)
  return ranked.map(scored => scored.item);
}

/**
 * Generate suggestions from filtered items
 *
 * @param items - Array of items to suggest from
 * @param query - Search query string
 * @param fields - Fields to search across
 * @param maxSuggestions - Maximum number of suggestions
 * @returns Top N suggestions
 */
export function generateSuggestions<T>(
  items: T[],
  query: string,
  fields: string[],
  maxSuggestions: number = 5
): T[] {
  // If no query, return empty suggestions
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Rank items
  const ranked = rankItems(
    items,
    query,
    (item) => extractSearchableValues(item, fields)
  );

  // Return top N
  return ranked.slice(0, maxSuggestions).map(scored => scored.item);
}

/**
 * Highlight matching text in a string
 *
 * Wraps matching portions in <mark> tags for CSS styling
 *
 * @param text - The text to highlight
 * @param query - The search query
 * @returns HTML string with highlighted matches
 *
 * @example
 * highlightMatches("John Thomas", "john t")
 * => "<mark>John</mark> <mark>T</mark>homas"
 */
export function highlightMatches(text: string, query: string): string {
  if (!text || !query || query.trim().length === 0) {
    return text;
  }

  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return text;
  }

  // Create a regex pattern for all tokens (case-insensitive)
  // We'll match word boundaries or start of string
  const pattern = tokens
    .map(token => escapeRegex(token))
    .join('|');

  const regex = new RegExp(`(${pattern})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters in a string
 *
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if an item matches all query tokens (AND logic)
 *
 * @param item - Item to check
 * @param query - Search query
 * @param fields - Fields to search
 * @returns True if all tokens match
 */
export function matchesQuery<T>(
  item: T,
  query: string,
  fields: string[]
): boolean {
  if (!query || query.trim().length === 0) {
    return true;
  }

  const tokens = tokenize(query);
  const values = extractSearchableValues(item, fields);

  // All tokens must match at least one field
  return tokens.every(token =>
    values.some(value => value.includes(token))
  );
}
