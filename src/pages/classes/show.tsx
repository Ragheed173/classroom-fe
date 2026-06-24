import { useShow, useInvalidate, useList, useNotification } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { AlertTriangle, Copy, UserPlus, UserMinus } from "lucide-react";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BACKEND_BASE_URL } from "@/constants";
import { ClassDetails, User } from "@/types";

type ClassUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-lg font-bold tracking-widest bg-muted px-3 py-1.5 rounded-lg border">{code}</code>
      <Button variant="outline" size="sm" onClick={copyCode}>
        <Copy className="h-3.5 w-3.5 mr-1" />{copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}

function EnrollStudentDialog({ classId, classCapacity, enrollmentCount, onSuccess }: {
  classId: string; classCapacity: number; enrollmentCount: number; onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const { open: notify } = useNotification();

  const { query: studentsQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "student" }],
    pagination: { pageSize: 200 },
    queryOptions: { enabled: open },
  });

  const students = studentsQuery?.data?.data ?? [];
  const isFull = enrollmentCount >= classCapacity;

  const handleEnroll = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}classes/${classId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentId: selectedStudent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to enroll student");
      notify?.({ type: "success", message: "Student enrolled successfully" });
      setOpen(false);
      setSelectedStudent("");
      onSuccess();
    } catch (err: unknown) {
      notify?.({ type: "error", message: err instanceof Error ? err.message : "Failed to enroll student" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={isFull}>
          <UserPlus className="h-4 w-4 mr-1" /> Enroll Student
          {isFull && <span className="ml-1 text-xs">(Full)</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll a Student</DialogTitle>
          <DialogDescription>Select a student to add to this class.</DialogDescription>
        </DialogHeader>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student..." />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleEnroll} disabled={!selectedStudent || loading}>
            {loading ? "Enrolling..." : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";
  const invalidate = useInvalidate();
  const { open: notify } = useNotification();
  const [unenrolling, setUnenrolling] = useState<string | null>(null);

  const { query: classQuery } = useShow<ClassDetails>({ resource: "classes" });
  const classDetails = classQuery.data?.data;
  const isLoading = classQuery.isLoading;
  const isError = classQuery.isError;

  const invalidateStudents = () => {
    invalidate({ resource: `classes/${classId}/users`, invalidates: ["list"] });
    classQuery.refetch();
  };

  const handleUnenroll = async (studentId: string) => {
    setUnenrolling(studentId);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}classes/${classId}/enrollments/${studentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to unenroll");
      notify?.({ type: "success", message: "Student unenrolled successfully" });
      invalidateStudents();
    } catch (err: unknown) {
      notify?.({ type: "error", message: err instanceof Error ? err.message : "Failed to unenroll student" });
    } finally {
      setUnenrolling(null);
    }
  };

  const studentColumns = useMemo<ColumnDef<ClassUser>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      size: 240,
      header: () => <p className="column-title">Student</p>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            {row.original.image && <AvatarImage src={row.original.image} alt={row.original.name} />}
            <AvatarFallback className="text-xs">{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="truncate font-medium text-sm">{row.original.name}</span>
            <span className="text-xs text-muted-foreground truncate">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "unenroll",
      size: 120,
      header: () => <p className="column-title">Actions</p>,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={unenrolling === row.original.id}
          onClick={() => handleUnenroll(row.original.id)}
        >
          <UserMinus className="h-4 w-4 mr-1" />
          {unenrolling === row.original.id ? "..." : "Remove"}
        </Button>
      ),
    },
  ], [unenrolling]);

  const studentsTable = useTable<ClassUser>({
    columns: studentColumns,
    refineCoreProps: {
      resource: `classes/${classId}/users`,
      pagination: { pageSize: 5, mode: "server" },
      filters: { permanent: [{ field: "role", operator: "eq", value: "student" }] },
      queryOptions: { enabled: !!classId },
    },
  });

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {isLoading ? "Loading class details..." : isError ? "Failed to load class details." : "Class not found."}
        </p>
      </ShowView>
    );
  }

  const enrollmentCount = classDetails.enrollmentCount ?? 0;
  const capacity = classDetails.capacity;
  const capacityPct = Math.min(100, Math.round((enrollmentCount / capacity) * 100));
  const isNearFull = capacityPct >= 80;
  const isFull = enrollmentCount >= capacity;

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const placeholderUrl = `https://placehold.co/100x100?text=${encodeURIComponent(getInitials(teacherName) || "?")}`;

  return (
    <ShowView className="class-view class-show space-y-6">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {classDetails.bannerUrl ? (
          <img src={classDetails.bannerUrl} alt={classDetails.name} loading="lazy" />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div>
          <div className="details-header">
            <div>
              <h1>{classDetails.name}</h1>
              <p>{classDetails.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="space-x-2">
                <Badge variant="outline">{capacity} spots</Badge>
                <Badge variant={classDetails.status === "active" ? "default" : "secondary"} data-status={classDetails.status}>
                  {classDetails.status.toUpperCase()}
                </Badge>
              </div>
              {isFull && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Class Full
                </Badge>
              )}
              {!isFull && isNearFull && (
                <Badge className="bg-amber-500 text-white flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Almost Full
                </Badge>
              )}
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enrollment</span>
              <span>{enrollmentCount} / {capacity}</span>
            </div>
            <Progress value={capacityPct} className={`h-2 ${isFull ? "[&>div]:bg-destructive" : isNearFull ? "[&>div]:bg-amber-500" : ""}`} />
          </div>

          <div className="details-grid">
            <div className="instructor">
              <p>👨‍🏫 Instructor</p>
              <div>
                <img src={classDetails.teacher?.image ?? placeholderUrl} alt={teacherName} />
                <div>
                  <p>{teacherName}</p>
                  <p>{classDetails.teacher?.email}</p>
                </div>
              </div>
            </div>
            <div className="department">
              <p>🏛️ Department</p>
              <div>
                <p>{classDetails.department?.name ?? "—"}</p>
                <p>{classDetails.department?.description ?? ""}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="subject">
          <p>📚 Subject</p>
          <div>
            {classDetails.subject?.code && (
              <Badge variant="outline">Code: <span>{classDetails.subject.code}</span></Badge>
            )}
            <p>{classDetails.subject?.name}</p>
            <p>{classDetails.subject?.description}</p>
          </div>
        </div>

        <Separator />

        <div className="join">
          <h2>🎓 Invite Code</h2>
          {classDetails.inviteCode ? (
            <div className="mt-3">
              <InviteCodeDisplay code={classDetails.inviteCode} />
              <p className="text-xs text-muted-foreground mt-2">Share this code with students to let them join the class.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No invite code generated.</p>
          )}
        </div>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enrolled Students ({enrollmentCount}/{capacity})</CardTitle>
          <EnrollStudentDialog
            classId={classId}
            classCapacity={capacity}
            enrollmentCount={enrollmentCount}
            onSuccess={invalidateStudents}
          />
        </CardHeader>
        <CardContent>
          <DataTable table={studentsTable} />
        </CardContent>
      </Card>
    </ShowView>
  );
};

export default ClassesShow;
