import React, { createContext, useContext, useMemo, useState } from "react";
import { seedState } from "./seed";
import {
  Announcement,
  AppState,
  Course,
  Enrollment,
  EnrollmentSubject,
  Grade,
  Notification,
  Payment,
  Section,
  Subject,
  User,
} from "./types";

const STORAGE_KEY = "ecs-react-state-v2";
const AUTH_KEY = "ecs-react-auth-v2";

type AppContextType = {
  state: AppState;
  currentUser: User | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  registerStudent: (name: string, email: string, password: string) => { ok: boolean; message?: string };
  setState: React.Dispatch<React.SetStateAction<AppState>>;
};

const AppContext = createContext<AppContextType | null>(null);

const normalizeState = (input: Partial<AppState> | null | undefined): AppState => {
  const base = seedState;
  if (!input) return base;
  return {
    users: Array.isArray(input.users) ? input.users : base.users,
    courses: Array.isArray(input.courses) ? input.courses : base.courses,
    subjects: Array.isArray(input.subjects) ? input.subjects : base.subjects,
    sections: Array.isArray(input.sections) ? input.sections : base.sections,
    enrollments: Array.isArray(input.enrollments) ? input.enrollments : base.enrollments,
    enrollmentSubjects: Array.isArray(input.enrollmentSubjects) ? input.enrollmentSubjects : base.enrollmentSubjects,
    payments: Array.isArray(input.payments) ? input.payments : base.payments,
    announcements: Array.isArray(input.announcements) ? input.announcements : base.announcements,
    notifications: Array.isArray(input.notifications) ? input.notifications : base.notifications,
    grades: Array.isArray(input.grades) ? input.grades : base.grades,
    settings: {
      academicYear: input.settings?.academicYear ?? base.settings.academicYear,
      semester: input.settings?.semester ?? base.settings.semester,
    },
  };
};

const loadState = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedState;
  try {
    return normalizeState(JSON.parse(raw) as Partial<AppState>);
  } catch {
    return seedState;
  }
};

const loadAuthUserId = (): number | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [authUserId, setAuthUserId] = useState<number | null>(loadAuthUserId);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  React.useEffect(() => {
    if (authUserId === null) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.setItem(AUTH_KEY, String(authUserId));
    }
  }, [authUserId]);

  const currentUser = useMemo(
    () => (authUserId ? state.users.find((u) => u.id === authUserId) ?? null : null),
    [authUserId, state.users],
  );

  React.useEffect(() => {
    if (authUserId !== null && !currentUser) {
      setAuthUserId(null);
    }
  }, [authUserId, currentUser]);

  const login = (email: string, password: string) => {
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) return { ok: false, message: "Invalid login credentials." };
    if (user.status !== "active") return { ok: false, message: "Your account is inactive." };
    setAuthUserId(user.id);
    return { ok: true };
  };

  const logout = () => setAuthUserId(null);

  const registerStudent = (name: string, email: string, password: string) => {
    if (!name || !email || password.length < 6) return { ok: false, message: "Please provide valid details." };
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "Email already registered." };
    }
    const nextId = Math.max(...state.users.map((u) => u.id), 0) + 1;
    const nextUser: User = { id: nextId, name, email, password, role: "student", status: "active" };
    setState((prev) => ({ ...prev, users: [nextUser, ...prev.users] }));
    return { ok: true };
  };

  return (
    <AppContext.Provider value={{ state, currentUser, login, logout, registerStudent, setState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}

export const nextId = <T extends { id: number }>(arr: T[]) => Math.max(...arr.map((x) => x.id), 0) + 1;
export const nowIso = () => new Date().toISOString();

export const helpers = {
  userById: (state: AppState, id: number) => state.users.find((u) => u.id === id),
  courseById: (state: AppState, id: number) => state.courses.find((c) => c.id === id),
  subjectById: (state: AppState, id: number) => state.subjects.find((s) => s.id === id),
  enrollmentByUser: (state: AppState, userId: number) =>
    [...state.enrollments].filter((e) => e.userId === userId).sort((a, b) => b.id - a.id)[0],
};

export type Entity =
  | User
  | Course
  | Subject
  | Section
  | Enrollment
  | EnrollmentSubject
  | Payment
  | Announcement
  | Notification
  | Grade;
