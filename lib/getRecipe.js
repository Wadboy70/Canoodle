import WAE from "web-auto-extractor";

const getRecipe = async (url) => {
  const html = await fetch(url, { mode: "cors" }).then((x) => x.text());

  const wae = WAE().parse(html);

  if (wae.jsonld.Recipe && wae.jsonld.Recipe.length) {
    const recipe = wae.jsonld.Recipe[0];
    return {
      name: recipe.name || "recipe",
      image: recipe.image || "",
      ingredients: recipe.recipeIngredient || [],
      instructions: recipe.recipeInstructions || [],
    };
  } else if (
    wae.jsonld["undefined"]?.["@graph"] &&
    wae.jsonld["undefined"]?.["@graph"].find((val) => val["@type"] === "Recipe")
  ) {
    const recipe = wae.jsonld["undefined"][0];
    return {
      name: recipe.name || "recipe",
      image: recipe.image || "",
      ingredients: recipe.recipeIngredient || [],
      instructions: recipe.recipeInstructions || [],
    };
  }

  return null;
};

export default getRecipe;
