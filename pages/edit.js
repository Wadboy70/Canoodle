import getRecipe from "lib/getRecipe";
import { useEffect } from "react";
import Button from "components/Button";
import styles from "styles/Edit.module.css";
import Image from "next/image";
import Container from "components/Container";
import useParsedRecipe from "lib/hooks/useParsedRecipe";
import useEditRecipe from "lib/hooks/useEditRecipe";
import {
  RenderIngredients,
  RenderInstructions,
} from "components/RecipeRendering";

const drillAndReplace = (obj, arr, rep) => {
  if (!arr.length) return rep;
  return Array.isArray(obj)
    ? replaceAt(obj, arr[0], drillAndReplace(obj[arr[0]], arr.slice(1), rep))
    : {
        ...obj,
        [arr[0]]: drillAndReplace(obj[arr[0]], arr.slice(1), rep),
      };
};

export const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

const Edit = ({ recipe }) => {
  const {
    parsedRecipe,
    ingredientList,
    instructionList,
    loading,
    saveRecipe,
    editInstructionState,
  } = useParsedRecipe(recipe);
  const { editMode, EditContainer, toggleEditMode } = useEditRecipe();
  if (!parsedRecipe) {
    return (
      <div className={styles.main}>
        <p>This recipe cannot be found :(</p>
      </div>
    );
  }

  return (
    <Container className="pt-0">
      <EditContainer className="bg-white h-full p-8 rounded-xl w-full">
        <h1 className="w-full text-center">Result</h1>
        <div className="flex flex-row justify-between">
          <Button onClick={saveRecipe} squared gray>
            <Image src="/heart.svg" width="20" height="20" alt="heart Logo" />
            <span className="ml-1">Save Recipe</span>
          </Button>
          <Button onClick={toggleEditMode} squared gray>
            <Image src="/edit.svg" width="20" height="20" alt="edit Logo" />
            <span className="ml-1">
              {editMode ? "Exit Edit Mode" : "Edit Recipe"}
            </span>
          </Button>
        </div>
        <div
          className="w-full h-40 bg-cover bg-center mt-4 rounded-xl"
          style={{
            backgroundImage: `url(${
              typeof parsedRecipe.image === "string"
                ? parsedRecipe.image
                : Array.isArray(parsedRecipe.image)
                ? typeof parsedRecipe?.image?.[0] === "string"
                  ? parsedRecipe?.image?.[0]
                  : parsedRecipe?.image?.[0].url
                : parsedRecipe.image.url
            })`,
          }}
        ></div>
        {loading && <p>loading...</p>}
        <h2>Ingredients</h2>
        <RenderIngredients ingredients={ingredientList} editMode={editMode} />
        <h2>Instructions</h2>
        <RenderInstructions
          instructions={instructionList}
          top
          editMode={editMode}
          onChangeInstruction={editInstructionState}
        />
      </EditContainer>
    </Container>
  );
};

export default Edit;

export async function getServerSideProps(context) {
  const recipes = await getRecipe(context.query.url);

  if (!recipes) return { props: {} };

  return {
    props: {
      recipe: JSON.stringify({ ...recipes, recipeURL: context.query.url }),
    },
  };
}
