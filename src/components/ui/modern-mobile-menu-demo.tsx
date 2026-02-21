import React from 'react';
import { InteractiveMenu, InteractiveMenuItem } from "./modern-mobile-menu";
import { Home, Plus, FileText, User, ShieldAlert } from 'lucide-react';

const nivaranMenuItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: Home, page: 'home' },
  { label: 'Report', icon: Plus, page: 'report' },
  { label: 'Status', icon: FileText, page: 'status' },
  { label: 'Profile', icon: User, page: 'profile' },
];

const customAccentColor = 'rgb(59 130 246)'; // Blue-500

const Default = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-8 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nivaran Navigation Demo
        </h1>
      </div>
      <InteractiveMenu 
        items={nivaranMenuItems}
        accentColor={customAccentColor}
        onNavigate={(page) => console.log('Navigate to:', page)}
        currentPage="home"
        isAdmin={false}
      />
    </div>
  );
};

const WithAdmin = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-8 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Nivaran Navigation Demo (Admin)
        </h1>
      </div>
      <InteractiveMenu 
        items={nivaranMenuItems}
        accentColor={customAccentColor}
        onNavigate={(page) => console.log('Navigate to:', page)}
        currentPage="admin"
        isAdmin={true}
      />
    </div>
  );
};

export { Default, WithAdmin };