import Container from "components/Container";
import RecipePreview from "components/RecipePreview";
import {
  COLLECTION_NAMES,
  deleteSingleFirestoreDoc,
  simpleQuery,
} from "lib/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "./Button";
import Loader from "./Loader";

const IdContainer = ({ name, recipes, id = null }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  if (!name || loading)
    return (
      <Container>
        <Loader />
      </Container>
    );

  const deleteList = async () => {
    if (typeof window === "undefined") return;
    const deleteConf = confirm(
      "do you want to delete this list? this cannot be undone"
    );
    if (!deleteConf) return;
    setLoading(true);
    //delete list
    await deleteSingleFirestoreDoc(COLLECTION_NAMES.LIST_DATA, id);
    //get all recipe lists that the list is in
    const recipeLists = await simpleQuery(
      "list_id",
      id,
      COLLECTION_NAMES.RECIPE_LISTS
    );
    //delete the list from all of those recipelists
    recipeLists?.forEach(async (recipeList) => {
      await deleteSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        recipeList.id
      );
    });

    setLoading(false);
    router.push("/dashboard");
  };
  return (
    <Container className="w-full">
      <h1>{name}</h1>
      {id && <Button onClick={deleteList}>Delete List</Button>}
      <div className="w-full grid-cols-4 grid grow">
        {recipes &&
          recipes.map((recipe) => (
            <RecipePreview key={recipe.id} recipe={recipe} listId={id} />
          ))}
      </div>
    </Container>
  );
};

export default IdContainer;
