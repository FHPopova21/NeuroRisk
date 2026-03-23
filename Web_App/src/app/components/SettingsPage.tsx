import React, { useState } from "react";
import { 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone, 
  Save,
  ArrowLeft,
  Shield,
  Eye,
  Volume2,
  Activity,
  Users,
  Settings as SettingsIcon,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSettings } from "../context/SettingsContext";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSetting, saveSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    saveSettings();
    toast.success("Settings saved successfully");
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "display", label: "Display", icon: Moon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Platform Settings</h1>
            <p className="text-slate-500 font-medium tracking-tight">Configure your clinical environment and preferences.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </header>

      <div className="grid md:grid-cols-4 gap-8">
        {/* TAB NAVIGATION */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10"
          >
            {activeTab === "general" && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Localization</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-700">Language</label>
                       <select 
                         value={settings.language}
                         onChange={(e) => updateSetting("language", e.target.value)}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                       >
                         <option>English (US)</option>
                         <option>Bulgarian (BG)</option>
                         <option>German (DE)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-700">Time Zone</label>
                       <select 
                         value={settings.timezone}
                         onChange={(e) => updateSetting("timezone", e.target.value)}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                       >
                         <option>(GMT+02:00) Sofia</option>
                         <option>(GMT+00:00) London</option>
                         <option>(GMT-05:00) New York</option>
                       </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Preferences</h3>
                  <div className="space-y-4">
                    <ToggleItem 
                      label="Enable Real-time EEG Streaming" 
                      description="Show live signal data in monitoring view" 
                      checked={settings.realTimeEEG}
                      onChange={(val) => updateSetting("realTimeEEG", val)}
                      icon={Activity} 
                    />
                    <ToggleItem 
                      label="Auto-save Medical Notes" 
                      description="Automatically save progress during consultations" 
                      checked={settings.autoSaveNotes}
                      onChange={(val) => updateSetting("autoSaveNotes", val)}
                      icon={Save} 
                    />
                    <ToggleItem 
                      label="Show Risk Level Indicators" 
                      description="Display color-coded risk alerts in patient list" 
                      checked={settings.riskIndicators}
                      onChange={(val) => updateSetting("riskIndicators", val)}
                      icon={Shield} 
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alert Subscriptions</h3>
                  <div className="space-y-4">
                    <ToggleItem 
                      label="High Risk Detection" 
                      description="Get notified immediately when a high risk event is detected" 
                      checked={settings.highRiskNotifications}
                      onChange={(val) => updateSetting("highRiskNotifications", val)}
                      icon={Bell} 
                    />
                    <ToggleItem 
                      label="Patient Updates" 
                      description="Notifications for new patient registrations or profile edits" 
                      checked={settings.patientUpdateNotifications}
                      onChange={(val) => updateSetting("patientUpdateNotifications", val)}
                      icon={Users} 
                    />
                    <ToggleItem 
                      label="System Maintenance" 
                      description="Alerts about scheduled downtime or updates" 
                      checked={settings.systemMaintenanceNotifications}
                      onChange={(val) => updateSetting("systemMaintenanceNotifications", val)}
                      icon={SettingsIcon} 
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Delivery Methods</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateSetting("deliveryMethod", "browser")}
                      className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${settings.deliveryMethod === "browser" ? "bg-emerald-50 border-emerald-100 shadow-sm" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}
                    >
                      <div className={`p-2 rounded-lg ${settings.deliveryMethod === "browser" ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"}`}><Globe className="w-5 h-5"/></div>
                      <span className={`font-bold ${settings.deliveryMethod === "browser" ? "text-emerald-900" : "text-slate-700"}`}>In-App Browser</span>
                    </button>
                    <button 
                      onClick={() => updateSetting("deliveryMethod", "email")}
                      className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${settings.deliveryMethod === "email" ? "bg-emerald-50 border-emerald-100 shadow-sm" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}
                    >
                      <div className={`p-2 rounded-lg ${settings.deliveryMethod === "email" ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"}`}><Mail className="w-5 h-5"/></div>
                      <span className={`font-bold ${settings.deliveryMethod === "email" ? "text-emerald-900" : "text-slate-700"}`}>Email Digest</span>
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privacy Settings</h3>
                  <div className="space-y-4">
                    <ToggleItem 
                      label="Two-Factor Authentication" 
                      description="Add extra security to your doctor account" 
                      checked={settings.twoFactorAuth}
                      onChange={(val) => updateSetting("twoFactorAuth", val)}
                      icon={Lock} 
                    />
                    <ToggleItem 
                      label="Anonymize EEG Export" 
                      description="Remove patient metadata when exporting clinical data" 
                      checked={settings.anonymizeEEG}
                      onChange={(val) => updateSetting("anonymizeEEG", val)}
                      icon={Eye} 
                    />
                    <ToggleItem 
                      label="Public Profile Visibility" 
                      description="Allow other clinicians to find your professional profile" 
                      checked={settings.publicProfile}
                      onChange={(val) => updateSetting("publicProfile", val)}
                      icon={Globe} 
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "display" && (
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Theme Preferences</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <ThemeCard label="Light" active={settings.theme === "light"} onClick={() => updateSetting("theme", "light")} icon={Sun} color="bg-white" />
                    <ThemeCard label="Dark" active={settings.theme === "dark"} onClick={() => updateSetting("theme", "dark")} icon={Moon} color="bg-slate-900" />
                    <ThemeCard label="System" active={settings.theme === "system"} onClick={() => updateSetting("theme", "system")} icon={Smartphone} color="bg-slate-100" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Accessibility</h3>
                  <div className="space-y-4">
                    <ToggleItem 
                      label="Screen Reader Support" 
                      description="Optimize UI elements for screen reading software" 
                      checked={settings.screenReader}
                      onChange={(val) => updateSetting("screenReader", val)}
                      icon={Volume2} 
                    />
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-700">Text Density</label>
                       <div className="flex gap-2">
                         {['Compact', 'Standard', 'Relaxed'].map((t) => (
                           <button 
                             key={t} 
                             onClick={() => updateSetting("textDensity", t as any)}
                             className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${settings.textDensity === t ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                           >
                             {t}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, description, checked, onChange, icon: Icon }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void, icon: any }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
      <div className="flex gap-4">
        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{label}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-all ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

const ThemeCard = ({ label, active, onClick, icon: Icon, color }: { label: string, active: boolean, onClick: () => void, icon: any, color: string }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border aspect-square flex flex-col items-center justify-center gap-3 transition-all ${active ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
  >
    <div className={`w-12 h-12 rounded-xl shadow-inner border border-white/20 flex items-center justify-center ${color}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
  </button>
);
