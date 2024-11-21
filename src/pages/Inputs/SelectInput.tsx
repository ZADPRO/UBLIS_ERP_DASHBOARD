import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isInvalid?: boolean; 
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  name,
  label,
  options = [],
  required = false,
  disabled = false,
  value,
  onChange,
  isInvalid = false,
}) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        required={required}
        className={`relative w-full h-10 px-3 transition-all bg-[#fff] border-2 rounded outline-none appearance-none peer border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white focus:border-[#ff5001] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          isInvalid ? "border-pink-500 text-pink-500" : ""
        }`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="" disabled>
          {/* Placeholder for empty option */}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={`pointer-events-none bg-[#fff] capitalize absolute left-2 z-[1] -top-2 px-2 text-[14px] text-[#ff5001] transition-all before:absolute before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all ${
          isInvalid ? "text-pink-500" : "peer-focus:text-[#ff5001]"
        } peer-required:after:text-[#000000] peer-valid:text-[14px] peer-focus:text-[14px] peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-white`}
      >
        {label}
      </label>
    </div>
  );
};

export default SelectInput;
