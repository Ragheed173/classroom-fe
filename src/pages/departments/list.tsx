import { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { useDeleteMany, useDelete } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { Department } from "@/types";

const DepartmentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
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
        size: 220,
        header: () => <p className="column-title">Name</p>,
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        size: 300,
        header: () => <p className="column-title">Description</p>,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm truncate">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        size: 180,
        header: () => <p className="column-title">Actions</p>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            <EditButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm" />
            <DeleteButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm" />
          </div>
        ),
      },
    ],
    []
  );

  const searchFilters = searchQuery
    ? [{ field: "search", operator: "eq" as const, value: searchQuery }]
    : [];

  const table = useTable<Department>({
    columns,
    refineCoreProps: {
      resource: "departments",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: searchFilters },
      sorters: { initial: [{ field: "id", order: "desc" }] },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Departments</h1>

      <div className="intro-row">
        <p className="text-muted-foreground">Manage academic departments.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              placeholder="Search departments..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CreateButton resource="departments" />
        </div>
      </div>

      <DataTable table={table} />
    </ListView>
  );
};

export default DepartmentsList;
