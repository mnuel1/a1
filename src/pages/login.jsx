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
  const { loading, setLoading } = useLoading();
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
        navigate("/a1/manifest");
      }
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="rounded-lg shadow-2xl w-[480px] h-auto border border-gray-300 bg-white p-8">
        <h2 className="font-main text-4xl font-bold text-center tracking-wide">
          Login
        </h2>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
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
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
