import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy Stripe client initialization to resist startup failure when STRIPE_SECRET_KEY is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY has not been defined in environment secrets.");
  }
  // Safeguard against popular placeholder values that cause slow timeouts or hangs
  const cleanKey = stripeSecretKey.trim().toLowerCase();
  if (
    !stripeSecretKey.startsWith("sk_") || 
    cleanKey.includes("your") || 
    cleanKey.includes("placeholder") || 
    cleanKey.includes("insert") ||
    stripeSecretKey.length < 15
  ) {
    throw new Error("STRIPE_SECRET_KEY appears to be unconfigured or a dummy placeholder. Falling back to local sandbox simulation.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

// Initialize Gemini SDK with robust validations
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Gemini SDK Initialization failed:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is missing in env. Server will run with high-fidelity fallback generators.");
}

// Helper to ask Gemini for JSON responses
async function askGeminiJSON<T>(prompt: string, fallbackJson: T, schema?: any): Promise<T> {
  if (!ai) {
    return fallbackJson;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    let text = response.text || "";
    text = text.trim();
    
    // Clean up any markdown code block wraps of type ```json ... ```
    if (text.startsWith("```json")) {
      text = text.substring(7);
    } else if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    return JSON.parse(text) as T;
  } catch (error: any) {
    console.error("[Gemini Connection Error]", error.message);
    return fallbackJson;
  }
}

// Fallback banks for French IFAS Concours (just in case API call or parsing fails)
const FALLBACK_QUESTIONS = [
  "Selon vous, quelles sont les qualités humaines les plus importantes pour exercer le métier d'aide-soignant ?",
  "Comment réagiriez-vous si un résident en Ehpad refuse catégoriquement sa toilette ou son repas un matin ?",
  "Comment comprenez-vous le principe de collaboration entre l'aide-soignant et l'infirmier au sein d'une équipe de soins ?",
  "Si un membre de la famille d'un résident se montre mécontent et agressif verbalement envers vous, comment gérez-vous cela ?",
  "Quelles sont vos craintes ou difficultés anticipées concernant la formation à l'IFAS (rythme, apprentissage, stages) ?",
  "Pour conclure, comment envisagez-vous l'organisation de votre vie personnelle face aux contraintes d'horaires décalés et de week-ends ?"
];

// --- ORAL BLANC API ROUTES ---

/**
 * Endpoint to START interview and generate first clinical question
 */
app.post("/api/simulation/start", async (req, res) => {
  const { profile } = req.body;
  
  if (!profile) {
    return res.status(400).json({ error: "Profil du candidat requis." });
  }

  const prompt = `
    Agis en tant que Président du Jury d'admission de l'IFAS (Institut de Formation d'Aide-Soignant) en 2026, conformément à l'Arrêté du 7 avril 2020 relatif aux modalités d'admission.
    Un candidat démarre sa simulation d'entretien d'admission (sélection d'entrée à l'école d'aide-soignant).
    Détails du candidat :
    - Nom : ${profile.name}
    - Axe d'évaluation choisi : ${profile.module}
    - Expérience antérieure : ${profile.experience}
    - Motivation initiale rédigée : ${profile.motivation}

    Rédige la première question d'introduction posée par le jury.
    Cette première question doit être accueillante, professionnelle et lancer l'entretien. Elle doit s'appuyer sur l'axe choisi ("${profile.module}") et le profil du candidat, par exemple en lui demandant de présenter son projet, ses motivations ou de réagir de manière humaine à une mise en situation relationnelle simple et bientraitante (sans jargon technique clinique complexe, car le candidat n'a pas encore fait ses études).
    Génère la réponse sous forme d'un objet JSON strict:
    {
      "question": "Texte de la première question du jury, rédigé de façon très professionnelle, polie, vivante et réaliste."
    }
  `;

  const fallback = { question: `Bonjour ${profile.name}. Pour débuter cet entretien d'admission à l'IFAS, pouvez-vous nous exposer brièvement votre parcours et ce qui motive aujourd'hui votre choix de vous orienter vers la formation d'aide-soignant ?` };
  
  const startSchema = {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "La première question d'entretien posée par le jury."
      }
    },
    required: ["question"]
  };

  try {
    const result = await askGeminiJSON(prompt, fallback, startSchema);
    res.json(result);
  } catch (err: any) {
    res.json(fallback);
  }
});

/**
 * Endpoint to SUBMIT answer, evaluate it, and yield the next question
 */
