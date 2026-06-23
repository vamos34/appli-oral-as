import React from "react";
import { PastSession } from "../types";
import { Award, Calendar, User, Briefcase, Eye, Trash2, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

interface HistoryPanelProps {
  pastSessions: PastSession[];
  onSelect: (session: PastSession) => void;
  onClearAll: () => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onNavigateToWizard: () => void;
}

export default function HistoryPanel({
  pastSessions,
  onSelect,
  onClearAll,
  onRemoveItem,
  onNavigateToWizard
}: HistoryPanelProps) {
  const getVerdictBadgeClass = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("excellent") || v.includes("très bien") || v.includes("admis") || v.includes("bravo")) {
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
    } else if (v.includes("moyen") || v.includes("encourag") || v.includes("passable") || v.includes("travailler")) {
      return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-805";
    } else {
      return "bg-slate-50 dark:bg-slate-800 text-slate-755 dark:text-slate-350 border border-slate-200 dark:border-slate-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 12) return "text-teal-600 dark:text-teal-400";
    if (score >= 10) return "text-amber-600 dark:text-amber-450";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="panel-history-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-teal-600 dark:text-teal-400" />
            Historique de vos simulations
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Retrouvez tous les rapports de jury et notes obtenus lors de vos précédents passages d'oraux blancs.
          </p>
        </div>

        {pastSessions.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            id="btn-clear-all-history"
          >
            <Trash2 className="w-4 h-4" />
            Effacer tout l'historique
          </button>
        )}
      </div>

      {pastSessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-150 dark:border-slate-700 text-slate-400 dark:text-slate-500">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Aucune simulation enregistrée</h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Vous n'avez pas encore finalisé de simulation d'entretien d'admission complète. Renseignez votre profil de candidat pour démarrer.
            </p>
          </div>

          <button
            onClick={onNavigateToWizard}
            className="bg-gradient-to-tr from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs mx-auto"
            id="btn-history-empty-action"
          >
            <Sparkles className="w-4 h-4" />
            Lancer ma première simulation d'entretien
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelect(session)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-teal-500/50 dark:hover:border-teal-600/50 hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-3">
                {/* Header item */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{session.date}</span>
                  </div>
                  
                  {/* Delete individual item */}
                  <button
                    onClick={(e) => onRemoveItem(session.id, e)}
                    className="text-slate-400 hover:text-rose-600 dark:text-slate-550 dark:hover:text-rose-450 p-1 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Supprimer cet historique"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Candidate detail */}
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm group-hover:text-teal-650 dark:group-hover:text-teal-400 transition flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-450 shrink-0" />
                    <span className="truncate">{session.candidateName}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{session.experience}</span>
                  </p>
                </div>

                {/* Verdict Badge */}
                <div className="pt-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getVerdictBadgeClass(session.finalVerdict)}`}>
                    {session.finalVerdict}
                  </span>
                </div>
              </div>

              {/* Score breakdown and consult button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Note obtenue</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xl font-black ${getScoreColor(session.globalScore)}`}>
                      {session.globalScore}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold">/20</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900 group-hover:bg-teal-600 group-hover:text-white transition cursor-pointer">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
