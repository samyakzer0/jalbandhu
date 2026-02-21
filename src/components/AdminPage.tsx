import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import AdminDashboard from './admin/AdminDashboard';
import AdminSetupInstructions from './admin/AdminSetupInstructions';

interface AdminPageProps {
  onNavigate?: (page: string) => void;
  user?: any;
}

function AdminPage({ onNavigate, user }: AdminPageProps) {
  const { theme } = useTheme();
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  const handleSetupComplete = () => {
    setShowSetupInstructions(false);
  };
  
  // Show setup instructions if needed
  if (showSetupInstructions) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Admin Setup</h1>
          </div>
        </div>
        
        <AdminSetupInstructions onComplete={handleSetupComplete} />
      </div>
    );
  }

  return (
    <AdminDashboard onNavigate={onNavigate} user={user} />
  );
}

export default AdminPage;
