export type Role = "admin" | "student";

export type EnrollmentStatus = "pending" | "approved" | "rejected" | "enrolled";
export type PaymentStatus = "pending" | "confirmed" | "rejected";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "active" | "inactive";
  studentNumber?: string;
  photo?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  capacity: number;
  department: string;
}

export interface Subject {
  id: number;
  courseId: number;
  code: string;
  name: string;
  units: number;
  prerequisite?: string;
}

export interface Section {
  id: number;
  subjectId: number;
  name: string;
  schedule: string;
  room: string;
  studentLimit: number;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: EnrollmentStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface EnrollmentSubject {
  id: number;
  enrollmentId: number;
  subjectId: number;
  sectionId?: number;
}

export interface Payment {
  id: number;
  userId: number;
  enrollmentId: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  referenceNo: string;
  payerName: string;
  paymentDate: string;
  proof?: string;
  remarks?: string;
  status: PaymentStatus;
  paidAt: string;
  updatedAt?: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  targetRole: "all" | "admin" | "student";
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Grade {
  id: number;
  userId: number;
  subjectId: number;
  grade: string;
  term: string;
}

export interface AppState {
  users: User[];
  courses: Course[];
  subjects: Subject[];
  sections: Section[];
  enrollments: Enrollment[];
  enrollmentSubjects: EnrollmentSubject[];
  payments: Payment[];
  announcements: Announcement[];
  notifications: Notification[];
  grades: Grade[];
  settings: {
    academicYear: string;
    semester: string;
  };
}
