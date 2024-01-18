import React from 'react';
import { useDarkMode } from './DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import '../styling/Header.css';


const Header = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className="header_container">
            <header>
                <div className="logo">Tampa Bay Twitter Environmental Analytics Dashboard</div>
            </header>
            <div className="toggle-switch">
                <input
                    type="checkbox"
                    id="dark-mode-toggle"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                />
                <label htmlFor="dark-mode-toggle">
                    <FontAwesomeIcon icon={faMoon} className={`icon dark-icon ${isDarkMode ? 'active' : ''}`} />
                    <FontAwesomeIcon icon={faSun} className={`icon light-icon ${isDarkMode ? 'active' : ''}`} />
                </label>
            </div>
        </div>

    );
};

export default Header;
