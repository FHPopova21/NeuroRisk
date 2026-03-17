import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "@/app/components/ui/sonner";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
