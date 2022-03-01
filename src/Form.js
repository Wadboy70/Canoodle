import styles from "styles/Form.module.css";
const Form = ({ children, className, ...props }) => (
  <form className={className + " " + styles.form} {...props}>
    {children}
  </form>
);

export default Form;
