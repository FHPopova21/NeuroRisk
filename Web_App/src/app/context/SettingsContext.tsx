import React, { createContext, useContext, useState, useEffect } from "react";

interface Settings {
  language: string;
  timezone: string;
  realTimeEEG: boolean;
  autoSaveNotes: boolean;
  riskIndicators: boolean;
  highRiskNotifications: boolean;
  patientUpdateNotifications: boolean;
  systemMaintenanceNotifications: boolean;
  deliveryMethod: "browser" | "email";
  twoFactorAuth: boolean;
  anonymizeEEG: boolean;
  publicProfile: boolean;
  theme: "light" | "dark" | "system";
  screenReader: boolean;
  textDensity: "Compact" | "Standard" | "Relaxed";
}

const DEFAULT_SETTINGS: Settings = {
  language: "English (US)",
  timezone: "(GMT+02:00) Sofia",
  realTimeEEG: true,
  autoSaveNotes: true,
  riskIndicators: true,
  highRiskNotifications: true,
  patientUpdateNotifications: false,
  systemMaintenanceNotifications: true,
  deliveryMethod: "browser",
  twoFactorAuth: false,
  anonymizeEEG: true,
  publicProfile: false,
  theme: "light",
  screenReader: false,
  textDensity: "Standard",
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("app_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem("app_settings", JSON.stringify(settings));
    
    // Apply theme immediately
    applyTheme(settings.theme);
  };

  const applyTheme = (theme: "light" | "dark" | "system") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
