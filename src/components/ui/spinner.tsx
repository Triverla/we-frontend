export const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin border-t-2 border-blue-500 border-solid w-12 h-12 rounded-full"></div>
  </div>
);

// Add this new component for button spinners
export const ButtonSpinner = () => (
  <div className="inline-flex justify-center items-center">
    <div className="animate-spin border-t-2 border-white border-solid w-4 h-4 rounded-full"></div>
  </div>
);
