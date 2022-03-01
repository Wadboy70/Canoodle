import getRecipe from "lib/getRecipe";
import styles from "styles/Edit.module.css";

const Edit = ({ recipe }) => {
  if (!recipe) {
    return (
      <div className={styles.main}>
        <p>This recipe cannot be found :(</p>
      </div>
    );
  }
  const parsedRecipe = JSON.parse(recipe);
  return (
    <div className={styles.main}>
      <div>
        <h1>Instructions</h1>
        <ol>
          {parsedRecipe.instructions.map((instruction, i) => (
            <li key={i}>{instruction.text}</li>
          ))}
        </ol>
        <h1>Ingredients</h1>
        <ul>
          {parsedRecipe.ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Edit;

export async function getServerSideProps(context) {
  const recipes = await getRecipe(context.query.url);

  if (!recipes) return { props: {} };

  return {
    props: { recipe: JSON.stringify(recipes) },
  };
}
