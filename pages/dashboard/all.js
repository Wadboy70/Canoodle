import Container from "components/Container";
import IdContainer from "components/IdContainer";
import Loader from "components/Loader";
import { useAuth } from "lib/AuthUserContext";
import { COLLECTION_NAMES, simpleQuery } from "lib/firestore";
import { useEffect, useState } from "react";

const AllRecipes = () => {
  const { authUser, loading } = useAuth();
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    const getRecipeData = async () => {
      const data = await simpleQuery(
        "uid",
        authUser.uid,
        COLLECTION_NAMES.RECIPE_DATA
      );
      setRecipes(data);
    };
    if (recipes === null && !loading) getRecipeData();
  }, [loading]);

  if (loading || !recipes)
    return (
      <Container>
        <Loader />
      </Container>
    );

  return <IdContainer name={"All Recipes"} recipes={recipes} />;
};

export default AllRecipes;
