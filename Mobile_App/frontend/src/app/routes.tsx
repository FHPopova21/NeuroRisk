import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { History } from "./components/History";
import { Profile } from "./components/Profile";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { AnalysisDetail } from "./components/AnalysisDetail";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "history", Component: History },
      { path: "history/:id", Component: AnalysisDetail },
      { path: "profile", Component: Profile },
      { path: "monitoring", Component: LiveMonitoring },
    ],
  },
  {
    path: "/onboarding",
    element: <OnboardingScreen onStart={() => window.location.href = "/"} />,
  },
]);
