import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api/fetchWeather';
import './App.css';

const App = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState({});
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const updateOnlineStatus = () => {
        setIsOffline(!navigator.onLine);
    }

    useEffect(() => {
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const search = async (e) => {
        if(e.key === 'Enter') {
            try {
                const data = await fetchWeather(query);
                setWeather(data);
                setQuery('');
            } catch (error) {
                console.error("Failed to fetch weather", error);
            }
        }
    }

    return (
        <div className="main-container">
            <input
                type="text"
                className="search-input"
                placeholder="Type city name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={search}
            />

            {isOffline && <div className="offline-message">You're currently offline, showing last cached results.</div>}

            {weather.location && (
                <div className="result">
                    <h2 className="result-location">
                        <span>{weather.location.name}</span>
                        <sup>{weather.location.country}</sup>
                    </h2>
                    <div className="result-temp">
                        {Math.round(weather.current.temp_c)}
                        <sup>&deg;C</sup>
                    </div>
                    <div className="result-info">
                        <img className="result-city-icon" src={weather.current.condition.icon} alt="weather icon"/>
                        <p>{weather.current.condition.text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
