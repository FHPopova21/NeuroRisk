import React, { useState } from "react";
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
import { Link } from "react-router";

const initialNotes = [
  { id: 1, patient: "Sarah Jenkins", author: "Dr. Alex Silva", date: "Mar 17, 2026", preview: "Patient reported minor aura symptoms earlier today. EEG analysis confirms spike-wave activity...", full: "Patient reported minor aura symptoms earlier today. EEG analysis confirms spike-wave activity in the temporal region. Recommended medication adjustment for the next 48 hours and increased monitoring via mobile app.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 2, patient: "Robert Wilson", author: "Nurse Roberts", date: "Mar 16, 2026", preview: "Medication compliance confirmed. Patient has been using the mobile app consistently...", full: "Medication compliance confirmed. Patient has been using the mobile app consistently for the past 48 hours. No adverse events reported. Seizure log is up to date.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: 3, patient: "Emily Davis", author: "Dr. Alex Silva", date: "Mar 15, 2026", preview: "Follow-up visit regarding spectral entropy variance. Condition remains stable...", full: "Follow-up visit regarding spectral entropy variance. Condition remains stable. Patient is scheduled for a more comprehensive EEG session next week. Continued use of NeuroRisk Edu for daily baseline.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { id: 4, patient: "James Miller", author: "Dr. Alex Silva", date: "Mar 12, 2026", preview: "Routine check-up. EEG baseline within normal range. No action required.", full: "Routine check-up. EEG baseline within normal range. No action required. Patient is advised to continue current lifestyle modifications.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
];

export const MedicalNotesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<typeof initialNotes[0] | null>(null);

  const filteredNotes = initialNotes.filter(n => 
    n.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.author.toLowerCase().includes(searchTerm.toLowerCase())
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
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
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
            {filteredNotes.map((note, i) => (
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
                <div className="w-16 h-16 rounded-[1.5rem] border-2 border-white shadow-lg overflow-hidden flex-shrink-0">
                  <img src={note.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{note.patient}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.date} • By {note.author}</p>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                    {note.preview}
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
                <div className="w-20 h-20 rounded-[2rem] border-4 border-slate-50 shadow-xl overflow-hidden mb-4">
                  <img src={selectedNote.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedNote.patient}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedNote.date}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</p>
                    <p className="text-sm font-bold text-slate-700">{selectedNote.author}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                  <div className="absolute top-4 right-4 text-slate-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Note Content</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedNote.full}
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Link 
                    to={`/patients/${selectedNote.id}`}
                    className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Go to Patient Record <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button className="w-full py-4 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                    Edit Note
                  </button>
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
    </div>
  );
};
