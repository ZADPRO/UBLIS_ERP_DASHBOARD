import React from "react";

interface TextInputProps {
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  readonly?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  type,
  placeholder,
  label,
  required = false,
  disabled = false,
  value,
  onChange,
  isInvalid = false,
  readonly = false,
}) => {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        className={`relative w-full h-10 px-3 placeholder-transparent transition-all border-2 rounded outline-none focus-visible:outline-none peer border-[#b3b4b6] text-[#4c4c4e] bg-[#fff] autofill:bg-white ${
          isInvalid
            ? "invalid:border-pink-500 invalid:text-pink-500 focus:invalid:border-pink-500"
            : "focus:border-[#ff5001]"
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        readOnly={readonly}
      />
      <label
        htmlFor={id}
        className={`cursor-text peer-focus:cursor-default -top-2 absolute left-2 z-[1] px-2 text-[14px] text-[#ff5001] transition-all before:absolute before:top-0 before:left-0 before:z-[-1] bg-[#fff] before:block before:h-full before:w-full before:bg-white before:transition-all ${
          isInvalid ? "peer-invalid:text-pink-500" : "peer-focus:text-[#ff5001]"
        } peer-placeholder-shown:text-bold ${required ? "peer-required:after:content-[]" : ""
        } peer-focus:-top-2 peer-focus:text-[14px] peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-slate-50`}
      >
        {label}
      </label>
    </div>
  );
};

export default TextInput;
