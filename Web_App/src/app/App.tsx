import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

export default App;
