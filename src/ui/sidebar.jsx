import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Menu,
  LogOut,
  FileSpreadsheet,
  UsersRound,
  Table
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const location = useLocation();
  const { getUser, logout } = useAuth();

  const role = getUser().role;

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const navLinks = [
    { name: "Manifest", href: "/a1/manifest", icon: FileSpreadsheet },
    { name: "Database", href: "/a1/database", icon: Table },
    { name: "Report", href: "/a1/report", icon: LayoutDashboard },
    ...(role?.toLowerCase() === "admin"
      ? [{ name: "Staffs", href: "/a1/staffs", icon: UsersRound }]
      : []),
    { name: "Profile", href: "/a1/profile", icon: User },
  ];

  return (
    <div className="flex h-screen">
      <aside
        className={`fixed top-0 left-0 h-full z-20 rounded-lg border 
          border-gray-200 bg-white p-2 shadow-xl transition-all duration-300 
          dark:border-gray-700 dark:bg-gray-900 flex flex-col ${
            !isExpanded ? "!w-[60px]" : "!w-[250px]"
          }`}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ justifyContent: isExpanded ? "space-between" : "center" }}
        >
          {isExpanded && (
            <span className="text-lg font-semibold">
              A<span className="text-primary">1</span> Global
            </span>
          )}
          <button
            className="bg-primary hover:bg-primary-60 cursor-pointer text-font-dark rounded-lg p-2"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex flex-col justify-between gap-2 h-full">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`hover:bg-primary hover:text-font-dark flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                  currentPath === link.href ? "bg-primary text-font-dark" : ""
                } ${!isExpanded ? "justify-center" : ""}`}
              >
                <link.icon size={20} />
                {isExpanded && (
                  <span className="text-sm font-medium transition-opacity">
                    {link.name}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <hr className="border-gray-500 border"/>
            <button
              type="button"
              onClick={logout}
              className={`hover:bg-primary hover:text-font-dark flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                !isExpanded ? "justify-center" : ""
              }`}
            >
              <LogOut size={20} />
              {isExpanded && (
                <span className="text-sm font-medium transition-opacity">
                  Log out
                </span>
              )}
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
