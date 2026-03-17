import React, { useState } from "react";
import { 
  User, 
  Smartphone, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Save, 
  Info,
  ChevronDown
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    condition: "",
    usesApp: false,
    contactInfo: ""
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age) {
      toast.success(`Patient ${formData.name} added successfully!`);
      navigate("/patients");
    } else {
      toast.error("Please fill in the required fields");
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
            <p className="text-slate-500 font-medium tracking-tight">Enter patient details to start clinical monitoring.</p>
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
            <h3 className="text-emerald-900 font-black text-lg mb-3">Clinical Data Protocol</h3>
            <p className="text-emerald-700 text-sm leading-relaxed mb-6">
              Ensure all information matches the patient's legal medical record. NeuroRisk Edu is used for clinical decision support.
            </p>
            <ul className="space-y-3 text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <li className="flex items-center gap-2">• Double check ID</li>
              <li className="flex items-center gap-2">• Verify contact info</li>
              <li className="flex items-center gap-2">• Review conditions</li>
            </ul>
          </div>

          <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Security Note</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              All clinical data is encrypted. This platform is not for PII collection beyond necessary clinical metrics.
            </p>
            <Link to="#" className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Read Privacy Policy</Link>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    placeholder="Enter patient full name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Age</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 34"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Gender</label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all appearance-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pre-existing Condition (Optional)</label>
                <textarea
                  placeholder="Describe patient's condition or clinical history..."
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all min-h-[100px]"
                />
              </div>

              <div className="col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Uses Mobile App</h4>
                    <p className="text-xs text-slate-500">Patient will receive real-time alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.usesApp}
                    onChange={(e) => setFormData({ ...formData, usesApp: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    placeholder="email@example.com or phone number"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <Save className="w-4 h-4" />
                Save Patient Profile
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
