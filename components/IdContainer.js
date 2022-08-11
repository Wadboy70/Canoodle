import Container from "components/Container";
import RecipePreview from "components/RecipePreview";
import Loader from "./Loader";

const IdContainer = ({ name, recipes, id = null }) => {
  if (!name)
    return (
      <Container>
        <Loader />
      </Container>
    );
  return (
    <Container className="w-full">
      <h1>{name}</h1>
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
