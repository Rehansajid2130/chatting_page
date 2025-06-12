import React, { useState } from 'react';
import axios from 'axios';

const UserSearch = ({ onUserSelect }) => { // Receive the onUserSelect function as a prop
  const [searchTerm, setSearchTerm] = useState(''); // State for the search input
  const [searchResults, setSearchResults] = useState([]); // State for the search results
  const [loading, setLoading] = useState(false); // State to indicate loading
  const [error, setError] = useState(null); // State to store errors

  const handleSearch = async () => {
    setLoading(true); // Set loading to true when the search starts
    setError(null); // Clear any previous errors
    try {
      const response = await axios.get(`/api/users/search?username=${searchTerm}`); // Make the API request
      setSearchResults(response.data); // Update the search results with the data from the API
    } catch (error) {
      console.error('Error searching for users:', error); // Log the error
      setError('Error searching for users. Please try again.'); // Set an error message
    } finally {
      setLoading(false); // Set loading to false when the search is complete (success or failure)
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update the search term state
      />
      <button onClick={handleSearch} disabled={loading}> {/* Disable the button while loading */}
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if there is an error */}
      <ul>
        {searchResults.map((user) => (
          <li key={user.id} onClick={() => onUserSelect(user)}> {/* Make each item clickable */}
            {user.username} ({user.name})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;