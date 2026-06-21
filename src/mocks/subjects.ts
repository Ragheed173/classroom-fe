import { Subject } from "@/types";

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Programming",
    department: "CS",
    description:
      "Fundamentals of programming using a high-level language, including variables, control flow, functions, and basic problem-solving techniques.",
    created_at: "2025-09-01T08:00:00.000Z",
  },
  {
    id: 2,
    code: "MIS201",
    name: "Database Management Systems",
    department: "MIS",
    description:
      "Design and implementation of relational databases, SQL queries, normalization, and introductory data modeling for business applications.",
    created_at: "2025-09-01T08:00:00.000Z",
  },
  {
    id: 3,
    code: "CE301",
    name: "Data Structures and Algorithms",
    department: "CE",
    description:
      "Study of core data structures such as arrays, linked lists, stacks, queues, trees, and graphs, with algorithm analysis and efficiency.",
    created_at: "2025-09-01T08:00:00.000Z",
  },
];
