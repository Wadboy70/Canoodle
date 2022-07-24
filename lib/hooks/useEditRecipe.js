import { useState } from "react";
import Form from "components/Form";

const useEditRecipe = () => {
  const [editMode, setEditMode] = useState(false);
  const EditContainer = editMode
    ? Form
    : ({ children, ...props }) => <div {...props}>{children}</div>;

  const toggleEditMode = () => setEditMode(!editMode);

  return { editMode, EditContainer, toggleEditMode };
};

export default useEditRecipe;
