import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { PortalShell } from "../components/PortalShell";
import { AdminTabCharts } from "../components/charts/PortalCharts";
import { Badge, Button, Card, Input, Select, Stat, Textarea } from "../components/Ui";
import { helpers, nextId, nowIso, useAppStore } from "../core/store";
import { EnrollmentStatus } from "../core/types";

type AdminTab =
  | "dashboard"
  | "students"
  | "enrollments"
  | "courses"
  | "subjects"
  | "sections"
  | "payments"
  | "reports"
  | "announcements"
  | "settings";

const tabs: AdminTab[] = [
  "dashboard",
  "students",
  "enrollments",
  "courses",
  "subjects",
  "sections",
  "payments",
  "reports",
  "announcements",
  "settings",
];

export function AdminApp() {
  const { currentUser, logout, state, setState } = useAppStore();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  if (!currentUser) return <Navigate to="/login" replace />;
  const panelClass = "border-rose-400/35";
  const panelTitleClass = "text-white";
  const rowClass = "flex flex-col gap-2 rounded-xl border-2 border-rose-300/35 bg-[#3d1520] px-3 py-2.5 text-rose-50 shadow-sm transition hover:border-rose-200/60 hover:bg-[#4a1a28] sm:flex-row sm:items-center sm:justify-between";
  const fieldClass = "border-rose-300/50 bg-[#1a0810] text-white placeholder:text-rose-200/50";

  const stats = {
    students: state.users.filter((u) => u.role === "student").length,
    enrolled: state.enrollments.filter((e) => e.status === "approved" || e.status === "enrolled").length,
    pending: state.enrollments.filter((e) => e.status === "pending").length,
    courses: state.courses.length,
  };

  return (
    <PortalShell portalTitle="Admin Portal" userName={currentUser.name} tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={logout}>
      <Card
        title="Admin Control Center"
        className={panelClass}
        titleClassName={panelTitleClass}
        right={<span className="rounded-full border-2 border-rose-200/50 bg-rose-600/40 px-3 py-1 text-xs font-bold text-white">Candy Control Mode</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Students" value={stats.students} />
          <Stat label="Enrolled" value={stats.enrolled} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Courses" value={stats.courses} />
        </div>
      </Card>

      <AdminTabCharts tab={tab} state={state} />

      {tab === "dashboard" && (
        <Card title="Recent Enrollment Activity" className={panelClass} titleClassName={panelTitleClass}>
          <div className="space-y-2">
            {[...state.enrollments]
              .sort((a, b) => b.id - a.id)
              .slice(0, 8)
              .map((e) => (
                <div key={e.id} className={`${rowClass} text-sm`}>
                  <div>
                    <div className="font-semibold text-white">{helpers.userById(state, e.userId)?.name}</div>
                    <div className="text-rose-100">{helpers.courseById(state, e.courseId)?.name}</div>
                  </div>
                  <Badge value={e.status} />
                </div>
              ))}
          </div>
        </Card>
      )}

      {tab === "students" && <StudentsPanel />}
      {tab === "enrollments" && <EnrollmentsPanel />}
      {tab === "courses" && <CoursesPanel />}
      {tab === "subjects" && <SubjectsPanel />}
      {tab === "sections" && <SectionsPanel />}
      {tab === "payments" && <PaymentsPanel />}
      {tab === "reports" && <ReportsPanel />}
      {tab === "announcements" && <AnnouncementsPanel />}
      {tab === "settings" && <SettingsPanel />}
    </PortalShell>
  );

  function StudentsPanel() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
      <Card title="Student Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="mb-4 grid gap-2 md:grid-cols-4">
          <Input className={fieldClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input className={fieldClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input className={fieldClass} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button
            onClick={() => {
              if (!name || !email || !password) return;
              setState((prev) => ({
                ...prev,
                users: [{ id: nextId(prev.users), name, email, password, role: "student", status: "active" }, ...prev.users],
              }));
              setName("");
              setEmail("");
              setPassword("");
            }}
          >
            Add Student
          </Button>
        </div>
        <div className="space-y-2">
          {state.users
            .filter((u) => u.role === "student")
            .map((u) => (
              <div key={u.id} className={rowClass}>
                <div>
                  <div className="font-semibold text-white">{u.name}</div>
                  <div className="text-sm text-rose-200/70">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={u.status} />
                  <Button
                    className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233]"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        users: prev.users.map((x) => (x.id === u.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x)),
                      }))
                    }
                  >
                    Toggle
                  </Button>
                  <Button
                    className="!border-red-200 !from-red-700 !to-red-800"
                    onClick={() => setState((prev) => ({ ...prev, users: prev.users.filter((x) => x.id !== u.id) }))}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    );
  }

  function EnrollmentsPanel() {
    const setStatus = (id: number, status: EnrollmentStatus) => {
      setState((prev) => {
        const target = prev.enrollments.find((e) => e.id === id);
        if (!target) return prev;
        const updated = prev.enrollments.map((e) => (e.id === id ? { ...e, status, updatedAt: nowIso() } : e));
        const u = prev.users.find((x) => x.id === target.userId);
        const users =
          status === "approved" && u && !u.studentNumber
            ? prev.users.map((x) =>
                x.id === u.id ? { ...x, studentNumber: `S${new Date().getFullYear()}${String(u.id).padStart(5, "0")}` } : x,
              )
            : prev.users;
        const note = { id: nextId(prev.notifications), userId: target.userId, message: `Your enrollment is now ${status}.`, isRead: false, createdAt: nowIso() };
        return { ...prev, users, enrollments: updated, notifications: [note, ...prev.notifications] };
      });
    };

    return (
      <Card title="Enrollment Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="space-y-2">
          {state.enrollments.map((e) => (
            <div key={e.id} className={rowClass}>
              <div>
                <div className="font-semibold text-white">{helpers.userById(state, e.userId)?.name}</div>
                <div className="text-sm text-rose-200/70">{helpers.courseById(state, e.courseId)?.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge value={e.status} />
                <Button className="!border-emerald-200 !from-emerald-600 !to-emerald-700" onClick={() => setStatus(e.id, "approved")}>
                  Approve
                </Button>
                <Button className="!border-red-200 !from-red-700 !to-red-800" onClick={() => setStatus(e.id, "rejected")}>
                  Reject
                </Button>
                <Button className="!border-pink-200 !from-pink-600 !to-pink-700" onClick={() => setStatus(e.id, "enrolled")}>Enrolled</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function CoursesPanel() {
    const [form, setForm] = useState({ id: 0, code: "", name: "", capacity: "40", department: "" });
    return (
      <Card title="Course Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="mb-4 grid gap-2 md:grid-cols-5">
          <Input className={fieldClass} placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input className={fieldClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input className={fieldClass} placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          <Input className={fieldClass} placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <Button
            onClick={() => {
              if (!form.code || !form.name || !form.department) return;
              const cap = Number(form.capacity) || 40;
              if (form.id) {
                setState((prev) => ({
                  ...prev,
                  courses: prev.courses.map((c) => (c.id === form.id ? { ...c, code: form.code, name: form.name, capacity: cap, department: form.department } : c)),
                }));
              } else {
                setState((prev) => ({
                  ...prev,
                  courses: [...prev.courses, { id: nextId(prev.courses), code: form.code, name: form.name, capacity: cap, department: form.department }],
                }));
              }
              setForm({ id: 0, code: "", name: "", capacity: "40", department: "" });
            }}
          >
            {form.id ? "Update" : "Add"}
          </Button>
        </div>
        <div className="space-y-2">
          {state.courses.map((c) => (
            <div key={c.id} className={rowClass}>
              <div>
                <div className="font-semibold text-white">
                  {c.code} - {c.name}
                </div>
                <div className="text-sm text-rose-200/70">
                  {c.department} | Capacity: {c.capacity}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233]" onClick={() => setForm({ id: c.id, code: c.code, name: c.name, capacity: String(c.capacity), department: c.department })}>
                  Edit
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setState((prev) => ({ ...prev, courses: prev.courses.filter((x) => x.id !== c.id) }))}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function SubjectsPanel() {
    const [form, setForm] = useState({ id: 0, courseId: String(state.courses[0]?.id ?? 1), code: "", name: "", units: "3", prerequisite: "" });
    return (
      <Card title="Subject Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="mb-4 grid gap-2 md:grid-cols-6">
          <Select className={fieldClass} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            {state.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </Select>
          <Input className={fieldClass} placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input className={fieldClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input className={fieldClass} placeholder="Units" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
          <Input className={fieldClass} placeholder="Prerequisite" value={form.prerequisite} onChange={(e) => setForm({ ...form, prerequisite: e.target.value })} />
          <Button
            onClick={() => {
              if (!form.code || !form.name) return;
              const payload = {
                id: form.id || nextId(state.subjects),
                courseId: Number(form.courseId),
                code: form.code,
                name: form.name,
                units: Number(form.units) || 3,
                prerequisite: form.prerequisite || undefined,
              };
              setState((prev) => ({
                ...prev,
                subjects: form.id ? prev.subjects.map((s) => (s.id === form.id ? payload : s)) : [...prev.subjects, payload],
              }));
              setForm({ id: 0, courseId: String(state.courses[0]?.id ?? 1), code: "", name: "", units: "3", prerequisite: "" });
            }}
          >
            {form.id ? "Update" : "Add"}
          </Button>
        </div>
        <div className="space-y-2">
          {state.subjects.map((s) => (
            <div key={s.id} className={rowClass}>
              <div>
                <div className="font-semibold text-white">
                  {s.code} - {s.name}
                </div>
                <div className="text-sm text-rose-200/70">
                  {helpers.courseById(state, s.courseId)?.code} | Units: {s.units} | Prereq: {s.prerequisite || "-"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233]"
                  onClick={() =>
                    setForm({
                      id: s.id,
                      courseId: String(s.courseId),
                      code: s.code,
                      name: s.name,
                      units: String(s.units),
                      prerequisite: s.prerequisite || "",
                    })
                  }
                >
                  Edit
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setState((prev) => ({ ...prev, subjects: prev.subjects.filter((x) => x.id !== s.id) }))}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function SectionsPanel() {
    const [form, setForm] = useState({ id: 0, subjectId: String(state.subjects[0]?.id ?? 1), name: "", schedule: "", room: "", studentLimit: "40" });
    return (
      <Card title="Section Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="mb-4 grid gap-2 md:grid-cols-6">
          <Select className={fieldClass} value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </Select>
          <Input className={fieldClass} placeholder="Section" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input className={fieldClass} placeholder="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
          <Input className={fieldClass} placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <Input className={fieldClass} placeholder="Limit" value={form.studentLimit} onChange={(e) => setForm({ ...form, studentLimit: e.target.value })} />
          <Button
            onClick={() => {
              if (!form.name || !form.schedule || !form.room) return;
              const payload = {
                id: form.id || nextId(state.sections),
                subjectId: Number(form.subjectId),
                name: form.name,
                schedule: form.schedule,
                room: form.room,
                studentLimit: Number(form.studentLimit) || 40,
              };
              setState((prev) => ({
                ...prev,
                sections: form.id ? prev.sections.map((s) => (s.id === form.id ? payload : s)) : [...prev.sections, payload],
              }));
              setForm({ id: 0, subjectId: String(state.subjects[0]?.id ?? 1), name: "", schedule: "", room: "", studentLimit: "40" });
            }}
          >
            {form.id ? "Update" : "Add"}
          </Button>
        </div>
        <div className="space-y-2">
          {state.sections.map((s) => (
            <div key={s.id} className={rowClass}>
              <div>
                <div className="font-semibold text-white">
                  {helpers.subjectById(state, s.subjectId)?.code} - {s.name}
                </div>
                <div className="text-sm text-rose-200/70">
                  {s.schedule} | {s.room} | Limit {s.studentLimit}
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233]" onClick={() => setForm({ ...s, subjectId: String(s.subjectId), studentLimit: String(s.studentLimit) })}>
                  Edit
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setState((prev) => ({ ...prev, sections: prev.sections.filter((x) => x.id !== s.id) }))}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function PaymentsPanel() {
    return (
      <Card title="Payment Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="space-y-2">
          {state.payments.map((p) => (
            <div key={p.id} className={rowClass}>
              <div>
                <div className="font-semibold text-white">
                  {helpers.userById(state, p.userId)?.name} - ₱{p.amount.toLocaleString()}
                </div>
                <div className="text-sm text-rose-200/70">
                  {p.paymentType} | {p.paymentMethod} | {p.referenceNo}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge value={p.status} />
                <Button
                  className="!border-emerald-200 !from-emerald-600 !to-emerald-700"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      payments: prev.payments.map((x) => (x.id === p.id ? { ...x, status: "confirmed", updatedAt: nowIso() } : x)),
                      notifications: [
                        { id: nextId(prev.notifications), userId: p.userId, message: "Your payment has been confirmed.", isRead: false, createdAt: nowIso() },
                        ...prev.notifications,
                      ],
                    }))
                  }
                >
                  Confirm
                </Button>
                <Button
                  className="!border-red-200 !from-red-700 !to-red-800"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      payments: prev.payments.map((x) => (x.id === p.id ? { ...x, status: "rejected", updatedAt: nowIso() } : x)),
                      notifications: [
                        { id: nextId(prev.notifications), userId: p.userId, message: "Your payment was rejected.", isRead: false, createdAt: nowIso() },
                        ...prev.notifications,
                      ],
                    }))
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function ReportsPanel() {
    const byCourse = useMemo(
      () =>
        state.courses.map((c) => ({
          course: c,
          total: state.enrollments.filter((e) => e.courseId === c.id).length,
        })),
      [state.courses, state.enrollments],
    );
    return (
      <Card title="Reports" className={panelClass} titleClassName={panelTitleClass}>
        <div className="space-y-2">
          {byCourse.map((row) => (
            <div key={row.course.id} className={rowClass}>
              <span className="font-semibold text-white">
                {row.course.code} - {row.course.name}
              </span>
              <span className="text-sm text-rose-200/70">{row.total} applications</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function AnnouncementsPanel() {
    const [form, setForm] = useState({ id: 0, title: "", body: "", targetRole: "all" as "all" | "admin" | "student" });
    return (
      <Card title="Announcement Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="mb-4 grid gap-2 md:grid-cols-3">
          <Input className={fieldClass} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select className={fieldClass} value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value as "all" | "admin" | "student" })}>
            <option value="all">All</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </Select>
          <Button
            onClick={() => {
              if (!form.title || !form.body) return;
              const payload = { ...form, id: form.id || nextId(state.announcements), createdAt: form.id ? state.announcements.find((a) => a.id === form.id)?.createdAt || nowIso() : nowIso() };
              setState((prev) => ({
                ...prev,
                announcements: form.id ? prev.announcements.map((a) => (a.id === form.id ? payload : a)) : [payload, ...prev.announcements],
              }));
              setForm({ id: 0, title: "", body: "", targetRole: "all" });
            }}
          >
            {form.id ? "Update" : "Post"}
          </Button>
        </div>
        <Textarea className={fieldClass} rows={4} placeholder="Announcement details..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <div className="mt-3 space-y-2">
          {state.announcements.map((a) => (
            <div key={a.id} className="rounded-xl border border-rose-300/20 bg-[#1a0608]/70 p-3 shadow-[0_0_14px_rgba(244,63,94,0.1)]">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{a.title}</div>
                <Badge value={a.targetRole} />
              </div>
              <p className="mt-1 text-sm text-rose-100">{a.body}</p>
              <div className="mt-2 flex gap-2">
                <Button className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233]" onClick={() => setForm({ id: a.id, title: a.title, body: a.body, targetRole: a.targetRole })}>
                  Edit
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setState((prev) => ({ ...prev, announcements: prev.announcements.filter((x) => x.id !== a.id) }))}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function SettingsPanel() {
    const [year, setYear] = useState(state.settings.academicYear);
    const [semester, setSemester] = useState(state.settings.semester);
    return (
      <Card title="Settings" className={panelClass} titleClassName={panelTitleClass}>
        <div className="grid gap-2 md:grid-cols-3">
          <Input className={fieldClass} value={year} onChange={(e) => setYear(e.target.value)} placeholder="Academic Year" />
          <Input className={fieldClass} value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester" />
          <Button onClick={() => setState((prev) => ({ ...prev, settings: { academicYear: year, semester } }))}>Save</Button>
        </div>
      </Card>
    );
  }
}
