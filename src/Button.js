import styles from "styles/Button.module.css";

const Button = ({ onClick, children, className, ...otherClasses }) => (
  <button
    className={`${styles.button} ${className}`}
    onClick={onClick}
    {...otherClasses}
  >
    {children}
  </button>
);

export default Button;
