import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Button from "src/Button";
import Form from "src/Form";
import InputWithLabel from "src/InputWithLabel";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { isValidHttpUrl } from "lib/helperFunctions";
import getRecipe from "lib/getRecipe";

const Home = () => {
  const [currentRecipe, setCurrentRecipe] = useState("");
  const router = useRouter();
  return (
    <main className={styles.main}>
      <Form>
        <InputWithLabel
          type="text"
          value={currentRecipe}
          onChange={(event) => setCurrentRecipe(event.target.value)}
          name="site"
          id="recipeSiteValue"
          placeholder="Website URL"
          label="Recipe Site URL"
        />
        <Button
          onClick={async (e) => {
            e.preventDefault();
            if (typeof window !== "undefined") {
              if (!isValidHttpUrl(currentRecipe)) {
                alert("Invalid URL :(");
                return;
              }
              router.push(`/edit?url=${encodeURI(currentRecipe)}`);
            }
          }}
        >
          Submit
        </Button>
      </Form>
    </main>
  );
};

export default Home;
