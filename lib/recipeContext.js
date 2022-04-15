import React, { createContext, useState } from "react";

export const RecipeContext = createContext({});

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState({});
  const [hydrateRecipes, setHydrateRecipes] = useState(0);
  return (
    <RecipeContext.Provider
      value={{ recipes, setRecipes, hydrateRecipes, setHydrateRecipes }}
    >
      {children}
    </RecipeContext.Provider>
  );
};
