import { useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { BookOpen } from "lucide-react";

import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Subject, ClassDetails } from "@/types";

const SubjectsShow = () => {
  const { query } = useShow<Subject>({ resource: "subjects" });
  const subject = query.data?.data;

  const classColumns = useMemo<ColumnDef<ClassDetails>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      size: 200,
      header: () => <p className="column-title">Class</p>,
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: "teacher",
      accessorKey: "teacher.name",
      size: 160,
      header: () => <p className="column-title">Teacher</p>,
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>() ?? "—"}</span>,
    },
    {
      id: "capacity",
      accessorKey: "capacity",
      size: 100,
      header: () => <p className="column-title">Capacity</p>,
      cell: ({ getValue }) => <span className="text-sm">{getValue<number>()}</span>,
    },
    {
      id: "status",
      accessorKey: "status",
      size: 100,
      header: () => <p className="column-title">Status</p>,
      cell: ({ getValue }) => {
        const s = getValue<string>();
        return <Badge variant={s === "active" ? "default" : "secondary"}>{s}</Badge>;
      },
    },
    {
      id: "actions",
      size: 100,
      header: () => <p className="column-title">Actions</p>,
      cell: ({ row }) => <ShowButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>,
    },
  ], []);

  const classesTable = useTable<ClassDetails>({
    columns: classColumns,
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: subject ? [{ field: "subject", operator: "eq" as const, value: subject.name }] : [],
      },
      queryOptions: { enabled: !!subject },
    },
  });

  if (query.isLoading || !subject) {
    return (
      <ShowView className="class-view">
        <ShowViewHeader resource="subjects" title="Subject Details" />
        <p className="text-muted-foreground mt-4">{query.isLoading ? "Loading..." : "Subject not found."}</p>
      </ShowView>
    );
  }

  return (
    <ShowView className="class-view space-y-6">
      <ShowViewHeader resource="subjects" title="Subject Details" />

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900">
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{subject.name}</h2>
                <Badge variant="outline" className="font-mono">{subject.code}</Badge>
              </div>
              {subject.description && (
                <p className="text-muted-foreground text-sm mt-1">{subject.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {subject.department && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Department</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{subject.department.name}</span>
                <Badge variant="secondary" className="font-mono">{subject.department.code}</Badge>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Created</p>
              <p className="font-medium">{subject.created_at ? new Date(subject.created_at).toLocaleDateString() : "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Updated</p>
              <p className="font-medium">{subject.updated_at ? new Date(subject.updated_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Classes using this Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable table={classesTable} />
        </CardContent>
      </Card>
    </ShowView>
  );
};

export default SubjectsShow;
