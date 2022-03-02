import styles from "styles/Form.module.css";
const Form = ({ children, className, ...props }) => (
  <form
    className={className + " " + styles.form}
    {...props}
    onSubmit={(e) => {
      e.preventDefault();
    }}
  >
    {children}
  </form>
);

export default Form;
