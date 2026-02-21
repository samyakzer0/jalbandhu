
// Basic interface for Weather Data
export interface WeatherData {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    location: string;
    rainLast3Hours?: number;
}

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Placeholder: User should replace this or we use Env Var
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            console.warn("No API Key provided for OpenWeatherMap. returning mock data.");
            // Mock data for demonstration until key is added
            return {
                temp: 28,
                condition: 'Cloudy',
                humidity: 65,
                windSpeed: 12,
                location: 'Mock City',
                rainLast3Hours: 5 // mm
            };
        }

        const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Weather fetch failed');

        const data = await response.json();
        return {
            temp: data.main.temp,
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            location: data.name,
            // Rain volume for last 3 hours if available
            rainLast3Hours: data.rain ? data.rain['3h'] || 0 : 0
        };
    } catch (error) {
        console.error("Weather Service Error:", error);
        return null;
    }
};

export const checkFloodRisk = (rain3h: number): string => {
    if (rain3h > 50) return 'HIGH';
    if (rain3h > 15) return 'MODERATE';
    return 'LOW';
};
