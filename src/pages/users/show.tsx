import { useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useParams } from "react-router";
import { Mail, Shield } from "lucide-react";

import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, ClassDetails } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  teacher: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  student: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function getInitials(name = "") {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const UsersShow = () => {
  const { id } = useParams();
  const { query } = useShow<User>({ resource: "users" });
  const user = query.data?.data;

  const classColumns = useMemo<ColumnDef<ClassDetails>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      size: 200,
      header: () => <p className="column-title">Class</p>,
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
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

  const resource = user?.role === "teacher" ? `classes/${id}/users` : `classes/${id}/users`;
  const roleFilter = user?.role === "teacher" ? "teacher" : "student";

  const classesTable = useTable<ClassDetails>({
    columns: classColumns,
    refineCoreProps: {
      resource: user ? `classes` : "classes",
      pagination: { pageSize: 5, mode: "server" },
      filters: {
        permanent: user
          ? user.role === "teacher"
            ? [{ field: "teacher", operator: "eq" as const, value: user.name }]
            : []
          : [],
      },
      queryOptions: { enabled: !!user },
    },
  });

  if (query.isLoading || !user) {
    return (
      <ShowView className="class-view">
        <ShowViewHeader resource="users" title="User Details" />
        <p className="text-muted-foreground mt-4">{query.isLoading ? "Loading..." : "User not found."}</p>
      </ShowView>
    );
  }

  return (
    <ShowView className="class-view space-y-6">
      <ShowViewHeader resource="users" title="User Details" />

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="size-16">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[user.role] ?? ""}`}>
                  {user.role}
                </span>
                {user.emailVerified && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Joined</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Last Updated</p>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {user.role === "teacher" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes Taught</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable table={classesTable} />
          </CardContent>
        </Card>
      )}
    </ShowView>
  );
};

export default UsersShow;
