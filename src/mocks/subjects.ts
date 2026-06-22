export type MockSubject = {
  id: number;
  name: string;
  code: string;
};

export const toSubjectCode = (name: string): string =>
  name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map((word) => word.slice(0, 4))
    .join("")
    .toUpperCase();

const subjectNames = [
  "Introduction to Biology",
  "Calculus I",
  "Computer Science",
  "World History",
];

export const mockSubjects: MockSubject[] = subjectNames.map((name, index) => ({
  id: index + 1,
  name,
  code: toSubjectCode(name),
}));
