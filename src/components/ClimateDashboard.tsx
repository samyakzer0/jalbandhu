import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CloudRain, Wind, Droplets, Activity, AlertTriangle, MapPin, Search } from 'lucide-react';
import { getWeatherData, WeatherData, checkFloodRisk } from '../services/WeatherService';
import { getNearbyEarthquakes, EarthquakeEvent } from '../services/EarthquakeService';

const ClimateDashboard = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
    const [floodRisk, setFloodRisk] = useState<string>('LOW');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setError("Could not get your location. Using default location.");
                    // Default to New Delhi for demo
                    setLocation({ lat: 28.6139, lon: 77.2090 });
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLocation({ lat: 28.6139, lon: 77.2090 });
        }
    }, []);

    useEffect(() => {
        if (!location) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch Weather
            const weatherData = await getWeatherData(location.lat, location.lon);
            setWeather(weatherData);

            if (weatherData) {
                setFloodRisk(checkFloodRisk(weatherData.rainLast3Hours || 0));
            }

            // Fetch Earthquakes
            const earthquakeData = await getNearbyEarthquakes(location.lat, location.lon);
            setEarthquakes(earthquakeData);

            setLoading(false);
        };

        fetchData();
    }, [location]);

    if (loading && !weather) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const cardClass = `p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-100'
        }`;

    return (
        <div className={`min-h-screen p-4 md:p-8 pb-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Error Banner */}
                {error && (
                    <div className="bg-yellow-500/20 text-yellow-500 p-4 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className={`text-3xl md:text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Climate Command Center
                        </h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg flex items-center gap-2`}>
                            <MapPin className="w-5 h-5" />
                            {weather?.location || 'Unknown Location'}
                        </p>
                    </div>

                    <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full font-bold text-sm ${floodRisk === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                        floodRisk === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-green-500/20 text-green-500'
                        }`}>
                        FLOOD RISK: {floodRisk}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Weather Card */}
                    <div className={`${cardClass} col-span-1 md:col-span-2 lg:col-span-1`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CloudRain className="text-blue-500" /> Weather
                            </h2>
                            <span className="text-4xl font-bold">{Math.round(weather?.temp || 0)}°C</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-1 text-sm opacity-70">
                                    <Droplets size={16} /> Humidity
                                </div>
                                <span className="text-xl font-semibold">{weather?.humidity}%</span>
                            </div>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-1 text-sm opacity-70">
                                    <Wind size={16} /> Wind
                                </div>
                                <span className="text-xl font-semibold">{weather?.windSpeed} m/s</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <p className="text-lg capitalize">{weather?.condition}</p>
                            <p className="text-sm opacity-60">Rain (3h): {weather?.rainLast3Hours}mm</p>
                        </div>
                    </div>

                    {/* Social Sentiment (Placeholder for NLP) */}
                    <div className={`${cardClass} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Activity size={100} />
                        </div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Search className="text-purple-500" /> Social Sentinel
                        </h2>
                        <div className="space-y-4">
                            <div className={`p-3 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                                <p className="text-sm">"Clear skies in the city today! Great for a walk."</p>
                                <span className="text-xs opacity-50 mt-1 block">Twitter • 10m ago</span>
                            </div>
                            <div className={`p-3 rounded-lg border-l-4 border-yellow-500 ${isDark ? 'bg-gray-700/50' : 'bg-yellow-50'}`}>
                                <p className="text-sm">"Water level rising near the bridge, be careful!"</p>
                                <span className="text-xs opacity-50 mt-1 block">Instagram • 2h ago</span>
                            </div>
                            <p className="text-xs opacity-50 text-center mt-4">
                                AI Analysis of 1.2k local posts
                            </p>
                        </div>
                    </div>

                    {/* Earthquake Alert */}
                    <div className={`${cardClass}`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" /> Seismic Activity
                        </h2>

                        {earthquakes.length > 0 ? (
                            <div className="space-y-3">
                                {earthquakes.slice(0, 3).map((eq) => (
                                    <div key={eq.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-sm truncate w-40">{eq.place}</p>
                                            <p className="text-xs opacity-60">{new Date(eq.time).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${eq.magnitude > 5 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                            M {eq.magnitude.toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm opacity-70">No recent significant earthquakes detected nearby.</p>
                        )}
                    </div>

                </div>

                {/* Flood Risk Detailed Banner */}
                <div className={`p-6 rounded-2xl ${floodRisk === 'HIGH' ? 'bg-gradient-to-r from-red-900 to-red-800 text-white' :
                    floodRisk === 'MODERATE' ? 'bg-gradient-to-r from-yellow-800 to-yellow-900 text-white' :
                        'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                    }`}>
                    <h3 className="text-2xl font-bold mb-2">
                        {floodRisk === 'HIGH' ? 'Flood Warning Active!' :
                            floodRisk === 'MODERATE' ? 'Flood Advisory' :
                                'Conditions Normal'}
                    </h3>
                    <p className="opacity-90 max-w-2xl">
                        {floodRisk === 'HIGH' ? 'Heavy rainfall detected in your region. Local water bodies may be overflowing. Avoid low-lying areas.' :
                            floodRisk === 'MODERATE' ? 'Moderate rainfall consistent over the last few hours. Stay updated.' :
                                'No immediate flood threats based on current precipitation data. Platform continues to monitor real-time conditions.'}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ClimateDashboard;
