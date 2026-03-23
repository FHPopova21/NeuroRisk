import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { DashboardHome } from "./components/DashboardHome";
import { AdminDashboard } from "./components/AdminDashboard";
import { DoctorManagement } from "./components/DoctorManagement";
import { PatientsPage } from "./components/PatientsPage";
import { AddPatientPage } from "./components/AddPatientPage";
import { PatientProfilePage } from "./components/PatientProfilePage";
import { EEGRecordsPage } from "./components/EEGRecordsPage";
import { AlertsPage } from "./components/AlertsPage";
import { MedicalNotesPage } from "./components/MedicalNotesPage";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardHome />,
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/doctors",
        element: (
          <ProtectedRoute requiredRole="admin">
            <DoctorManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/patients",
        element: (
          <ProtectedRoute requiredRole="admin">
            <PatientsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/alerts",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AlertsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/logs",
        element: (
          <ProtectedRoute requiredRole="admin">
            <div className="p-8">Activity Logs (Full version in next update)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "patients",
        element: (
          <ProtectedRoute requiredRole="doctor">
            <PatientsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "patients/add",
        element: (
          <ProtectedRoute requiredRole="doctor">
            <AddPatientPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "patients/:id",
        element: <PatientProfilePage />,
      },
      {
        path: "eeg-records",
        element: (
          <ProtectedRoute requiredRole="doctor">
            <EEGRecordsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "alerts",
        element: (
          <ProtectedRoute requiredRole="doctor">
            <AlertsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notes",
        element: (
          <ProtectedRoute requiredRole="doctor">
            <MedicalNotesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "admin/settings",
        element: (
          <ProtectedRoute requiredRole="admin">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
