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
    <Container>
      <div className="w-full flex flex-col grow">
        <div className="flex justify-center items-center flex-col w-full">
          <h1>{name}</h1>
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

export default IdContainer;
