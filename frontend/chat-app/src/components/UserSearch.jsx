// UserSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const cancelTokenSource = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Cancel previous request if exists
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel();
    }
    cancelTokenSource.current = axios.CancelToken.source();

    // Debounce search API call
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/users/search?query=${encodeURIComponent(query)}`, {
          cancelToken: cancelTokenSource.current.token,
        });
        setResults(response.data?.data || []);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Search error:', error);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(debounceTimeout.current);
      if (cancelTokenSource.current) cancelTokenSource.current.cancel();
    };
  }, [query]);

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <LoadingText>Searching...</LoadingText>}
      {!loading && results.length > 0 && (
        <ResultsList>
          {results.map(user => (
            <ResultItem key={user._id} onClick={() => { onUserSelect(user); setQuery(''); setResults([]); }}>
              <Avatar src={user.profile_pic || '/default-avatar.png'} alt={user.name} />
              <UserName>{user.name || user.username || user.email}</UserName>
            </ResultItem>
          ))}
        </ResultsList>
      )}
    </SearchContainer>
  );
};

const SearchContainer = styled.div`
  position: relative;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  outline: none;
`;

const LoadingText = styled.div`
  color: #ccc;
  margin-top: 5px;
  font-size: 12px;
`;

const ResultsList = styled.ul`
  position: absolute;
  top: 48px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 5px 0;
  margin: 0;
  list-style: none;
  z-index: 10;
`;

const ResultItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 1.5px solid white;
`;

const UserName = styled.span`
  color: white;
  font-size: 14px;
`;

export default UserSearch;