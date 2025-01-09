import React, { useState } from "react";

interface PasswordInputProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id = "password",
  name = "password",
  label = "Your password",
  value = "",
  placeholder = "Enter your password",
  onChange,
  disabled = false,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="peer relative h-10 w-full rounded border-2 border-[#b3b4b6] px-3 pr-12 text-[#4c4c4e] placeholder-transparent outline-none transition-all autofill:bg-white  focus:border-[#ff5001] focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        minLength={8}
      />
      <label
        htmlFor={id}
        className="absolute left-2 -top-2 bg-white z-[1] cursor-text px-2 text-[14px] text-[#ff5001] transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:text-[14px]  peer-required:after:content-['\00a0*']  peer-focus:cursor-default peer-focus:text-[14px] peer-focus:text-[#ff5001]  peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
      >
        {label}
      </label>

      {showPassword ? (
        <svg
          onClick={() => setShowPassword(!showPassword)}
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-2.5 right-[10px]  h-[20px] w-[20px] cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          role="button"
        >
          <title>Hide Password</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ) : (
        <svg
          onClick={() => setShowPassword(!showPassword)}
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-2.5 right-[10px] h-[20px] w-[20px] cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          role="button"
        >
          <title>Show Password</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      )}
    </div>
  );
};

export default PasswordInput;
