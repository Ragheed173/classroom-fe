import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { userEditSchema } from "@/lib/schema";
import { User } from "@/types";

function getInitials(name = "") {
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const UsersEdit = () => {
  const form = useForm({
    resolver: zodResolver(userEditSchema),
    refineCoreProps: { resource: "users", action: "edit" },
  });

  const { refineCore: { onFinish, queryResult }, handleSubmit, control, formState: { isSubmitting } } = form;
  const user = queryResult?.data?.data as User | undefined;

  if (queryResult?.isLoading) {
    return <EditView className="class-view"><Breadcrumb /><p className="text-muted-foreground mt-4">Loading...</p></EditView>;
  }

  return (
    <EditView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Edit User</h1>

      <div className="my-4">
        <Card className="class-form-card">
          {user && (
            <div className="flex items-center gap-4 px-6 pt-6">
              <Avatar className="size-14">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Editing user</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-xl font-bold">Update User</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-5">
                <FormField control={control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-orange-600">*</span></FormLabel>
                    <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role <span className="text-orange-600">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EditView>
  );
};

export default UsersEdit;
