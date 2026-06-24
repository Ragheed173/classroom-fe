import { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { User } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  teacher: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  student: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function getInitials(name = "") {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const UsersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "user",
      size: 240,
      header: () => <p className="column-title">User</p>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            {row.original.image && <AvatarImage src={row.original.image} alt={row.original.name} />}
            <AvatarFallback className="text-xs">{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.original.name}</p>
            <p className="text-xs text-muted-foreground truncate">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      accessorKey: "role",
      size: 110,
      header: () => <p className="column-title">Role</p>,
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[role] ?? ""}`}>
            {role}
          </span>
        );
      },
    },
    {
      id: "emailVerified",
      accessorKey: "emailVerified",
      size: 110,
      header: () => <p className="column-title">Verified</p>,
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? "default" : "secondary"}>
          {getValue<boolean>() ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      size: 120,
      header: () => <p className="column-title">Joined</p>,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(getValue<string>()).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      size: 180,
      header: () => <p className="column-title">Actions</p>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ShowButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
          <EditButton resource="users" recordItemId={row.original.id} variant="outline" size="sm" />
          <DeleteButton resource="users" recordItemId={row.original.id} variant="outline" size="sm" />
        </div>
      ),
    },
  ], []);

  const permanentFilters = useMemo(() => [
    ...(selectedRole !== "all" ? [{ field: "role", operator: "eq" as const, value: selectedRole }] : []),
    ...(searchQuery ? [{ field: "search", operator: "eq" as const, value: searchQuery }] : []),
  ], [selectedRole, searchQuery]);

  const table = useTable<User>({
    columns,
    refineCoreProps: {
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: permanentFilters },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Users</h1>

      <div className="intro-row">
        <p className="text-muted-foreground">Manage all users across roles.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable table={table} />
    </ListView>
  );
};

export default UsersList;
