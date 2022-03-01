import styles from "styles/InputWithLabel.module.css";
const InputWithLabel = ({
  type,
  name,
  value,
  onChange,
  id,
  placeholder,
  label,
}) => (
  <div className={styles.inputContainer}>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      id={id}
      placeholder={placeholder}
    />
  </div>
);

export default InputWithLabel;
