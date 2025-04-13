import React, { useState } from "react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/useLoading";
import { useAuth } from "../context/useAuth";

import { loginWithCredentials } from "../api/auth";

import LoginInput from "../ui/input";

const Login = () => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const { setLoading } = useLoading();
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginID || !password) {
      toast.error("Please provide both login ID and password.");
      setLoading(false);
      return;
    }

    try {
      const user = await loginWithCredentials(login, loginID, password);

      if (user) {
        toast.success("Login Success!");
        // console.log("Logged in successfully:", user);
        navigate("/a1/manifest");
      }
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-2 rounded-lg shadow-2xl w-[912px] h-[520px] border border-gray-300">
        <div className="bg-primary p-4 rounded-l-lg">
          <h1 className="font-main text-6xl mt-24 font-semibold">
            Welcome to
            <span className="text-7xl font-bold"> A1 Portal </span>
          </h1>
        </div>

        <div className="p-4">
          <h2 className="font-main text-4xl font-bold text-center mt-24 tracking-wide">
            Login
          </h2>

          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <LoginInput
              type="text"
              label="Login ID"
              name="loginID"
              placeholder="Enter your login ID"
              required={true}
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
            />
            <LoginInput
              type="password"
              name="password"
              label="Password"
              placeholder="*****"
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              canAutoComplete={false}
            />
            <button
              type="submit"
              className="cursor-pointer w-full bg-primary text-white py-2 rounded-md hover:bg-primary-hover transition"
              //   disabled={loading}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
