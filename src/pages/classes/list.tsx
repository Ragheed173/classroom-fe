import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ListView } from "@/components/refine-ui/views/list-view";

const ClassesList = () => {
  return (
    <ListView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Classes</h1>

      <div className="intro-row">
        <p>Manage and create classes for your students.</p>
        <CreateButton resource="classes" />
      </div>
    </ListView>
  );
};

export default ClassesList;