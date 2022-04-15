const Container = ({
  children,
  bgImage = false,
  row = false,
  className = "",
}) => (
  <div
    className={`grow p-10 flex justify-center items-center ${
      bgImage ? "bg-spices" : "bg-amber-50"
    } bg-cover ${className} ${row ? "flex-row" : "flex-col"}`}
  >
    {children}
  </div>
);

export default Container;
