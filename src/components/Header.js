import React, { useState } from 'react';
import "./Header.css";
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAuth } from "firebase/auth"

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Dummy suggestions based on the search term
    if (value) {
      setSuggestions([
        "Event 1",
        "Event 2",
        "Event 3",
        "Event 4"
      ]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false); // Hide suggestions after selecting one
  };

  return (
    <div className='header'>
      <div className="header__left">
        <img src="/assets/logo.svg" alt="logo" width="80px" height="80px" />
      </div>
      <div className="searchBar">
        <SearchIcon />
        <input type='text' placeholder='Search for events' value={searchTerm} onChange={handleInputChange}  />
        {showSuggestions && (
          <div className="suggestion-box active">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item" 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="header__right">
        <Link to="/my-events" style={{ textDecoration: "none" }} className="nav">
          <AssignmentIndRoundedIcon />
          <span>My Events</span>
        </Link>
        <Link to="/events" style={{ textDecoration: "none" }} className="nav">
          <TravelExploreIcon />
          <span>Explore Events</span>
        </Link>
        <div className="nav">
          <NotificationsIcon />
          <span>Notifications</span>
        </div>
        <Link to="/profile">
          <Avatar src={user?.photoURL} className='Avatar' />
        </Link>
      </div>
    </div>
  )
}

export default Header;