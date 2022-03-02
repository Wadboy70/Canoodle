import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  updateFirestoreDoc,
} from "lib/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "src/Button";
import Form from "src/Form";
import InputWithLabel from "src/InputWithLabel";
import styles from "styles/Dashboard.module.css";

const Dashboard = () => {
  const router = useRouter();
  const { authUser } = useAuth();
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState(null);

  useEffect(() => {
    if (authUser === "null") router.push("/");
  }, [authUser, router]);
  useEffect(() => {
    const populateGallery = async () => {
      const list = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );
      if (!list || list.error) setGallery([]);
      const lists = Object.keys(list);
      const dbLists = (
        await Promise.all(
          lists
            .map(async (i) => {
              if (!(typeof list[i] === "object")) return;
              const recps = await Promise.all(
                list[i]?.list?.map(async (id) => {
                  const data = await getSingleFirestoreDoc(
                    COLLECTION_NAMES.RECIPE_DATA,
                    id
                  );
                  console.log(data, "data");
                  return data && !data.error ? { ...data, id } : null;
                })
              );
              console.log(recps, "recps");
              const fin = {
                listName: list[i]?.name,
                recipes: recps || [],
              };
              return fin;
            })
            .filter((val) => !!val)
        )
      ).filter((val) => !!val);
      setGallery(dbLists);
    };
    if (gallery === null && authUser) populateGallery();
    console.log(gallery, authUser);
  }, [gallery]);
  return (
    <div className={styles.main}>
      <h1>Dashboard</h1>
      <Form>
        {loading && <p>loading...</p>}
        <InputWithLabel
          type={"text"}
          name="listname"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          label="Make a New List"
          placeholder={"New List Name"}
        />
        <Button
          onClick={async () => {
            setLoading(true);
            if (
              (listName.replace(/\s+/g, "") === "" || listName == "error") &&
              typeof window !== "undefined"
            ) {
              alert("invalid list name");
              setLoading(false);
              return;
            }
            const lists = await getSingleFirestoreDoc(
              COLLECTION_NAMES.RECIPE_LISTS,
              authUser.uid
            );

            if (
              (!lists ||
                lists.error ||
                Object.keys(lists).find(
                  (val) => lists[val]?.name == listName
                )) &&
              typeof window !== "undefined"
            ) {
              alert("cannot add list, check to see if it already exists");
              setLoading(false);
              return;
            }

            await updateFirestoreDoc(
              {
                [listName.replace(/\s+/g, "")]: {
                  list: [],
                  name: listName,
                },
              },
              COLLECTION_NAMES.RECIPE_LISTS,
              authUser.uid
            );
            setGallery(null);
            setLoading(false);
          }}
        >
          Submit
        </Button>
      </Form>
      <div className={styles.gallery}>
        {gallery &&
          gallery.map((list, i) => (
            <div key={list.listName} className={styles.row}>
              <h2>{list.listName && list.listName}</h2>
              <div className={styles.rowContainer}>
                {list.recipes.map((recipe) => (
                  <Link key={recipe.name} href={`/view/${recipe.id}`}>
                    <a className={styles.recipe}>
                      <h3>{recipe.name}</h3>
                      {recipe.image && <img src={recipe.image} />}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
