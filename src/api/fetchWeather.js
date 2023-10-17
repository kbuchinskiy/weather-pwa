import axios from 'axios';

const URL = 'http://api.weatherapi.com/v1/current.json?aqi=no';
const API_KEY = '69f028e3aab242eaa67170122231510';

export const fetchWeather = async (query) => {
    try {
        const { data } = await axios.get(URL, {
            params: {
                q: query,
                key: API_KEY,
            }
        });
        return data;
    } catch (error) {
        if (!navigator.onLine) {
            const cache = await caches.open('data-cache-v1');
            const requestUrl = `${URL}?q=${query}&key=${API_KEY}`;
            let cachedResponse = await cache.match(requestUrl);

            if (!cachedResponse || !cachedResponse.ok) {
                // If the specific request is not found, get the last cached response.
                const keys = await cache.keys();
                const requests = keys.filter(key => key.url.includes('weatherapi.com'));

                if (requests.length > 0) {
                    const lastRequest = requests[requests.length - 1]; // Get the last request
                    cachedResponse = await cache.match(lastRequest);
                }
            }

            if (cachedResponse && cachedResponse.ok) {
                return await cachedResponse.json();
            }
            throw new Error('Offline and no cached data available');
        } else {
            throw error;
        }
    }
};
