import React, { useState } from "react";
import { 
  User, 
  Smartphone, 
  Mail, 
  ArrowLeft, 
  Save, 
  Info,
  ChevronDown,
  FileUp,
  Fingerprint
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { apiService } from "../services/api";
import { clsx } from "clsx";

export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    patientId: "",
    age: "",
    gender: "male",
    condition: "",
    hasEpilepsy: false,
    email: ""
  });
  const [eegData, setEegData] = useState<number[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Simple CSV parsing: split by non-numeric characters (commas, spaces, newlines)
        const numbers = text.split(/[\s,]+/)
                           .map(s => parseFloat(s))
                           .filter(n => !isNaN(n));
        
        if (numbers.length > 0) {
          setEegData(numbers);
          toast.success(`Loaded ${numbers.length} data points from ${file.name}`);
        } else {
          toast.error("No valid numeric data found in file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.patientId || !formData.email) {
      toast.error("Please fill in all required fields (First Name, Last Name, ID, Email)");
      return;
    }

    setSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
      
      const payload = {
        patient_id: formData.patientId,
        name: fullName,
        email: formData.email,
        birth_date: new Date(new Date().getFullYear() - (parseInt(formData.age) || 30), 0, 1).toISOString().split('T')[0],
        gender: formData.gender,
        medical_history: formData.condition,
        has_epilepsy: formData.hasEpilepsy,
        initial_eeg_data: eegData
      };

      await apiService.createPatient(payload);
      toast.success(`Patient ${fullName} added successfully! Email notification logged in server console.`);
      navigate("/patients");
    } catch (err: any) {
      toast.error(err.message || "Failed to save patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/patients"
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-emerald-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Add New Patient</h1>
            <p className="text-slate-500 font-medium tracking-tight">Enter patient details and upload initial EEG data.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: GUIDELINES */}
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6 border border-emerald-200">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-emerald-900 font-black text-lg mb-3">Add Protocol</h3>
            <p className="text-emerald-700 text-sm leading-relaxed mb-6">
              Manually assign a Patient ID and upload a signal file (CSV/TXT) for immediate AI baseline analysis.
            </p>
            <ul className="space-y-3 text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <li className="flex items-center gap-2">• Verify Email</li>
              <li className="flex items-center gap-2">• Upload CSV/TXT</li>
              <li className="flex items-center gap-2">• Set Epilepsy Status</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
            <div className="grid grid-cols-6 gap-6">
              {/* NAMES */}
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">First Name</label>
                <input
                  type="text" required
                  placeholder="First"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Middle Name</label>
                <input
                  type="text"
                  placeholder="Middle"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Last Name</label>
                <input
                  type="text" required
                  placeholder="Last"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>

              {/* ID & AGE */}
              <div className="col-span-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Manual Patient ID</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text" required
                    placeholder="e.g. PN-12345"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all font-mono"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Age</label>
                <input
                  type="number" required
                  placeholder="30"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Gender</label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* CONTACT & EPILEPSY */}
              <div className="col-span-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="email" required
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Epilepsy</h4>
                  <p className="text-[9px] text-slate-400">Has history?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.hasEpilepsy}
                    onChange={(e) => setFormData({ ...formData, hasEpilepsy: e.target.checked })}
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              {/* FILE UPLOAD */}
              <div className="col-span-6">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Brain Signal Data (CSV / TXT)</label>
                <div className={clsx(
                  "relative border-2 border-dashed rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer",
                  fileName ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50 hover:border-emerald-300"
                )}>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    fileName ? "bg-emerald-500 text-white" : "bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm"
                  )}>
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-700">{fileName || "Click to upload signal file"}</p>
                    <p className="text-xs text-slate-400 mt-1">{fileName ? `${eegData?.length || 0} samples detected` : "Support for raw signal records (X1, X2...)"}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-6">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Notes (Optional)</label>
                <textarea
                  placeholder="Enter medical history, medications, or specific observations..."
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all min-h-[80px]"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className={clsx(
                  "flex-1 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs",
                  saving ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                )}
              >
                {saving ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save & Notify Patient
              </button>
              <button
                type="button"
                onClick={() => navigate("/patients")}
                className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
