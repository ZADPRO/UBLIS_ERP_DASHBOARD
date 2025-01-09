import React from "react";

interface CheckboxInputProps {
  checked?: boolean;
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean; // New readonly prop
  id: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  checked,
  label,
  onChange,
  required = false,
  disabled = false,
  readonly = false, // Default readonly value
  id,
}) => {
  // Handle onChange, prevent if readonly is true
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!readonly && onChange) {
      onChange(event); // Only call onChange if not readonly
    }
  };

  return (
    <div className="flex w-full items-center mb-3">
      <input
        className="peer h-[20px] w-[20px] cursor-pointer appearance-none rounded-full border-3 border-[#b3b4b6] bg-white transition-colors checked:border-[#ff5001] checked:bg-[#ff5001] checked:hover:border-[#ff5001] checked:hover:bg-[#ff5001] focus:outline-none checked:focus:border-[#ff5001] checked:focus:bg-[#ff5001] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50"
        type="checkbox"
        checked={checked}
        onChange={handleChange} // Use custom handleChange
        id={id}
        disabled={disabled}
        required={required}
      />
      <label
        className={`cursor-pointer w-full text-start text-[0.8rem] pl-2 text-slate-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 ${
          disabled ? "text-slate-400" : "text-[#4d4f53] font-semibold"
        }`}
        htmlFor={id}
      >
        {label}
      </label>
      <svg
        className="pointer-events-none absolute left-0 top-1 h-[20px] w-[20px] -rotate-90 fill-[#ff5001] stroke-[#ff5001] opacity-0 transition-all duration-300 peer-checked:rotate-0 peer-checked:opacity-100 peer-disabled:cursor-not-allowed"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        aria-labelledby="title-1 description-1"
        role="graphics-symbol"
      >
        <title id="title-1">Check mark icon</title>
        <desc id="description-1">
          Check mark icon to indicate whether the checkbox input is checked or
          not.
        </desc>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.8116 5.17568C12.9322 5.2882 13 5.44079 13 5.5999C13 5.759 12.9322 5.91159 12.8116 6.02412L7.66416 10.8243C7.5435 10.9368 7.37987 11 7.20925 11C7.03864 11 6.87501 10.9368 6.75435 10.8243L4.18062 8.42422C4.06341 8.31105 3.99856 8.15948 4.00002 8.00216C4.00149 7.84483 4.06916 7.69434 4.18846 7.58309C4.30775 7.47184 4.46913 7.40874 4.63784 7.40737C4.80655 7.406 4.96908 7.46648 5.09043 7.57578L7.20925 9.55167L11.9018 5.17568C12.0225 5.06319 12.1861 5 12.3567 5C12.5273 5 12.691 5.06319 12.8116 5.17568Z"
        />
      </svg>
    </div>
  );
};

export default CheckboxInput;
