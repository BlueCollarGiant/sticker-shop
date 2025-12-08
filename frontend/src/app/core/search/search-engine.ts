/**
 * Core search engine implementation using Angular signals
 */

import { signal, computed, effect, Signal } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchConfig, SearchEngine } from './search-types';
import { filterAndRank, generateSuggestions, highlightMatches } from './search-filters.util';

/**
 * Create a new search engine instance
 *
 * This is a factory function that creates a fully configured search engine
 * with signals, debounced input, ranking, and suggestions.
 *
 * @param items - Signal containing the items to search
 * @param config - Search configuration
 * @returns Search engine instance
 *
 * @example
 * ```typescript
 * const users = signal<User[]>([...]);
 * const search = createSearchEngine(users, {
 *   fields: ['name', 'email', 'role'],
 *   getLabel: (user) => user.name,
 *   getKey: (user) => user.id
 * });
 * ```
 */
export function createSearchEngine<T>(
  items: Signal<T[]>,
  config: SearchConfig<T>
): SearchEngine<T> {
  // Configuration with defaults
  const debounceMs = config.debounceMs ?? 200;
  const maxSuggestions = config.maxSuggestions ?? 5;
  const enableSuggestions = config.enableSuggestions ?? true;

  // Internal state signals
  const query = signal('');
  const debouncedQuery = signal('');
  const activeIndex = signal(-1);
  const isOpen = signal(false);

  // RxJS subject for debouncing
  const querySubject = new Subject<string>();
  const subscription = querySubject
    .pipe(debounceTime(debounceMs))
    .subscribe(value => {
      debouncedQuery.set(value);
    });

  // Effect to sync query to debounced query
  effect(() => {
    const currentQuery = query();
    querySubject.next(currentQuery);
  }, { allowSignalWrites: true });

  // Computed: filtered and ranked items
  const filtered = computed(() => {
    const currentItems = items();
    const currentQuery = debouncedQuery();

    return filterAndRank(currentItems, currentQuery, config.fields);
  });

  // Computed: suggestions (top N items)
  const suggestions = computed(() => {
    if (!enableSuggestions) {
      return [];
    }

    const currentItems = items();
    const currentQuery = query(); // Use immediate query for suggestions

    return generateSuggestions(
      currentItems,
      currentQuery,
      config.fields,
      maxSuggestions
    );
  });

  // Public API
  return {
    // Signals (read-only access)
    query: query.asReadonly(),
    debouncedQuery: debouncedQuery.asReadonly(),
    filtered,
    suggestions,
    activeIndex: activeIndex.asReadonly(),
    isOpen: isOpen.asReadonly(),

    // Methods
    setQuery: (value: string) => {
      query.set(value);
      activeIndex.set(-1);

      // Auto-open suggestions if query is not empty
      if (enableSuggestions && value.trim().length > 0) {
        isOpen.set(true);
      } else {
        isOpen.set(false);
      }
    },

    selectSuggestion: (item: T) => {
      const label = config.getLabel(item);
      query.set(label);
      debouncedQuery.set(label);
      isOpen.set(false);
      activeIndex.set(-1);
    },

    moveSelection: (delta: number) => {
      const currentSuggestions = suggestions();
      if (currentSuggestions.length === 0) {
        return;
      }

      const current = activeIndex();
      let next = current + delta;

      // Wrap around
      if (next < -1) {
        next = currentSuggestions.length - 1;
      } else if (next >= currentSuggestions.length) {
        next = -1;
      }

      activeIndex.set(next);
    },

    resetSelection: () => {
      activeIndex.set(-1);
    },

    openSuggestions: () => {
      if (enableSuggestions && query().trim().length > 0) {
        isOpen.set(true);
      }
    },

    closeSuggestions: () => {
      isOpen.set(false);
      activeIndex.set(-1);
    },

    highlight: (text: string, queryOverride?: string) => {
      const searchQuery = queryOverride ?? query();
      return highlightMatches(text, searchQuery);
    },

    // Cleanup
    destroy: () => {
      subscription.unsubscribe();
      querySubject.complete();
    }
  };
}

/**
 * Helper function to handle keyboard navigation in search inputs
 *
 * Use this in your component's keyboard event handler
 *
 * @param event - Keyboard event
 * @param search - Search engine instance
 * @returns True if event was handled
 *
 * @example
 * ```typescript
 * onKeyDown(event: KeyboardEvent) {
 *   if (handleSearchKeyboard(event, this.search)) {
 *     event.preventDefault();
 *   }
 * }
 * ```
 */
export function handleSearchKeyboard<T>(
  event: KeyboardEvent,
  search: SearchEngine<T>
): boolean {
  switch (event.key) {
    case 'ArrowDown':
      search.moveSelection(1);
      return true;

    case 'ArrowUp':
      search.moveSelection(-1);
      return true;

    case 'Enter':
      const suggestions = search.suggestions();
      const activeIndex = search.activeIndex();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        search.selectSuggestion(suggestions[activeIndex]);
        return true;
      }
      break;

    case 'Escape':
      search.closeSuggestions();
      return true;
  }

  return false;
}
