import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getSettings } from "../api/settings";
import { getAccountData } from "../api/account";

import Sidebar from "../ui/sidebar";
export const Layout = () => {
  const { updateSettings, getUser, updateUser } = useAuth();
  const user = getUser();

  useEffect(() => {
    let unsubscribe;
    let unsubscribeUser;

    if (user?.id) {
      getAccountData(user.id, (updatedUser) => {
        updateUser(updatedUser);
      }).then((res) => {
        if (res?.unsubscribe) unsubscribeUser = res.unsubscribe;
      });
    }

    getSettings((newSettings) => {
      // realtime
      updateSettings(newSettings);
    }).then((res) => {
      // initial
      updateSettings(res.data);
      if (res?.unsubscribe) unsubscribe = res.unsubscribe;
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  return (
    <div className="bg-background dark:bg-background-dark 
    text-font-light dark:text-font-dark transition
    delay-150 font-main flex w-full min-h-screen">
      <div className="flex px-4 gap-4 w-full">
        <Sidebar />
        <div className="min-h-screen bg-white rounded-md w-full ml-9 ">
          {user &&
            <div className="sticky top-0 z-20 bg-primary text-white w-full px-4">
              You are {getUser().name} as the {getUser().role}
            </div>
          }
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export const AuthLayout = () => {
  const { user, getUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (getUser()) {
      navigate("/a1/manifest");
    }
  }, [user]);

  return (
    <div className="text-black">
      <Outlet />
    </div>
  );
};
