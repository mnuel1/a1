import { useState } from "react";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import { NormalInput } from "../../ui/input";
import { useAccount } from "./hooks/useAccount";

import { Avatar } from "./ui/userAvatar";
import { SectionCard } from "./ui/sectionCard";

import Settings from "./settings";

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = () => <div className="h-px bg-gray-100 my-4" />;

// ─── Account Page ─────────────────────────────────────────────────────────────

const AccountPage = () => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { getUser } = useAuth();
  const toast = useToast();
  const { updateLogin, updatePassword, isUpdatingLogin, isUpdatingPassword } = useAccount();

  const user = getUser();
  const isAdmin = user?.role.toLowerCase() === "admin";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateLogin({ loginID, id: user.id });
      toast.success("User update", "Login ID updated successfully");
      setLoginID("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePassword({ password, confirmPassword, id: user.id });
      toast.success("User update", "Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-background overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className={`flex flex-col gap-5 p-6 overflow-y-auto ${isAdmin ? "w-1/2 border-r border-gray-100" : "w-full max-w-xl mx-auto"}`}>

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-font-light tracking-tight">Account</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your personal credentials</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <Avatar name={user?.name ?? user?.login_id} role={user?.role} />
          <Divider />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Login ID</p>
              <p className="text-sm font-medium text-font-light truncate">{user?.login_id ?? "—"}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Role</p>
              <p className="text-sm font-medium text-font-light">{user?.role ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Update Login ID */}
        <SectionCard
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          title="Change Login ID"
          description="Update the ID you use to log in"
        >
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <NormalInput
              label="New Login ID"
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isUpdatingLogin}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-60 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdatingLogin ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating…
                </span>
              ) : "Update Login ID"}
            </button>
          </form>
        </SectionCard>

        {/* Update Password */}
        <SectionCard
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          title="Change Password"
          description="Choose a strong password"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <NormalInput
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <NormalInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-60 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
            >
              {isUpdatingPassword ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating…
                </span>
              ) : "Update Password"}
            </button>
          </form>
        </SectionCard>
      </div>

      {/* ── Right Panel: Admin Settings ─────────────────────────────────────── */}
      {isAdmin && (
        <div className="w-1/2 overflow-y-auto">
          <Settings />
        </div>
      )}
    </div>
  );
};

export default AccountPage;