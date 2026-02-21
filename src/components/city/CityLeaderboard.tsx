import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Trophy, TrendingUp, TrendingDown, Waves, Shield, Users, MapPin } from 'lucide-react';

interface CityStats {
  id: string;
  name: string;
  state: string;
  safetyScore: number;
  totalReports: number;
  resolvedReports: number;
  responseTime: number; // in hours
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  population: number;
  coastalLength: number; // in km
  rank: number;
  change: number; // rank change from last period
}

interface CityLeaderboardProps {
  currentCity?: string;
}

const CityLeaderboard: React.FC<CityLeaderboardProps> = ({ currentCity }) => {
  const { theme } = useTheme();
  const [cities, setCities] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState<'safety' | 'response' | 'resolved'>('safety');

  // Mock data for Indian coastal cities
  const mockCityData: CityStats[] = [
    {
      id: 'mumbai',
      name: 'Mumbai',
      state: 'Maharashtra',
      safetyScore: 87,
      totalReports: 234,
      resolvedReports: 198,
      responseTime: 4.2,
      riskLevel: 'high',
      population: 12442373,
      coastalLength: 150,
      rank: 1,
      change: 2
    },
    {
      id: 'kochi',
      name: 'Kochi',
      state: 'Kerala',
      safetyScore: 85,
      totalReports: 89,
      resolvedReports: 76,
      responseTime: 3.8,
      riskLevel: 'medium',
      population: 677381,
      coastalLength: 95,
      rank: 2,
      change: -1
    },
    {
      id: 'chennai',
      name: 'Chennai',
      state: 'Tamil Nadu',
      safetyScore: 82,
      totalReports: 167,
      resolvedReports: 128,
      responseTime: 6.1,
      riskLevel: 'high',
      population: 4796877,
      coastalLength: 120,
      rank: 3,
      change: 1
    },
    {
      id: 'visakhapatnam',
      name: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      safetyScore: 79,
      totalReports: 92,
      resolvedReports: 71,
      responseTime: 5.4,
      riskLevel: 'medium',
      population: 1730320,
      coastalLength: 80,
      rank: 4,
      change: 0
    },
    {
      id: 'mangalore',
      name: 'Mangalore',
      state: 'Karnataka',
      safetyScore: 77,
      totalReports: 45,
      resolvedReports: 38,
      responseTime: 4.9,
      riskLevel: 'low',
      population: 488968,
      coastalLength: 60,
      rank: 5,
      change: 3
    },
    {
      id: 'kolkata',
      name: 'Kolkata',
      state: 'West Bengal',
      safetyScore: 75,
      totalReports: 143,
      resolvedReports: 98,
      responseTime: 8.2,
      riskLevel: 'critical',
      population: 4496694,
      coastalLength: 100,
      rank: 6,
      change: -2
    },
    {
      id: 'goa',
      name: 'Panaji',
      state: 'Goa',
      safetyScore: 73,
      totalReports: 67,
      resolvedReports: 49,
      responseTime: 7.1,
      riskLevel: 'medium',
      population: 114759,
      coastalLength: 105,
      rank: 7,
      change: 1
    },
    {
      id: 'puducherry',
      name: 'Puducherry',
      state: 'Puducherry',
      safetyScore: 71,
      totalReports: 34,
      resolvedReports: 24,
      responseTime: 6.8,
      riskLevel: 'medium',
      population: 244377,
      coastalLength: 45,
      rank: 8,
      change: -1
    },
    {
      id: 'trivandrum',
      name: 'Trivandrum',
      state: 'Kerala',
      safetyScore: 69,
      totalReports: 78,
      resolvedReports: 52,
      responseTime: 9.3,
      riskLevel: 'medium',
      population: 957730,
      coastalLength: 70,
      rank: 9,
      change: 0
    },
    {
      id: 'bhubaneswar',
      name: 'Bhubaneswar',
      state: 'Odisha',
      safetyScore: 66,
      totalReports: 105,
      resolvedReports: 64,
      responseTime: 11.4,
      riskLevel: 'high',
      population: 837737,
      coastalLength: 85,
      rank: 10,
      change: -3
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Sort cities based on filter
      let sortedCities = [...mockCityData];
      
      switch (filterBy) {
        case 'safety':
          sortedCities.sort((a, b) => b.safetyScore - a.safetyScore);
          break;
        case 'response':
          sortedCities.sort((a, b) => a.responseTime - b.responseTime);
          break;
        case 'resolved':
          sortedCities.sort((a, b) => (b.resolvedReports / b.totalReports) - (a.resolvedReports / a.totalReports));
          break;
      }

      // Update ranks
      sortedCities.forEach((city, index) => {
        city.rank = index + 1;
      });

      setCities(sortedCities);
      setLoading(false);
    }, 1000);
  }, [filterBy]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />; // Empty space for no change
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} backdrop-blur-xl rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              City Leaderboard
            </h2>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'safety' | 'response' | 'resolved')}
              className={`px-3 py-2 rounded-lg text-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="safety">Safety Score</option>
              <option value="response">Response Time</option>
              <option value="resolved">Resolution Rate</option>
            </select>
          </div>
        </div>

        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Ranking of coastal cities based on ocean safety metrics and emergency response performance
        </p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {cities.map((city) => {
          const isCurrentCity = city.name.toLowerCase() === currentCity?.toLowerCase();
          const resolutionRate = (city.resolvedReports / city.totalReports) * 100;

          return (
            <div
              key={city.id}
              className={`${
                isCurrentCity 
                  ? theme === 'dark' ? 'bg-blue-900/60 border-blue-500' : 'bg-blue-50 border-blue-300'
                  : theme === 'dark' ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/60 border-gray-100/50'
              } backdrop-blur-xl rounded-xl p-4 border transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    <div className={`text-2xl ${city.rank <= 3 ? '' : 'text-lg font-bold'} ${
                      isCurrentCity ? 'text-blue-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {getRankIcon(city.rank)}
                    </div>
                    {getChangeIcon(city.change)}
                  </div>

                  {/* City Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold ${
                        isCurrentCity ? 'text-blue-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {city.name}
                      </h3>
                      {isCurrentCity && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Your City
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm mt-1">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {city.state}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{formatNumber(city.population)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Waves className="w-3 h-3" />
                        <span>{city.coastalLength}km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${
                      city.safetyScore >= 80 ? 'text-green-500' :
                      city.safetyScore >= 70 ? 'text-yellow-500' :
                      city.safetyScore >= 60 ? 'text-orange-500' : 'text-red-500'
                    }`}>
                      {city.safetyScore}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Safety
                    </p>
                  </div>

                  <div className="text-center">
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {city.responseTime.toFixed(1)}h
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Response
                    </p>
                  </div>

                  <div className="text-center">
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(resolutionRate)}%
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Resolved
                    </p>
                  </div>

                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getRiskLevelColor(city.riskLevel)}`}>
                      {city.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar for current metric */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {filterBy === 'safety' ? 'Safety Score' : 
                     filterBy === 'response' ? 'Response Time' : 'Resolution Rate'}
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {city.totalReports} reports
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      filterBy === 'safety' ? 
                        (city.safetyScore >= 80 ? 'bg-green-500' : 
                         city.safetyScore >= 70 ? 'bg-yellow-500' : 
                         city.safetyScore >= 60 ? 'bg-orange-500' : 'bg-red-500') :
                      filterBy === 'response' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ 
                      width: `${
                        filterBy === 'safety' ? city.safetyScore : 
                        filterBy === 'response' ? Math.max(10, 100 - (city.responseTime * 5)) : 
                        resolutionRate
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityLeaderboard;