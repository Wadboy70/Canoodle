import styles from "styles/InputWithLabel.module.css";
const InputWithLabel = ({
  type,
  name,
  value,
  onChange,
  id,
  placeholder,
  label,
  className,
  ...otherClasses
}) => (
  <div className={`${styles.inputContainer} ${className ? className : ""}`}>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      id={id}
      placeholder={placeholder}
      {...otherClasses}
    />
  </div>
);

export default InputWithLabel;
