/**
 * Core types and interfaces for the reusable search engine
 */

/**
 * Match type enum for ranking priority
 */
export enum MatchType {
  STARTS_WITH = 'starts_with',       // Highest priority: "john" matches "John Smith"
  WORD_START = 'word_start',         // High priority: "smith" matches "John Smith"
  SUBSTRING = 'substring',           // Medium priority: "oh" matches "John"
  NO_MATCH = 'no_match'              // No match found
}

/**
 * Scored search result
 */
export interface ScoredItem<T> {
  item: T;
  score: number;
  matchType: MatchType;
  matchedFields: string[];
}

/**
 * Search engine configuration
 */
export interface SearchConfig<T> {
  /**
   * Fields to search across (e.g., ['name', 'email', 'role'])
   */
  fields: string[];

  /**
   * Function to get display label for suggestions
   */
  getLabel: (item: T) => string;

  /**
   * Function to get unique identifier
   */
  getKey: (item: T) => string;

  /**
   * Debounce delay in milliseconds (default: 200)
   */
  debounceMs?: number;

  /**
   * Maximum number of suggestions to show (default: 5)
   */
  maxSuggestions?: number;

  /**
   * Enable/disable suggestions dropdown (default: true)
   */
  enableSuggestions?: boolean;
}

/**
 * Search engine output interface
 */
export interface SearchEngine<T> {
  // Signals
  query: () => string;
  debouncedQuery: () => string;
  filtered: () => T[];
  suggestions: () => T[];
  activeIndex: () => number;
  isOpen: () => boolean;

  // Methods
  setQuery: (value: string) => void;
  selectSuggestion: (item: T) => void;
  moveSelection: (delta: number) => void;
  resetSelection: () => void;
  openSuggestions: () => void;
  closeSuggestions: () => void;
  highlight: (text: string, query?: string) => string;

  // Cleanup
  destroy: () => void;
}
