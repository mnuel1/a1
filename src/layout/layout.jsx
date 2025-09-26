import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useLoading } from "../context/useLoading";
import { useAuth } from "../context/useAuth";
import { ModalProvider } from "../context/useModal";
import { Loading } from "../ui/loading";

import Sidebar from "../ui/sidebar";
export const Layout = () => {
  const { user, getUser } = useAuth();
  const { loading } = useLoading();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!getUser()) {
      navigate("/login");
    }
  }, [user]);

  return (
    <div className="bg-background dark:bg-background-dark 
	text-font-light dark:text-font-dark transition
	delay-150 font-main flex w-full min-h-screen">
      {loading && <Loading />}
      <ModalProvider>      
        <div className="flex px-4 gap-4 w-full">
          <Sidebar />
          <div className="min-h-screen bg-white rounded-md w-full ml-9 ">
            <Outlet />
          </div>
        </div>
      </ModalProvider>
    </div>
  );
};

export const AuthLayout = () => {
  const { user, getUser } = useAuth();
  const { loading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (getUser()) {
      navigate("/a1/manifest");
    }
  }, [user]);

  return (
    <div className="text-black">      
      {loading && <Loading />}
      <Outlet />
    </div>
  );
};
