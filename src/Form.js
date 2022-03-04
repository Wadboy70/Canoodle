import styles from "styles/Form.module.css";
const Form = ({ children, className, onSubmit = () => {}, ...props }) => (
  <form
    className={`${styles.form} ${className ? className : ""}`}
    {...props}
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit(e);
    }}
  >
    {children}
  </form>
);

export default Form;
