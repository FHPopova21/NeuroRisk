import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  Smartphone, 
  Filter,
  User,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { apiService, Patient } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const PatientsPage: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModalPatient, setSelectedModalPatient] = useState<Patient | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = isAdmin ? await apiService.getAdminPatients() : await apiService.getPatients();
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [isAdmin]);

  const filteredPatients = patients.filter(p => {
    const matchesFilter = filter === "All" || (filter === "Active" ? p.is_active : !p.is_active);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isAdmin ? "Global Patient Monitor" : "Patient Database"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdmin 
              ? "Read-only access to all registered patients in the network." 
              : "Manage and monitor all your patients in one place."}
          </p>
        </div>
        {!isAdmin && (
          <Link 
            to="/patients/add"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            Add New Patient
          </Link>
        )}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
          {(["All", "Active", "Inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                filter === f ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f === "Active" ? "With App" : f === "Inactive" ? "Without App" : "All Patients"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, age or risk..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
      </div>

      {/* PATIENT TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Age</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">App Status</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Analysis</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Level</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((patient, i) => (
                <motion.tr 
                  key={patient.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedModalPatient(patient)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block group-hover:text-emerald-600 transition-colors">{patient.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: #{patient.patient_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">{patient.birth_date || "N/A"}</td>
                  <td className="px-6 py-5">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      patient.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <Smartphone className="w-3 h-3" />
                      {patient.is_active ? "Connected" : "No App"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{new Date(patient.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                      patient.status === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      patient.status === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedModalPatient(patient)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100"
                      >
                        Quick Info
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Showing {filteredPatients.length} of {patients.length} patients</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30" disabled>Previous</button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg">1</button>
            <button className="px-4 py-2 hover:bg-slate-50 rounded-lg">2</button>
            <button className="p-2 rounded-lg hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* PATIENT OVERVIEW MODAL */}
      <AnimatePresence>
        {selectedModalPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setSelectedModalPatient(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient Overview</h3>
                <button
                  onClick={() => setSelectedModalPatient(null)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Data Content */}
              <div className="px-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedModalPatient.name}</h2>
                  <p className="text-sm font-bold text-slate-400">ID: {selectedModalPatient.patient_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Birth Date</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedModalPatient.birth_date ? new Date(selectedModalPatient.birth_date!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gender</span>
                    <span className="text-sm font-bold text-slate-900 capitalize">{selectedModalPatient.gender || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Epilepsy</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedModalPatient.medical_history?.toLowerCase().includes('epilepsy') ? 'Yes' : 'None Recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Joined</span>
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(selectedModalPatient.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                {/* Mobile App Status */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mobile App Status</span>
                  <div className={clsx(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-colors",
                    selectedModalPatient.is_active ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100"
                  )}>
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      selectedModalPatient.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                    )}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={clsx(
                        "text-sm font-bold block",
                        selectedModalPatient.is_active ? "text-emerald-700" : "text-slate-600"
                      )}>
                        {selectedModalPatient.is_active ? "Connected" : "No Device"}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedModalPatient.is_active ? "Syncing Live" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Note Summary (Dark Block) */}
              <div className="mt-8 bg-slate-900 p-8 rounded-t-[2rem]">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Medical Note Summary</h4>
                <p className="text-slate-300 text-sm font-medium italic mb-6">
                  {selectedModalPatient.medical_history || "Няма специални бележки."}
                </p>
                <button 
                  onClick={() => navigate(`/patients/${selectedModalPatient.id}?tab=notes`)}
                  className="flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors"
                >
                  View All Notes <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
