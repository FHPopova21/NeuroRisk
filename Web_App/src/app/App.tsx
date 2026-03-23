import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

import { SettingsProvider } from "./context/SettingsContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300">
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
