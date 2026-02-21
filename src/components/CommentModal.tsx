import { useState, useEffect } from 'react';
import { X, AlertTriangle, MapPin, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (commentData: any) => void;
  reportId?: string | null;
  currentUser: any;
}

const CommentModal = ({ isOpen, onClose, onSubmit, reportId, currentUser }: CommentModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [commentType, setCommentType] = useState<'general' | 'advisory' | 'urgent' | 'resolved' | 'analysis'>('general');
  const [isPublic, setIsPublic] = useState(false);
  const [coastalState, setCoastalState] = useState('');
  const [responseRequired, setResponseRequired] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(reportId || '');
  
  // Ocean hazard specific metadata
  const [waveHeight, setWaveHeight] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [affectedPorts, setAffectedPorts] = useState('');
  const [evacuationZones, setEvacuationZones] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { theme } = useTheme();

  const hazardTypes = [
    { value: '1', label: 'Tsunami Events', icon: '🌊' },
    { value: '2', label: 'Storm Surge', icon: '⛈️' },
    { value: '3', label: 'High Waves', icon: '🌊' },
    { value: '4', label: 'Coastal Erosion', icon: '🏖️' },
    { value: '5', label: 'Marine Debris', icon: '🗑️' },
    { value: '6', label: 'Oil Spills', icon: '🛢️' },
    { value: '7', label: 'Algal Blooms', icon: '🦠' },
    { value: '8', label: 'Water Quality', icon: '💧' }
  ];

  const coastalStates = [
    'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Odisha', 
    'West Bengal', 'Gujarat', 'Maharashtra', 'Goa'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: '#16a34a', description: 'Routine monitoring' },
    { value: 'medium', label: 'Medium', color: '#ca8a04', description: 'Attention needed' },
    { value: 'high', label: 'High', color: '#ea580c', description: 'Urgent response' },
    { value: 'critical', label: 'Critical', color: '#dc2626', description: 'Immediate action required' }
  ];

  const commentTypes = [
    { value: 'general', label: 'General Comment', icon: MessageCircle },
    { value: 'advisory', label: 'Advisory', icon: AlertTriangle },
    { value: 'urgent', label: 'Urgent Alert', icon: AlertTriangle },
    { value: 'resolved', label: 'Resolution Update', icon: MessageCircle },
    { value: 'analysis', label: 'Technical Analysis', icon: MessageCircle }
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedReportId(reportId || '');
      setCommentText('');
      setError('');
    }
  }, [isOpen, reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      setError('Comment text is required');
      return;
    }

    if (!selectedReportId) {
      setError('Please select a report or enter a report ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build metadata object
      const metadata: any = {};
      
      if (waveHeight) metadata.wave_height = parseFloat(waveHeight);
      if (windSpeed) metadata.wind_speed = parseFloat(windSpeed);
      if (affectedPorts) metadata.affected_ports = affectedPorts.split(',').map(p => p.trim());
      if (evacuationZones) metadata.evacuation_zones = evacuationZones.split(',').map(z => z.trim());

      const commentData = {
        report_id: selectedReportId,
        hazard_type_id: 1, // Default to tsunami, can be enhanced to detect from report
        comment_text: commentText.trim(),
        comment_type: commentType,
        urgency_level: urgencyLevel,
        is_public: isPublic,
        coastal_state: coastalState || null,
        response_required: responseRequired,
        metadata
      };

      await onSubmit(commentData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create comment');
    } finally {
      setLoading(false);
    }
  };

  const canSetCritical = currentUser?.role === 'admin' || currentUser?.role === 'analyst';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-2xl rounded-xl shadow-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Add Ocean Hazard Comment
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Report ID */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Report ID *
            </label>
            <input
              type="text"
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              placeholder="e.g., SGST-2024-001"
              className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              required
            />
          </div>

          {/* Comment Text */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Comment *
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Provide details about the ocean hazard situation..."
              className={`w-full px-4 py-2 border rounded-lg resize-none transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              required
            />
            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {commentText.length}/1000 characters
            </div>
          </div>

          {/* Row 1: Comment Type and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Comment Type
              </label>
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value as any)}
                className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {commentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Urgency Level
              </label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as any)}
                className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {urgencyLevels.map(level => (
                  <option 
                    key={level.value} 
                    value={level.value}
                    disabled={level.value === 'critical' && !canSetCritical}
                  >
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
              {urgencyLevel === 'critical' && !canSetCritical && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Critical urgency will be downgraded to High (insufficient permissions)
                </p>
              )}
            </div>
          </div>

          {/* Row 2: State and Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <MapPin size={16} className="inline mr-1" />
                Coastal State
              </label>
              <select
                value={coastalState}
                onChange={(e) => setCoastalState(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select state (optional)</option>
                {coastalStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
                />
                <label htmlFor="isPublic" className={`flex items-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isPublic ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-gray-400" />}
                  Make comment public
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="responseRequired"
                  checked={responseRequired}
                  onChange={(e) => setResponseRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
                />
                <label htmlFor="responseRequired" className={`flex items-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <AlertTriangle size={16} className="text-orange-500" />
                  Response required
                </label>
              </div>
            </div>
          </div>

          {/* Ocean Hazard Metadata */}
          <div className={`p-4 border rounded-lg ${
            theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Ocean Conditions (Optional)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Wave Height (meters)
                </label>
                <input
                  type="number"
                  value={waveHeight}
                  onChange={(e) => setWaveHeight(e.target.value)}
                  step="0.1"
                  placeholder="e.g., 3.5"
                  className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Wind Speed (km/h)
                </label>
                <input
                  type="number"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(e.target.value)}
                  placeholder="e.g., 85"
                  className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Affected Ports (comma-separated)
                </label>
                <input
                  type="text"
                  value={affectedPorts}
                  onChange={(e) => setAffectedPorts(e.target.value)}
                  placeholder="e.g., Kochi, Alappuzha"
                  className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Evacuation Zones (comma-separated)
                </label>
                <input
                  type="text"
                  value={evacuationZones}
                  onChange={(e) => setEvacuationZones(e.target.value)}
                  placeholder="e.g., Zone A, Zone B"
                  className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || !commentText.trim() || !selectedReportId}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                loading || !commentText.trim() || !selectedReportId
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;