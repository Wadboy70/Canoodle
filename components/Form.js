const Form = ({ children, className = "", onSubmit = () => {}, ...props }) => (
  <form
    className={`bg-white/90 py-10 px-8 ${className}`}
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
