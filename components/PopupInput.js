import Button from "./Button";
import Form from "./Form";
import { useState } from "react";

export const PopupOverlayAndForm = ({ hidePopup, onSubmit, children }) => (
  <div
    className="fixed top-0 left-0 w-screen h-screen bg-black/30 backdrop-blur-sm flex items-center justify-center"
    onClick={hidePopup}
  >
    <Form onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
      {children}
    </Form>
  </div>
);

const PopupInput = ({
  onSubmit = () => {},
  placeholder = "Input Text",
  name = "Add New Value",
  setShowPopup,
}) => {
  const [listName, setListName] = useState(null);
  return (
    <PopupOverlayAndForm
      hidePopup={() => setShowPopup(false)}
      onSubmit={() => onSubmit(listName, setListName)}
    >
      <h1 className="mt-0">{name}</h1>
      <input
        type="text"
        className="mr-4 bg-transparent outline-0 font-bold w-full bg-black/5 rounded-md p-2 mb-2"
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setListName(e.target.value)}
      />
      <Button className="leading-none">Submit</Button>
    </PopupOverlayAndForm>
  );
};

export default PopupInput;
