export default function InputComponent({
    label,
    placeholder,
    onChange,
    value,
    type,
  }) {
    return (
      <div className="relative">
        <p className=" pt-0 pr-2 pb-0 pl-2 absolute -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600 bg-white">
          {label}
        </p>
        <input
          placeholder={placeholder}
          type={type || "text"}
          value={value}
          onChange={onChange}
          className='mt-2 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-base text-gray-900 shadow-sm sm:leading-6'
        />
      </div>
    );
  }