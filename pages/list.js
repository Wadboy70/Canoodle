import Container from "components/Container";
import { useAuth } from "lib/AuthUserContext";
import { COLLECTION_NAMES, getSingleFirestoreDoc } from "lib/firestore";
import { useEffect, useState } from "react";

const ListId = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(null);
  const { authUser } = useAuth();
  useEffect(() => {
    const getList = async () => {
      setLoading(true);
      const listData = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );

      if (!listData.groceries) {
        setList([]);
        setLoading(false);
        return;
      }
      setList(
        (
          await Promise.all(
            listData.groceries.map(async (id) => {
              return (
                (await getSingleFirestoreDoc(COLLECTION_NAMES.RECIPE_DATA, id))
                  .ingredients || []
              );
            })
          )
        )
          .flat()
          .map((v, i) => ({ name: v, id: i }))
      );
      setLoading(false);
    };
    if (!list && authUser) getList();
  });

  useEffect(() => {
    console.log(list);
  }, [list]);
  return (
    <Container>
      <h1>Shopping List</h1>
      {loading && <p>loading...</p>}
      {list && (
        <ul className="w-full bg-white p-6 grow">
          {list.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center w-full">
              <span className="form-check">
                <input
                  className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                  type="checkbox"
                  checked={ingredient.checked}
                  onClick={(e) => {
                    setList(
                      list.map((v) =>
                        v.id === ingredient.id
                          ? { ...v, checked: e.target.checked }
                          : v
                      )
                    );
                  }}
                  name="listItem"
                  id="listItem"
                />
              </span>
              <div className="grow flex">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => {
                    setList(
                      list.map((v) =>
                        v.id === ingredient.id
                          ? { ...v, name: e.target.value }
                          : v
                      )
                    );
                  }}
                  className={`grow outline-none bg-inherit ${
                    ingredient.checked ? "line-through text-slate-500" : ""
                  }`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default ListId;
