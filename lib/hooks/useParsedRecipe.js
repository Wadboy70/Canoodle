import { useAuth } from "lib/AuthUserContext";
import {
  addUnsortedRecipe,
  checkForSimilarRecipe,
  COLLECTION_NAMES,
  simpleQuery,
} from "lib/firestore";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const useParsedRecipe = (recipe) => {
  const [parsedRecipe, setParsedRecipe] = useState(
    recipe ? JSON.parse(recipe) : null
  );
  const [ingredientList, setIngredientList] = useState(
    parsedRecipe.ingredients
  );
  const [instructionList, setInstructionList] = useState(
    parsedRecipe.instructions
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { authUser } = useAuth();

  useEffect(() => {
    if (JSON.stringify(parsedRecipe) !== recipe) {
      const recipeJSON = recipe ? JSON.parse(recipe) : null;
      setParsedRecipe(recipeJSON);
      setIngredientList(recipeJSON?.ingredients);
      setIngredientList(recipeJSON?.instructions);
    }
  }, [recipe]);

  const saveRecipe = async () => {
    if (loading) return;
    setLoading(true);
    if (!authUser) {
      if (typeof window !== "undefined") alert("log in to save recipes!");
      setLoading(false);
      return;
    }

    //add a new recipe and check for a recipe with the same url
    const recipeExists = await checkForSimilarRecipe(
      parsedRecipe.recipeURL,
      authUser.uid
    );
    //if recipe exists prompt user, else save that boi, stop loading and redirect
    if (!recipeExists) {
      //save recipe
      const recipeCount = (
        await simpleQuery("uid", authUser.uid, COLLECTION_NAMES.RECIPE_DATA)
      )?.length;

      if (recipeCount > 9) {
        alert("upgrade your account to add more recipes!");
        setLoading(false);
        return;
      } else {
        await addUnsortedRecipe({
          ...parsedRecipe,
          uid: authUser.uid,
        });
      }
      setLoading(false);
      router.push("/dashboard");
      return;
    }
    //if confirm continue, else return
    const conf = confirm(
      "You saved a recipe from this URL already! Save again?"
    );
    if (!conf) {
      setLoading(false);
      return;
    }
    await addUnsortedRecipe({
      ...parsedRecipe,
      uid: authUser.uid,
    });
    setLoading(false);
    router.push("/dashboard");
  };

  const editInstructionState = ({ id, name }) => {
    const foundIndex = instructionList.findIndex(
      (instruction) => instruction.id === id
    );
    const editedInstruction = {
      ...instructionList[foundIndex],
      name: name,
    };
    setInstructionList(
      instructionList.map((val) => (val.id === id ? editedInstruction : val))
    );
  };

  return {
    parsedRecipe,
    setParsedRecipe,
    loading,
    saveRecipe,
    ingredientList,
    instructionList,
    editInstructionState,
  };
};

export default useParsedRecipe;
