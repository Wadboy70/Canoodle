import { useAuth } from "lib/AuthUserContext";
import { addUnsortedRecipe, checkForUserListOrCreate } from "lib/firestore";
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

  useEffect(() => {
    console.log(instructionList);
  }, [instructionList]);

  const saveRecipe = async () => {
    if (loading) return;
    setLoading(true);
    if (!authUser) {
      if (typeof window !== "undefined") alert("log in to save recipes!");
      setLoading(false);
      return;
    }
    const userListSuccess = await checkForUserListOrCreate(authUser.uid);
    const addNew = await addUnsortedRecipe(authUser.uid, parsedRecipe);
    if (!addNew || !userListSuccess) {
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  const editInstructionState = ({ id, level, name }) => {
    const foundIndex = instructionList.findIndex(
      (instruction) => instruction.id === id
    );
    const editedInstruction = {
      ...instructionList[foundIndex],
      level: level,
      name: name,
    };
    const instructionsToEdit = instructionList;
    instructionsToEdit.splice(foundIndex, 1, editedInstruction);
    setInstructionList(instructionsToEdit);
    //instructions not updating? hmmm
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
