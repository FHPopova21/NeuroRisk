import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Search,
  ChevronRight,
  Plus,
  Calendar,
  MoreVertical,
  Activity,
  User,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { apiService, MedicalNote } from "../services/api";
import { toast } from "sonner";

export const MedicalNotesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<MedicalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [targetPatientId, setTargetPatientId] = useState("");
  const [patients, setPatients] = useState<any[]>([]);

  const fetchNotes = async () => {
    try {
      const data = await apiService.getMedicalNotes();
      setNotes(data);
    } catch (error) {
      toast.error("Failed to load clinical notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (error) { }
  };

  useEffect(() => {
    fetchNotes();
    fetchPatients();
  }, []);

  const handleCreateNote = async () => {
    if (!targetPatientId || !newNoteContent.trim()) {
      toast.error("Please select a patient and enter content");
      return;
    }
    try {
      await apiService.createMedicalNote(targetPatientId, newNoteContent);
      toast.success("Note created successfully");
      setShowCreateModal(false);
      setNewNoteContent("");
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-2xl border border-blue-200 text-blue-600 shadow-lg shadow-blue-100">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Medical Notes</h1>
            <p className="text-slate-500 font-medium tracking-tight">Access all clinical observations and patient log summaries.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Create New Note
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* NOTES LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">No notes found</div>
            ) : filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedNote(note)}
                className={clsx(
                  "bg-white rounded-[2.5rem] border p-8 flex flex-col md:flex-row gap-6 items-start group hover:shadow-md transition-all cursor-pointer relative",
                  selectedNote?.id === note.id ? "border-emerald-600 ring-2 ring-emerald-100" : "border-slate-100"
                )}
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 border-2 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{note.patient_name || note.patient_id}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(note.timestamp).toLocaleDateString()} • {new Date(note.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Clinical Log
                    </span>
                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                      View Full Details <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FULL NOTE VIEW (Right Column) */}
        <div className="lg:col-span-1">
          {selectedNote ? (
            <motion.div
              key={selectedNote.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sticky top-8 space-y-6"
            >
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 border-4 border-slate-50 shadow-xl flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedNote.patient_name || selectedNote.patient_id}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedNote.timestamp).toLocaleString()}</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                  <div className="absolute top-4 right-4 text-slate-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Note Content</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedNote.content}
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Link
                    to={`/patients/${selectedNote.patient_id}`}
                    className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Go to Patient Record <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center sticky top-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <FileEdit className="w-8 h-8 opacity-20" />
              </div>
              <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest">Select a note to view full details</h3>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">New Clinical Note</h2>
              <p className="text-slate-500 font-medium">Record observations for a patient.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Patient</label>
                <select
                  value={targetPatientId}
                  onChange={(e) => setTargetPatientId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note Content</label>
                <textarea
                  rows={6}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Type clinical observations here..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="flex-1 py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                Save Clinical Note
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