app.post("/api/simulation/submit-answer", async (req, res) => {
  const { profile, questionText, answerText, questionIndex } = req.body;
  const qIdx = parseInt(questionIndex, 10);
  const totalQuestions = 6;

  if (!profile || !questionText) {
    return res.status(400).json({ error: "Paramètres d'évaluation manquants." });
  }

  const isFinished = qIdx >= totalQuestions - 1;

  const prompt = `
    Tu es le Jury Virtuel bienveillant et rigoureux de l'entretien de sélection à l'entrée de l'IFAS (études d'Aide-Soignant) en 2026, conformément à l'Arrêté du 7 avril 2020.
    Critères fondamentaux d'évaluation de la grille nationale d'admission (notée sur 20 points) :
    1. Aptitudes à la communication : Clarté d'expression, courtoisie, vocabulaire soigné, structure des réponses. (4 points)
    2. Motivation, réalisme du projet de formation : Compréhension réelle des réalités du métier de l'aide-soignant (horaires décalés, fatigue, travail en équipe de soin, limites d'actions par rapport aux infirmiers) et organisation financière ou matérielle d'études. (8 points)
    3. Aptitudes relationnelles & Valeurs de bientraitance : Posture d'écoute active, empathie naturelle, respect de la dignité, de la pudeur d'un usager, réaction face au refus de doucher ou s'alimenter d'un patient. (8 points)

    Note que le candidat n'est pas encore diplômé de soins de clinique et ne doit pas être pénalisé sur des protocoles médicaux non-étudiés, mais sur son bon sens, son éthique de l'accompagnement, ses aptitudes relationnelles et son envie d'apprendre.

    Analyse la réponse de ${profile.name} à la question : "${questionText}"
    Réponse formulée : "${answerText || ""}"
    
    Génère l'évaluation en respectant strictement le format attendu.
  `;

  const fallbackNextQuestion = FALLBACK_QUESTIONS[Math.min(qIdx + 1, FALLBACK_QUESTIONS.length - 1)];

  const fallback = {
    grade: 12,
    strengths: ["Bonne intention de prise en charge", "Ton calme et bientraitant"],
    weaknesses: ["Protocoles d'hygiène méritant plus de précision"],
    feedbackText: "Rappel de protocole : tout refus de lavage de la part d'un malade doit être recherché par la discussion, respecté momentanément, mais retransmis immédiatement écrit et oralement à l'IDEC.",
    finished: isFinished,
    nextQuestion: isFinished ? "" : fallbackNextQuestion
  };

  const submitSchema = {
    type: Type.OBJECT,
    properties: {
      grade: {
        type: Type.INTEGER,
        description: "Note brute sur 20 attribuée à la réponse."
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tableau de 2-3 points forts courts."
      },
      weaknesses: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tableau de 2-3 points d'amélioration ou points faibles."
      },
      feedbackText: {
        type: Type.STRING,
        description: "Commentaire pédagogique et bienveillant de 2-3 sentences."
      },
      finished: {
        type: Type.BOOLEAN,
        description: "Indique si la session d'évaluation est terminée (true ou false)."
      },
      nextQuestion: {
        type: Type.STRING,
        description: "La question de relance suivante du jury si finished est false, sinon vide."
      }
    },
    required: ["grade", "strengths", "weaknesses", "feedbackText", "finished", "nextQuestion"]
  };

  try {
    const result = await askGeminiJSON(prompt, fallback, submitSchema);
    res.json(result);
  } catch (err) {
    res.json(fallback);
  }
});

/**
 * Endpoint to SYNTHESIZE overall final report card
 */
