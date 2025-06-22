// src/components/common/SearchBar.tsx
// Универсальный компонент поиска

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, X, Filter } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  activeFiltersCount?: number;
  className?: string;
}

export function SearchBar({
  onSearch,
  onFilterClick,
  placeholder = "Поиск...",
  showFilters = false,
  activeFiltersCount = 0,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1 relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={Search}
          className="pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showFilters && onFilterClick && (
        <Button
          variant="outline"
          onClick={onFilterClick}
          icon={Filter}
          className="relative"
        >
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
