import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Search, X, Tag, User, Building } from 'lucide-react';
import FindTagsForSearch from '../graphql/queries/FindTagsForSearch.gql';
import FindPerformersForSearch from '../graphql/queries/FindPerformersForSearch.gql';
import FindStudiosForSearch from '../graphql/queries/FindStudiosForSearch.gql';
import { useIntersectionObserver } from '../lib/useIntersectionObserver';

interface SearchResult {
  id: string;
  name: string;
  type: 'tag' | 'performer' | 'studio';
  image?: string;
}

interface SearchBarProps {
  selectedTags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onClearAll: () => void;
  availableTags: string[];
  isPlayerMode?: boolean;
  onHomeClick?: () => void;
  onPerformerSelect?: (performerId: string) => void;
  onStudioSelect?: (studioId: string) => void;
}

export default function SearchBar({
  selectedTags,
  onTagAdd,
  onTagRemove,
  onClearAll,
  availableTags,
  isPlayerMode = false,
  onHomeClick,
  onPerformerSelect,
  onStudioSelect
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search queries
  const { data: tagsData, loading: tagsLoading, fetchMore: fetchMoreTags } = useQuery(FindTagsForSearch, {
    variables: useMemo(() => ({
      filter: {
        q: searchValue,
        page: 1,
        per_page: 20,
        sort: 'name',
        direction: 'ASC'
      }
    }), [searchValue]),
    skip: !searchValue || searchValue.length < 2
  });

  const { data: performersData, loading: performersLoading, fetchMore: fetchMorePerformers } = useQuery(FindPerformersForSearch, {
    variables: useMemo(() => ({
      filter: {
        q: searchValue,
        page: 1,
        per_page: 10,
        sort: 'name',
        direction: 'ASC'
      }
    }), [searchValue]),
    skip: !searchValue || searchValue.length < 2
  });

  const { data: studiosData, loading: studiosLoading, fetchMore: fetchMoreStudios } = useQuery(FindStudiosForSearch, {
    variables: useMemo(() => ({
      filter: {
        q: searchValue,
        page: 1,
        per_page: 10,
        sort: 'name',
        direction: 'ASC'
      }
    }), [searchValue]),
    skip: !searchValue || searchValue.length < 2
  });

  // Intersection observers for infinite scroll
  const { ref: tagsLoadMoreRef, hasTriggered: shouldLoadMoreTags, resetTrigger: resetTagsTrigger } = useIntersectionObserver({
    threshold: 0.1
  });

  const { ref: performersLoadMoreRef, hasTriggered: shouldLoadMorePerformers, resetTrigger: resetPerformersTrigger } = useIntersectionObserver({
    threshold: 0.1
  });

  const { ref: studiosLoadMoreRef, hasTriggered: shouldLoadMoreStudios, resetTrigger: resetStudiosTrigger } = useIntersectionObserver({
    threshold: 0.1
  });

  // Infinite scroll logic
  useEffect(() => {
    if (shouldLoadMoreTags && tagsData?.findTags) {
      const tags = tagsData.findTags.tags || [];
      const totalCount = tagsData.findTags.count || 0;
      const hasMore = tags.length < totalCount;

      if (hasMore && !tagsLoading) {
        const nextPage = Math.ceil(tags.length / 20) + 1;
        fetchMoreTags({
          variables: {
            filter: {
              q: searchValue,
              page: nextPage,
              per_page: 20,
              sort: 'name',
              direction: 'ASC'
            }
          }
        }).then(() => resetTagsTrigger());
      }
    }
  }, [shouldLoadMoreTags, tagsData, tagsLoading, searchValue, fetchMoreTags, resetTagsTrigger]);

  useEffect(() => {
    if (shouldLoadMorePerformers && performersData?.findPerformers) {
      const performers = performersData.findPerformers.performers || [];
      const totalCount = performersData.findPerformers.count || 0;
      const hasMore = performers.length < totalCount;

      if (hasMore && !performersLoading) {
        const nextPage = Math.ceil(performers.length / 10) + 1;
        fetchMorePerformers({
          variables: {
            filter: {
              q: searchValue,
              page: nextPage,
              per_page: 10,
              sort: 'name',
              direction: 'ASC'
            }
          }
        }).then(() => resetPerformersTrigger());
      }
    }
  }, [shouldLoadMorePerformers, performersData, performersLoading, searchValue, fetchMorePerformers, resetPerformersTrigger]);

  useEffect(() => {
    if (shouldLoadMoreStudios && studiosData?.findStudios) {
      const studios = studiosData.findStudios.studios || [];
      const totalCount = studiosData.findStudios.count || 0;
      const hasMore = studios.length < totalCount;

      if (hasMore && !studiosLoading) {
        const nextPage = Math.ceil(studios.length / 10) + 1;
        fetchMoreStudios({
          variables: {
            filter: {
              q: searchValue,
              page: nextPage,
              per_page: 10,
              sort: 'name',
              direction: 'ASC'
            }
          }
        }).then(() => resetStudiosTrigger());
      }
    }
  }, [shouldLoadMoreStudios, studiosData, studiosLoading, searchValue, fetchMoreStudios, resetStudiosTrigger]);

  // Combine search results
  const searchResults: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = [];

    if (tagsData?.findTags?.tags) {
      results.push(...tagsData.findTags.tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        type: 'tag' as const
      })));
    }

    if (performersData?.findPerformers?.performers) {
      results.push(...performersData.findPerformers.performers.map((performer: any) => ({
        id: performer.id,
        name: performer.name,
        type: 'performer' as const,
        image: performer.image_path
      })));
    }

    if (studiosData?.findStudios?.studios) {
      results.push(...studiosData.findStudios.studios.map((studio: any) => ({
        id: studio.id,
        name: studio.name,
        type: 'studio' as const,
        image: studio.image_path
      })));
    }

    return results;
  }, [tagsData, performersData, studiosData]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: SearchResult[] } = {
      tags: [],
      performers: [],
      studios: []
    };

    searchResults.forEach(result => {
      groups[`${result.type}s`].push(result);
    });

    return groups;
  }, [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setShowSuggestions(value.length > 1); // Only show suggestions for 2+ characters
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'tag') {
      onTagAdd(result.name);
    } else if (result.type === 'performer' && onPerformerSelect) {
      onPerformerSelect(result.id);
    } else if (result.type === 'studio' && onStudioSelect) {
      onStudioSelect(result.id);
    }
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-4">
      {/* Logo - Desktop Only */}
      <button 
        onClick={onHomeClick}
        className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
      >
        <div className="text-2xl">📦</div>
        <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent tracking-wider">
          STASHBROWSER
        </span>
      </button>

      <div className="flex-1" />

      {/* Selected Tags */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {selectedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagRemove(tag)}
            className="group relative px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
          >
            <span className="text-purple-200 text-sm">{tag}</span>
            <X className="inline-block ml-2 w-3 h-3 text-purple-300 group-hover:text-purple-100" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 md:flex-none" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 md:left-4 w-4 md:w-5 h-4 md:h-5 text-blue-400/70" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchValue && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={isPlayerMode ? "Search..." : "Search tags..."}
            className="w-full md:w-80 pl-10 md:pl-12 pr-10 md:pr-12 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-[#1a1a2e]/80 to-[#16213e]/80 border border-blue-500/30 text-white text-sm md:text-base placeholder-gray-400 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
          />
          {(searchValue || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchValue('');
                onClearAll();
                setShowSuggestions(false);
              }}
              className="absolute right-3 md:right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 md:w-5 h-4 md:h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden z-50 max-h-96 overflow-y-auto">
            {/* Tags Section */}
            {groupedResults.tags.length > 0 && (
              <div className="border-b border-white/5 last:border-b-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-300 uppercase tracking-wider">Tags</span>
                </div>
                {groupedResults.tags.slice(0, 10).map((result) => (
                  <button
                    key={`tag-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-200"
                  >
                    <span className="text-purple-300">{result.name}</span>
                  </button>
                ))}
                {groupedResults.tags.length > 10 && (
                  <div
                    ref={tagsLoadMoreRef as React.RefObject<HTMLDivElement>}
                    className="px-4 py-2 text-center text-xs text-gray-400"
                  >
                    {tagsLoading ? 'Loading more tags...' : 'Scroll for more tags'}
                  </div>
                )}
              </div>
            )}

            {/* Performers Section */}
            {groupedResults.performers.length > 0 && (
              <div className="border-b border-white/5 last:border-b-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-teal-500/10">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300 uppercase tracking-wider">Performers</span>
                </div>
                {groupedResults.performers.slice(0, 5).map((result) => (
                  <button
                    key={`performer-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gradient-to-r hover:from-green-500/20 hover:to-teal-500/20 transition-all duration-200"
                  >
                    <span className="text-green-300">{result.name}</span>
                  </button>
                ))}
                {groupedResults.performers.length > 5 && (
                  <div
                    ref={performersLoadMoreRef as React.RefObject<HTMLDivElement>}
                    className="px-4 py-2 text-center text-xs text-gray-400"
                  >
                    {performersLoading ? 'Loading more performers...' : 'Scroll for more performers'}
                  </div>
                )}
              </div>
            )}

            {/* Studios Section */}
            {groupedResults.studios.length > 0 && (
              <div className="border-b border-white/5 last:border-b-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                  <Building className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-300 uppercase tracking-wider">Studios</span>
                </div>
                {groupedResults.studios.slice(0, 5).map((result) => (
                  <button
                    key={`studio-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-200"
                  >
                    <span className="text-orange-300">{result.name}</span>
                  </button>
                ))}
                {groupedResults.studios.length > 5 && (
                  <div
                    ref={studiosLoadMoreRef as React.RefObject<HTMLDivElement>}
                    className="px-4 py-2 text-center text-xs text-gray-400"
                  >
                    {studiosLoading ? 'Loading more studios...' : 'Scroll for more studios'}
                  </div>
                )}
              </div>
            )}

            {/* Loading indicator */}
            {(tagsLoading || performersLoading || studiosLoading) && (
              <div className="px-4 py-2 text-center text-gray-400 text-sm">
                Searching...
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {showSuggestions && searchValue.length > 1 && searchResults.length === 0 && !tagsLoading && !performersLoading && !studiosLoading && (
          <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden z-50">
            <div className="px-4 py-6 text-center text-gray-400">
              No results found for "{searchValue}"
            </div>
          </div>
        )}
      </div>

      {/* Mobile Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="md:hidden flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagRemove(tag)}
              className="group relative px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <span className="text-purple-200 text-xs">{tag}</span>
              <X className="inline-block ml-1.5 w-3 h-3 text-purple-300 group-hover:text-purple-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
