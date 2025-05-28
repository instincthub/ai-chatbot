import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search chats..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search previous chats"
      />
    </form>
  );
};

export default SearchBar;
