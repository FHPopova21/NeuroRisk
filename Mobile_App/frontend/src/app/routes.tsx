import { createHashRouter } from "react-router";
import { Home } from "./components/Home";
import { History } from "./components/History";
import { Profile } from "./components/Profile";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { AnalysisDetail } from "./components/AnalysisDetail";
import { Layout } from "./components/Layout";

export const router = createHashRouter([
  {
    path: "/",
    element: <OnboardingScreen onStart={() => window.location.hash = "/login"} />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/register/:token",
    element: <Register />,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "history", Component: History },
      { path: "history/:id", Component: AnalysisDetail },
      { path: "profile", Component: Profile },
      { path: "monitoring", Component: LiveMonitoring },
    ],
  },
]);
