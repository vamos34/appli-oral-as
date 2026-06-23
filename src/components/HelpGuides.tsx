import React, { useState } from "react";
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  UserCheck
} from "lucide-react";

type GuideSection = {
  subtitle: string;
  text: string;
  trap?: string;
  advice?: string;
};

type GuideCategory = {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  sections: GuideSection[];
};

export default function HelpGuides() {
  const [activeTab, setActiveTab] = useState<string>("piliers");

  const CATEGORIES: Record<string, GuideCategory> = {
    piliers: {
      id: "piliers",
      title: "🏆 Les 3 Piliers de la Nouvelle Grille",
      description: "Les critères fondamentaux d'admission sur lesquels le jury vous note concomitamment (Arrêté du 7 avril 2020).",
      badge: "Grille Officielle 2026",
      icon: Award,
      color: "text-emerald-700 border-emerald-200",
      bgColor: "bg-emerald-50",
      sections: [
        {
          subtitle: "1. Aptitude à la Communication & Posture Orale (Sur 4 points)",
          text: "Le jury évalue votre élocution, la politesse et la clarté d'expression de vos idées.\n- **Vocabulaire professionnel :** Évitez le langage familier et appropriez-vous des mots-clés du soin (bientraitance, empathie, projet, collaboration, sécurité, écoute, pudeur, autonomie).\n- **Posture non-verbale :** Entrez avec le sourire, dites bonjour distinctement aux deux jurés. Restez droit, les mains ouvertes et posées sur la table. Évitez les postures fermées (bras croisés/ongles rongés).",
          advice: "S'entraîner à haute voix est la clé. Des phrases courtes, claires et rythmées valent mieux qu'un long monologue confus."
        },
        {
          subtitle: "2. Motivation, réalisme du Projet & Financement (Sur 8 points)",
          text: "Vous devez faire preuve d'un intérêt profond pour le domaine de la santé et d'un projet de formation mûrement réfléchi.\n- **Connaissance des réalités du métier :** Montrez que vous êtes conscient des contraintes (horaires décalés postés en 2x8 ou 3x8, travail les week-ends et jours fériés, fatigue physique lors des mobilisations, confrontation à la mort ou à la souffrance d'autrui).\n- **Viabilité logistique et matérielle :** Le jury veut la preuve formelle que vous avez anticipé le financement de votre année et des stages (financement Région, CPF, Transition Pro, France Travail, économies, organisation des transports complexes car les stages commencent à 6h00 du matin, garde des enfants).",
          trap: "Dire qu'on n'a 'pas peur du tout' ou éluder la question du financement en disant 'on verra' est perçu comme de l'immaturité par le jury.",
          advice: "Explicitez clairement votre mode de transport (permis de conduire ou covoiturage calé) et montrez un budget de subsistance anticipé."
        },
        {
          subtitle: "3. Aptitudes Relationnelles, Valeurs du Soin & Bientraitance (Sur 8 points)",
          text: "C'est le cœur humain du futur soignant. Vos réponses doivent transpirer le respect de l'usager.\n- **La Bientraitance active :** Ce n’est pas juste l'absence de maltraitance. C’est le respect du rythme du résident, l'adaptation à ses souhaits, le non-tutoiement des adultes, et la préservation constante de son intimité et de son libre arbitre.\n- **La Collaboration et limites :** L'aide-soignant travaille en équipe pluri-professionnelle de soin sous la responsabilité de l'infirmier(e). Vous devez montrer que vous connaissez parfaitement vos limites (vous ne faites pas de soins infirmiers, vous collaborez et transmettez systématiquement tout événement indésirable).",
          advice: "Chaque fois que vous décrivez une action, mentionnez le respect de la pudeur de la personne et la transmission d'informations à l'équipe."
        }
      ]
    },
    pieges: {
      id: "pieges",
      title: "❓ Questions Redoutables & Contre-Pièges",
      description: "Les questions de déstabilisation du binôme de jurés et comment y répondre sereinement.",
      badge: "Incontournables du Jury",
      icon: AlertTriangle,
      color: "text-amber-700 border-amber-200",
      bgColor: "bg-amber-50",
      sections: [
        {
          subtitle: "« Pourquoi devenir Aide-Soignant et pas plutôt Infirmier ? »",
          text: "Le jury cherche à savoir si vous choisissez le métier d'AS par dépit ou par passion réelle de l'accompagnement d'humain à humain.\n- **La bonne posture :** Valorisez le soin relationnel au quotidien. Soulignez que l'accompagnement dans les gestes fondamentaux de la vie courante (la toilette, le repas, l'écoute) vous permet d'être au plus près de la personne, dans un contact continu et chaleureux.\n- **La distinction :** Expliquez que le côté hautement relationnel et direct du rôle d'aide-soignant correspond pleinement à vos valeurs personnelles, alors que le rôle infirmier comporte une composante de soins techniques hospitaliers et administratifs plus éloignée du contact humain immédiat.",
          trap: "Évitez à tout prix les réponses comme 'Parce que les études sont plus courtes' ou 'Parce que je n'ai pas le niveau pour entrer en IFSI'. Ces explications détruisent la valeur des deux professions aux yeux des jurés.",
          advice: "Dites : 'Le geste de soin de vie quotidienne de l'aide-soignant est pour moi le plus noble et le plus proche du besoin humain fondamental du résident.'"
        },
        {
          subtitle: "« Quelles sont vos plus grandes craintes vis-à-vis du métier d'AS ? »",
          text: "Cette question mesure votre lucidité relative au métier.\n- **La bonne posture :** Assumez vos limites et vos peurs légitimes (ex: la première confrontation à la détresse d'une fin de vie, la charge psychologique des premiers stages cliniques, la charge de travail physique).\n- **La solution intégrée :** Enchaînez immédiatement sur la manière de surmonter cela : la communication de groupe en équipe de soins, le débriefing avec ses collègues, le soutien des formateurs de l'IFAS, et le respect des protocoles d'ergonomie pour se préserver physiquement.",
          trap: "Répondre 'Je n'ai absolument aucune peur' démontre une idéalisation naïve et dangereuse des réalités du travail d'accompagnement de santé.",
          advice: "Montrez qu'une crainte s'apprivoise en équipe soignante : 'La fatigue émotionnelle existe, mais l'équipe est notre meilleure alliée pour échanger et surmonter les moments difficiles.'"
        },
        {
          subtitle: "« Comment allez-vous financer vos 10 mois d'études ? »",
          text: "Le jury élimine fréquemment des profils brillants qui risquent d'abandonner à cause d'une précarité financière intenable.\n- **La bonne posture :** Présentez un plan budgétaire précis et solide. Parlez avec des termes administratifs (ex: 'Mon dossier de financement de région est accepté', 'Je bénéficie du maintien de mes allocations de retour à l'emploi (AREF)', 'J'ai signé un contrat d'apprentissage ou un contrat d'allocation d'études d'établissement').",
          trap: "Répondre par le flou total : 'Mes parents m'aideront sûrement' ou 'Je trouverai bien un travail de nuit à côté'. Cumuler l'école d'aide-soignant avec un travail éprouvant à côté mène souvent à l'échec et le jury le sait pertinement.",
          advice: "Montrez que cette année d'études est une priorité absolue, entièrement sécurisée à l'avance pour pouvoir vous concentrer à 100% sur vos cours et vos stages."
        }
      ]
    },
    situations: {
      id: "situations",
      title: "💡 Mises en Situation Humaines de Sélection",
      description: "Cas pratiques humains conçus pour tester vos réflexes d'admission sans jargon médical complexe.",
      badge: "Postures RelatIonnelles",
      icon: HeartHandshake,
      color: "text-rose-705 border-rose-200",
      bgColor: "bg-rose-50",
      sections: [
        {
          subtitle: "Cas 1 : Le refus catégorique de la douche le matin",
          text: "« Mme Dupuis, 82 ans, refuse de faire sa toilette ce matin et vous rejette brusquement quand vous entrez dans sa chambre de l'Ehpad. Que faites-vous ? »\n- **Le réflexe d'évaluation :** Respect suprême du consentement (bientraitance). On ne force JAMAIS un usager.\n- **L'action bienveillante :** Je dédramatise. Je cherche à comprendre la cause du refus (Est-elle fatiguée ? A-t-elle froid ? A-t-elle mal à une articulation ? Est-elle triste ? Refuse-t-elle ma présence ?).\n- **L'alternative humaniste :** Je propose de repousser la toilette à plus tard dans la matinée, ou de faire simplement un brin de toilette rapide au lavabo pour ne pas la perturber. Si le refus persiste, je respecte son choix, je veille à sa sécurité, et j'en informe impérativement l'infirmier(e) d'équipe pour la traçabilité médicale.",
          trap: "Ne dites jamais que vous allez insister pour 'respecter le planning de service' ou que vous allez la forcer en pensant que 'c'est pour son bien'. C'est une dérive autoritaire disqualifiante au concours.",
          advice: "Mentionnez toujours que la chambre du résident est son domicile privé : on y respecte ses choix de vie autant que possible."
        },
        {
          subtitle: "Cas 2 : La colère verbale de la famille d'un résident",
          text: "« Le fils d'un résident entre hors de lui dans le couloir et vous hurle dessus parce que son père est encore en pyjama à 10h30. Quelle est votre posture ? »\n- **La posture face à l'agressivité :** Rester calme, courtois et à l'écoute. Je n'entre surtout pas dans le conflit verbal ni dans la justification défensive.\n- **L'empathie désamorçante :** J'invite le membre de la famille à s'isoler dans un espace discret (bureau ou chambre) pour épargner la pudeur du résident et le calme du service. Je valide son inquiétude parentale : 'Je comprends tout à fait que cette situation vous contrarie, laissez-moi vous expliquer...'\n- **L'explication humaine :** J'explique poliment que son père a passé une nuit difficile et a émis le souhait de dormir et de se reposer plus longtemps ce matin, choix que l'équipe soignante a respecté par bientraitance.",
          trap: "Répondre agressivement ou se cacher derrière le manque de personnel : 'On fait ce qu'on peut, on est en sous-effectif !'. Même si c'est parfois vrai, le jury attend des aptitudes de gestion du stress et de canalisation de la crise.",
          advice: "Mettez en avant votre esprit d'apaisement : 'Isoler la colère, écouter l'inquiétude légitime de la famille et expliquer nos actes de prise en charge avec bienveillance.'"
        },
        {
          subtitle: "Cas 3 : La curiosité indiscrète d'une amie ou voisine",
          text: "« Une voisine d'un patient hospitalisé vous croise à la boulangerie et vous demande amicalement de quoi souffre son ami en disant : 'Vous travaillez là-bas, vous devez bien savoir.' Que lui dites-vous ? »\n- **Le réflexe déontologique :** Secret professionnel absolu. La violation du secret partagé est passible de sanctions dures de l'ARS.\n- **La réponse polie et ferme :** 'Je comprends votre démarche bienveillante envers votre voisin, mais en tant que professionnelle de santé, je suis strictement soumise au secret médical. Je ne peux vous délivrer aucune information de santé. Je vous invite à prendre contact directement avec sa famille proche.'\n- **À l'hôpital :** Je ne confirme même pas que la personne est hospitalisée dans l'un de mes services de soin pour préserver sa totale discrétion de vie privée.",
          trap: "Partager l'information en pensant que c'est une voisine 'de confiance'. Le secret professionnel est absolute et ne s'arrête pas aux portes de l'hôpital.",
          advice: "Affirmez que la discrétion et le secret partagé sont le socle de confiance indispensable que le patient accorde à un soignant."
        }
      ]
    }
  };

  const activeCategory = CATEGORIES[activeTab];
  const ActiveIcon = activeCategory.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="help-guides">
      
      {/* Intitulé & Introduction Hub */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>📚 Guide de Révision Interactif de l'Entretien (Sélection IFAS)</span>
            </h3>
            <p className="text-xs text-slate-505 max-w-2xl leading-relaxed">
              Préparez-vous à l'entretien individuel du concours d'admission en étudiant les 3 piliers de la grille officielle, en évitant les pièges des jurés et en assimilant les réponses types des scénarios du quotidien hospitalier.
            </p>
          </div>
          <span className="self-start sm:self-center text-[11px] bg-teal-100 text-teal-900 font-extrabold px-3 py-1 rounded-full uppercase shrink-0 border border-teal-200">
            Édition Référentiel 2026
          </span>
        </div>

        {/* Tab Selection Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
          {Object.values(CATEGORIES).map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all duration-250 cursor-pointer ${
                  isSelected 
                    ? "bg-white border-teal-500 shadow-sm text-slate-800 font-bold" 
                    : "bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${cat.bgColor} ${cat.color.split(" ")[0]}`}>
                  <CatIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black truncate">{cat.title.slice(2)}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{cat.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content split viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-150">
        
        {/* Left column info - Highlights */}
        <div className="md:col-span-4 p-5 bg-slate-50/20 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              Objectif Jury
            </h4>
            <p className="text-[11.5px] text-slate-505 leading-relaxed">
              Le jury recherche avant tout un <strong>profil humain sain</strong>, conscient de l'intensité du quotidien d'aide-soignant, sachant s'expliquer poliment et dont le financement est garanti.
            </p>
            <div className="border-t border-slate-100 pt-2.5">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Critère phare :</div>
              <ul className="space-y-1 text-[10.5px] text-slate-600 font-medium list-disc list-inside">
                <li>Bientraitance omniprésente</li>
                <li>Respect strict de la pudeur</li>
                <li>Haut intérêt relationnel</li>
                <li>Collaboration avec l'infirmier</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-amber-50/75 rounded-xl border border-amber-200 text-[10.5px] text-amber-900 leading-relaxed font-sans shadow-2xs">
            <span className="font-extrabold flex items-center gap-1 mb-1 text-amber-950 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" /> Astuce de Lauréat :
            </span>
            Ne récitez jamais un discours pré-écrit. Le jury le sent tout de suite. Soyez sincère, souriant, exprimez votre passion pour l'accompagnement de vie, et montrez votre réalisme organisationnel de manière structurée !
          </div>
        </div>

        {/* Right column contents - Sections and instructions */}
        <div className="md:col-span-8 p-6 space-y-6 bg-white">
          <div className="flex items-center gap-2 border-b border-indigo-50 pb-3">
            <div className={`p-2 rounded-xl ${activeCategory.bgColor} ${activeCategory.color.split(" ")[0]}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm sm:text-base">{activeCategory.title}</h4>
              <p className="text-xs text-slate-400">{activeCategory.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {activeCategory.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-150 hover:border-slate-300 transition duration-200">
                
                {/* Title */}
                <h5 className="font-black text-slate-800 text-sm sm:text-base flex items-start gap-2 leading-tight">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{section.subtitle}</span>
                </h5>

                {/* Subtext description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-6">
                  {section.text}
                </p>

                {/* Core Trépas / Trap alert if any */}
                {section.trap && (
                  <div className="mt-3.5 bg-rose-50 rounded-lg p-3 border border-rose-100 flex gap-2.5 ml-6">
                    <span className="text-[11px] font-black bg-rose-200 text-rose-800 roundedpx-2 px-1.5 py-0.5 h-max uppercase mt-0.5 tracking-wider font-mono shrink-0">PIÈGE !</span>
                    <p className="text-[11.5px] text-rose-700 leading-relaxed font-medium">
                      {section.trap}
                    </p>
                  </div>
                )}

                {/* Advice from professionals */}
                {section.advice && (
                  <div className="mt-2.5 bg-slate-50 rounded-lg p-3 border border-slate-150 flex gap-2.5 ml-6">
                    <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-slate-505 leading-relaxed font-medium italic">
                      <strong>Le conseil :</strong> {section.advice}
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
