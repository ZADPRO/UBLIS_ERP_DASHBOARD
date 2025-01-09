import React from "react";

interface RadiobuttonInputProps {
  id: string;
  value?: string;
  name: string;
  selectedOption?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  label: string;
  readonly?: boolean; // Add readonly prop
}

const RadiobuttonInput: React.FC<RadiobuttonInputProps> = ({
  id,
  value,
  name,
  selectedOption = "no",
  onChange,
  required = false,
  label,
  readonly = false, // Default readonly value
}) => {
  // Handle onChange, prevent if readonly is true
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!readonly && onChange) {
      onChange(event); // Only trigger onChange if not readonly
    }
  };

  return (
    <div className="relative flex">
      <input
        style={{ display: "block" }}
        className="transition-colors h-[20px] w-[20px] rounded-full border-3 border-[#b3b4b6] appearance-none cursor-pointer peer bg-white checked:border-[#ff5001] checked:bg-emerald-500 checked:hover:border-[#ff5001] checked:hover:bg-[#ff5001] focus:outline-none checked:focus:border-[#ff5001] checked:focus:bg-[#ff5001] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50"
        type="radio"
        id={id}
        value={value}
        name={name}
        checked={selectedOption === value}
        onChange={handleChange} // Use custom handleChange
        required={required}
      />
      <label
        className="pl-2 text-[1rem] lg:text-[18px] mt-1 cursor-pointer text-[#4d4f53] font-semibold peer-disabled:cursor-not-allowed peer-disabled:text-slate-400"
        htmlFor={id}
      >
        {label}
      </label>
      <svg
        className="absolute left-0 w-[20px] h-[20px] transition-all duration-300 scale-50 opacity-0 pointer-events-none fill-white peer-checked:scale-100 peer-checked:opacity-100 peer-disabled:cursor-not-allowed"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`title-${id} description-${id}`}
        role="graphics-symbol"
      >
        <title id={`title-${id}`}>Circle Shape</title>
        <desc id={`description-${id}`}>
          Circle shape to indicate whether the radio input is checked or not.
        </desc>
        <circle cx="8" cy="8" r="4" />
      </svg>
    </div>
  );
};

export default RadiobuttonInput;
