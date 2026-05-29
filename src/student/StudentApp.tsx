import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { PortalShell } from "../components/PortalShell";
import { StudentTabCharts } from "../components/charts/PortalCharts";
import { Badge, Button, Card, Input, Select, Stat, Textarea } from "../components/Ui";
import { helpers, nextId, nowIso, useAppStore } from "../core/store";

type StudentTab = "dashboard" | "profile" | "enrollment" | "subjects" | "schedule" | "payments" | "records" | "notifications" | "documents";

const tabs: StudentTab[] = ["dashboard", "profile", "enrollment", "subjects", "schedule", "payments", "records", "notifications", "documents"];

export function StudentApp() {
  const { currentUser, logout, state, setState } = useAppStore();
  const [tab, setTab] = useState<StudentTab>("dashboard");
  if (!currentUser) return <Navigate to="/login" replace />;
  const user = currentUser;

  const enrollment = helpers.enrollmentByUser(state, user.id);
  const selectedSubjects = enrollment ? state.enrollmentSubjects.filter((es) => es.enrollmentId === enrollment.id) : [];
  const announcements = state.announcements.filter((a) => a.targetRole === "all" || a.targetRole === "student");
  const notifications = state.notifications.filter((n) => n.userId === user.id).sort((a, b) => b.id - a.id);

  const panelClass = "border-rose-400/35";
  const panelTitleClass = "text-white";
  const rowClass = "rounded-xl border-2 border-rose-300/35 bg-[#3d1520] px-3 py-2.5 text-rose-50 shadow-sm transition hover:border-rose-200/60 hover:bg-[#4a1a28]";
  const actionRowClass = `${rowClass} flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`;

  return (
    <PortalShell portalTitle="Student Portal" userName={user.name} tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={logout}>
      <Card title="Student Dashboard" className={panelClass} titleClassName={panelTitleClass}>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Stat label="Enrollment Status" value={enrollment?.status ?? "no_application"} />
          <Stat label="Current Program" value={enrollment ? helpers.courseById(state, enrollment.courseId)?.code ?? "-" : "-"} />
          <Stat label="Selected Subjects" value={selectedSubjects.length} />
        </div>
      </Card>

      <StudentTabCharts tab={tab} state={state} user={user} />

      {tab === "dashboard" && (
        <Card title="Announcements" className={panelClass} titleClassName={panelTitleClass}>
          <div className="space-y-2">
            {announcements.map((a) => (
              <article key={a.id} className={`${rowClass} candy-card-hover`}>
                <div className="font-semibold text-white">{a.title}</div>
                <p className="text-sm text-rose-100">{a.body}</p>
              </article>
            ))}
          </div>
        </Card>
      )}

      {tab === "profile" && <ProfilePanel />}
      {tab === "enrollment" && <EnrollmentPanel />}
      {tab === "subjects" && <SubjectsPanel />}
      {tab === "schedule" && <SchedulePanel />}
      {tab === "payments" && <PaymentsPanel />}
      {tab === "records" && <RecordsPanel />}
      {tab === "notifications" && <NotificationsPanel />}
      {tab === "documents" && <DocumentsPanel />}
    </PortalShell>
  );

  function ProfilePanel() {
    const [name, setName] = useState(user.name);
    const [photo, setPhoto] = useState(user.photo ?? "");
    return (
      <Card title="Profile Management" className={panelClass} titleClassName={panelTitleClass}>
        <div className="grid gap-2 md:grid-cols-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Photo URL" />
          <Button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                users: prev.users.map((u) => (u.id === user.id ? { ...u, name, photo } : u)),
              }))
            }
          >
            Save
          </Button>
        </div>
        <p className="mt-3 text-sm text-rose-200/70">Email: {user.email}</p>
        <p className="text-sm text-rose-200/70">Student Number: {user.studentNumber ?? "-"}</p>
      </Card>
    );
  }

  function EnrollmentPanel() {
    const [courseId, setCourseId] = useState(String(enrollment?.courseId ?? state.courses[0]?.id ?? 1));
    const [picked, setPicked] = useState<number[]>(selectedSubjects.map((s) => s.subjectId));
    const subjects = state.subjects.filter((s) => s.courseId === Number(courseId));
    return (
      <Card title="Enrollment Application" className={panelClass} titleClassName={panelTitleClass}>
        <div className="space-y-3">
          <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {state.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-2 md:grid-cols-2">
            {subjects.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-xl border border-rose-300/25 bg-[#120308]/50 p-2 text-sm text-rose-100">
                <input type="checkbox" checked={picked.includes(s.id)} onChange={() => setPicked((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))} />
                {s.code} - {s.name}
              </label>
            ))}
          </div>
          <Button
            onClick={() =>
              setState((prev) => {
                const existing = helpers.enrollmentByUser(prev, user.id);
                let enrollmentId = existing?.id;
                let enrollments = prev.enrollments;
                if (!enrollmentId) {
                  enrollmentId = nextId(prev.enrollments);
                  enrollments = [...prev.enrollments, { id: enrollmentId, userId: user.id, courseId: Number(courseId), status: "pending", submittedAt: nowIso(), updatedAt: nowIso() }];
                } else {
                  enrollments = prev.enrollments.map((e) => (e.id === enrollmentId ? { ...e, courseId: Number(courseId), status: "pending", updatedAt: nowIso() } : e));
                }
                const enrollmentSubjects = [
                  ...prev.enrollmentSubjects.filter((es) => es.enrollmentId !== enrollmentId),
                  ...picked.map((subjectId, idx) => ({ id: nextId(prev.enrollmentSubjects) + idx, enrollmentId: enrollmentId!, subjectId })),
                ];
                return { ...prev, enrollments, enrollmentSubjects };
              })
            }
          >
            Submit Enrollment
          </Button>
        </div>
      </Card>
    );
  }

  function SubjectsPanel() {
    const all = state.subjects;
    const enrollmentId = enrollment?.id;
    const picked = enrollmentId ? state.enrollmentSubjects.filter((es) => es.enrollmentId === enrollmentId).map((es) => es.subjectId) : [];
    const toggle = (subjectId: number) => {
      if (!enrollmentId) return;
      setState((prev) => {
        const exists = prev.enrollmentSubjects.find((es) => es.enrollmentId === enrollmentId && es.subjectId === subjectId);
        return exists
          ? { ...prev, enrollmentSubjects: prev.enrollmentSubjects.filter((es) => es.id !== exists.id) }
          : { ...prev, enrollmentSubjects: [...prev.enrollmentSubjects, { id: nextId(prev.enrollmentSubjects), enrollmentId, subjectId }] };
      });
    };
    return (
      <Card title="Subject Management" className={panelClass} titleClassName={panelTitleClass}>
        {!enrollment && <p className="text-sm text-rose-200/70">Submit enrollment first.</p>}
        <div className="space-y-2">
          {all.map((s) => (
            <div key={s.id} className={actionRowClass}>
              <div>
                <div className="font-semibold text-rose-50">
                  {s.code} - {s.name}
                </div>
                <div className="text-xs text-rose-200/60">Units: {s.units}</div>
              </div>
              <Button disabled={!enrollment} className={picked.includes(s.id) ? "!border-red-200 !from-red-700 !to-red-800" : "!border-emerald-200 !from-emerald-600 !to-emerald-700"} onClick={() => toggle(s.id)}>
                {picked.includes(s.id) ? "Drop" : "Add"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function SchedulePanel() {
    const rows = selectedSubjects.map((es) => {
      const subject = helpers.subjectById(state, es.subjectId);
      const section = es.sectionId ? state.sections.find((s) => s.id === es.sectionId) : state.sections.find((s) => s.subjectId === es.subjectId);
      return { subject, section };
    });
    return (
      <Card title="Class Schedule" className={panelClass} titleClassName={panelTitleClass}>
        {rows.length === 0 ? (
          <p className="text-sm text-rose-200/70">No schedule yet. Complete enrollment and add subjects to generate your class timetable.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-rose-300/35">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-rose-600/50 text-white">
                <tr>
                  <th className="px-3 py-2 font-semibold">Subject</th>
                  <th className="px-3 py-2 font-semibold">Section</th>
                  <th className="px-3 py-2 font-semibold">Schedule</th>
                  <th className="px-3 py-2 font-semibold">Room</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.subject?.id ?? "subject"}-${i}`} className="border-t border-rose-300/25 odd:bg-[#3d1520] even:bg-[#2a1018]">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-white">{r.subject?.code ?? "-"}</div>
                      <div className="text-xs text-rose-100">{r.subject?.name ?? "Unknown subject"}</div>
                    </td>
                    <td className="px-3 py-2 text-rose-50">{r.section?.name ?? "TBA"}</td>
                    <td className="px-3 py-2 text-rose-50">{r.section?.schedule ?? "Schedule to be assigned"}</td>
                    <td className="px-3 py-2 text-rose-50">{r.section?.room ?? "TBA"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  function PaymentsPanel() {
    const [form, setForm] = useState({
      id: 0,
      amount: "",
      paymentType: "tuition",
      paymentMethod: "gcash",
      referenceNo: "",
      payerName: user.name,
      paymentDate: new Date().toISOString().slice(0, 10),
      proof: "",
      remarks: "",
    });
    const myPayments = state.payments.filter((p) => p.userId === user.id).sort((a, b) => b.id - a.id);
    const save = () => {
      if (!enrollment || !form.amount || !form.referenceNo || !form.payerName) return;
      const payload = {
        id: form.id || nextId(state.payments),
        userId: user.id,
        enrollmentId: enrollment.id,
        amount: Number(form.amount),
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        referenceNo: form.referenceNo,
        payerName: form.payerName,
        paymentDate: form.paymentDate,
        proof: form.proof || undefined,
        remarks: form.remarks || undefined,
        status: "pending" as const,
        paidAt: nowIso(),
      };
      setState((prev) => ({
        ...prev,
        payments: form.id ? prev.payments.map((p) => (p.id === form.id ? { ...p, ...payload, updatedAt: nowIso() } : p)) : [payload, ...prev.payments],
      }));
      setForm({ id: 0, amount: "", paymentType: "tuition", paymentMethod: "gcash", referenceNo: "", payerName: user.name, paymentDate: new Date().toISOString().slice(0, 10), proof: "", remarks: "" });
    };
    return (
      <Card title="Payments" className={panelClass} titleClassName={panelTitleClass}>
        <div className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
            <option value="tuition">Tuition</option>
            <option value="miscellaneous">Miscellaneous</option>
            <option value="enrollment_fee">Enrollment Fee</option>
          </Select>
          <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="gcash">GCash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paymaya">PayMaya</option>
          </Select>
          <Input placeholder="Reference No" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
          <Input placeholder="Payer Name" value={form.payerName} onChange={(e) => setForm({ ...form, payerName: e.target.value })} />
          <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <Input placeholder="Proof note" value={form.proof} onChange={(e) => setForm({ ...form, proof: e.target.value })} />
          <Input placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </div>
        <div className="mt-2 flex gap-2">
          <Button onClick={save}>{form.id ? "Update Payment" : "Submit Payment"}</Button>
          {form.id > 0 && (
            <Button className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520] hover:!from-[#5c2233] hover:!to-[#4a1a28]" onClick={() => setForm({ id: 0, amount: "", paymentType: "tuition", paymentMethod: "gcash", referenceNo: "", payerName: user.name, paymentDate: new Date().toISOString().slice(0, 10), proof: "", remarks: "" })}>
              Cancel
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {myPayments.map((p) => (
            <div key={p.id} className={actionRowClass}>
              <div>
                <div className="font-semibold text-rose-50">
                  ₱{p.amount.toLocaleString()} - {p.paymentType}
                </div>
                <div className="text-xs text-rose-200/60">{p.referenceNo}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge value={p.status} />
                {p.status === "pending" && (
                  <>
                    <Button className="!border-rose-200 !from-[#4a1a28] !to-[#3d1520]" onClick={() => setForm({ id: p.id, amount: String(p.amount), paymentType: p.paymentType, paymentMethod: p.paymentMethod, referenceNo: p.referenceNo, payerName: p.payerName, paymentDate: p.paymentDate, proof: p.proof ?? "", remarks: p.remarks ?? "" })}>
                      Edit
                    </Button>
                    <Button className="!border-red-200 !from-red-700 !to-red-800" onClick={() => setState((prev) => ({ ...prev, payments: prev.payments.filter((x) => x.id !== p.id) }))}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function RecordsPanel() {
    const history = state.enrollments.filter((e) => e.userId === user.id).sort((a, b) => b.id - a.id);
    const grades = state.grades.filter((g) => g.userId === user.id);
    return (
      <div className="space-y-4">
        <Card title="Enrollment History" className={panelClass} titleClassName={panelTitleClass}>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className={actionRowClass}>
                <div className="text-rose-50">{helpers.courseById(state, h.courseId)?.name}</div>
                <Badge value={h.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Grades" className={panelClass} titleClassName={panelTitleClass}>
          <div className="space-y-2">
            {grades.map((g) => (
              <div key={g.id} className={actionRowClass}>
                <div className="text-rose-50">
                  {helpers.subjectById(state, g.subjectId)?.code} - {g.term}
                </div>
                <strong className="text-rose-100">{g.grade}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function NotificationsPanel() {
    return (
      <Card title="Notifications" className={panelClass} titleClassName={panelTitleClass}>
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={rowClass}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-rose-50">{n.message}</div>
                <span className="text-xs text-rose-200/60">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function DocumentsPanel() {
    const lastPayment = state.payments.filter((p) => p.userId === user.id).sort((a, b) => b.id - a.id)[0];
    return (
      <div className="space-y-4">
        <Card title="Registration Form" className={panelClass} titleClassName={panelTitleClass}>
          {enrollment ? (
            <div className="grid gap-2 text-sm text-rose-100/85 md:grid-cols-2">
              <div>Student: {user.name}</div>
              <div>Student Number: {user.studentNumber || "-"}</div>
              <div>Program: {helpers.courseById(state, enrollment.courseId)?.name}</div>
              <div>Status: <Badge value={enrollment.status} /></div>
            </div>
          ) : (
            <p className="text-sm text-rose-200/70">No enrollment record yet.</p>
          )}
        </Card>
        <Card title="Enrollment Receipt" className={panelClass} titleClassName={panelTitleClass}>
          {lastPayment ? (
            <div className="grid gap-2 text-sm text-rose-100/85 md:grid-cols-2">
              <div>Amount: ₱{lastPayment.amount.toLocaleString()}</div>
              <div>Reference: {lastPayment.referenceNo}</div>
              <div>Method: {lastPayment.paymentMethod}</div>
              <div>Status: <Badge value={lastPayment.status} /></div>
            </div>
          ) : (
            <p className="text-sm text-rose-200/70">No payment record yet.</p>
          )}
        </Card>
      </div>
    );
  }
}
