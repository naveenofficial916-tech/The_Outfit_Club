import React, { useState, useEffect } from 'react';
import { SearchIcon, CloseIcon } from '../common/Icons';
import './SearchInput.css';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by garment, fabric, style, aesthetic...',
  debounceMs = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync internal state when outer value changes (e.g. on Clear All)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  // Debounce input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onClear();
  };

  return (
    <div className={`search-input-wrapper ${className}`}>
      <span className="search-input-icon">
        <SearchIcon size={18} />
      </span>
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search collection"
        className="search-input-field"
      />
      {localValue.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear-btn"
          aria-label="Clear search input"
          title="Clear search"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
};
