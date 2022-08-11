import React, { createContext, useState, useEffect } from "react";

export const SelectContext = createContext({});

export const SelectProvider = ({ children }) => {
  const [select, setSelect] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentDrag, setCurrentDrag] = useState({
    homeRecipe: null,
    homeList: null,
    destinationList: null,
  });

  useEffect(() => {
    if (select.length) {
      setSelect([]);
    }
  }, [editMode]);
  return (
    <SelectContext.Provider
      value={{
        select,
        setSelect,
        editMode,
        setEditMode,
        currentDrag,
        setCurrentDrag,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
};
