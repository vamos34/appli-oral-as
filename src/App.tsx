import React, { useState, useEffect, useRef } from "react";
import { CandidateProfile, Question, AnswerItem, ReportFeedback, PastSession } from "./types";
import { useCredits, CreditIndicator, RechargeModal, CreditGateModal } from "./components/CreditSystem";
import ReportDashboard from "./components/ReportDashboard";
import HelpGuides from "./components/HelpGuides";
import HistoryPanel from "./components/HistoryPanel";
import SalesLandingPage from "./components/SalesLandingPage";
import { CGVModal, MentionsLegalesModal } from "./components/LegalModals";
import { Activity, Sparkles, RefreshCw, AlertCircle, ArrowLeft, HeartPulse, ShieldCheck, HelpCircle, User, Award, BookOpen, Send, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Sun, Moon } from "lucide-react";
import { safeLocalStorage, safeSessionStorage } from "./utils/storage";

export default function App() {
  const {
    credits,
    transactions,
    spendCredit,
    refillCredits,
    isRechargeOpen,
    setIsRechargeOpen,
    isGateOpen,
    setIsGateOpen,
  } = useCredits();

  // Dark mode / light mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeLocalStorage.getItem("ifas_dark_theme");
    return saved === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      safeLocalStorage.setItem("ifas_dark_theme", "true");
    } else {
      document.documentElement.classList.remove("dark");
      safeLocalStorage.setItem("ifas_dark_theme", "false");
    }
  }, [isDarkMode]);

  // Core application state
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [userAnswerInput, setUserAnswerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Accumulated history of Q&A in the current active oral session
  const [interviewHistory, setInterviewHistory] = useState<AnswerItem[]>([]);
  const [finalFeedback, setFinalFeedback] = useState<ReportFeedback | null>(null);
  const [viewingLegalPage, setViewingLegalPage] = useState<"cgv" | "mentions" | null>(null);

  // Past oral blank sessions
  const [pastSessions, setPastSessions] = useState<PastSession[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("ifas_past_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    safeLocalStorage.setItem("ifas_past_sessions", JSON.stringify(pastSessions));
  }, [pastSessions]);

  const [selectedPastSession, setSelectedPastSession] = useState<PastSession | null>(null);

  // App lock until payment status - false by default so the Sales Landing Page is the official homepage.
  const [isAppUnlocked, setIsAppUnlocked] = useState<boolean>(() => {
    if (safeSessionStorage.getItem("ifas_app_unlocked_session") === "true") {
      return true;
    }
    const savedCredits = safeLocalStorage.getItem("ifas_credits_count");
    if (savedCredits && parseInt(savedCredits, 10) > 0 && savedCredits !== "3") {
      return true;
    }
    return false;
  });

  // Automatically unlock only if actively marked in session
  useEffect(() => {
    if (isAppUnlocked) {
      safeSessionStorage.setItem("ifas_app_unlocked_session", "true");
    } else {
      safeSessionStorage.removeItem("ifas_app_unlocked_session");
    }
  }, [isAppUnlocked]);

  // Synchronise le deverrouillage si l'utilisateur possède déjà ou acquiert des crédits payés
  useEffect(() => {
    if (credits > 0) {
      setIsAppUnlocked(true);
    }
  }, [credits]);

  // Contrôleur de référencement SEO : Empêche l'indexation de l'application mais autorise celle de la page de vente
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    if (isAppUnlocked) {
      meta.setAttribute("content", "noindex, nofollow");
    } else {
      meta.setAttribute("content", "index, follow");
    }
  }, [isAppUnlocked]);

  // Active view tab during Setup
  const [setupTab, setSetupTab] = useState<"wizard" | "guides" | "history">("wizard");

  // Input form state for candidate profile creation
  const [formName, setFormName] = useState("");
  const [formModule, setFormModule] = useState("Entretien de Sélection (Format complet & réglementaire)");
  const [formExperience, setFormExperience] = useState("Aucun - Reconversion complète");
  const [formMotivation, setFormMotivation] = useState("");

  const EXPERIENCES_LIST = [
    "Aucun - Reconversion complète",
    "ASH (Agent des Services Hospitaliers)",
    "Auxiliaire de vie ou Aide à domicile",
    "Étudiant ou bachelier",
    "Autre domaine d'activité (Commerce, BTP, etc.)"
  ];

  // Starts the interview - deducts 1 credit and spawns the virtual jury first question
  const handleStartSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage("Veuillez saisir votre prénom ou nom avant d'initier la simulation.");
      return;
    }

    if (credits <= 0) {
      setIsGateOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const activeProfile: CandidateProfile = {
      name: formName,
      module: formModule,
      experience: formExperience,
      motivation: formMotivation || "Désir profond de prodiguer des soins, de soulager la douleur corporelle et d'apporter du réconfort au sein d'une équipe soudée."
    };

    try {
      const response = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: activeProfile })
      });

      if (!response.ok) {
        throw new Error("Impossible de joindre le serveur du Jury Virtuel.");
      }

      const result = await response.json();
      
      // Spend credit after successful connection
      const spent = spendCredit(`Simulation d'entretien pour ${activeProfile.name}`);
      if (!spent) {
        setIsGateOpen(true);
        setIsLoading(false);
        return;
      }

      // Initialize session states
      setProfile(activeProfile);
      setCurrentQuestionText(result.question);
      setCurrentQuestionIndex(0);
      setUserAnswerInput("");
      setInterviewHistory([]);
      setFinalFeedback(null);
      setStage("interview");
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur critique de démarrage.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submits the response of a single question
  const handleSubmitAnswer = async () => {
    if (!profile) return;
    if (!userAnswerInput.trim()) {
      setErrorMessage("Veuillez formuler une réponse écrite.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/simulation/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          questionText: currentQuestionText,
          answerText: userAnswerInput,
          questionIndex: currentQuestionIndex
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission de votre réponse.");
      }

      const evalResult = await response.json();

      // Store evaluation in history list
      const answeredItem: AnswerItem = {
        questionIndex: currentQuestionIndex,
        questionText: currentQuestionText,
        answerText: userAnswerInput,
        grade: evalResult.grade,
        strengths: evalResult.strengths || [],
        weaknesses: evalResult.weaknesses || [],
        feedbackText: evalResult.feedbackText,
        juryResponse: evalResult.nextQuestion || ""
      };

      const updatedHistory = [...interviewHistory, answeredItem];
      setInterviewHistory(updatedHistory);

      if (evalResult.finished) {
        // Calculate the aggregate feedback reports
        await handleFetchGlobalReport(updatedHistory);
      } else {
        // Switch to the next question
        setCurrentQuestionText(evalResult.nextQuestion);
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswerInput("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compiles overall grades from the completed interview Q&A
  const handleFetchGlobalReport = async (historyData: AnswerItem[]) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/simulation/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          history: historyData
        })
      });

      if (!response.ok) {
        throw new Error("L'évaluation finale globale a échoué.");
      }

      const report = await response.json();
      setFinalFeedback(report);
      setStage("feedback");

      // Save to persistent simulation history
      const newPastSession: PastSession = {
        id: Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
        date: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        candidateName: profile.name,
        experience: profile.experience,
        globalScore: report.globalScore,
        finalVerdict: report.finalVerdict || "Terminé",
        feedback: report,
        history: historyData
      };
      setPastSessions((prev) => [newPastSession, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || "Problème d'évaluation finale.");
    } finally {
      setIsLoading(false);
    }
  };

  // Abruptly quits the active exam
  const handleQuitAndClean = () => {
    if (confirm("Voulez-vous vraiment quitter la simulation ? Votre crédit consommé pour cette session ne sera pas recrédité.")) {
      setStage("setup");
      setProfile(null);
      setInterviewHistory([]);
      setFinalFeedback(null);
    }
  };

  // Reset for a fresh attempt
  const handleRestart = () => {
    setStage("setup");
    setProfile(null);
    setInterviewHistory([]);
    setFinalFeedback(null);
  };

  if (!isAppUnlocked) {
    return (
      <>
        <SalesLandingPage
          onUnlock={(creditsToAdd, planName) => {
            refillCredits(creditsToAdd, `Formule : ${planName}`);
            setIsAppUnlocked(true);
            safeLocalStorage.setItem("ifas_app_unlocked", "true");
          }}
          onOpenLegal={(page) => setViewingLegalPage(page)}
        />
        <CGVModal
          isOpen={viewingLegalPage === "cgv"}
          onClose={() => setViewingLegalPage(null)}
        />
        <MentionsLegalesModal
          isOpen={viewingLegalPage === "mentions"}
          onClose={() => setViewingLegalPage(null)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200" id="main-app">
      
      {/* Header element */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 md:px-8 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-teal-500 to-teal-600 p-2 rounded-xl text-white shadow-md shadow-teal-550/15">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                Sacha <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-900">Virtual Jury</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest mt-0.5">SIMULATEUR CONCOURS IFAS</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              title={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              id="btn-toggle-theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 animate-fadeIn" /> : <Moon className="w-4 h-4 text-indigo-500 animate-fadeIn" />}
            </button>

            <CreditIndicator credits={credits} onOpenRecharge={() => setIsRechargeOpen(true)} />

            {stage === "setup" && (
              <button
                onClick={() => setIsAppUnlocked(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                title="Consulter ou modifier l'offre commerciale"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Page d'accueil</span>
              </button>
            )}

            {stage === "interview" && (
              <button
                onClick={handleQuitAndClean}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Quitter l'entretien
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Référentiel Sélection IFAS 2026</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start">
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn" id="banner-error">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <strong className="block font-bold">Erreur d'exécution :</strong>
              <span className="leading-relaxed block">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto p-1 hover:bg-rose-100 rounded text-rose-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. SETUP STAGE PANEL */}
        {stage === "setup" && (
          <div className="space-y-6 animate-fadeIn" id="panel-setup">
            
            {/* Secondary Selector to study instead of starting */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 w-full overflow-x-auto scrollbar-none">
              <button
                onClick={() => {
                  setSelectedPastSession(null);
                  setSetupTab("wizard");
                }}
                className={`text-center font-extrabold text-xs py-3 px-4 transition border-b-2 cursor-pointer whitespace-nowrap ${
                  setupTab === "wizard" && !selectedPastSession
                    ? "border-teal-500 text-teal-650 dark:text-teal-400"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-355"
                }`}
              >
                🚀 Nouvelle simulation
              </button>
              <button
                onClick={() => {
                  setSelectedPastSession(null);
                  setSetupTab("guides");
                }}
                className={`text-center font-extrabold text-xs py-3 px-4 transition border-b-2 cursor-pointer whitespace-nowrap ${
                  setupTab === "guides" && !selectedPastSession
                    ? "border-teal-500 text-teal-655 dark:text-teal-400"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-355"
                }`}
              >
                📚 Fiches de révisions IFAS
              </button>
              <button
                onClick={() => {
                  setSelectedPastSession(null);
                  setSetupTab("history");
                }}
                className={`text-center font-extrabold text-xs py-3 px-4 transition border-b-2 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  setupTab === "history" || selectedPastSession
                    ? "border-teal-500 text-teal-655 dark:text-teal-400"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-355"
                }`}
              >
                <span>🕒 Historique d'examens</span>
                {pastSessions.length > 0 && (
                  <span className="text-[10px] bg-teal-150 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-905 font-black">
                    {pastSessions.length}
                  </span>
                )}
              </button>
            </div>

            {selectedPastSession ? (
              <ReportDashboard
                profile={{
                  name: selectedPastSession.candidateName,
                  module: "Entretien de Sélection (Format complet & réglementaire)",
                  experience: selectedPastSession.experience,
                  motivation: ""
                }}
                feedback={selectedPastSession.feedback}
                history={selectedPastSession.history}
                onRestart={() => {
                  setSelectedPastSession(null);
                  setSetupTab("wizard");
                }}
                onBack={() => setSelectedPastSession(null)}
              />
            ) : setupTab === "guides" ? (
              <HelpGuides />
            ) : setupTab === "history" ? (
              <HistoryPanel
                pastSessions={pastSessions}
                onSelect={(session) => setSelectedPastSession(session)}
                onClearAll={() => {
                  if (confirm("Voulez-vous vraiment effacer tout votre historique d'entraînement ? Cette action est définitive.")) {
                    setPastSessions([]);
                  }
                }}
                onRemoveItem={(id, e) => {
                  e.stopPropagation();
                  if (confirm("Voulez-vous supprimer cette simulation de votre historique personnel ?")) {
                    setPastSessions((prev) => prev.filter((s) => s.id !== id));
                  }
                }}
                onNavigateToWizard={() => setSetupTab("wizard")}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Intro pitch card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-tr from-teal-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                      <Award className="w-48 h-48" />
                    </div>
                    <div className="space-y-4">
                      <span className="bg-white/10 text-teal-100 text-[9px] tracking-widest font-black uppercase px-2.5 py-1 rounded-full border border-white/20 inline-block">
                        INNOVATION PÉDAGOGIQUE
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black leading-tight">Prenez confiance face au Jury Virtuel</h2>
                      <p className="text-xs text-teal-50 leading-relaxed">
                        Chaque situation d'entretien est paramétrée à partir de votre profil de candidat. Un jury assisté par l'IA Gemini simule une véritable épreuve officielle de 6 questions. Vous obtenez un rapport interactif avec note sur 25 points.
                      </p>
                      
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-teal-100">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-300" />
                          <span>Validation des compétences cliniques</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-teal-100">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-300" />
                          <span>Détail thématique des erreurs sanitaires</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial callout */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Inscriptions Illimitées d'Essai</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed italic">
                      "Grâce aux simulations en situation réelle sur les modules d'hygiène et de sécurité, j'ai surmonté mon stress de prise de parole et obtenu 18/20 à l'examen d'admission !"
                    </p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">— SÉVERINE T., ADMISE EN IFAS (2025)</div>
                  </div>
                </div>

                {/* Main setup wizard */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 md:p-8">
                  <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">Initialisation de l'évaluation</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Renseignez vos coordonnées d'examen pour que notre Jury Virtuel calibre vos situations de soins cliniques.</p>
                  </div>

                  <form onSubmit={handleStartSimulation} className="space-y-5">
                    
                    {/* Candidate Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">ID Candidat / Prénom & Nom</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Ex: Clara Martin"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 transition font-medium"
                          maxLength={35}
                        />
                        <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>

                    {/* Format de sélection IFAS 2026 - Information éducative réglementaire */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 md:p-5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block flex items-center gap-2">
                          <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>Format d'évaluation de la Sélection IFAS</span>
                        </label>
                        <span className="text-[10px] bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-extrabold px-2 py-0.5 rounded-md uppercase border border-teal-200/50">100% Conforme</span>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Conformément à l'Arrêté du 7 avril 2020, l'entretien d'admission est une <strong>épreuve unique et globale</strong> (notée sur 20 points). Le jury évalue concomitamment l'ensemble de vos aptitudes. Il n'y a pas de modules ou d'axes isolés à choisir : la simulation d'entraînement ci-dessous testera donc votre profil de manière équilibrée sur les 3 piliers officiels :
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-sans">
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700 text-center">
                          <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase">Communication</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-medium leading-tight">Élocution, structure et vocabulaire (4 pts)</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700 text-center">
                          <div className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase font-bold">Projet & Métier</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-medium leading-tight">Motivations, réalisme terrain, financement (8 pts)</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700 text-center">
                          <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase">Relationnel</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 font-medium leading-tight">Bientraitance, empathie et éthique (8 pts)</div>
                        </div>
                      </div>
                    </div>

                    {/* Antecedents / Experience */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Parcours d'expérience professionnelle</label>
                      <select
                        value={formExperience}
                        onChange={(e) => setFormExperience(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 transition font-medium"
                      >
                        {EXPERIENCES_LIST.map((exp, idx) => (
                          <option key={idx} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>

                    {/* Motivation block */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Décrivez vos motivations (Optionnel • Recommandé)</label>
                      <textarea
                        placeholder="Qu'est-ce qui vous attire vers les métiers du soin ? Quelle est la raison de votre choix d'orientation ?"
                        value={formMotivation}
                        onChange={(e) => setFormMotivation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 transition h-24 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-slate-600 dark:text-slate-400 text-xs">
                      <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Coût de lancement : <strong className="text-slate-800 dark:text-slate-200">1 crédit d'entraînement</strong>. 3 essais gratuits offerts au total.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-tr from-teal-500 to-teal-600 hover:from-teal-650 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-450 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
                      id="btn-trigger-simulation"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Calibrage de l'examen par le Jury...</span>
                        </>
                      ) : (
                        <>
                          <span>Lancer ma simulation d'entretien</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                  </form>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 2. INTERVIEW ACTIVE TRIAL PANEL */}
        {stage === "interview" && profile && (
          <div className="max-w-4xl mx-auto w-full space-y-6 animate-fadeIn" id="panel-interview">
            
            {/* Header / progress */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-widest uppercase block flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ÉVALUATION ACTIVE
                </span>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                  Candidat : <strong className="text-slate-900 dark:text-white">{profile.name}</strong> • Concours IFAS
                </h3>
              </div>

              {/* Progress counter */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-32 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full transition-all duration-350"
                    style={{ width: `${((currentQuestionIndex + 1) / 6) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Question {currentQuestionIndex + 1} / 6
                </span>
              </div>
            </div>

            {/* Main Stage panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Virtual Jury Avatar */}
              <div className="md:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl p-5 flex flex-col justify-center items-center text-center gap-4 animate-fadeIn">
                <div className="w-20 h-20 bg-gradient-to-tr from-slate-700 to-slate-900 text-slate-100 rounded-full flex items-center justify-center text-3xl font-black relative shadow">
                  👵
                  <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" title="Jury Connecté"></div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md uppercase">JURY 🩺</span>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">Gisèle & Dr. Mercier</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400">Cadre formateur & Jury de Sélection d'admission IFAS 2026</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-150 dark:border-slate-700/60">
                  ✏️ Réfléchissez posément et rédigez votre argumentation avec bientraitance et rigueur.
                </div>
              </div>

              {/* Right Column: Question Display & Text area response */}
              <div className="md:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col gap-6 justify-between">
                
                {/* Jury query message bubbles */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">QUESTION DU JURY DE SÉLECTION</span>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 italic font-medium text-slate-800 dark:text-slate-100 text-xs sm:text-base leading-relaxed relative">
                    "{currentQuestionText}"
                    <div className="absolute left-4 -bottom-2 h-3 w-3 bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45"></div>
                  </div>
                </div>

                {/* Candidate response textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Votre formulation & réponse :
                    </label>
                  </div>

                  <textarea
                    required
                    disabled={isLoading}
                    placeholder="Saisissez ici votre réponse clinique rédigée de façon structurée..."
                    value={userAnswerInput}
                    onChange={(e) => setUserAnswerInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 transition h-40 resize-none leading-relaxed leading-6"
                    id="input-interactio-answer"
                  />
                </div>

                {/* Submit Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-705 pt-4">
                  <div className="text-[11px] text-slate-400 dark:text-slate-450 font-medium">
                    Appuyez sur "Valider" pour comptabiliser vos points et avancer.
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isLoading || !userAnswerInput.trim()}
                    className="w-full sm:w-auto bg-gradient-to-tr from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-350 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    id="btn-submit-interaction-answer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analyse de votre geste soins...</span>
                      </>
                    ) : (
                      <>
                        <span>Valider la réponse</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Small guide / hint overlay below for convenience */}
            <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 flex gap-3 text-indigo-900 leading-relaxed text-xs">
              <BookOpen className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Aide-Mémoire d'argumentation :</strong>
                <span>Privilégiez la sécurité physique du résident, le lavage hydro-alcoolique régulier des mains, le respect rigoureux du secret professionnel partagé au sein de l'équipe, et transmettez systématiquement toute anomalie à l'infirmière.</span>
              </div>
            </div>

          </div>
        )}

        {/* 3. FINAL COMPREHENSIVE REPORT CARD SECTION */}
        {stage === "feedback" && profile && finalFeedback && (
          <ReportDashboard
            profile={profile}
            feedback={finalFeedback}
            history={interviewHistory}
            onRestart={handleRestart}
          />
        )}

      </main>

      {/* Elegant Footer with credentials */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-250 dark:border-slate-800 py-6 px-4 md:px-8 mt-12 text-slate-500 dark:text-slate-400 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200 font-bold">
              <span>🩺 Entraînement IFAS Sacha Simulator</span>
              <span className="text-[10px] bg-teal-50 dark:bg-teal-955/45 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-900 font-semibold">Paiement sécurisé Stripe</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[11px]">
              Entraînement de cas cliniques et bientraitance de l'aide-soignant pour l'excellence au concours.
            </p>
          </div>

          {/* Legal links requested by user */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setViewingLegalPage("cgv")}
              className="text-indigo-650 hover:text-indigo-805 dark:text-indigo-400 dark:hover:text-indigo-300 transition underline decoration-indigo-200 dark:decoration-indigo-900 hover:decoration-indigo-500 cursor-pointer"
              id="footer-link-cgv"
            >
              Conditions Générales de Vente (CGV)
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => setViewingLegalPage("mentions")}
              className="text-indigo-650 hover:text-indigo-805 dark:text-indigo-400 dark:hover:text-indigo-300 transition underline decoration-indigo-200 dark:decoration-indigo-900 hover:decoration-indigo-500 cursor-pointer"
              id="footer-link-mentions"
            >
              Mentions Légales & RGPD
            </button>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-[10px] text-slate-450 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
            <span>🔐 SSL 256-BIT SECURISÉ STRIPE • REAL-TIME JURY IA</span>
          </div>
        </div>
      </footer>

      {/* Credit System Modals */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        credits={credits}
        refillCredits={refillCredits}
        transactions={transactions}
      />
      <CreditGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
      />

      {/* Legal and Commercial Modals */}
      <CGVModal
        isOpen={viewingLegalPage === "cgv"}
        onClose={() => setViewingLegalPage(null)}
      />
      <MentionsLegalesModal
        isOpen={viewingLegalPage === "mentions"}
        onClose={() => setViewingLegalPage(null)}
      />
    </div>
  );
}
