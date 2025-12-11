import { useNavigate } from "react-router-dom";

const NoPermissionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center w-full">
      <span className="font-black text-9xl text-yellow-500">403</span>
      <span className="font-bold text-5xl">Access Denied</span>

      <p className="text-gray-700 my-2">
        You do not have permission to view this page.
      </p>

      <a
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md text-white mt-2"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
      >
        Go Back
      </a>
    </div>
  );
};

export default NoPermissionPage;
