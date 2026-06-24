import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BACKEND_BASE_URL } from "@/constants";
import { DashboardData } from "@/types";
import {
  Users, BookOpen, GraduationCap, Building2, ListChecks,
  TrendingUp, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const RADIAL_COLORS: Record<string, string> = {
  admin: "#ef4444",
  teacher: "#6366f1",
  student: "#22c55e",
};

function StatCard({ title, value, icon: Icon, color, sub }: {
  title: string; value: number | string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-4 pt-5 pb-5">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function getInitials(name = "") {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const { data: dash, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_BASE_URL}dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const json = await res.json();
      return json.data as DashboardData;
    },
  });

  if (isLoading) {
    return (
      <div className="dashboard space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !dash) {
    return (
      <div className="dashboard flex flex-col items-center justify-center min-h-64 gap-3 text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { overview, userDistribution, enrollmentTrends, classesByDepartment, capacityStatus, recentActivity } = dash;

  const userPieData = userDistribution.map((d) => ({
    name: d.role.charAt(0).toUpperCase() + d.role.slice(1),
    value: d.count,
    fill: RADIAL_COLORS[d.role] ?? "#94a3b8",
  }));

  return (
    <div className="dashboard space-y-6 pb-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your classroom management system</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={overview.totalUsers} icon={Users} color="bg-indigo-500" />
        <StatCard title="Departments" value={overview.totalDepartments} icon={Building2} color="bg-violet-500" />
        <StatCard title="Subjects" value={overview.totalSubjects} icon={BookOpen} color="bg-amber-500" />
        <StatCard title="Classes" value={overview.totalClasses} icon={GraduationCap} color="bg-emerald-500" />
        <StatCard title="Enrollments" value={overview.totalEnrollments} icon={ListChecks} color="bg-rose-500" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={enrollmentTrends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="count" name="Enrollments" stroke="#6366f1" fill="url(#enrollGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            {enrollmentTrends.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">No enrollment data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Classes by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" /> Classes by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={classesByDepartment} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 10 }} width={110} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Classes" radius={[0, 4, 4, 0]}>
                  {classesByDepartment.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {classesByDepartment.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">No department data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Capacity Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={capacityStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {capacityStatus.map((entry, i) => {
                    const colors: Record<string, string> = { Full: "#ef4444", "Almost Full": "#f59e0b", Available: "#22c55e" };
                    return <Cell key={i} fill={colors[entry.status] ?? CHART_COLORS[i]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {capacityStatus.map((s) => (
                <div key={s.status} className="text-center">
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={userPieData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={6} label={{ position: "insideStart", fill: "#fff", fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {userDistribution.map((u) => (
                <div key={u.role} className="text-center">
                  <p className="text-xl font-bold">{u.count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.role}s</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Recent Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent enrollments</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{getInitials(item.studentName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.studentEmail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="text-xs max-w-36 truncate block">{item.className}</Badge>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(item.enrolledAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
