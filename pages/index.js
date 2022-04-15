import { useState } from "react";
import Button from "components/Button";
import Form from "components/Form";
import InputWithLabel from "components/InputWithLabel";
import { useRouter } from "next/router";
import { isValidHttpUrl } from "lib/helperFunctions";
import Container from "components/Container";

export const submitRecipe = async (router, url) => {
  if (typeof window !== "undefined") {
    if (!isValidHttpUrl(url)) {
      alert("Invalid URL :(");
      return;
    }
    if (window.location.pathname == "/edit") {
      router.push(`/edit?url=${encodeURI(url)}`, undefined, { shallow: false });
      return;
    }
    router.push(`/edit?url=${encodeURI(url)}`);
  }
};

const Home = () => {
  const [currentRecipe, setCurrentRecipe] = useState("");
  const router = useRouter();
  return (
    <Container bgImage>
      <Form className="min-w-3/5 flex flex-col items-center py-32">
        <h1 className="font-bold text-3xl mb-4">Explore Recipes</h1>
        <InputWithLabel
          type="text"
          value={currentRecipe}
          onChange={(event) => setCurrentRecipe(event.target.value)}
          name="site"
          id="recipeSiteValue"
          placeholder="https://www.food.com/morefood"
          className="w-96 mb-4"
        />
        <Button
          onClick={async (e) => {
            e.preventDefault();
            await submitRecipe(router, currentRecipe);
          }}
        >
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default Home;
