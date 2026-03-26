import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Clock, User } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", icon: Home, label: "Начало" },
    { path: "/history", icon: Clock, label: "История" },
    { path: "/profile", icon: User, label: "Профил" },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
