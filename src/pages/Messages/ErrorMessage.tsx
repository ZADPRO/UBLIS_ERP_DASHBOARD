import React from "react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="py-2 text-center bg-[#ED5555] text-[#fff] rounded transition-all duration-300">
      {message}
    </div>
  );
};

export default ErrorMessage;
