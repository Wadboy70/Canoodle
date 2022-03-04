import { arrayRemove, arrayUnion } from "firebase/firestore";
import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  mergeFirestoreDoc,
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
  const { authUser, loading } = useAuth();
  const [listName, setListName] = useState("");
  const [dashLoading, setDashLoading] = useState(false);
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
  const populateGallery = async () => {
    let list = await getSingleFirestoreDoc(
      COLLECTION_NAMES.RECIPE_LISTS,
      authUser.uid
    );
    if (!list) {
      await mergeFirestoreDoc(
        {
          All_Recipes: { list: [], name: "All Recipes" },
          uid: authUser.uid,
        },
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );
      list = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );
    } else if (list.error) {
      setGallery([]);
      return;
    }
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

  if (loading) {
    return (
      <div className={styles.main}>
        <p>loading...</p>
      </div>
    );
  } else if (authUser === null && !loading) {
    return (
      <div className={styles.main}>
        <p>
          You can only access this page when authenticated :( Please click the
          login button above!
        </p>
      </div>
    );
  }

  const changeGrouping = async () => {
    if (
      currentDrag.homeList.id === currentDrag.destinationList.id ||
      dashLoading
    )
      return;
    setDashLoading(true);
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
    ) {
      setDashLoading(false);
      return false;
    } else if (
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
    ) {
      setDashLoading(false);
      return false;
    }
    populateGallery();
    setDashLoading(false);
    return true;
  };
  const addList = async () => {
    setDashLoading(true);
    if (
      (listName.replace(/\s+/g, "") === "" || listName == "error") &&
      typeof window !== "undefined"
    ) {
      alert("invalid list name");
      setDashLoading(false);
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
      setDashLoading(false);
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
    setDashLoading(false);
  };

  return (
    <div className={styles.main}>
      <h1>Dashboard</h1>
      {dashLoading && <p>loading...</p>}
      <Form onSubmit={addList} className={styles.newList}>
        <InputWithLabel
          type={"text"}
          name="listname"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          label="Make a New List"
          placeholder={"New List Name"}
          className={styles.listForm}
        />
        <Button>Submit</Button>
      </Form>
      <p>ⓘ Tip: Click and Drag recipes to move them to new lists!</p>
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
                <div>
                  <Button
                    className={styles.groceryButton}
                    onClick={() => {
                      router.push(`/list/${list.id}`);
                    }}
                  >
                    Make a grocery list!
                  </Button>
                  {/* <Button onClick={()=>{
                    if(typeof window !== "undefined"){
                      const confirm = alert("Are you sure you want to delete this list?");
                      if(confirm){
                        
                      }
                    }
                  }}>Delete List</Button> */}
                </div>
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
                        <div
                          className={styles.recipeImage}
                          style={{
                            "background-image": `url(${
                              typeof recipe.image === "string"
                                ? recipe.image
                                : recipe?.image?.[0]
                            })`,
                          }}
                          alt={recipe.name}
                        />
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
