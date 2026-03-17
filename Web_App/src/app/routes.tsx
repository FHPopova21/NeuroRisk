import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { DashboardHome } from "@/app/components/DashboardHome";
import { PatientsPage } from "@/app/components/PatientsPage";
import { AddPatientPage } from "@/app/components/AddPatientPage";
import { PatientProfilePage } from "@/app/components/PatientProfilePage";
import { EEGRecordsPage } from "@/app/components/EEGRecordsPage";
import { AlertsPage } from "@/app/components/AlertsPage";
import { MedicalNotesPage } from "@/app/components/MedicalNotesPage";
import { ProfilePage } from "@/app/components/ProfilePage";
import { RootLayout } from "@/app/layouts/RootLayout";

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
    element: <RootLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardHome />,
      },
      {
        path: "patients",
        element: <PatientsPage />,
      },
      {
        path: "patients/add",
        element: <AddPatientPage />,
      },
      {
        path: "patients/:id",
        element: <PatientProfilePage />,
      },
      {
        path: "eeg-records",
        element: <EEGRecordsPage />,
      },
      {
        path: "alerts",
        element: <AlertsPage />,
      },
      {
        path: "notes",
        element: <MedicalNotesPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
