const InputWithLabel = ({
  type,
  name,
  value,
  onChange,
  id,
  placeholder,
  label,
  className = "",
  ...otherClasses
}) => (
  <div className={className}>
    {label && <label>{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      id={id}
      placeholder={placeholder}
      className={`p-1 rounded-full my-1 flex rounded-md text-center shadow-lg px-5 py-2 w-full focus:outline-0`}
      {...otherClasses}
    />
  </div>
);

export default InputWithLabel;
