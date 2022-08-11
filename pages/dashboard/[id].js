import IdContainer from "components/IdContainer";
import { useListData, useRecipeData } from "lib/hooks/dashboardHooks";

const ID = ({ id }) => {
  const { name } = useListData(id);
  const { recipes } = useRecipeData(id);
  return <IdContainer name={name} recipes={recipes} id={id} />;
};

export default ID;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
