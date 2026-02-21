import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';
import { Clipboard, CheckCircle } from 'lucide-react';

interface AdminSetupInstructionsProps {
  onComplete?: () => void;
}

function AdminSetupInstructions({ onComplete }: AdminSetupInstructionsProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  
  const setupScript = `
// Function to check if a table exists and create it if it doesn't
async function ensureTableExists(supabase, tableName, createTableFn) {
  try {
    console.log(\`Checking if \${tableName} table exists...\`);
    // Try to select from the table
    const { error } = await supabase.from(tableName).select('*').limit(1);
    
    // If there's an error with code 42P01, the table doesn't exist
    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      console.log(\`Table \${tableName} does not exist. Creating...\`);
      await createTableFn();
      console.log(\`Table \${tableName} created successfully.\`);
    } else if (error) {
      console.error(\`Error checking table \${tableName}:\`, error);
    } else {
      console.log(\`Table \${tableName} already exists.\`);
    }
  } catch (e) {
    console.error(\`Error ensuring table \${tableName} exists:\`, e);
  }
}

// Get the supabase client from the window object
async function setupAdminTables() {
  try {
    // Get supabase instance
    const supabase = window.supabase;
    
    // Get current user to set as admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user is logged in.');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Create user_roles table if it doesn't exist
    await ensureTableExists(supabase, 'user_roles', async () => {
      // Using SQL to create the table
      await supabase.from('user_roles').insert([
        { user_id: user.id, role: 'admin' }
      ]);
    });
    
    // Create category_admins table if it doesn't exist
    await ensureTableExists(supabase, 'category_admins', async () => {
      // Add categories
      const categories = ['Tsunami', 'Cyclone', 'Storm Surge', 'High Waves', 'Coastal Erosion', 'Marine Pollution', 'Maritime Accident', 'Other'];
      
      for (const category of categories) {
        await supabase.from('category_admins').insert([
          { user_id: user.id, category }
        ]);
      }
    });
    
    console.log('Admin tables setup completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupAdminTables();
`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupScript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className={`p-6 max-w-3xl mx-auto`}>
      <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Admin Setup Instructions
      </h2>
      
      <div className={`rounded-lg p-4 mb-6 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          It looks like the admin tables in your Supabase database might not be set up correctly.
          This is required for the admin functionality to work properly.
        </p>
        
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Follow these steps to set up your admin account:
        </h3>
        
        <ol className={`list-decimal pl-6 mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <li className="mb-2">Make sure you're logged in to the app with the account you want to make an admin.</li>
          <li className="mb-2">Open your browser's developer tools (Press F12 or right-click and select "Inspect").</li>
          <li className="mb-2">Go to the "Console" tab in the developer tools.</li>
          <li className="mb-2">Copy the script below and paste it into the console.</li>
          <li className="mb-2">Press Enter to run the script.</li>
          <li className="mb-2">After the script finishes running, refresh the page.</li>
        </ol>
      </div>
      
      <div className="relative">
        <div className={`p-4 rounded-lg mb-6 font-mono text-sm overflow-auto max-h-96 ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
        }`}>
          <pre>{setupScript}</pre>
        </div>
        
        <button
          onClick={copyToClipboard}
          className={`absolute top-2 right-2 p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <CheckCircle size={18} className="text-green-500" />
          ) : (
            <Clipboard size={18} />
          )}
        </button>
      </div>
      
      {onComplete && (
        <div className="mt-6 text-center">
          <button
            onClick={onComplete}
            className={`px-6 py-2 rounded-md font-medium ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            I've completed the setup
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminSetupInstructions;
