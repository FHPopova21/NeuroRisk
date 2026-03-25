import React, { useEffect, useState } from "react";
import { 
  Search, Filter, CheckCircle, XCircle, 
  ShieldAlert, MoreVertical, Mail, User, Clock
} from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";
import { motion } from "motion/react";

export const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchDoctors = async () => {
    try {
      const data = await apiService.getAdminDoctors(filter === "ALL" ? undefined : filter);
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiService.updateDoctorStatus(id, status);
      toast.success(`Doctor status updated to ${status}`);
      fetchDoctors();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Management</h1>
          <p className="text-slate-500 mt-1">Verify and manage medical professional accounts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {doctors.map((doctor, idx) => (
              <motion.tr 
                key={doctor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      {doctor.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doctor.name}</p>
                      <p className="text-xs text-slate-500">{doctor.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{doctor.specialization}</span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  {doctor.admin_assigned_id}
                </td>
                <td className="px-6 py-4">
                  {doctor.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                  {doctor.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  {doctor.status === 'SUSPENDED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">
                      <ShieldAlert className="w-3 h-3" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(doctor.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {doctor.status !== 'ACTIVE' && (
                      <button 
                        onClick={() => handleUpdateStatus(doctor.id, 'ACTIVE')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve & Activate"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {doctor.status !== 'SUSPENDED' && (
                      <button 
                        onClick={() => handleUpdateStatus(doctor.id, 'SUSPENDED')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Suspend Account"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
        {doctors.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400 font-medium">
            No doctors found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
};
