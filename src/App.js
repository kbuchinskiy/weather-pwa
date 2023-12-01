import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api/fetchWeather';
import 'reset-css/reset.css';
import './App.css';
const LAST_CITIES_LENGTH = 5;

const getBackgroundImage = (conditionText) => {
    switch (conditionText) {
        case 'Sunny':
            return '/images/weather/sunny.png';
        case 'Cloudy':
            return '/images/weather/cloudy.png';
        case 'Partly cloudy':
            return '/images/weather/partly_cloudy.png';
        case 'Mist':
            return '/images/weather/mist.png';
        // Add more cases for different weather conditions
        default:
            return '/images/weather/sunny.png'; // Default image
    }
}

const App = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState({});
    const [recentCities, setRecentCities] = useState([]);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isCityWrong, setIsCityWrong] = useState(false);
    const [bgImage, setBgImage] = useState(getBackgroundImage());

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
            setBgImage(getBackgroundImage(data.current.condition.text));

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
        <div className="wrapper">
            <img className="bg-image" src={bgImage} alt="weather image" />
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

                {(recentCities.length > 0) && (
                    <div className="recent-cities">
                        <ul>
                            {recentCities.map(city => {
                                if (city !== query) { // Only render if it's not the currently selected city
                                    return (
                                        <li onClick={() => handleRecentCityClick(city)} key={city}>
                                            {city}
                                        </li>
                                    );
                                }
                                return null; // Do not render the selected city
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
