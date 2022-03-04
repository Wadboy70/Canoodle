import styles from "styles/Button.module.css";

const Button = ({ children, className, ...otherClasses }) => (
  <button
    className={`${styles.button} ${className ? className : ""}`}
    // onClick={onClick}
    {...otherClasses}
  >
    {children}
  </button>
);

export default Button;