app.post("/api/simulation/feedback", async (req, res) => {
  const { profile, history } = req.body;

  if (!profile || !history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Historique d'oral manquant." });
  }

  // Summarize performance data to formulate a comprehensive synthesis prompt
  const sumOfGrades = history.reduce((acc, curr) => acc + (curr.grade || 10), 0);
  const avgGrade = Math.round((sumOfGrades / history.length) * 10) / 10;

  const prompt = `
    Fais le bilan de synthèse globale de l'Entretien individuel de Sélection d'entrée en IFAS (aide-soignant) en 2026, régi par la grille officielle de l'Arrêté du 7 avril 2020.
    Profil du candidat : Nom: ${profile.name}, Axe choisi: ${profile.module}, Expérience: ${profile.experience}, Motivation initiale: ${profile.motivation}
    
    Historique des 6 échanges de l'entretien et des notes attribuées :
    ${JSON.stringify(history)}

    Génère le rapport de bilan en respectant strictement le format attendu. Les notes doivent être cohérentes avec la moyenne brute ${avgGrade}.
  `;

  const fallback = {
    globalScore: Math.max(10, Math.round(avgGrade)),
    skills: [
      { name: "Aptitude de communication", score: 14, comment: "Expression verbale polie et termes respectueux." },
      { name: "Motivation pour le soin", score: 12, comment: "Qualités de présence et attention évidentes." },
      { name: "Connaissance du métier", score: 13, comment: "Bonne compréhension de la pluri-professionnalité de l'équipe." },
      { name: "Rigueur et Déontologie", score: 14, comment: "Respect aigu de l'éthique et du secret professionnel partagé." },
      { name: "Organisation d'études", score: 13, comment: "Planification d'année d'études et de stages bien conçue." }
    ],
    generalComments: "Une solide prestation d'entraînement pour l'admission en IFAS. Vos qualités relationnelles et votre rigueur d'expression plaident grandement en votre faveur. Structurez vos exemples professionnels de reconversion pour optimiser les points du jury.",
    keyStrengths: [
      "Attitude protectrice de la bientraitance physique et morale",
      "Écoute sereine et humilité d'apprentissage",
      "Grand réalisme quant aux roulements horaires hospitaliers"
    ],
    improvementSuggestions: [
      "Approfondir les exemples concrets de transfert de compétences",
      "Mettre plus en avant l'importance suprême du travail en équipe de soin",
      "Expliquer votre logistique matérielle et financière de manière fluide"
    ],
    finalVerdict: avgGrade >= 14 ? "Félicitations, Candidat Recommandé !" : "Admissible avec encouragement !"
  };

  const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
      globalScore: {
        type: Type.NUMBER,
        description: "Note globale finale sur 20 points."
      },
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nom de l'aptitude évaluée." },
            score: { type: Type.INTEGER, description: "Note sur 20 points attribuée à cette compétence." },
            comment: { type: Type.STRING, description: "Commentaire court de max 15 mots." }
          },
          required: ["name", "score", "comment"]
        },
        description: "Tableau de EXACTEMENT 5 aptitudes requises."
      },
      generalComments: {
        type: Type.STRING,
        description: "Avis de synthèse de 3 phrases félicitant ou encourageant le candidat."
      },
      keyStrengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tableau de EXACTEMENT 3 forces majeures démontrées."
      },
      improvementSuggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tableau de EXACTEMENT 3 suggestions d'amélioration concrètes."
      },
      finalVerdict: {
        type: Type.STRING,
        description: "Expression du verdict final (ex. 'Félicitations, Candidat Très Admissible !')."
      }
    },
    required: ["globalScore", "skills", "generalComments", "keyStrengths", "improvementSuggestions", "finalVerdict"]
  };

  try {
    const result = await askGeminiJSON(prompt, fallback, feedbackSchema);
    res.json(result);
  } catch (err) {
    res.json(fallback);
  }
});

// --- STRIPE PAYMENTS INTEGRATION ---

const PLANS_METADATA = [
  { id: 0, name: "Offre Découverte", credits: 1, priceInCents: 1000, description: "1 simulation complète d'oral IFAS avec jury virtuel" },
  { id: 1, name: "Offre Préparation", credits: 5, priceInCents: 3000, description: "5 simulations complètes d'oral IFAS (20€ économisés, -40%)" },
  { id: 2, name: "Offre Premium", credits: 9999, priceInCents: 6000, description: "Simulations illimitées pendant 30 jours (Économie maximale)" }
];

app.post("/api/stripe/create-checkout-session", async (req, res) => {
  const { planId, appUrl } = req.body;
  const pId = parseInt(planId, 10);
  const plan = PLANS_METADATA.find(p => p.id === pId);

  if (!plan) {
    return res.status(400).json({ error: "Forfait d'entraînement invalide." });
  }

  const origin = appUrl || req.get("origin") || "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan.name,
              description: `${plan.description} - Préparation Oral Concours IFAS`,
            },
            unit_amount: plan.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?stripe_success=true&credits=${plan.credits}&plan_name=${encodeURIComponent(plan.name)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_cancel=true`,
    }, {
      timeout: 3500, // 3.5 seconds fast network fail timeout to trigger fallback
    });

    res.json({ url: session.url, isSimulation: false });
  } catch (error: any) {
    console.warn("[Stripe API Fallback] Stripe non disponible. Utilisation du mode bac-à-sable simulé.", error.message);
    res.json({
      url: null,
      isSimulation: true,
      errorInfo: error.message,
      message: "Exécution locale sandbox (clé Stripe non fournie ou incorrecte)."
    });
  }
});


// Dev environment vs Production builds
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express / Vite Applet] Running on http://localhost:${PORT}`);
  });
}

startServer();
