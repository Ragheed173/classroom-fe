import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { departmentSchema } from "@/lib/schema";

const DepartmentsCreate = () => {
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: { resource: "departments", action: "create" },
  });

  const { refineCore: { onFinish }, handleSubmit, control, formState: { isSubmitting } } = form;

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Create Department</h1>

      <div className="my-4">
        <Card className="class-form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gradient-orange">Fill out form</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input placeholder="CS" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Brief description of the department" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Department"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default DepartmentsCreate;
