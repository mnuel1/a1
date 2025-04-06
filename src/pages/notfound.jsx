const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center w-full">
      <span className="font-black text-9xl text-red-600">404</span>
      <span className="font-bold text-5xl">Not found</span>
      <p className="text-gray-700 my-2">Page doesn't exist. Please go back.</p>
      <a
       className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-md text-white"
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
      >
        Go Back
      </a>
    </div>
  );
};

export default NotFound;
