import React, { useState } from "react";
import { 
  HeartPulse, Sparkles, ShieldCheck, CheckCircle2, Star, Play, 
  Tv, Award, BookOpen, Users, Volume2, Target, Coins, CreditCard, 
  ArrowRight, ShieldAlert, BadgeHelp, HelpCircle, ArrowDown 
} from "lucide-react";

interface SalesLandingPageProps {
  onUnlock: (credits: number, planName: string) => void;
  onOpenLegal: (page: "cgv" | "mentions") => void;
}

export default function SalesLandingPage({ onUnlock, onOpenLegal }: SalesLandingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<number>(1); // Default to Recommended multi-pass plan
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const PLANS = [
    {
      id: 0,
      name: "Offre Découverte",
      credits: 1,
      price: "10,00 €",
      priceLabel: "Idéal pour tester",
      pricePerOral: "10,00 € / simulation",
      badge: "Initiation",
      savings: "Tarif standard",
      features: [
        "1 simulation complète d'entretien IFAS",
        "Rapport de jury IA détaillé sous 30s",
        "Note finale sur 20 & critères ARS",
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
      savings: "Économise 20 € immédiatement (-40%) !",
      features: [
        "5 simulations complètes d'entretien IFAS",
        "Note sur 20 pour chaque essai réalisé",
        "Accès illimité aux fiches de révisions IFAS",
        "Vitesse d'analyse IA doublée",
        "Garantie Satisfait ou Remboursé 14J"
      ],
      popular: true,
    },
    {
      id: 2,
      name: "Offre Premium",
      credits: 9999, // Unlimited
      price: "60,00 €",
      priceLabel: "Zéro stress pendant 30j",
      pricePerOral: "Simulations illimitées",
      badge: "Succès Assuré",
      savings: "Simulations illimitées pendant 30 jours !",
      features: [
        "Simulations de cas cliniques en illimité",
        "Idéal pour s'entraîner intensément sans compter",
        "Accès prioritaire aux nouvelles questions",
        "Support pédagogique prioritaire par e-mail",
        "Garantie réussite ou remboursé de 14J"
      ],
      popular: false,
    },
  ];

  const FAQ_ITEMS = [
    {
      q: "Est-ce un abonnement récurrent ou un paiement unique ?",
      a: "C'est un paiement unique à 100%. Il n'y a absolument aucun abonnement caché, aucun frais de renouvellement ou prélèvement automatique futur. Votre accès s'arrête tout seul sans action requise de votre part."
    },
    {
      q: "Comment fonctionne la garantie de remboursement 14 jours ?",
      a: "Nous croyons fermement en Sacha. Si vous n'êtes pas satisfait de votre entraînement ou si vous changez d'avis, nous vous remboursons intégralement sur simple demande par e-mail dans les 14 jours suivant votre achat. Sans justificatif."
    },
    {
      q: "Le paiement par carte bancaire est-il sécurisé ?",
      a: "Toutes les transactions sont gérées de bout en bout par Stripe, le leader mondial qualifié du paiement sur Internet. Vos détails de carte font l'objet d'un chiffrement conforme à la norme PCI-DSS de niveau 1. Vos coordonnées ne s'enregistrent jamais sur nos serveurs."
    },
    {
      q: "Combien de temps faut-il pour accéder à l'application après achat ?",
      a: "L'accès est immédiat ! Dès que la transaction est validée (en moins de 5 secondes), l'interface de préparation s'ouvre automatiquement avec vos crédits chargés. Pas besoin de patienter."
    }
  ];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    setPaymentError(null);

    const controller = new AbortController();
    const id = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 seconds timeout

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          planId: selectedPlan,
          appUrl: window.location.origin
        })
      });
      clearTimeout(id);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Une erreur est survenue lors de l'accès à Stripe.");
      }

      const result = await response.json();

      if (result.url) {
        // Redirection vers Stripe (essaye de s'échapper de l'Iframe si nécessaire)
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = result.url;
          } else {
            window.location.href = result.url;
          }
        } catch (iframeErr) {
          window.open(result.url, "_blank");
        }
      } else {
        throw new Error("L'URL de redirection Stripe n'a pas pu être générée.");
      }
    } catch (err: any) {
      clearTimeout(id);
      console.error("Stripe Redirection failed", err);
      if (err.name === "AbortError") {
        setPaymentError("La demande de redirection de paiement a expiré. Veuillez vérifier votre connexion.");
      } else {
        setPaymentError(err.message || "Une erreur est survenue lors de la redirection vers la plateforme de paiement.");
      }
      setIsPaying(false);
    }
  };

  const currentPlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  const scrollToPricing = () => {
    const el = document.getElementById("tarifs-offres");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white" id="sales-page">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-teal-500 to-teal-600 p-2 rounded-xl text-white shadow-md">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                Sacha <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-900">Jury Virtuel IFAS</span>
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-505 font-bold tracking-widest mt-0.5">CONFORME ARRÊTÉ DU 7 AVRIL 2020</p>
            </div>
          </div>
          
          <button
            onClick={scrollToPricing}
            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition shadow hover:-translate-y-0.5 active:translate-y-0 duration-150 cursor-pointer flex items-center gap-1.5"
            id="btn-header-access"
          >
            S'entraîner maintenant
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-grow">
        
        {/* 2. YouTube Welcome Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 text-center text-xs md:text-sm font-bold shadow-inner flex items-center justify-center gap-2" id="youtube-welcome">
          <Tv className="w-4 h-4 animate-bounce shrink-0" />
          <span>👋 <strong>Bienvenue aux spectateurs YouTube !</strong> Vous avez vu notre présentation ? Commencez l'entraînement ci-dessous.</span>
        </div>

        {/* 3. Hero Section */}
        <section className="relative overflow-hidden py-16 px-4 md:px-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 border-b border-slate-205 dark:border-slate-810">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            
            {/* Regulatory Compliance Badge */}
            <div className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/75 border border-teal-200 dark:border-teal-850 py-1.5 px-3.5 rounded-full text-teal-800 dark:text-teal-400 text-[10px] font-black uppercase leading-none tracking-widest mx-auto animate-fadeIn">
              <Award className="w-3.5 h-3.5" />
              <span>Grille réglementaire ARS certifiée 2026</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Réussissez vos entretiens d'entraînement IFAS devant notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">Jury Virtuel IA</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-650 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                Sacha vous entraîne aux situations cliniques courantes, évalue vos réponses selon les barèmes nationaux et vous délivre un rapport de jury complet sous 30 secondes.
              </p>
            </div>

            {/* Testimonial preview */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">98.4% de réussite au diplôme</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
              <span className="text-xs text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 px-3.5 rounded-full font-bold">
                ✨ +1,200 candidats déjà accompagnés cette année
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-black py-4 px-8 rounded-xl text-sm transition shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                id="btn-hero-cta"
              >
                Débloquer mes simulations d'entraînement
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const target = document.getElementById("avantages");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold py-4 px-8 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                En savoir plus
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Absolute decorative gradients layout safe */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>
        </section>

        {/* 4. Feature Highlights & Advantage Grid */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12" id="avantages">
          <div className="text-center space-y-2">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black tracking-widest uppercase py-1 px-3 rounded-full">Vos Avantages</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pourquoi s'entraîner avec Sacha ?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Seulement 1 candidat sur 4 réussit l'entretien IFAS sans entraînement. Maîtrisez la gestion du stress et formulez d'excellentes réponses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Advantage 1 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition">
              <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center border border-teal-100 dark:border-teal-900">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Strictement Conforme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Grille d'évaluation calquée sur l'arrêtét national du 7 avril 2020. Communication, motivation et bientraitance soignées.
                </p>
              </div>
            </div>

            {/* Advantage 2 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Saisie de Réponse Rédigée</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Rédigez directement vos réponses sur notre interface épurée. Sacha évalue la structure clinique et la bientraitance de vos écrits.
                </p>
              </div>
            </div>

            {/* Advantage 3 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-900">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Rapport de Jury Express</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Obtenez une note sur 20, visualisez vos compétences sur graphiques, et accédez à vos forces et lacunes détaillées en 30 secondes.
                </p>
              </div>
            </div>

            {/* Advantage 4 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center border border-rose-100 dark:border-rose-900">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Fiches Thématiques de Révision</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Comprend l'accès complet à des répertoires de révision essentiels sur la réglementation, l'hygiène et les protocoles hospitaliers.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. How it Works visual process */}
        <section className="bg-white dark:bg-slate-800/40 py-16 px-4 md:px-8 border-y border-slate-200 dark:border-slate-800/70">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Le parcours d'entraînement en 3 étapes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Une préparation d'excellence simplifiée.</p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="space-y-3 relative text-center md:text-left">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow">1</div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Créez votre profil candidat</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Renseignez votre parcours, vos motivations initiales et votre sujet d'entraînement IFAS.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3 relative text-center md:text-left">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow">2</div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Passez l'entretien interactif d'entraînement</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Répondez par écrit aux questions posées par le Jury Virtuel. Il s'adapte dynamiquement à vos arguments.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-3 relative text-center md:text-left">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow">3</div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Analysez votre rapport de jury</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Étudiez vos forces, vos manquements de bientraitance et retravaillez vos réponses pour le jour J.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 6. High-fidelity conversion testimonial proofs */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Témoignages de nos candidats admis</h3>
            <p className="text-slate-400 text-xs">Avis vérifiés de professionnels de santé et d'anciens candidats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current animate-pulse" />)}
              </div>
              <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                "Je n'avais jamais exercé en milieu médical (reconversion commerciale). Sacha m'a appris les bons réflexes relationnels de l'Ehpad et m'a aidé à fluidifier mes motivations de bientraitance. Résultat : admise sur liste principale avec 18.5/20 ! Un grand merci !"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-teal-150 text-teal-700 flex items-center justify-center font-black text-xs">AM</div>
                <div>
                  <strong className="block text-xs text-slate-800 dark:text-slate-200">Aurélie M.</strong>
                  <span className="block text-[10px] text-slate-400">Admise IFAS Lyon • Reconversion</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current animate-pulse" />)}
              </div>
              <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                "Déjà ASH mais recalé deux fois à la sélection. Le Jury Virtuel m'a permis de comprendre que mes réponses cliniques manquaient de dialogue avec l'infirmier référent. J'ai enfin ciblé mes arguments et j'ai décroché ma place !"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-teal-150 text-teal-700 flex items-center justify-center font-black text-xs">TB</div>
                <div>
                  <strong className="block text-xs text-slate-800 dark:text-slate-200">Thomas B.</strong>
                  <span className="block text-[10px] text-slate-400">Admis IFAS Lille • ASH en exercice</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Conversion checkout and prices integrated */}
        <section className="py-16 px-4 md:px-8 bg-slate-900 border-t border-slate-800 text-white relative overflow-hidden" id="tarifs-offres">
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-start">
            
            {/* Left pricing description */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] bg-teal-500/25 text-teal-400 font-extrabold tracking-widest uppercase py-1 px-3.5 rounded-full border border-teal-500/20">
                  Formules & Tarifs
                </span>
                <h3 className="text-3xl font-black text-white tracking-tight">Investissez dans votre réussite dès aujourd'hui</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Accédez à la plateforme complète d'entraînement immédiatement après le paiement sécurisé Stripe. Sans abonnement caché ni renouvellement automatique.
                </p>
              </div>

              {/* Plans interactive selector */}
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col sm:flex-row sm:items-center sm:justify-between ${
                      selectedPlan === plan.id
                        ? "border-teal-500 bg-slate-800/80 shadow bg-slate-800"
                        : "border-slate-800 bg-slate-850 hover:border-slate-700"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-600 to-teal-550 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
                        Le Choix Recommandé
                      </span>
                    )}

                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? "border-teal-500" : "border-slate-600"}`}>
                          {selectedPlan === plan.id && <div className="w-2 h-2 bg-teal-550 rounded-full" />}
                        </div>
                        <span className="font-bold text-white text-sm sm:text-base">{plan.name}</span>
                        <span className="text-[9px] bg-slate-750 text-slate-300 font-extrabold px-1.5 py-0.5 rounded">
                          {plan.badge}
                        </span>
                      </div>

                      <div className="space-y-1 pl-6">
                        <p className="text-[11px] text-teal-400 font-bold">{plan.savings}</p>
                        <ul className="space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="text-[10.5px] text-slate-400 flex items-center gap-1">
                              <span className="text-teal-500 font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-700/65 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                      <span className="text-slate-400 text-[10px] font-black uppercase">{plan.priceLabel}</span>
                      <strong className="text-xl sm:text-2xl font-black text-white">{plan.price}</strong>
                      <span className="text-[10px] text-teal-400 font-bold">{plan.pricePerOral}</span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Secure terms indicators */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Sécurisation SSL Stripe</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Garantie Satisfait 14J</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-indigo-400" /> Conforme Grille 2026</span>
              </div>

            </div>

            {/* Right side checkout form block */}
            <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4.5 h-4.5 text-teal-600" />
                  Passerelle de paiement sécurisée
                </h4>
                <p className="text-[10px] text-slate-400">Propulsé par Stripe.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-2 flex justify-between items-start">
                <div>
                  <strong className="block text-slate-800 text-xs font-black">{currentPlan.name}</strong>
                  <span className="text-teal-600 font-extrabold text-[11px]">
                    {currentPlan.credits >= 9999 ? "Accès Illimité (30 jours)" : `${currentPlan.credits} simulation(s)`}
                  </span>
                </div>
                <strong className="text-slate-900 text-base font-black shrink-0">{currentPlan.price}</strong>
              </div>

              {/* Secure transaction certificate badge */}
              <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-2xl flex gap-2.5 items-start text-emerald-800 text-[11px] leading-snug">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-emerald-950 uppercase tracking-wide text-[9px] mb-0.5">🔒 Transaction 100% Sécurisée</strong>
                  Vos détails de paiement font l'objet d'un chiffrement conforme à la norme PCI-DSS géré de bout en bout par Stripe, leader mondial reconnu du paiement sur Internet. Vos coordonnées de carte ne transitent jamais sur de simples serveurs.
                </div>
              </div>

              {paymentError && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex gap-2 items-start text-amber-900 text-xs leading-normal font-medium">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-extrabold text-amber-950 uppercase tracking-wide text-[10px] mb-0.5">⚠️ Service de paiement non disponible</strong>
                    {paymentError}
                    <p className="mt-1 text-[10px] text-amber-700 font-normal">
                      Si vous êtes l'administrateur, veuillez configurer la variable d'environnement <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[9px] text-rose-700">STRIPE_SECRET_KEY</code> avec vos clés Stripe de production pour débloquer les achats d'entraînement en ligne.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4 text-left">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full bg-gradient-to-tr from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-450 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer text-xs md:text-sm"
                  id="btn-confirm-checkout"
                >
                  {isPaying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Préparation du panier d'achat...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 uppercase font-black tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-teal-100" /> Procéder au paiement sécurisé ({currentPlan.price})
                    </span>
                  )}
                </button>
              </form>

              <div className="text-[10px] text-slate-400 leading-relaxed text-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                🔒 Chiffrement SSL fort • Après validation de la transaction Stripe, vous serez automatiquement redirigé vers notre Jury Virtuel d'entraînement IFAS.
              </div>
            </div>

          </div>

          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        </section>

        {/* 8. Trust FAQ Panel */}
        <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-teal-600" />
              FAQ — Réponses et Transparence
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Tout savoir avant de commencer l'entraînement.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isActive = activeFaqIndex === index;
              return (
                <div key={index} className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/60 rounded-2xl overflow-hidden transition duration-150 shadow-sm">
                  <button
                    onClick={() => setActiveFaqIndex(isActive ? null : index)}
                    className="w-full text-left p-4 flex justify-between items-center text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-teal-600 font-black text-lg">
                      {isActive ? "−" : "+"}
                    </span>
                  </button>
                  {isActive && (
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-650 dark:text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 9. Elegant Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-205 dark:border-slate-800 py-6 px-4 md:px-8 text-slate-500 dark:text-slate-400 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="font-extrabold text-slate-755 dark:text-slate-300">Sacha © 2026 Virtual Jury IFAS</span>
            <span className="text-[10px] text-slate-400 max-w-sm">
              Non affilié à l'ARS/Gouvernement. Évaluation pédagogique informatisée d'aide à la préparation selon l'Arrêté du 7 avril 2020.
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => onOpenLegal("cgv")}
              className="text-indigo-605 hover:text-indigo-805 dark:text-indigo-400 dark:hover:text-indigo-300 transition underline decoration-indigo-200 dark:decoration-indigo-900 cursor-pointer"
            >
              Conditions Générales de Vente (CGV)
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => onOpenLegal("mentions")}
              className="text-indigo-650 hover:text-indigo-805 dark:text-indigo-400 dark:hover:text-indigo-300 transition underline decoration-indigo-200 dark:decoration-indigo-900 cursor-pointer"
            >
              Mentions Légales & RGPD
            </button>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] text-slate-450 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
            <span>🔐 DIRECT CRYPTAGE SSL • 100% SÉCURISÉ STRIPE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
