import { useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Building2 } from "lucide-react";

import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Department, Subject } from "@/types";

const DepartmentsShow = () => {
  const { query } = useShow<Department>({ resource: "departments" });
  const dept = query.data?.data;

  const subjectColumns = useMemo<ColumnDef<Subject>[]>(() => [
    {
      id: "code",
      accessorKey: "code",
      size: 100,
      header: () => <p className="column-title">Code</p>,
      cell: ({ getValue }) => <Badge variant="outline" className="font-mono">{getValue<string>()}</Badge>,
    },
    {
      id: "name",
      accessorKey: "name",
      size: 200,
      header: () => <p className="column-title">Name</p>,
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: "description",
      accessorKey: "description",
      size: 250,
      header: () => <p className="column-title">Description</p>,
      cell: ({ getValue }) => <span className="text-muted-foreground text-sm truncate">{getValue<string>() ?? "—"}</span>,
    },
    {
      id: "actions",
      size: 100,
      header: () => <p className="column-title">Actions</p>,
      cell: ({ row }) => <ShowButton resource="subjects" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>,
    },
  ], []);

  const subjectsTable = useTable<Subject>({
    columns: subjectColumns,
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: dept ? [{ field: "department", operator: "eq" as const, value: dept.name }] : [] },
    },
  });

  if (query.isLoading || !dept) {
    return (
      <ShowView className="class-view">
        <ShowViewHeader resource="departments" title="Department Details" />
        <p className="text-muted-foreground mt-4">{query.isLoading ? "Loading..." : "Department not found."}</p>
      </ShowView>
    );
  }

  return (
    <ShowView className="class-view space-y-6">
      <ShowViewHeader resource="departments" title="Department Details" />

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900">
              <Building2 className="h-6 w-6 text-violet-600 dark:text-violet-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{dept.name}</h2>
                <Badge variant="outline" className="font-mono">{dept.code}</Badge>
              </div>
              {dept.description && <p className="text-muted-foreground text-sm mt-1">{dept.description}</p>}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Created</p>
              <p className="font-medium">{dept.created_at ? new Date(dept.created_at).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Updated</p>
              <p className="font-medium">{dept.updated_at ? new Date(dept.updated_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subjects in this Department</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable table={subjectsTable} />
        </CardContent>
      </Card>
    </ShowView>
  );
};

export default DepartmentsShow;
