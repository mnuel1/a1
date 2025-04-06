import React, { useState, useEffect } from 'react';
import { LayoutDashboard, User, Menu, LogOut, FileSpreadsheet, UsersRound } from "lucide-react";
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const location = useLocation();
  const { getUser } = useAuth()

  const role = getUser().role;
  
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  const navLinks = [
    { name: 'Manifest', href: '/a1/manifest', icon: FileSpreadsheet },
    { name: 'Report', href: '/a1/report', icon: LayoutDashboard },
    ...(role?.toLowerCase() === 'admin' ? [{ name: 'Staffs', href: '/a1/staffs', icon: UsersRound }] : []),
    { name: 'Profile', href: '/a1/profile', icon: User },
  ];

  return (
    <div className="flex h-full">
      <aside
        className={`h-full rounded-lg border-r border-gray-200 bg-white p-2 shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 ${!isExpanded ? '!w-[60px]' : '!w-[250px]'}`}
      >
        <div className="flex items-center justify-between p-4" style={{ justifyContent: isExpanded ? 'space-between' : 'center' }}>
          {isExpanded && <span className="text-lg font-semibold">A<span className="text-primary">1</span> Global</span>}
          <button className="hover:bg-primary hover:text-font-dark rounded-lg p-2" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
        </div>

        <nav className="mt-5 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`hover:bg-primary hover:text-font-dark flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${currentPath === link.href ? 'bg-primary text-font-dark' : ''} ${!isExpanded ? 'justify-center' : ''}`}
            >
              <link.icon size={20} />
              {isExpanded && <span className="text-sm font-medium transition-opacity">{link.name}</span>}
            </a>
          ))}

          <form method="POST" action="/auth/logout" className="inline">
            <button
              type="submit"
              className={`hover:bg-primary hover:text-font-dark flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-300 ${!isExpanded ? 'justify-center' : ''}`}
            >
              <LogOut size={20} />
              {isExpanded && <span className="text-sm font-medium transition-opacity">Log out</span>}
            </button>
          </form>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
