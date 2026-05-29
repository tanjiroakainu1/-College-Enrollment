import { AppState, User } from "../../core/types";
import { adminChartData, studentChartData } from "../../core/chartData";
import { CandyArea, CandyBar, CandyDualBar, CandyLine, CandyPie, CandyRadial, ChartCard, ChartGrid } from "./CandyCharts";

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

type StudentTab = "dashboard" | "profile" | "enrollment" | "subjects" | "schedule" | "payments" | "records" | "notifications" | "documents";

export function AdminTabCharts({ tab, state }: { tab: AdminTab; state: AppState }) {
  switch (tab) {
    case "dashboard": {
      const d = adminChartData.dashboard(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Enrollment Status Mix" subtitle="Live pipeline breakdown">
            <CandyPie data={d.enrollmentStatus} />
          </ChartCard>
          <ChartCard title="Applications by Program" subtitle="Course demand radar">
            <CandyBar data={d.byCourse} />
          </ChartCard>
          <ChartCard title="Revenue by Payment Type" subtitle="Candy cash flow">
            <CandyArea data={d.paymentRevenue} currency />
          </ChartCard>
          <ChartCard title="Payment Status Pulse" subtitle="Confirm · pending · rejected">
            <CandyPie data={d.paymentStatus} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "students": {
      const d = adminChartData.students(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Active vs Inactive" subtitle="Student account health">
            <CandyPie data={d.statusSplit} />
          </ChartCard>
          <ChartCard title="Students per Program" subtitle="Enrollment distribution">
            <CandyLine data={d.perCourse} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "enrollments": {
      const d = adminChartData.enrollments(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Status Breakdown" subtitle="Pending · approved · enrolled · rejected">
            <CandyPie data={d.status} />
          </ChartCard>
          <ChartCard title="Enrollments by Course" subtitle="Where applications land">
            <CandyBar data={d.byCourse} layout="vertical" />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "courses": {
      const d = adminChartData.courses(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Capacity vs Enrolled" subtitle="Program fill rate">
            <CandyDualBar data={d.capacity} keys={["capacity", "enrolled"]} />
          </ChartCard>
          <ChartCard title="Courses by Department" subtitle="Academic spread">
            <CandyPie data={d.byDepartment} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "subjects": {
      const d = adminChartData.subjects(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Units per Subject" subtitle="Academic load map">
            <CandyBar data={d.units} layout="vertical" />
          </ChartCard>
          <ChartCard title="Subjects per Program" subtitle="Curriculum depth">
            <CandyBar data={d.perCourse} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "sections": {
      const d = adminChartData.sections(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Section Capacity" subtitle="Room limits per section">
            <CandyBar data={d.limits} layout="vertical" />
          </ChartCard>
          <ChartCard title="Sections per Subject" subtitle="Class offering density">
            <CandyPie data={d.perSubject} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "payments": {
      const d = adminChartData.payments(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Payment Status" subtitle="Confirmation pipeline">
            <CandyPie data={d.status} />
          </ChartCard>
          <ChartCard title="Revenue by Type" subtitle="Tuition · misc · fees">
            <CandyArea data={d.byType} currency />
          </ChartCard>
          <ChartCard title="Revenue by Method" subtitle="GCash · bank · PayMaya">
            <CandyBar data={d.byMethod} currency />
          </ChartCard>
          <ChartCard title="Payment Amounts" subtitle="Individual transaction bars">
            <CandyLine data={d.amounts} currency />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "reports": {
      const d = adminChartData.reports(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Applications Report" subtitle="Per program totals">
            <CandyBar data={d.applications} />
          </ChartCard>
          <ChartCard title="Confirmed Revenue" subtitle="Revenue by program">
            <CandyArea data={d.revenue} currency />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "announcements": {
      const d = adminChartData.announcements(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Audience Targeting" subtitle="All · student · admin">
            <CandyPie data={d.byTarget} />
          </ChartCard>
          <ChartCard title="Announcement Volume" subtitle="Campus broadcast pulse">
            <CandyBar data={d.volume} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "settings": {
      const d = adminChartData.settings(state);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="System Overview" subtitle="Core entity counts">
            <CandyBar data={d.overview} />
          </ChartCard>
          <ChartCard title="Enrollment Health" subtitle="Global status mix">
            <CandyPie data={d.enrollments} />
          </ChartCard>
        </ChartGrid>
      );
    }
    default:
      return null;
  }
}

export function StudentTabCharts({ tab, state, user }: { tab: StudentTab; state: AppState; user: User }) {
  switch (tab) {
    case "dashboard": {
      const d = studentChartData.dashboard(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="My Enrollment Progress" subtitle="Profile · enroll · subjects · pay">
            <CandyRadial data={d.progress} />
          </ChartCard>
          <ChartCard title="Payment Status" subtitle="Your transaction pipeline">
            <CandyPie data={d.payments} />
          </ChartCard>
          <ChartCard title="Grade Performance" subtitle="Lower is better (GPA scale)">
            <CandyBar data={d.grades} />
          </ChartCard>
          <ChartCard title="Subject Units Load" subtitle="Your enrolled units">
            <CandyBar data={d.units} layout="vertical" />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "profile": {
      const d = studentChartData.profile(state, user);
      return (
        <ChartGrid cols={1}>
          <ChartCard title="Profile Completion" subtitle="How complete is your account?">
            <CandyRadial data={d.completion} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "enrollment": {
      const d = studentChartData.enrollment(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Program Subject Count" subtitle="Your program highlighted">
            <CandyBar data={d.programCompare} />
          </ChartCard>
          <ChartCard title="Subject Selection" subtitle="Selected vs remaining">
            <CandyPie data={d.selection} />
          </ChartCard>
          <ChartCard title="Application Status" subtitle="Current enrollment state">
            <CandyPie data={d.status} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "subjects": {
      const d = studentChartData.subjects(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Units Map" subtitle="Green = your enrolled subjects">
            <CandyBar data={d.units} layout="vertical" />
          </ChartCard>
          <ChartCard title="Selected vs Available" subtitle="Your subject portfolio">
            <CandyPie data={d.selected} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "schedule": {
      const d = studentChartData.schedule(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Weekly Load (Units)" subtitle="Per scheduled subject">
            <CandyBar data={d.load} />
          </ChartCard>
          <ChartCard title="Room Distribution" subtitle="Where your classes are">
            <CandyPie data={d.rooms} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "payments": {
      const d = studentChartData.payments(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Payment Status" subtitle="Pending · confirmed · rejected">
            <CandyPie data={d.status} />
          </ChartCard>
          <ChartCard title="Spending by Type" subtitle="Tuition · misc · fees">
            <CandyArea data={d.byType} currency />
          </ChartCard>
          <ChartCard title="Payment History" subtitle="Your transaction timeline">
            <CandyLine data={d.history} currency />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "records": {
      const d = studentChartData.records(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Enrollment History" subtitle="Programs you've applied to">
            <CandyPie data={d.history} />
          </ChartCard>
          <ChartCard title="Grade Chart" subtitle="Performance by subject">
            <CandyBar data={d.grades} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "notifications": {
      const d = studentChartData.notifications(state, user);
      return (
        <ChartGrid cols={2}>
          <ChartCard title="Read vs Unread" subtitle="Inbox health">
            <CandyPie data={d.readSplit} />
          </ChartCard>
          <ChartCard title="Notification Volume" subtitle="Total alerts received">
            <CandyBar data={d.volume} />
          </ChartCard>
        </ChartGrid>
      );
    }
    case "documents": {
      const d = studentChartData.documents(state, user);
      return (
        <ChartGrid cols={1}>
          <ChartCard title="Document Readiness" subtitle="Registration · ID · receipt · payment">
            <CandyRadial data={d.readiness} />
          </ChartCard>
        </ChartGrid>
      );
    }
    default:
      return null;
  }
}
