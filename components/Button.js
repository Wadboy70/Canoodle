const Button = ({
  children,
  className,
  squared = false,
  gray = false,
  shadow = false,
  customColor = false,
  ...otherClasses
}) => (
  <button
    className={`flex items-center py-2 px-4 mx-0.5 text-white hover:cursor-pointer whitespace-nowrap ${
      squared ? "rounded-md" : "rounded-full"
    } ${
      customColor
        ? "text-slate-900"
        : gray
        ? "bg-slate-200 text-slate-900"
        : "bg-orange-400"
    } ${shadow ? "shadow-md" : ""} ${className ? className : ""} `}
    {...otherClasses}
  >
    {children}
  </button>
);

export default Button;
