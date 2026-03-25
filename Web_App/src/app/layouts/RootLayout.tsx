import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react";

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentView={location.pathname.substring(1)} 
        userRole={user?.role || "doctor"} 
        isOpen={isSidebarOpen}
        onChangeView={(view) => {
          navigate(`/${view}`);
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 h-[100dvh] min-w-0 transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-black text-slate-900 tracking-tight text-lg">NeuroRisk</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
            {(user?.name || user?.username || "U")[0]}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
