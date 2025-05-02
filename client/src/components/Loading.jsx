const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping delay-200"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping delay-400"></div>
      </div>
    </div>
  );
};

export default Loading;