export const Avatar = ({ name, role }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-xl font-bold text-white tracking-wide">{initials}</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-font-light leading-tight">{name ?? "Unknown"}</p>
        <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-font-light">
          {role === "Admin" ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.243a1 1 0 11-1.94-.486L10.47 14H7.53l-.56 2.243a1 1 0 11-1.94-.486L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
          {role ?? "User"}
        </span>
      </div>
    </div>
  );
};
