import styles from "styles/Loader.module.css";

const Loader = () => (
  <div className={`${styles["lds-ellipsis"]} self-center`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

export default Loader;
