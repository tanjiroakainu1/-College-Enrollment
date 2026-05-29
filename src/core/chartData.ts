import { AppState, User } from "./types";
import { helpers } from "./store";

export type ChartPoint = { name: string; value: number; fill?: string };

export const CANDY_COLORS = ["#fb7185", "#f43f5e", "#dc2626", "#ec4899", "#f97316", "#fda4af", "#be123c", "#a855f7"];

export const STATUS_COLORS: Record<string, string> = {
  pending: "#fbbf24",
  approved: "#34d399",
  enrolled: "#60a5fa",
  rejected: "#f87171",
  confirmed: "#34d399",
  active: "#34d399",
  inactive: "#94a3b8",
  all: "#fb7185",
  admin: "#a855f7",
  student: "#f43f5e",
  tuition: "#f43f5e",
  miscellaneous: "#ec4899",
  enrollment_fee: "#f97316",
  gcash: "#34d399",
  bank_transfer: "#60a5fa",
  paymaya: "#a855f7",
};

function countBy<T extends string>(items: T[]): ChartPoint[] {
  const map = new Map<string, number>();
  items.forEach((k) => map.set(k, (map.get(k) ?? 0) + 1));
  return [...map.entries()].map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
    fill: STATUS_COLORS[name] ?? CANDY_COLORS[map.size % CANDY_COLORS.length],
  }));
}

function sumBy<T>(items: T[], keyFn: (item: T) => string, valFn: (item: T) => number): ChartPoint[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const k = keyFn(item);
    map.set(k, (map.get(k) ?? 0) + valFn(item));
  });
  return [...map.entries()].map(([name, value], i) => ({
    name: name.replace(/_/g, " "),
    value,
    fill: STATUS_COLORS[name] ?? CANDY_COLORS[i % CANDY_COLORS.length],
  }));
}

