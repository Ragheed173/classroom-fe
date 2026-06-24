import * as z from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code max 20 characters"),
  description: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(3, "Subject name must be at least 3 characters"),
  code: z.string().min(2, "Subject code must be at least 2 characters").max(20, "Code max 20 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  departmentId: z.coerce.number({ required_error: "Department is required", invalid_type_error: "Department is required" }).min(1, "Department is required"),
});

const scheduleSchema = z.object({
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").max(50, "Class name must be at most 50 characters"),
  description: z.string({ required_error: "Description is required" }).min(5, "Description must be at least 5 characters"),
  subjectId: z.coerce.number({ required_error: "Subject is required", invalid_type_error: "Subject is required" }).min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  capacity: z.coerce.number({ required_error: "Capacity is required", invalid_type_error: "Capacity is required" }).min(1, "Capacity must be at least 1"),
  status: z.enum(["active", "inactive", "archived"]),
  bannerUrl: z.string({ required_error: "Class banner is required" }).min(1, "Class banner is required"),
  bannerCldPubId: z.string({ required_error: "Banner reference is required" }).min(1, "Banner reference is required"),
  inviteCode: z.string().optional(),
  schedules: z.array(scheduleSchema).optional(),
});

export const enrollmentSchema = z.object({
  classId: z.coerce.number({ required_error: "Class ID is required", invalid_type_error: "Class ID is required" }).min(1, "Class ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});

export const userEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "teacher", "student"], { required_error: "Role is required" }),
});
