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
import UploadWidget from "@/components/upload-widget";
import { classSchema } from "@/lib/schema";
import { Subject, User } from "@/types";

const ClassesEdit = () => {
  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: { resource: "classes", action: "edit" },
  });

  const {
    refineCore: { onFinish, queryResult },
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    watch,
    setValue,
  } = form;

  const bannerPublicId = watch("bannerCldPubId");

  const { query: subjectsQuery } = useList<Subject>({ resource: "subjects", pagination: { pageSize: 100 } });
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const subjects = subjectsQuery?.data?.data ?? [];
  const teachers = teachersQuery?.data?.data ?? [];

  if (queryResult?.isLoading) {
    return <EditView className="class-view"><Breadcrumb /><p className="text-muted-foreground mt-4">Loading...</p></EditView>;
  }

  return (
    <EditView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Edit Class</h1>

      <div className="my-4">
        <Card className="class-form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gradient-orange">Update details</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-5">
                <FormField control={control} name="bannerUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image <span className="text-orange-600">*</span></FormLabel>
                    <FormControl>
                      <UploadWidget
                        value={field.value ? { url: field.value, publicId: bannerPublicId ?? "" } : null}
                        onChange={(file) => {
                          if (file) {
                            field.onChange(file.url);
                            setValue("bannerCldPubId", file.publicId, { shouldValidate: true, shouldDirty: true });
                          } else {
                            field.onChange("");
                            setValue("bannerCldPubId", "", { shouldValidate: true, shouldDirty: true });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {errors.bannerCldPubId && !errors.bannerUrl && (
                      <p className="text-destructive text-sm">{errors.bannerCldPubId.message?.toString()}</p>
                    )}
                  </FormItem>
                )} />

                <FormField control={control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name <span className="text-orange-600">*</span></FormLabel>
                    <FormControl><Input placeholder="Introduction to Biology - Section A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={control} name="subjectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject <span className="text-orange-600">*</span></FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value?.toString()}
                        disabled={subjectsQuery.isLoading}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="teacherId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher <span className="text-orange-600">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                        disabled={teachersQuery.isLoading}
                      >
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={control} name="capacity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity <span className="text-orange-600">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          value={(field.value as number | undefined) ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-orange-600">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-orange-600">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description about the class" {...field} value={field.value ?? ""} />
                    </FormControl>
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

export default ClassesEdit;
