import { createContext, useContext, useState, useEffect } from 'react';
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

  // useEffect(() => {    
  //   if (!session) return;

  //   const interval = setInterval(async () => {
  //     const sessionToken = Cookies.get(auth.sessionCookieName);
  //     if (!sessionToken) return;

  //     const { session: validSession, user } =
  //       await auth.validateSessionToken(sessionToken);

  //     if (!validSession) {        
  //       logout();
  //     } else {
  //       // optional: update session if renewed
  //       setSession(validSession);
  //     }
  //   }, 2000); // check every 2 seconds

  //   return () => clearInterval(interval);
  // }, [session]);

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

  const updateUser = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    setSettings(null)
    localStorage.removeItem("user");
    localStorage.removeItem("settings");
    auth.deleteSessionTokenCookie();
  };

  const can = (action) => {
    const page = window.location.pathname.split("/").filter(Boolean).pop();
    const cuser = getUser()
    if (!cuser?.access) return false;
    const access = cuser.access

    const pagePermissions = access.permissions?.[page];
    if (!pagePermissions) return false;
    return !!pagePermissions[action];
  };

  const getRestrictions = () => {
    const page = window.location.pathname.split("/").filter(Boolean).pop();
    const cuser = getUser()
    if (!cuser?.access) return {};

    const restrictions = cuser.access.restrictions || {};

    return restrictions[page] || restrictions || {};
  };

  return (
    <AuthContext.Provider value={{ user, session, settings, login, logout, getUser, getSettings, updateSettings, updateUser, can, getRestrictions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
