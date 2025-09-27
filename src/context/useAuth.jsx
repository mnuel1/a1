import React, { createContext, useContext, useState, useEffect } from 'react';
import * as auth from '../auth/auth'; 
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState(null);  

  useEffect(() => {
    // Check for session token on app load
    const sessionToken = Cookies.get(auth.sessionCookieName);
    if (sessionToken) {
      auth.validateSessionToken(sessionToken).then(({ session, user }) => {                
        if (session) {
          setSession(session);
          setUser(user);
          auth.setSessionTokenCookie(sessionToken, session.expiresAt);
        } else {
          auth.deleteSessionTokenCookie();
        }
      });
    }
  }, []);

  const login = async (userData) => {
    
    const token = auth.generateSessionToken();
    const session = await auth.createSession(token, userData.id);

    localStorage.setItem("user", JSON.stringify(userData));
      
    setUser(userData);
    setSession(session);
    
    auth.setSessionTokenCookie(token, session.expiresAt);
  };

  const getUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  const getSettings = () => {
    const settingsData = localStorage.getItem('settings');
    return settingsData ? JSON.parse(settingsData) : null;
  }

  const updateSettings = (settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    setSettings(settings)
  }

  const logout = () => {
    setUser(null);
    setSession(null);
    setSettings(null)
    localStorage.removeItem("user"); 
    localStorage.removeItem("settings"); 
    auth.deleteSessionTokenCookie();    
  };

  return (
    <AuthContext.Provider value={{ user, session, settings, login, logout, getUser, getSettings, updateSettings}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
