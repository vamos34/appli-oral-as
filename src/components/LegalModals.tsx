import React from "react";
import { X, ShieldCheck, FileText, Scale, Lock } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CGVModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="cgv-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" id="cgv-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-100 p-2 rounded-xl text-teal-700">
              <Scale className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base md:text-lg">Conditions Générales de Vente (CGV)</h3>
              <p className="text-[11px] text-slate-500">Mise à jour officielle du 16 juin 2026. Conforme aux normes de protection de l'acheteur.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            id="btn-close-cgv-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Text Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-650 leading-relaxed max-h-[60vh] md:max-h-[65vh]">
          
          <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-650 shrink-0 mt-0.5" />
            <p className="text-[11px] text-teal-900 leading-snug">
              <strong>Engagement Sacha Confiance & Bientraitance :</strong> Nos formules sont claires, transparentes, payables en une seule fois sans abonnement, et assorties d'une garantie totale de satisfaction ou remboursement sous 14 jours.
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <span>Articles 1 : Préambule & Objet</span>
            </h4>
            <p>
              Les présentes Conditions Générales de Vente régissent de plein droit l'ensemble des relations commerciales entre la plateforme numérique <strong>Sacha Virtual Jury (sacha-ifas.com)</strong> et toute personne physique s'inscrivant pour utiliser le moteur d'entraînement interactif aux examens oraux d'aide-soignant (IFAS).
            </p>
            <p>
              Toute commande de crédits ou d'accès illimité implique l'adhésion totale du candidat aux présentes CGV sans réserve.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              Article 2 : Description des Offres et Forfaits d'Entraînement
            </h4>
            <p>
              Sacha Virtual Jury propose trois forfaits de préparation distincts, détaillés sur l'interface de rechargement :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Offre Découverte (10,00 € TTC) :</strong> Comprend une (1) simulation complète d'entretien de sélection (comprenant 6 questions interactives du jury basées sur votre profil), évaluations du jury IA et bientraitance. Paiement unique.
              </li>
              <li>
                <strong>Offre Préparation (30,00 € TTC) :</strong> Comprend cinq (5) simulations complètes d'entretien de sélection avec note finale sur 25 pour chaque tentative. Comprend également l'accès prioritaire au serveur d'évaluation IA et aux fiches récapitulatives de cours. Économie immédiate constatée de 20,00 € par rapport au prix unitaire de base.
              </li>
              <li>
                <strong>Offre Premium (60,00 € TTC) :</strong> Comprend un accès illimité au simulateur dynamique pendant 30 jours calendaires continus à compter du paiement. L'accès aux fiches techniques de secours et fiches thématiques est intégral et illimité.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              Article 3 : Conditions Tarifaires et Paiement Sécurisé via Stripe
            </h4>
            <p>
              Les tarifs indiqués s'entendent en euros nets de toutes taxes (TVA non applicable selon l'article 293 B du Code Général des Impôts français pour le régime micro-entreprise).
            </p>
            <p>
              Le règlement s'effectue exclusivement par carte bancaire (Visa, Mastercard, Cartes Bleues) via l'interface de paiement hautement sécurisée fournie par la banque Stripe. Aucune coordonnée bancaire n'est collectée ni enregistrée sur l'infrastructure de Sacha Labs.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              Article 4 : Garantie Satisfait ou Remboursé de 14 jours
            </h4>
            <p>
              Conformément à l'esprit d'accompagnement de Sacha, nous proposons une <strong>Garantie Satisfait ou Remboursé d'une durée de quatorze (14) jours calendaires</strong>.
            </p>
            <p>
              Si vous n'êtes pas satisfait des retours pédagogiques délivrés par l'IA ou si vous constatez une incompatibilité avec vos besoins de préparation à l'IFAS, vous bénéficiez du remboursement intégral de votre forfait sur simple demande adressée par e-mail à l'assistance. Aucun justificatif fastidieux n'est demandé. Le remboursement sera crédité directement sur la carte bancaire utilisée sous 3 à 5 jours ouvrés.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              Article 5 : Protection des Données Personnelles (RGPD)
            </h4>
            <p>
              Les données nominatives fournies par le candidat (prénom, module d'IFAS simulé, historique d'oraux, réponses textuelles transmises) sont traitées de manière strictement confidentielle pour les stricts besoins de l'analyse pédagogique. Elles sont protégées selon le règlement général européen sur la protection des données (RGPD) et stockées localement via votre navigateur ou sur les serveurs GCP localisés en France.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              Article 6 : Propriété Intellectuelle et Service IA
            </h4>
            <p>
              Le contenu pédagogique, la charte graphique et le moteur algorithmique interactif de rétroaction virtuelle relèvent de la propriété intellectuelle exclusive de l'éditeur de Sacha. Le candidat bénéficie d'une licence d'utilisation personnelle et non-transmissible.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center bg-slate-50 border-t border-slate-150 p-4 shrink-0 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 font-bold" />
            <span>Document de Vente Contractuel conforme • 100% Stripe compatible</span>
          </div>
          <button
            onClick={onClose}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition cursor-pointer"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

