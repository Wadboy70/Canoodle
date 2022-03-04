import { useAuth } from "lib/AuthUserContext";
import { COLLECTION_NAMES, getSingleFirestoreDoc } from "lib/firestore";
import { replaceAt } from "pages/edit";
import { useEffect, useState } from "react";
import styles from "styles/List.module.css";

const ListId = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(null);
  const { authUser } = useAuth();
  useEffect(() => {
    const getList = async () => {
      const exists = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );

      if (exists) {
        const idList = exists[id]?.list;
        if (!idList) setList([]);
        else {
          setList(
            (
              await Promise.all(
                idList.map(async (id) => {
                  return (
                    (
                      await getSingleFirestoreDoc(
                        COLLECTION_NAMES.RECIPE_DATA,
                        id
                      )
                    ).ingredients || []
                  );
                })
              )
            ).flat()
          );
        }
      } else setList([]);
      setLoading(false);
    };
    if (list === null && authUser) getList();
  });

  useEffect(() => {
    console.log(list);
  }, [list]);
  return (
    <div className={styles.main}>
      <h1>Shopping List</h1>
      {loading && <p>loading...</p>}
      {list && (
        <ul>
          {list.map((ingredient, i) => (
            <li key={i} className={styles.listItem}>
              <input type="checkbox" name="listItem" id="listItem" />
              <p>{ingredient}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListId;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
