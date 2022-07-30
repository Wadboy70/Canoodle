import Container from "components/Container";
import RecipePreview from "components/RecipePreview";
import {
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  getSingleRecipe,
  simpleQuery,
} from "lib/firestore";
import { useEffect, useState } from "react";

const useListData = (id) => {
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

const useRecipeData = (id) => {
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

const ID = ({ id }) => {
  const { name } = useListData(id);
  const { recipes } = useRecipeData(id);

  return (
    <Container>
      <div className="w-full flex flex-col grow">
        <div className="flex justify-center items-center flex-col w-full">
          <h1>{name ? name : "List could not be found"}</h1>
          <div className="w-full flex flex-col grow">
            {recipes &&
              recipes.map((recipe) => (
                <RecipePreview key={recipe.id} recipe={recipe} listId={id} />
              ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ID;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
