import { Navigate, Route, Routes } from "react-router-dom";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { useAppStore } from "./core/store";
import { HomePage } from "./public/HomePage";
import { LoginPage } from "./public/LoginPage";
import { RegisterPage } from "./public/RegisterPage";
import { AdminApp } from "./admin/AdminApp";
import { StudentApp } from "./student/StudentApp";

function RoleGuard({ role, children }: { role: "admin" | "student"; children: React.ReactElement }) {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to={currentUser.role === "admin" ? "/admin" : "/student"} replace />;
  return children;
}

function RedirectByRole() {
  const { currentUser } = useAppStore();
  if (!currentUser) return <Navigate to="/" replace />;
  return <Navigate to={currentUser.role === "admin" ? "/admin" : "/student"} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin/*"
          element={
            <RoleGuard role="admin">
              <AdminApp />
            </RoleGuard>
          }
        />
        <Route
          path="/student/*"
          element={
            <RoleGuard role="student">
              <StudentApp />
            </RoleGuard>
          }
        />
        <Route path="/app" element={<RedirectByRole />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingChatbot />
    </>
  );
}
