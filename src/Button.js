import styles from "styles/Button.module.css";

const Button = ({ onClick, children, ...otherClasses }) => (
  <button className={styles.button} onClick={onClick} {...otherClasses}>
    {children}
  </button>
);

export default Button;
