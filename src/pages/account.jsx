import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../ui/input';

import { useAuth } from '../context/useAuth';
import { useLoading } from "../context/useLoading";
import { updateLoginID, updatePassword } from '../api/account';

const Account = () => {
  const [loginID, setLoginID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { getUser } = useAuth()
  const { setLoading } = useLoading()
  

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const id = getUser().id
      console.log(id);
      
      if (!id) {
        throw new Error("Something went wrong. Please try again later.");
      }
      const result = await updateLoginID(loginID, id)

      if (!result.success) {
        throw new Error("Something went wrong. Please try again later.");
      }

      toast.success("Login ID updated succesfully.")

    } catch (error) {      
      toast.error(error.message);
    } finally {
      setLoading(false)
      setLoginID("")
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const id = getUser().id

      if (!id) {
        throw new Error("Something went wrong. Please try again later.");
      }
      const result = await updatePassword(password, confirmPassword, id)

      if (!result.success) {
        throw new Error("Something went wrong. Please try again later.");
      }

      toast.success("Password updated succesfully.")

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false)
      setPassword("")
      setConfirmPassword("")
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-full flex-col gap-2 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <span className="text-gray-500 text-sm">
            You can edit your login ID here. Leave blank if you don't want to change it.
          </span>
        </div>

        <form onSubmit={handleSubmitLogin} className="mt-4 space-y-4 w-fit">          
          <Input
            label="Login ID"
            type="text"
            name="loginID"
            placeholder="Enter your login ID"
            required
            value={loginID}
            onChange={(e) => setLoginID(e.target.value)}
          />

          <button
            className="text-sm cursor-pointer w-full rounded-lg bg-primary py-2 text-white transition hover:bg-primary-hover"
            type="submit"
          >
            Change Login ID
          </button>
        </form>

        <hr className="my-4" />

        {/* Change Password Section */}
        <div>
          <h2 className="text-xl font-bold">Change Password</h2>
          <span className="text-gray-500 text-sm">
            You can edit your password here. Leave blank if you don't want to change it.
          </span>
        </div>

        <form onSubmit={handleSubmitPassword} className="mt-4 space-y-4 w-fit">          
          <Input
            label="New Password"
            type="password"
            name="password"
            placeholder="Enter a password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter the password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="text-sm cursor-pointer w-full rounded-lg bg-primary py-2 text-white transition hover:bg-primary-hover"
            type="submit"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;
