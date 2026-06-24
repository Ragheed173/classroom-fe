import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useList } from "@refinedev/core";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { subjectSchema } from "@/lib/schema";
import { Department } from "@/types";

const SubjectsEdit = () => {
  const form = useForm({
    resolver: zodResolver(subjectSchema),
    refineCoreProps: { resource: "subjects", action: "edit" },
  });

  const { refineCore: { onFinish, queryResult }, handleSubmit, control, formState: { isSubmitting } } = form;

  const { query: deptsQuery } = useList<Department>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });
  const departments = deptsQuery?.data?.data ?? [];

  if (queryResult?.isLoading) {
    return <EditView className="class-view"><Breadcrumb /><p className="text-muted-foreground mt-4">Loading...</p></EditView>;
  }

  return (
    <EditView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Edit Subject</h1>

      <div className="my-4">
        <Card className="class-form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gradient-orange">Update details</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Name <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input placeholder="Introduction to Biology" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input placeholder="BIO101" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={control} name="departmentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department <span className="text-orange-600">*</span></FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                      disabled={deptsQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-orange-600">*</span></FormLabel>
                    <FormControl><Textarea placeholder="Brief description of the subject" {...field} value={field.value ?? ""} /></FormControl>
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

export default SubjectsEdit;
