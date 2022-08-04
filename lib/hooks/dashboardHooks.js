import {
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  getSingleRecipe,
  simpleQuery,
} from "lib/firestore";
import { useEffect, useState } from "react";

export const useListData = (id) => {
  const [listName, setListName] = useState(undefined);
  useEffect(() => {
    const getListData = async () => {
      const data = await getSingleFirestoreDoc(COLLECTION_NAMES.LIST_DATA, id);
      if (!data) setListName(null);
      setListName(data.name);
    };

    if (listName === undefined) {
      getListData();
    }
  });
  return { name: listName };
};

export const useRecipeData = (id) => {
  //get recipes hook
  const [recipes, setRecipes] = useState(null);
  useEffect(() => {
    const getRecipes = async () => {
      //get all connectors
      const recipesInList = await simpleQuery(
        "list_id",
        id,
        COLLECTION_NAMES.RECIPE_LISTS
      );
      if (!recipesInList) {
        //setError "cant load recipes"
        setRecipes([]);
        return;
      }
      //get all recipes from connectors
      const allRecipes = await Promise.all(
        recipesInList.map(
          async (recipeInList) => await getSingleRecipe(recipeInList.recipe_id)
        )
      );

      if (!allRecipes) {
        //setError "cant load recipes"
        setRecipes([]);
        return;
      }
      //get all
      //save Recipes in setrecipes
      setRecipes(allRecipes);
    };

    if (!recipes) {
      getRecipes();
    }
  });

  return { recipes };
};
