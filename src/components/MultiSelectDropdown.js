import React, { useState, useRef, useEffect } from 'react';
import '../styling/MultiSelectDropDown.css'

function MultiSelectDropdown({ options, title, callback }) {

    const [selectedOptions, setSelectedOptions] = useState(new Set());
    const [showOptions, setShowOptions] = useState(false);

    const dropdownRef = useRef(null);

    const toggleOption = (option) => {
        setSelectedOptions(prevSelectedOptions => {
            const newSelection = new Set(prevSelectedOptions);
            if (newSelection.has(option)) {
                newSelection.delete(option);
            } else {
                newSelection.add(option);
            }
            return newSelection;
        });
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowOptions(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect( () => {
        // console.log(selectedOptions)
        callback(selectedOptions)
    }, [selectedOptions])


    return (
        <div className="dd_container">
            <div className={`dropdown-header ${showOptions ? 'active' : ''}`}
                 onClick={() => setShowOptions(!showOptions)}>
                {title}
                <span className={`dropdown-arrow ${showOptions ? 'up' : 'down'}`}></span>
            </div>
            <div className={`options_menu ${showOptions ? 'active' : ''}`}>
                {showOptions && (
                    <ul className={"entire_list"}>
                        {options.map(option => (
                            <li className="single_option"
                                key={option}
                                onClick={() => toggleOption(option)}
                                style={
                                { cursor: 'pointer', backgroundColor: selectedOptions.has(option) ? 'lightgray' : 'white' }}>
                                {option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default MultiSelectDropdown;

