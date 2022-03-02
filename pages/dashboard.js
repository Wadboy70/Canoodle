import { arrayRemove, arrayUnion } from "firebase/firestore";
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
  const [mouseLocation, setMouseLocation] = useState({
    left: 0,
    top: 0,
  });
  const [currentDrag, setCurrentDrag] = useState({
    homeRecipe: null,
    homeList: null,
    destinationList: null,
  });

  useEffect(() => {
    if (authUser === "null") router.push("/");
  }, [authUser, router]);
  const populateGallery = async () => {
    const list = await getSingleFirestoreDoc(
      COLLECTION_NAMES.RECIPE_LISTS,
      authUser.uid
    );
    if (!list || list.error) setGallery([]);
    const lists = Object.getOwnPropertyNames(list);
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
              id: i,
              date: list[i]?.date,
            };
            return fin;
          })
          .filter((val) => !!val)
      )
    )
      .filter((val) => !!val)
      .sort((a, b) => (a.id === "All_Recipes" ? 1 : a.date > b.date ? 1 : -1));
    console.log(dbLists, "LISTTSS");
    setGallery(dbLists);
  };
  useEffect(() => {
    if (gallery === null && authUser) populateGallery();
    console.log(gallery, authUser);
  }, [authUser]);
  useEffect(() => {
    console.log(currentDrag);
  }, [currentDrag]);

  const changeGrouping = async () => {
    if (
      (
        await updateFirestoreDoc(
          {
            [`${currentDrag.destinationList.id}.list`]: arrayUnion(
              currentDrag.homeRecipe.id
            ),
          },
          COLLECTION_NAMES.RECIPE_LISTS,
          authUser.uid
        )
      ).error
    )
      return false;
    else if (
      (
        await updateFirestoreDoc(
          {
            [`${currentDrag.homeList.id}.list`]: arrayRemove(
              currentDrag.homeRecipe.id
            ),
          },
          COLLECTION_NAMES.RECIPE_LISTS,
          authUser.uid
        )
      ).error
    )
      return false;
    populateGallery();
    return true;
  };

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
                Object.getOwnPropertyNames(lists).find(
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
                  date: new Date(),
                },
              },
              COLLECTION_NAMES.RECIPE_LISTS,
              authUser.uid
            );
            populateGallery();
            setLoading(false);
          }}
        >
          Submit
        </Button>
      </Form>
      <div className={styles.gallery}>
        {gallery &&
          gallery.map((list, i) => (
            <div
              key={list.listName}
              className={styles.row}
              onDragEnter={(e) => {
                e.stopPropagation();
                if (currentDrag.homeRecipe) {
                  setCurrentDrag({
                    ...currentDrag,
                    destinationList: list,
                  });
                }
              }}
            >
              <span className={styles.listTitle}>
                <h2>{list.listName && list.listName}</h2>
                <Button
                  className={styles.groceryButton}
                  onClick={() => {
                    router.push(`/list/${list.id}`);
                  }}
                >
                  Turn this into a grocery list!
                </Button>
              </span>
              <hr />
              <div className={styles.rowContainer}>
                {list.recipes.map((recipe) => (
                  <Link key={recipe.name} href={`/view/${recipe.id}`}>
                    <a
                      className={styles.recipe}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setCurrentDrag({
                          ...currentDrag,
                          homeRecipe: recipe,
                          homeList: list,
                        });
                      }}
                      onDragEnd={async (e) => {
                        e.stopPropagation();
                        if (!currentDrag.destinationList) {
                          setCurrentDrag({
                            homeRecipe: null,
                            homeList: null,
                            destinationList: null,
                          });
                        } else {
                          await changeGrouping();
                          setCurrentDrag({
                            homeRecipe: null,
                            homeList: null,
                            destinationList: null,
                          });
                        }
                      }}
                    >
                      <h3>{recipe.name}</h3>
                      {recipe.image && (
                        <img src={recipe.image} alt={recipe.name} />
                      )}
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