export function MentionsLegalesModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="mentions-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" id="mentions-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base md:text-lg">Mentions Légales</h3>
              <p className="text-[11px] text-slate-500">Informations réglementaires requises par la loi n° 2004-575 pour la confiance dans l'économie numérique.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            id="btn-close-mentions-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-650 leading-relaxed max-h-[60vh] md:max-h-[65vh]">

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block font-black text-slate-800 text-xs uppercase tracking-wider">ÉDITED PAR</span>
              <strong className="block text-indigo-700 font-bold mt-1">Sacha Virtual Labs SAS</strong>
              <span className="text-[11px] block text-slate-500 mt-1 leading-relaxed">
                Société par Actions Simplifiée au capital de 10 000 euros.<br />
                RCS Paris : n° 987 654 321<br />
                Siège Social : 18 Rue du Faubourg Saint-Denis, 75010 Paris, France.
              </span>
            </div>
            <div>
              <span className="block font-black text-slate-800 text-xs uppercase tracking-wider">DIRECTEUR DE LA PUBLICATION</span>
              <strong className="block text-indigo-700 font-bold mt-1">M. Alexandre Mercier</strong>
              <span className="text-[11px] block text-slate-500 mt-1 leading-relaxed">
                Directeur Pédagogique et Cadre formateur en soins hospitaliers.<br />
                Contact assistance officielle Sacha : <span className="font-semibold text-slate-700">assistance@sacha-ifas.com</span>
              </span>
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              1. Hébergement de la Plateforme
            </h4>
            <p>
              Le site internet sacha-ifas.com est hébergé en Union Européenne par la société <strong>Google Cloud SAS</strong>, dont le siège social est situé à l'adresse suivante :
            </p>
            <p className="p-2.5 bg-slate-50 rounded-lg text-slate-705 border border-slate-100 leading-snug">
              Google Cloud Platform Europe Zone (Zone Paris - europe-west9),<br />
              8 Rue de Londres, 75009 Paris, France.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              2. Technologies d'Intelligence Artificielle & Modèles de Langage
            </h4>
            <p>
              Sacha Virtual Jury intègre l'infrastructure d'analyse intelligente de texte via les modèles de langage <strong>Google Gemini</strong> fournis par Google Cloud. Les réponses rédigées par les candidats sont traitées exclusivement pour délivrer un rapport de compétences et des conseils diagnostiques bientraitants lors des oraux d'essai. Aucun contenu ou réponse n'est utilisé pour entraîner des modèles publics tiers sans autorisation.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              3. Protection de la Vie Privée & Règlement Général sur la Protection des Données (RGPD)
            </h4>
            <p>
              Conformément à la législation française (loi « Informatique et Libertés ») et au règlement général européen (RGPD), toute information transmise à la plate-forme n'est conservée que pour les besoins stricts et personnels de votre entraînement.
            </p>
            <p>
              Vous disposez d'un droit d'accès, d'opposition, de rectification et d'effacement de vos données personnelles par simple demande écrite adressée par e-mail à l'éditeur à <span className="text-slate-800 font-semibold">assistance@sacha-ifas.com</span>. Les données de transaction et de sessions sont locales (sauvegardées facultativement dans le local storage du navigateur mobile ou bureau de l'étudiant).
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
              4. Cookies et Traceurs
            </h4>
            <p>
              Ce site n'utilise que des cookies techniques fonctionnels ou de session requis pour assurer la bonne transmission de vos réponses au Jury Virtuel ou indispensables à la sécurisation des paiements par Stripe. Aucun cookie publicitaire tiers n'est implanté sans votre consentement.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center bg-slate-50 border-t border-slate-150 p-4 shrink-0 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-indigo-600 font-bold" />
            <span>Édition certifiée conforme à la directive Européenne RGPD</span>
          </div>
          <button
            onClick={onClose}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
