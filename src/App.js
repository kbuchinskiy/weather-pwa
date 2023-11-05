import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api/fetchWeather';
import 'reset-css/reset.css';
import './App.css';
const LAST_CITIES_LENGTH = 5;
const App = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState({});
    const [recentCities, setRecentCities] = useState([]);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isCityWrong, setIsCityWrong] = useState(false);

    const updateOnlineStatus = () => {
        setIsOffline(!navigator.onLine);
    }

    useEffect(() => {
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        const savedCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        setRecentCities(savedCities);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const updateRecentCities = (city) => {
        setRecentCities(prevCities => {
            const updatedCities = [city, ...prevCities.filter(c => c !== city)];
            if (updatedCities.length > LAST_CITIES_LENGTH) {
                updatedCities.pop();
            }
            localStorage.setItem('recentCities', JSON.stringify(updatedCities));
            return updatedCities;
        });
    }

    const getWeatherForCity = async (city) => {
        setIsCityWrong(false);
        try {
            const data = await fetchWeather(city);
            setWeather(data);
            updateRecentCities(data.location.name);
            setQuery(data.location.name);
        } catch (error) {
            setIsCityWrong(true);
            console.error("Failed to fetch weather", error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await getWeatherForCity(query);
    }

    const handleRecentCityClick = async (city) => {
        setQuery(city);
        await getWeatherForCity(city);
    }

    const onQueryUpdate = (query) => {
        setQuery(query);
        setIsCityWrong(false);
    }

    return (
        <div className="main-container">
            <div className="form-wrapper">

                <form className="form" onSubmit={handleSubmit} action="" autoComplete="on">
                    <input
                        autoComplete="on"
                        type="text"
                        name="city"
                        className={`search-input ${isCityWrong ? 'input-error' : ''}`}
                        placeholder="Type city name..."
                        value={query}
                        onChange={(e) => onQueryUpdate(e.target.value)}
                    />
                    <button type="submit">go</button>
                </form>
                {isCityWrong && <p className="form-error">Wrong city name</p>}
            </div>

            {isOffline && <div className="offline-message">You're currently offline, showing last cached results.</div>}
            {(recentCities.length > 0 && !weather.location) && (
                <div className="recent-cities">
                    <h2>recent cities:</h2>
                    <ul>
                        {recentCities.map(city => (
                            <li onClick={ () => handleRecentCityClick(city)} key={city}>{city}</li>
                        ))}
                    </ul>
                </div>
            )}

            {weather.location && (
                <article className="weather-result">
                    <header className="weather-location">
                        <h2 className="weather-location-city">{weather.location.name}</h2>
                        <p className="weather-location-country">{weather.location.country}</p>
                    </header>
                    <section className="weather-temp">
                        <h3>temp: <strong>{Math.round(weather.current.temp_c)}<sup>&deg;C</sup></strong></h3>
                        <h3>feels like: <strong>{Math.round(weather.current.temp_c)}<sup>&deg;C</sup></strong></h3>
                    </section>
                    <section className="weather-info">
                        <figure>
                            <img className="weather-icon" src={weather.current.condition.icon} alt="Weather icon"/>
                            <figcaption>{weather.current.condition.text}</figcaption>
                        </figure>
                    </section>
                </article>

            )}
        </div>
    );
}

export default App;
