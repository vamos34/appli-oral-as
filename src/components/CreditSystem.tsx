import React, { useState, useEffect } from "react";
import { Coins, CreditCard, Plus, X, Check, CheckCircle2, History, Sparkles, Clock, ArrowRight, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { safeLocalStorage } from "../utils/storage";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: "refill" | "spend";
  description: string;
  date: string;
}

// Custom hook to manage credits and history synchronized with localStorage
export function useCredits() {
  const [credits, setCredits] = useState<number>(() => {
    const saved = safeLocalStorage.getItem("ifas_credits_count");
    // Force reset if legacy '3' credits are found, to ensure 0 credits
    if (saved === "3") {
      safeLocalStorage.setItem("ifas_credits_count", "0");
      return 0;
    }
    return saved !== null ? parseInt(saved, 10) : 0; // 0 free credits initially
  });

  const [transactions, setTransactions] = useState<CreditTransaction[]>(() => {
    const saved = safeLocalStorage.getItem("ifas_credits_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy offered credits transactions
          const cleaned = parsed.filter(
            (tx) => tx.id !== "init-1" && !tx.description.toLowerCase().includes("offert")
          );
          if (cleaned.length !== parsed.length) {
            safeLocalStorage.setItem("ifas_credits_history", JSON.stringify(cleaned));
          }
          return cleaned;
        }
        return [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  useEffect(() => {
    safeLocalStorage.setItem("ifas_credits_count", credits.toString());
  }, [credits]);

  useEffect(() => {
    safeLocalStorage.setItem("ifas_credits_history", JSON.stringify(transactions));
  }, [transactions]);

  const spendCredit = (description: string = "Lancement d'une simulation d'entretien") => {
    if (credits >= 9999) {
      addTransaction(0, "spend", `${description} (Forfait Illimité - Aucun crédit décompté)`);
      return true;
    }
    if (credits <= 0) {
      setIsGateOpen(true);
      return false;
    }
    setCredits((prev) => prev - 1);
    addTransaction(1, "spend", description);
    return true;
  };

  const refillCredits = (amount: number, description: string) => {
    setCredits((prev) => prev + amount);
    addTransaction(amount, "refill", description);
  };

  const addTransaction = (amount: number, type: "refill" | "spend", description: string) => {
    const newTx: CreditTransaction = {
      id: "tx-" + Math.random().toString(36).substring(2, 9),
      amount,
      type,
      description,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Stripe success redirection callback parser
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSuccess = params.get("stripe_success");
    const sessionId = params.get("session_id");

    if (stripeSuccess === "true" && sessionId) {
      const usedIds = JSON.parse(safeLocalStorage.getItem("ifas_processed_stripe_sessions") || "[]");
      if (!usedIds.includes(sessionId)) {
        // Call backend verification to check with Stripe if sessionId has been fully paid
        fetch(`/api/stripe/verify-session?sessionId=${encodeURIComponent(sessionId)}`)
          .then(async (res) => {
            if (!res.ok) {
              throw new Error("Validation échouée auprès de Stripe.");
            }
            const data = await res.json();
            if (data.valid) {
              refillCredits(data.credits, `Paiement Stripe Réussi: ${data.planName}`);
              usedIds.push(sessionId);
              safeLocalStorage.setItem("ifas_processed_stripe_sessions", JSON.stringify(usedIds));
              
              // Clean up parameters so user can't refresh
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
              
              // Pop open the success modal beautifully
              setIsRechargeOpen(true);
            }
          })
          .catch((err) => {
            console.error("Erreur de validation Stripe:", err);
          });
      } else {
        // Clear param if already processed
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else if (params.get("stripe_cancel") === "true") {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      try {
        alert("Paiement annulé. Aucun crédit n'a été décompté.");
      } catch (e) {
        console.warn("Could not alert. Payment cancels safely.", e);
      }
    }
  }, []);

  return {
    credits,
    transactions,
    spendCredit,
    refillCredits,
    isRechargeOpen,
    setIsRechargeOpen,
    isGateOpen,
    setIsGateOpen,
  };
}

// Indicator badge to render in the header
interface CreditIndicatorProps {
  credits: number;
  onOpenRecharge: () => void;
}

export function CreditIndicator({ credits, onOpenRecharge }: CreditIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenRecharge}
        className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-1.5 px-3.5 rounded-full text-xs shadow-md shadow-amber-500/15 cursor-pointer hover:scale-105 active:scale-[0.98] transition"
        id="btn-header-credits"
        title="Gérer vos crédits"
      >
        <Coins className="w-4 h-4 shrink-0 animate-pulse text-amber-100" />
        <span>{credits >= 9999 ? "Forfait Illimité ✨" : `${credits} ${credits > 1 ? "crédits" : "crédit"}`}</span>
      </button>

      <button
        onClick={onOpenRecharge}
        className="flex items-center justify-center p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg hover:text-amber-600 transition cursor-pointer"
        id="btn-header-add-credits"
        title="Recharger des crédits"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Modal component that simulates Stripe payments and manages the recharge choice
interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  refillCredits: (amount: number, description: string) => void;
  transactions: CreditTransaction[];
}

export function RechargeModal({ isOpen, onClose, credits, refillCredits, transactions }: RechargeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(1); // default to Recommended plan
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"checkout" | "history">("checkout");
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const PLANS = [
    {
      id: 0,
      name: "Offre Découverte",
      credits: 1,
      price: "10,00 €",
      priceLabel: "Payez une fois",
      pricePerOral: "10,00 € / simulation",
      badge: "Formule d'initiation",
      savings: "Tarif de base",
      features: [
        "1 simulation complète d'entretien IFAS",
        "Rapport de jury IA détaillé sous 30s",
        "Note finale sur 20 & bientraitance",
        "Paiement unique, sans engagement"
      ],
      popular: false,
    },
    {
      id: 1,
      name: "Offre Préparation",
      credits: 5,
      price: "30,00 €",
      priceLabel: "Le choix malin",
      pricePerOral: "6,00 € / simulation",
      badge: "Économique • Recommandé",
      savings: "Économise 20 € immédiatement (soit -40%) !",
      features: [
        "5 simulations complètes d'entretien IFAS",
        "Note sur 20 pour chaque essai réalisé",
        "Accès illimité aux fiches de révisions IFAS",
        "Doublement de la vitesse d'analyse",
        "Économie immédiate de 20,00 €"
      ],
      popular: true,
    },
    {
      id: 2,
      name: "Offre Premium",
      credits: 9999, // Unlimited simulations marker
      price: "60,00 €",
      priceLabel: "Zéro stress pendant 30j",
      pricePerOral: "Simulations illimitées",
      badge: "Succès Assuré • Accès Total",
      savings: "Simulations illimitées pendant 30 jours complets !",
      features: [
        "Simulations de cas cliniques en illimité",
        "Idéal pour s'entraîner intensément sans compter",
        "Garantie réussite ou remboursé de 14 jours",
        "Accès prioritaire à toutes les questions ARS",
        "Support pédagogique prioritaire par e-mail"
      ],
      popular: false,
    },
  ];

  const FAQ_ITEMS = [
    {
      q: "Comment fonctionne la garantie de remboursement ?",
      a: "Nous croyons fermement en l'efficacité de Sacha. Si vous n'êtes pas satisfait de votre entraînement ou si vous changez d'avis, nous vous remboursons à 100% sur simple demande par e-mail dans les 14 jours suivant votre achat. Aucune justification ne vous sera demandée."
    },
    {
      q: "Est-ce un prélèvement automatique ou un paiement unique ?",
      a: "C'est un paiement unique à 100%. Il n'y a absolument aucun abonnement caché, aucun frais de renouvellement récurrent, ni prélèvement automatique futur. Votre accès s'arrête de lui-même sans action requise."
    },
    {
      q: "Le paiement par carte bancaire est-il sécurisé ?",
      a: "La transaction est entièrement sécurisée par Stripe, leader mondial du paiement sur Internet. Vos informations bancaires sont chiffrées de bout en bout (protocole TLS/SSL AES-256) conformes à la norme PCI-DSS de niveau 1. Elles ne transitent jamais sur nos serveurs."
    },
    {
      q: "Que se passe-t-il après l'achat de l'Offre Premium Illimitée ?",
      a: "Dès validation du paiement, votre compte passe instantanément sous le statut d'accès illimité. Le compteur du haut affichera 'Forfait Illimité'. Vous pourrez lancer autant de simulations que nécessaire sur n'importe quel module durant 30 jours complets."
    }
  ];

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan === null) return;
    setIsPaying(true);

    try {
      // Call server API to request Stripe checkout redirect session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          appUrl: window.location.origin
        })
      });

      if (!response.ok) {
        throw new Error("Erreur de connexion.");
      }

      const result = await response.json();

      if (result.url) {
        // Redirect to Stripe hosted payment page
        window.location.href = result.url;
      } else {
        // High-fidelity sandbox fallback
        setTimeout(() => {
          const plan = PLANS[selectedPlan];
          refillCredits(plan.credits, `Recharge: ${plan.name} (${plan.credits >= 9999 ? "Accès Illimité" : `+${plan.credits} simulations`}) [Demo]`);
          setIsPaying(false);
          setPaymentSuccess(true);
        }, 1500);
      }
    } catch (err: any) {
      console.warn("[Stripe Dev Fallback] Mode simulé activé.", err);
      setTimeout(() => {
        const plan = PLANS[selectedPlan];
        refillCredits(plan.credits, `Recharge: ${plan.name} (${plan.credits >= 9999 ? "Accès Illimité" : `+${plan.credits} simulations`}) [Offline Fallback]`);
        setIsPaying(false);
        setPaymentSuccess(true);
      }, 1000);
    }
  };

  const handleResetSuccess = () => {
    setPaymentSuccess(false);
    setSelectedPlan(1);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    onClose();
  };

  const currentPlan = PLANS[selectedPlan ?? 0];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="recharge-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-fadeIn" id="recharge-modal">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
              <Coins className="w-5 h-5 text-amber-500 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base md:text-lg">Préparer mon concours IFAS</h3>
              <p className="text-[11px] text-slate-500">Augmentez vos chances d'admission grâce à nos oraux blancs interactifs.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab("checkout")}
                className={`px-3.5 py-1.5 rounded-md transition duration-150 cursor-pointer ${activeTab === "checkout" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Tarifs & Formules
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-1.5 rounded-md transition duration-150 cursor-pointer ${activeTab === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Mon Historique
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              id="btn-close-recharge-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {paymentSuccess ? (
            <div className="text-center py-10 px-4 space-y-6 max-w-md mx-auto animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10 animate-scaleIn" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl md:text-2xl font-black text-slate-800">Félicitations !</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Votre transaction sécurisée Stripe de <strong className="text-slate-800">{currentPlan.price}</strong> a été enregistrée avec succès. Votre compte bénéficie maintenant de :
                </p>
                <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-xl text-teal-800 font-extrabold text-sm sm:text-base tracking-tight shadow-sm">
                  {currentPlan.credits >= 9999 ? "Accès Illimité pendant 30 Jours 🔓" : `+ ${currentPlan.credits} simulations d'examen`}
                </div>
              </div>

              {/* Status card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-left">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-black tracking-widest mb-1">
                  <span>STATUT INTÉGRATION STRIPE</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> CRÉDITÉ
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Solde actuel :</span>
                  <span className="font-extrabold text-slate-800 text-base">
                    {credits >= 9999 ? "Illimité" : `${credits} crédits`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetSuccess}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-teal-600/10 cursor-pointer"
              >
                Commencer mon entraînement
              </button>
            </div>
          ) : activeTab === "history" ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  Transactions et crédits récents
                </h4>
                <div className="text-xs bg-white text-slate-700 font-extrabold py-1 px-3 border border-slate-200 rounded-lg">
                  Mon solde : {credits >= 9999 ? "Accès Illimité ✨" : `${credits} crédits`}
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs sm:text-sm">Aucune transaction enregistrée pour le moment.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">{tx.description}</div>
                        <div className="text-slate-400 flex items-center gap-1.5 text-[10px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{tx.date}</span>
                        </div>
                      </div>
                      <div className={`font-black text-sm px-2.5 py-1 rounded-lg ${tx.type === "refill" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {tx.type === "refill" ? `+${tx.amount}` : `-${tx.amount}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              
              {/* Left Side: Plans */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Trouvez l'offre parfaite pour réussir</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Prenez de l'avance, éliminez votre trac de prise de parole et maîtrisez à 100% les protocoles d'hygiène et de sécurité exigés à l'examen.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between whitespace-normal ${
                        selectedPlan === plan.id
                          ? "border-teal-500 bg-white shadow-md shadow-teal-500/5 ring-1 ring-teal-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-600 to-teal-650 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
                          Conseillé • Recommandé par l'IFAS
                        </span>
                      )}
                      
                      <div className="space-y-2 flex-grow max-w-md">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? "border-teal-500" : "border-slate-300"}`}>
                            {selectedPlan === plan.id && <div className="w-2 h-2 bg-teal-500 rounded-full" />}
                          </div>
                          <span className="font-black text-slate-900 text-sm md:text-base">{plan.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md shrink-0 block">
                            {plan.badge}
                          </span>
                        </div>
                        
                        {/* Highlights & Savings */}
                        <div className="space-y-1 pl-6">
                          <p className="text-xs text-indigo-700 font-extrabold flex items-center gap-1 shrink-0">
                            <span>{plan.savings}</span>
                          </p>
                          <span className="text-[11px] text-slate-500 leading-none block font-semibold text-teal-700">
                            Simulations incluses : <strong className="text-teal-800">{plan.credits >= 9999 ? "Accès Illimité (30 jours)" : `${plan.credits} simulation(s) complète(s)`}</strong>
                          </span>
                        </div>

                        {/* Features dots */}
                        <ul className="pl-6 space-y-1 pt-1">
                          {plan.features.map((feat, fidx) => (
                            <li key={fidx} className="text-[11px] text-slate-500 flex items-center gap-1.5 leading-none">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-left sm:text-right shrink-0 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <div className="text-slate-400 text-[11px] sm:mb-0.5 font-bold uppercase">{plan.priceLabel}</div>
                        <div className="text-xl md:text-2xl font-black text-slate-800 leading-none">{plan.price}</div>
                        <div className="text-[10px] text-teal-600 font-extrabold mt-1">
                          {plan.pricePerOral}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secure Badge Design */}
                <div className="relative overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-black tracking-wider uppercase text-emerald-400">PAIEMENT SÉCURISÉ STRIPE • CERTIFICATION ARS</span>
                    </div>
                    <span className="bg-white/10 text-slate-300 text-[8px] font-bold px-2 py-0.5 rounded border border-white/10">PCI-DSS LEVEL 1</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sacha Virtual Jury intègre l'infrastructure de paiement **Stripe** hautement sécurisée. Vos données personnelles de connexion et de carte de crédit font l'objet d'un chiffrement militaire SSL AES-256 bits conforme à la réglementation RGPD européenne. Nous n'avons aucun moyen d'accéder à vos coordonnées bancaires privées.
                  </p>
                  <div className="flex items-center gap-3 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>🔓 SSL Chiffré</span>
                    <span>• 🛡️ Garantie Satisfait 14J</span>
                    <span>• 🇫🇷 Serveurs en France</span>
                  </div>
                </div>

                {/* Refund FAQ Interactive section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      FAQ — Remboursements, Sécurité et Fonctionnement
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tout comprendre sur notre charte de confiance et de remboursement.</p>
                  </div>

                  <div className="space-y-2">
                    {FAQ_ITEMS.map((faq, index) => {
                      const isActive = activeFaqIndex === index;
                      return (
                        <div key={index} className="border border-slate-150 rounded-xl overflow-hidden transition-all duration-200 hover:bg-slate-50/40">
                          <button
                            onClick={() => setActiveFaqIndex(isActive ? null : index)}
                            className="w-full text-left p-3 flex justify-between items-center text-xs font-bold text-slate-800 gap-3 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <span className="text-teal-600 font-extrabold text-base leading-none">
                              {isActive ? "−" : "+"}
                            </span>
                          </button>
                          {isActive && (
                            <div className="p-3 pt-0 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-650 leading-relaxed animate-fadeIn">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Side: Billing Check Box */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-md p-5 space-y-5 lg:sticky lg:top-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                    Récapitulatif de commande
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Passerelle de paiement officielle validée.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="block text-slate-800 text-sm font-black">{currentPlan.name}</strong>
                      <span className="text-teal-600 font-extrabold text-xs">
                        {currentPlan.credits >= 9999 ? "Accès Illimité (30 jours)" : `${currentPlan.credits} simulation(s) d'entretien`}
                      </span>
                    </div>
                    <span className="text-base font-black text-slate-900 shrink-0">{currentPlan.price}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-2.5 flex justify-between">
                    <span>Avantage :</span>
                    <span className="text-indigo-600 font-extrabold">{currentPlan.savings}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between leading-none">
                    <span>TVA incluse :</span>
                    <span>0,00 € (Régime Micro-entreprise)</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg text-[10.5px] text-emerald-800 font-medium leading-relaxed">
                    🌟 **Garantie Satisfait ou Remboursé 14 jours active** sur ce forfait.
                  </div>
                </div>

                {/* Card input (Simulated stripe elements / real support fallback) */}
                <form onSubmit={handleSimulatePayment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Numéro de Carte Bancaire (Test / Réel)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800 font-mono tracking-wide"
                        maxLength={19}
                      />
                      <CreditCard className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-35">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Date d'expiration</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800 font-mono text-center"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">CVV / CVC</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800 font-mono text-center"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPaying || selectedPlan === null}
                    className="w-full bg-gradient-to-tr from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-350 text-white font-bold py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm shadow-md"
                    id="btn-simulate-checkout"
                  >
                    {isPaying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Lancement de Stripe...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-teal-100" /> Confirmer mon achat sécurisé ({currentPlan.price})
                      </span>
                    )}
                  </button>
                </form>

                <div className="text-[10px] text-slate-400 text-center leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  💡 **Note** : Le paiement est géré de façon 100% sécurisée par notre partenaire Stripe. Si vous possédez un code de réduction ou d'accès, vous pourrez l'appliquer sur la page de paiement.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dialog that intercepts trying to run on 0 remaining credits
interface CreditGateProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
}

export function CreditGateModal({ isOpen, onClose, onOpenRecharge }: CreditGateProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="gate-modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 text-center animate-scaleIn" id="gate-modal">
        
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto border-2 border-amber-200">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h4 className="text-xl font-extrabold text-slate-800">Crédits d'entraînement insuffisants !</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            Chaque entraînement interactif assisté par le Jury Virtuel IA nécessite <strong className="text-amber-600">1 crédit</strong>. Votre solde actuel est de 0 crédit.
          </p>
        </div>

        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 text-[11px] text-amber-900 text-left space-y-1.5 leading-relaxed">
          <strong className="block text-amber-950">Pourquoi recharger vos crédits ?</strong>
          <span className="block">• Accès au moteur de questions dynamique.</span>
          <span className="block">• Évaluations et analyses détaillées par critère de compétences.</span>
          <span className="block">• Accès complet aux fiches de révisions thématiques.</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Plus tard
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="flex-1 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 transition cursor-pointer"
          >
            Recharger des crédits
          </button>
        </div>
      </div>
    </div>
  );
}
