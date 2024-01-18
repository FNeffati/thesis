import React, {useEffect, useState} from 'react';
import '../styling/TimeFrameSelector.css';


function TimeFrameSelector({ onTimeFrameChange, dateRange }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const formatDateForInput = (date) => {
        return date ? date.toISOString().split('T')[0] : '';
    };

    useEffect(() => {
        setStartDate(formatDateForInput(dateRange.minDate));
        setEndDate(formatDateForInput(dateRange.maxDate));
        }, [dateRange.minDate, dateRange.maxDate]);


    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
        onTimeFrameChange(e.target.value, endDate);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
        onTimeFrameChange(startDate, e.target.value);
    };

    return (
        <div className="time-frame-selector">
            <label>
                Start Date:
                <input type="date" value={startDate} onChange={handleStartDateChange} />
            </label>
            <label>
                End Date:
                <input type="date" value={endDate} onChange={handleEndDateChange} />
            </label>
        </div>
    );
}

export default TimeFrameSelector;