export const adminChartData = {
  dashboard: (state: AppState) => ({
    enrollmentStatus: countBy(state.enrollments.map((e) => e.status)),
    byCourse: state.courses.map((c, i) => ({
      name: c.code,
      value: state.enrollments.filter((e) => e.courseId === c.id).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
    paymentRevenue: sumBy(state.payments, (p) => p.paymentType, (p) => p.amount),
    paymentStatus: countBy(state.payments.map((p) => p.status)),
  }),

  students: (state: AppState) => ({
    statusSplit: countBy(state.users.filter((u) => u.role === "student").map((u) => u.status)),
    perCourse: state.courses.map((c, i) => ({
      name: c.code,
      value: state.enrollments.filter((e) => e.courseId === c.id).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
  }),

  enrollments: (state: AppState) => ({
    status: countBy(state.enrollments.map((e) => e.status)),
    byCourse: state.courses.map((c, i) => ({
      name: c.code,
      value: state.enrollments.filter((e) => e.courseId === c.id).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
  }),

  courses: (state: AppState) => ({
    capacity: state.courses.map((c, i) => ({
      name: c.code,
      capacity: c.capacity,
      enrolled: state.enrollments.filter((e) => e.courseId === c.id && (e.status === "approved" || e.status === "enrolled")).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
    byDepartment: sumBy(state.courses, (c) => c.department, () => 1),
  }),

  subjects: (state: AppState) => ({
    units: state.subjects.map((s, i) => ({
      name: s.code,
      value: s.units,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
    perCourse: state.courses.map((c, i) => ({
      name: c.code,
      value: state.subjects.filter((s) => s.courseId === c.id).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
  }),

  sections: (state: AppState) => ({
    limits: state.sections.map((s, i) => ({
      name: `${helpers.subjectById(state, s.subjectId)?.code ?? "?"}-${s.name}`,
      value: s.studentLimit,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
    perSubject: sumBy(state.sections, (s) => helpers.subjectById(state, s.subjectId)?.code ?? "Unknown", () => 1),
  }),

  payments: (state: AppState) => ({
    status: countBy(state.payments.map((p) => p.status)),
    byType: sumBy(state.payments, (p) => p.paymentType, (p) => p.amount),
    byMethod: sumBy(state.payments, (p) => p.paymentMethod, (p) => p.amount),
    amounts: state.payments.map((p, i) => ({
      name: `#${p.id}`,
      value: p.amount,
      fill: STATUS_COLORS[p.status] ?? CANDY_COLORS[i % CANDY_COLORS.length],
    })),
  }),

  reports: (state: AppState) => ({
    applications: state.courses.map((c, i) => ({
      name: c.code,
      value: state.enrollments.filter((e) => e.courseId === c.id).length,
      fill: CANDY_COLORS[i % CANDY_COLORS.length],
    })),
    revenue: state.courses.map((c, i) => {
      const userIds = new Set(state.enrollments.filter((e) => e.courseId === c.id).map((e) => e.userId));
      const total = state.payments.filter((p) => userIds.has(p.userId) && p.status === "confirmed").reduce((s, p) => s + p.amount, 0);
      return { name: c.code, value: total, fill: CANDY_COLORS[i % CANDY_COLORS.length] };
    }),
  }),

  announcements: (state: AppState) => ({
    byTarget: countBy(state.announcements.map((a) => a.targetRole)),
    volume: [{ name: "Total", value: state.announcements.length, fill: "#fb7185" }],
  }),

  settings: (state: AppState) => ({
    overview: [
      { name: "Students", value: state.users.filter((u) => u.role === "student").length, fill: "#fb7185" },
      { name: "Courses", value: state.courses.length, fill: "#f43f5e" },
      { name: "Subjects", value: state.subjects.length, fill: "#dc2626" },
      { name: "Sections", value: state.sections.length, fill: "#ec4899" },
    ],
    enrollments: countBy(state.enrollments.map((e) => e.status)),
  }),
};

export const studentChartData = {
  dashboard: (state: AppState, user: User) => {
    const enrollment = helpers.enrollmentByUser(state, user.id);
    const selected = enrollment ? state.enrollmentSubjects.filter((es) => es.enrollmentId === enrollment.id).length : 0;
    const myPayments = state.payments.filter((p) => p.userId === user.id);
    const myGrades = state.grades.filter((g) => g.userId === user.id);
    return {
      progress: [
        { name: "Profile", value: user.name ? 100 : 0, fill: "#fb7185" },
        { name: "Enrollment", value: enrollment ? (enrollment.status === "enrolled" ? 100 : enrollment.status === "approved" ? 75 : 50) : 0, fill: "#f43f5e" },
        { name: "Subjects", value: Math.min(selected * 25, 100), fill: "#ec4899" },
        { name: "Payments", value: myPayments.some((p) => p.status === "confirmed") ? 100 : myPayments.length ? 50 : 0, fill: "#34d399" },
      ],
      payments: countBy(myPayments.map((p) => p.status)),
      grades: myGrades.map((g, i) => ({
        name: helpers.subjectById(state, g.subjectId)?.code ?? "?",
        value: Number.parseFloat(g.grade) || 0,
        fill: CANDY_COLORS[i % CANDY_COLORS.length],
      })),
      units: enrollment
        ? state.enrollmentSubjects
            .filter((es) => es.enrollmentId === enrollment.id)
            .map((es) => helpers.subjectById(state, es.subjectId))
            .filter(Boolean)
            .map((s, i) => ({ name: s!.code, value: s!.units, fill: CANDY_COLORS[i % CANDY_COLORS.length] }))
        : [],
    };
  },

  profile: (_state: AppState, user: User) => ({
    completion: [
      { name: "Name", value: user.name ? 100 : 0, fill: "#fb7185" },
      { name: "Email", value: user.email ? 100 : 0, fill: "#f43f5e" },
      { name: "Photo", value: user.photo ? 100 : 30, fill: "#ec4899" },
      { name: "Student #", value: user.studentNumber ? 100 : 0, fill: "#34d399" },
    ],
  }),

  enrollment: (state: AppState, user: User) => {
    const enrollment = helpers.enrollmentByUser(state, user.id);
    const picked = enrollment ? state.enrollmentSubjects.filter((es) => es.enrollmentId === enrollment.id).length : 0;
    const courseSubjects = enrollment ? state.subjects.filter((s) => s.courseId === enrollment.courseId).length : 0;
    return {
      programCompare: state.courses.map((c, i) => ({
        name: c.code,
        value: state.subjects.filter((s) => s.courseId === c.id).length,
        fill: c.id === enrollment?.courseId ? "#fb7185" : CANDY_COLORS[i % CANDY_COLORS.length],
      })),
      selection: [
        { name: "Selected", value: picked, fill: "#34d399" },
        { name: "Remaining", value: Math.max(courseSubjects - picked, 0), fill: "#475569" },
      ],
      status: enrollment ? countBy([enrollment.status]) : [{ name: "none", value: 1, fill: "#475569" }],
    };
  },

  subjects: (state: AppState, user: User) => {
    const enrollment = helpers.enrollmentByUser(state, user.id);
    const picked = enrollment ? state.enrollmentSubjects.filter((es) => es.enrollmentId === enrollment.id).map((es) => es.subjectId) : [];
    return {
      units: state.subjects.map((s, i) => ({
        name: s.code,
        value: s.units,
        fill: picked.includes(s.id) ? "#34d399" : CANDY_COLORS[i % CANDY_COLORS.length],
      })),
      selected: [
        { name: "Enrolled", value: picked.length, fill: "#34d399" },
        { name: "Available", value: Math.max(state.subjects.length - picked.length, 0), fill: "#475569" },
      ],
    };
  },

  schedule: (state: AppState, user: User) => {
    const enrollment = helpers.enrollmentByUser(state, user.id);
    const rows = enrollment
      ? state.enrollmentSubjects
          .filter((es) => es.enrollmentId === enrollment.id)
          .map((es) => {
            const subject = helpers.subjectById(state, es.subjectId);
            const section = es.sectionId ? state.sections.find((s) => s.id === es.sectionId) : state.sections.find((s) => s.subjectId === es.subjectId);
            return { subject, section };
          })
      : [];
    return {
      load: rows.map((r, i) => ({
        name: r.subject?.code ?? "?",
        value: r.subject?.units ?? 1,
        fill: CANDY_COLORS[i % CANDY_COLORS.length],
      })),
      rooms: sumBy(
        rows.filter((r) => r.section?.room),
        (r) => r.section!.room,
        () => 1,
      ),
    };
  },

  payments: (state: AppState, user: User) => {
    const myPayments = state.payments.filter((p) => p.userId === user.id);
    return {
      status: countBy(myPayments.map((p) => p.status)),
      byType: sumBy(myPayments, (p) => p.paymentType, (p) => p.amount),
      history: myPayments.map((p, i) => ({
        name: `#${p.id}`,
        value: p.amount,
        fill: STATUS_COLORS[p.status] ?? CANDY_COLORS[i % CANDY_COLORS.length],
      })),
    };
  },

  records: (state: AppState, user: User) => {
    const history = state.enrollments.filter((e) => e.userId === user.id);
    const grades = state.grades.filter((g) => g.userId === user.id);
    return {
      history: history.map((h, i) => ({
        name: helpers.courseById(state, h.courseId)?.code ?? "?",
        value: 1,
        fill: STATUS_COLORS[h.status] ?? CANDY_COLORS[i % CANDY_COLORS.length],
      })),
      grades: grades.map((g, i) => ({
        name: helpers.subjectById(state, g.subjectId)?.code ?? "?",
        value: Number.parseFloat(g.grade) || 0,
        fill: CANDY_COLORS[i % CANDY_COLORS.length],
      })),
    };
  },

  notifications: (state: AppState, user: User) => {
    const mine = state.notifications.filter((n) => n.userId === user.id);
    return {
      readSplit: [
        { name: "Unread", value: mine.filter((n) => !n.isRead).length, fill: "#fbbf24" },
        { name: "Read", value: mine.filter((n) => n.isRead).length, fill: "#34d399" },
      ],
      volume: [{ name: "Total", value: mine.length, fill: "#fb7185" }],
    };
  },

  documents: (state: AppState, user: User) => {
    const enrollment = helpers.enrollmentByUser(state, user.id);
    const lastPayment = state.payments.filter((p) => p.userId === user.id).sort((a, b) => b.id - a.id)[0];
    return {
      readiness: [
        { name: "Registration", value: enrollment ? 100 : 0, fill: "#fb7185" },
        { name: "Student ID", value: user.studentNumber ? 100 : 0, fill: "#f43f5e" },
        { name: "Receipt", value: lastPayment ? 100 : 0, fill: "#ec4899" },
        { name: "Confirmed Pay", value: lastPayment?.status === "confirmed" ? 100 : 0, fill: "#34d399" },
      ],
    };
  },
};
