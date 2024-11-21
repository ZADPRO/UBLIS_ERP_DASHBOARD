import React from "react";

interface UsernameInputProps {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  readonly?: boolean;
}

const UsernameInput: React.FC<UsernameInputProps> = ({
  id,
  name,
  type = "text",
  placeholder = "Enter value", // Default placeholder
  label = "Label", // Default label
  required = false,
  disabled = false,
  value,
  onChange,
  isInvalid = false,
  readonly = false,
}) => {
  console.log(isInvalid);

  return (
    <div className="relative">
      {/* Input Field */}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        readOnly={readonly}
        className={`relative w-full h-10 px-3 placeholder-transparent transition-all border-2 rounded outline-none focus-visible:outline-none peer border-[#b3b4b6] text-[#4c4c4e] autofill:bg-white focus:border-[#ff5001] 
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
      />

      {/* Label */}
      <label
        htmlFor={id}
        className={`cursor-text peer-focus:cursor-default -top-2.5 absolute left-2 z-[1] px-2 text-[14px] text-[#ff5001] transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-focus:-top-2.5 peer-focus:text-[14px] peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-white`}
      >
        {label}
      </label>

      {(isInvalid || !isInvalid) && value.length === 0 ? (
        <i className="absolute top-[10px] right-[10px] h-6 w-5 cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed text-[20px] text-[#94a3b8] fa-regular fa-circle-check"></i>
      ) : isInvalid ? (
        <i className="absolute top-[10px] right-[10px] h-6 w-5 cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed text-[20px] text-[green] fa-regular fa-circle-check"></i>
      ) : (
        <i className="absolute top-[10px] right-[10px] h-6 w-5 cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed text-[20px] text-[red] fa-regular fa-circle-xmark"></i>
      )}
    </div>
  );
};

export default UsernameInput;
