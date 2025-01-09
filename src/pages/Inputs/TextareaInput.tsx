import React from "react";

interface TextareaInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isInvalid?: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  name,
  label,
  placeholder,
  rows = 2,
  required = false,
  disabled = false,
  value,
  onChange,
  isInvalid = false,
}) => {
  return (
    <div className="relative w-full">
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`relative w-full p-3 placeholder-transparent transition-all border-2 rounded outline-none focus-visible:outline-none peer border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white ${
          isInvalid
            ? "invalid:border-pink-500 invalid:text-pink-500 focus:invalid:border-pink-500"
            : "focus:border-[#ff5001]"
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
      ></textarea>
      <label
        htmlFor={id}
        className={`cursor-text peer-focus:cursor-default absolute left-2 -top-2.5 z-[1] px-2 text-[14px] text-[#4c4c4e] transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all ${
          isInvalid ? "peer-invalid:text-pink-500" : "peer-focus:text-[#ff5001]"
        } peer-placeholder-shown:text-[14px] ${
          required ? "peer-required:after:content-[]" : ""
        } peer-focus:-top-2.5 peer-focus:text-[14px] peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent`}
      >
        {label}
      </label>
    </div>
  );
};

export default TextareaInput;
