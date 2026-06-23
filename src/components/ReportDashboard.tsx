import React from "react";
import { ReportFeedback, AnswerItem, CandidateProfile } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Award, Sparkles, ThumbsUp, CheckCircle, TrendingUp, RefreshCw, MessageSquare, Heart, ShieldAlert, ChevronRight, ArrowLeft } from "lucide-react";

interface ReportDashboardProps {
  profile: CandidateProfile;
  feedback: ReportFeedback;
  history: AnswerItem[];
  onRestart: () => void;
  onBack?: () => void;
}

export default function ReportDashboard({ profile, feedback, history, onRestart, onBack }: ReportDashboardProps) {
  const getVerdictStyles = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("excellent") || v.includes("très bien") || v.includes("admis") || v.includes("bravo")) {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300",
        badge: "bg-emerald-600 dark:bg-emerald-700 text-white",
        text: "text-emerald-700 dark:text-emerald-400"
      };
    } else if (v.includes("moyen") || v.includes("encourag") || v.includes("passable") || v.includes("travailler")) {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-150 dark:border-amber-900/60 text-amber-800 dark:text-amber-300",
        badge: "bg-amber-600 dark:bg-amber-700 text-white",
        text: "text-amber-700 dark:text-amber-400"
      };
    } else {
      return {
        bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-150 dark:border-slate-700 text-slate-800 dark:text-slate-200",
        badge: "bg-slate-600 dark:bg-slate-700 text-white",
        text: "text-slate-700 dark:text-slate-300"
      };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30";
    if (score >= 12) return "text-teal-600 border-teal-200 bg-teal-50 dark:text-teal-400 dark:border-teal-850 dark:bg-teal-950/30";
    if (score >= 10) return "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/30";
    return "text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-900 dark:bg-rose-950/30";
  };

  const styles = getVerdictStyles(feedback.finalVerdict);

  return (
    <div className="space-y-8 animate-fadeIn" id="report-dashboard">
      
      {/* If looking at history, show a beautiful back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'historique des examens</span>
        </button>
      )}

      {/* Upper overview banner */}
      <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 ${styles.bg}`}>
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${styles.badge}`}>
              VERDICT DU JURY
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-bold">Bilan d'Entraînement IFAS</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
            {profile.name}, {feedback.finalVerdict}
          </h2>
          <p className="text-sm leading-relaxed max-w-2xl opacity-95">
            {feedback.generalComments}
          </p>
        </div>

        {/* Global Score Panel */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition ${getScoreColor(feedback.globalScore)}`}>
            <span className="text-[10px] font-bold text-slate-405 dark:text-slate-400 -mt-1">NOTE FINALE</span>
            <span className="text-4xl font-black tracking-tight">{feedback.globalScore}</span>
            <span className="text-xs font-semibold text-slate-405 border-t border-slate-200/20 dark:border-slate-700/55 pt-0.5 mt-0.5 px-2">/ 20</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-450 dark:text-slate-400 font-bold tracking-widest uppercase">
            Validation ARS ({feedback.globalScore >= 10 ? "Admissible" : "Refusé"})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Chart and Skills Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Évaluation des aptitudes & critères IFAS
            </h3>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedback.skills} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                  <XAxis type="number" domain={[0, 20]} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={110} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', borderColor: '#334155', backgroundColor: '#1e293b', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} / 20`, 'Aptitude']}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={16}>
                    {feedback.skills.map((entry, index) => {
                      const colors = ['#0d9488', '#0284c7', '#4f46e5', '#8b5cf6', '#ec4899'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skills interactive labels */}
            <div className="space-y-3.5 pt-2">
              {feedback.skills.map((skill, index) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition border border-slate-100 dark:border-slate-700/60">
                  <div className="font-extrabold text-slate-705 dark:text-slate-200 text-xs sm:text-sm min-w-[120px]">
                    {skill.name}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        skill.score >= 15 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" :
                        skill.score >= 10 ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300" : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                      }`}>
                        {skill.score} / 20
                      </span>
                    </div>
                    <p className="text-xs text-slate-550 dark:text-slate-300 leading-relaxed">
                      {skill.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Highlights, suggestions & key inputs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Strengths and Weaknesses */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Points notables du candidat
            </h3>

            {/* Core Strengths */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 by-1 rounded tracking-wider uppercase inline-block">
                Points forts majeurs
              </span>
              <ul className="space-y-2">
                {feedback.keyStrengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <ThumbsUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Suggestions */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded tracking-wider uppercase inline-block">
                Pistes d'amélioration
              </span>
              <ul className="space-y-2">
                {feedback.improvementSuggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick info card */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Award className="w-40 h-40" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-teal-400 font-extrabold uppercase tracking-widest block">SUITE DU PROGRAMME</span>
                <h4 className="text-lg font-extrabold">Continuer l'entraînement</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L'épreuve réelle d'admission exige une excellente préparation et de la rigueur. Multiplier les simulations augmente vos chances de réussite de plus de 75%.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onRestart}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  id="btn-restart-simulation"
                >
                  <RefreshCw className="w-4 h-4" /> Relancer une simulation
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* History details - Question by question review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <MessageSquare className="w-5.5 h-5.5 text-indigo-600" />
            Analyse détaillée de vos réponses
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Retrouvez les évaluations instantanées formulées par le jury sur chaque question posée.</p>
        </div>

        <div className="space-y-6 divide-y divide-slate-150">
          {history.map((record, index) => (
            <div key={index} className={`pt-6 ${index === 0 ? "pt-0" : ""}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Heading & Score */}
                <div className="lg:col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 font-black text-xs h-6 w-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {index + 1}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note attribuée</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">{record.grade}</span>
                      <span className="text-xs font-semibold text-slate-400">/ 20</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-9 space-y-4">
                  
                  {/* Context of Question */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Question posée par le Jury :</span>
                    <blockquote className="text-xs md:text-sm font-semibold text-slate-800 bg-indigo-50/40 p-3 rounded-lg border-l-4 border-indigo-500 italic">
                      "{record.questionText}"
                    </blockquote>
                  </div>

                  {/* Transcript */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Votre réponse :</span>
                    <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-150 leading-relaxed font-mono whitespace-pre-wrap">
                      {record.answerText || "Pas de réponse formulée."}
                    </p>
                  </div>

                  {/* Evaluation of this Question */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    
                    <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 space-y-1">
                      <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">Points Forts décelés</span>
                      <ul className="space-y-1">
                        {record.strengths.map((str, sIdx) => (
                          <li key={sIdx} className="text-xs text-slate-700 flex items-start gap-1">
                            <span className="text-emerald-600">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                        {record.strengths.length === 0 && (
                          <li className="text-xs text-slate-400 italic">Aucun point fort spécifique relevé.</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100 space-y-1">
                      <span className="text-[10px] text-rose-800 font-bold block uppercase tracking-wider">Points faibles / Améliorations</span>
                      <ul className="space-y-1">
                        {record.weaknesses.map((weak, wIdx) => (
                          <li key={wIdx} className="text-xs text-slate-700 flex items-start gap-1">
                            <span className="text-rose-500">⚠</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                        {record.weaknesses.length === 0 && (
                          <li className="text-xs text-slate-500 italic">Excellent respect des protocoles.</li>
                        )}
                      </ul>
                    </div>

                  </div>

                  {/* Comment */}
                  <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider mb-0.5">REMARQUE DU JURY</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {record.feedbackText}
                    </p>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
