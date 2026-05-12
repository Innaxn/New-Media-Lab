import type {
  GameOfTheDay,
  BuildPasswordQuestion,
  BuildPassphraseQuestion,
  SpotWeakestQuestion,
  PhishOrLegitQuestion,
  MultipleChoiceQuestion,
} from "./types";

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchGameOfTheDay(): Promise<GameOfTheDay> {
  const url = undefined; //
  // process.env.REACT_APP_SECRET_NAME as string | undefined;
  if (!url) {
    console.info("[GOTD] No URL configured — using mock data.");
    return MOCK_GAME_OF_THE_DAY;
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as GameOfTheDay;
    console.info("[GOTD] Loaded from remote:", data.question_type, data.date);
    return data;
  } catch (err) {
    console.warn("[GOTD] Fetch failed, falling back to mock:", err);
    return MOCK_GAME_OF_THE_DAY;
  }
}

// ─── Mock: Build a Password ───────────────────────────────────────────────────

const MOCK_BUILD_PASSWORD_QUESTIONS: BuildPasswordQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    question: "Create a password that satisfies all the rules below.",
    rules: [
      { regex: ".{8,}", description: "8+ characters" },
      { regex: "[A-Z]", description: "At least one uppercase letter" },
      { regex: "[0-9]", description: "At least one number" },
    ],
  },
  {
    id: 2,
    difficulty: "medium",
    question: "Level up — more rules, stronger password.",
    rules: [
      { regex: ".{12,}", description: "12+ characters" },
      { regex: "[A-Z]", description: "Uppercase letter" },
      { regex: "[a-z]", description: "Lowercase letter" },
      { regex: "[0-9]", description: "Number" },
      { regex: "[^A-Za-z0-9]", description: "Special character (!@#$…)" },
    ],
  },
  {
    id: 3,
    difficulty: "hard",
    question: "Expert mode — avoid common words too.",
    rules: [
      { regex: ".{16,}", description: "16+ characters" },
      { regex: "[A-Z]", description: "Uppercase letter" },
      { regex: "[a-z]", description: "Lowercase letter" },
      { regex: "[0-9]", description: "Number" },
      { regex: "[^A-Za-z0-9]", description: "Special character" },
      {
        regex: "^(?!.*(password|qwerty|123456|admin|letmein))",
        description: "No common words",
      },
    ],
  },
];

// ─── Mock: Spot the Weakest ───────────────────────────────────────────────────

const MOCK_SPOT_WEAKEST_QUESTIONS: SpotWeakestQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    scenario:
      "These passwords were found in a data breach. Which would a hacker crack first?",
    candidates: [
      {
        id: "c1",
        value: "password1",
        is_weakest: true,
        explanation: "Top of every leaked list — cracked in milliseconds.",
        entropy_label: "~6 bits",
      },
      {
        id: "c2",
        value: "Tr0ub4dor",
        is_weakest: false,
        explanation:
          "Symbol substitution looks complex but is very predictable.",
        entropy_label: "~28 bits",
      },
      {
        id: "c3",
        value: "xkQ$8mN!vP",
        is_weakest: false,
        explanation: "10 truly random characters — hard to crack.",
        entropy_label: "~65 bits",
      },
    ],
    hint: "Which password appears in every leaked credential list?",
  },
  {
    id: 2,
    difficulty: "medium",
    scenario:
      "Four passwords from a company breach. Which is easiest to crack?",
    candidates: [
      {
        id: "c1",
        value: "Company2024!",
        is_weakest: true,
        explanation:
          "Company name + year is the most predictable corporate pattern.",
        entropy_label: "~18 bits",
      },
      {
        id: "c2",
        value: "Tr0ub4dor&3",
        is_weakest: false,
        explanation: "Known pattern — weakens it.",
        entropy_label: "~28 bits",
      },
      {
        id: "c3",
        value: "xkQ$8mN!vPz2",
        is_weakest: false,
        explanation: "12 truly random characters — high strength.",
        entropy_label: "~72 bits",
      },
      {
        id: "c4",
        value: "correct-horse-battery-staple",
        is_weakest: false,
        explanation: "Long passphrase — very hard to crack.",
        entropy_label: "~44 bits",
      },
    ],
    hint: "Company name + year patterns are always the first thing attackers try.",
  },
  {
    id: 3,
    difficulty: "hard",
    scenario:
      "All four look strong at first glance. Which one is actually the weakest?",
    candidates: [
      {
        id: "c1",
        value: "P@$$w0rd!23",
        is_weakest: true,
        explanation:
          "Classic substitutions are in every dictionary attack wordlist.",
        entropy_label: "~20 bits effective",
      },
      {
        id: "c2",
        value: "correct-horse-staple-44",
        is_weakest: false,
        explanation: "Long passphrase — centuries to crack.",
        entropy_label: "~52 bits",
      },
      {
        id: "c3",
        value: "zt9!Kw#mP2qL",
        is_weakest: false,
        explanation: "12 truly random characters.",
        entropy_label: "~78 bits",
      },
      {
        id: "c4",
        value: "piano-eagle-7-river-!",
        is_weakest: false,
        explanation: "5-word passphrase with symbol — very strong.",
        entropy_label: "~60 bits",
      },
    ],
    hint: "Symbol substitutions like @ for a and $ for s are in every attacker's dictionary.",
  },
];

// ─── Mock: Build a Passphrase ─────────────────────────────────────────────────

const MOCK_BUILD_PASSPHRASE_QUESTIONS: BuildPassphraseQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    word_bank: [
      "purple",
      "bicycle",
      "lamp",
      "cloud",
      "socks",
      "melon",
      "tiger",
      "3",
      "!",
    ],
    min_words: 3,
    separator: "-",
    success_message:
      "A 3-word passphrase already beats most passwords. Length is everything.",
  },
  {
    id: 2,
    difficulty: "medium",
    word_bank: [
      "purple",
      "bicycle",
      "friday",
      "lamp",
      "tiger",
      "cloud",
      "rocket",
      "socks",
      "dancing",
      "melon",
      "silver",
      "mountain",
      "3",
      "7",
      "!",
    ],
    min_words: 4,
    separator: "-",
    success_message:
      "A 4-word passphrase has ~52 bits of entropy. Centuries to crack.",
  },
  {
    id: 3,
    difficulty: "hard",
    word_bank: [
      "purple",
      "bicycle",
      "friday",
      "lamp",
      "tiger",
      "cloud",
      "rocket",
      "socks",
      "dancing",
      "melon",
      "silver",
      "mountain",
      "pepper",
      "echo",
      "bridge",
      "candle",
      "pigeon",
      "anchor",
      "3",
      "7",
      "!",
      "#",
    ],
    min_words: 5,
    separator: "-",
    success_message:
      "A 5-word passphrase has billions of combinations. Use a password manager with this as the master key.",
  },
];

// ─── Mock: Phish or Legit ─────────────────────────────────────────────────────

const MOCK_PHISH_QUESTIONS: PhishOrLegitQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    instruction: "Examine the sender address. Is this email legitimate?",
    teaching_point:
      "Always check the actual sender domain — not just the display name.",
    emails: [
      {
        id: "ph-easy-1",
        is_phishing: true,
        focus_area: "headers",
        headers: {
          from_name: "ING Bank",
          from_address: "noreply@ing-secure-alerts.com",
          reply_to: "support@ing-phish.ru",
          to: "j.vandenberg@gmail.com",
          date: "Fri, 14 Mar 2025 08:42:11 +0100",
          subject: "Your account has been temporarily locked",
        },
        clues: [
          {
            label: "Spoofed domain",
            explanation:
              "Real ING emails come from @ing.nl. ing-secure-alerts.com is a lookalike.",
          },
          {
            label: "Suspicious Reply-To",
            explanation: "Replies route to a .ru domain — unrelated to ING.",
          },
        ],
        explanation:
          "Classic bank impersonation. The domain and Reply-To mismatch confirm phishing.",
      },
      {
        id: "ph-easy-2",
        is_phishing: false,
        focus_area: "headers",
        headers: {
          from_name: "GitHub",
          from_address: "noreply@github.com",
          to: "user@example.com",
          date: "Thu, 13 Mar 2025 16:03:45 +0000",
          subject: "[GitHub] A new SSH key was added to your account",
        },
        clues: [
          {
            label: "Verified domain",
            explanation: "noreply@github.com is GitHub's real domain.",
          },
          {
            label: "No Reply-To trick",
            explanation: "No separate Reply-To — replies stay on github.com.",
          },
        ],
        explanation: "Legitimate GitHub security notification.",
      },
    ],
  },
  {
    id: 2,
    difficulty: "medium",
    instruction:
      "Read the email body. Hover over links to see where they actually go.",
    teaching_point:
      "Hover over links before clicking — the real URL often reveals the truth.",
    emails: [
      {
        id: "ph-med-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "DigiD",
          from_address: "beveiliging@digid-verificatie.com",
          to: "user@example.nl",
          date: "Thu, 13 Mar 2025 22:11:44 +0100",
          subject: "Uw DigiD account is geblokkeerd",
        },
        body: [
          { type: "text", content: "Geachte gebruiker," },
          {
            type: "text",
            content: "Uw DigiD-account is tijdelijk geblokkeerd.",
            urgent: true,
          },
          {
            type: "button",
            content: "Deblokkeer mijn DigiD",
            href: "http://digid-verificatie.com/deblokkeer",
          },
          {
            type: "text",
            content: "Actie vereist binnen 12 uur.",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Lookalike domain",
            explanation:
              "Real DigiD is @digid.nl. digid-verificatie.com is a fake.",
          },
          {
            label: "HTTP link",
            explanation:
              "No legitimate government service uses HTTP for login pages.",
          },
          {
            label: "12-hour threat",
            explanation:
              "Government agencies never delete accounts by email within hours.",
          },
        ],
        explanation:
          "DigiD phishing — domain, HTTP link and urgency all confirm it.",
      },
      {
        id: "ph-med-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "LinkedIn",
          from_address: "messages-noreply@linkedin.com",
          to: "user@example.com",
          date: "Mon, 10 Mar 2025 10:00:00 +0000",
          subject: "You appeared in 12 searches this week",
        },
        body: [
          { type: "text", content: "Hi there," },
          {
            type: "text",
            content:
              "Your profile is getting attention — 12 searches this week.",
          },
          {
            type: "button",
            content: "View who viewed your profile",
            href: "https://www.linkedin.com/notifications/?filter=all",
          },
          {
            type: "link",
            content: "Unsubscribe",
            href: "https://www.linkedin.com/psettings/email",
          },
        ],
        clues: [
          {
            label: "Real domain",
            explanation:
              "messages-noreply@linkedin.com is a verified LinkedIn domain.",
          },
          {
            label: "HTTPS links",
            explanation: "Both links resolve to www.linkedin.com over HTTPS.",
          },
          {
            label: "No credentials",
            explanation: "Nothing requested — passive notification only.",
          },
        ],
        explanation: "Legitimate LinkedIn notification.",
      },
    ],
  },
  {
    id: 3,
    difficulty: "hard",
    instruction:
      "Analyse everything — headers and body. Some emails look very polished.",
    teaching_point:
      "Spear phishing uses your real name and company details. The only reliable indicator is often the sender domain.",
    emails: [
      {
        id: "ph-hard-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "IT Helpdesk — Radboud University",
          from_address: "helpdesk@ru-ict-support.nl",
          to: "i.georgieva@radboud.nl",
          date: "Fri, 14 Mar 2025 09:15:03 +0100",
          subject: "Action required: Email quota exceeded (92%)",
        },
        body: [
          { type: "text", content: "Dear Ivelina," },
          {
            type: "text",
            content:
              "Your account has reached 92% storage. Act within 48 hours.",
            urgent: true,
          },
          {
            type: "button",
            content: "Request Storage Extension",
            href: "https://ru-ict-support.nl/quota-extend?token=a8f2c1",
          },
          {
            type: "text",
            content: "ICT Helpdesk — Radboud University, Houtlaan 4, Nijmegen",
          },
        ],
        clues: [
          {
            label: "Lookalike domain",
            explanation:
              "Radboud's real domain is ru.nl. ru-ict-support.nl is a separately registered fake.",
          },
          {
            label: "Spear phishing",
            explanation:
              "Uses your real name and university address — harvested from public sources.",
          },
          {
            label: "48-hour pressure",
            explanation:
              "ICT departments send warnings well in advance. Urgent links are not a helpdesk workflow.",
          },
        ],
        explanation:
          "Sophisticated spear phishing. Uses real name and address — but the domain is ru-ict-support.nl, not ru.nl.",
      },
      {
        id: "ph-hard-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "Radboud University",
          from_address: "noreply@ru.nl",
          to: "i.georgieva@radboud.nl",
          date: "Wed, 12 Mar 2025 09:00:00 +0100",
          subject: "Reminder: thesis submission deadline — 28 March",
        },
        body: [
          { type: "text", content: "Dear Ivelina," },
          {
            type: "text",
            content:
              "Reminder: thesis submission deadline is 28 March 2025 at 23:59.",
          },
          {
            type: "button",
            content: "Go to Student Portal",
            href: "https://www.ru.nl/students/thesis-portal",
          },
          { type: "text", content: "Questions? Contact student@ru.nl." },
        ],
        clues: [
          {
            label: "Real ru.nl domain",
            explanation: "noreply@ru.nl is Radboud's verified sending domain.",
          },
          {
            label: "HTTPS portal link",
            explanation:
              "Button resolves to https://www.ru.nl — same domain as sender.",
          },
          {
            label: "No urgency tricks",
            explanation: "Calm, specific, with a real contact address.",
          },
        ],
        explanation: "Legitimate Radboud notification.",
      },
    ],
  },
];

// ─── Mock: Multiple Choice ────────────────────────────────────────────────────

const MOCK_MULTIPLE_CHOICE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    question: "What does GDPR stand for?",
    options: [
      "General Data Protection Regulation",
      "Global Digital Privacy Rules",
      "Government Data Processing Rights",
      "General Digital Privacy Regulation",
    ],
    correct_index: 0,
    hint: 'It\'s a European Union regulation — think "regulation", not "rules".',
  },
  {
    id: 2,
    difficulty: "easy",
    question: "Which of the following is considered the strongest password?",
    options: ["Password123", "12345678", "qwertyuiop", "G7#kP2!sX9"],
    correct_index: 3,
    hint: "A strong password uses a mix of uppercase, lowercase, numbers, and special symbols.",
  },
  {
    id: 3,
    difficulty: "medium",
    question:
      "Under GDPR, within how many hours must a data breach be reported to the supervisory authority?",
    options: ["24 hours", "48 hours", "72 hours", "7 days"],
    correct_index: 2,
    hint: "Article 33 specifies a specific time window from the moment of becoming aware.",
  },
  {
    id: 4,
    difficulty: "hard",
    question:
      "Which GDPR article states that pre-ticked consent checkboxes do NOT constitute valid consent?",
    options: ["Article 6", "Article 7", "Recital 32", "Article 17"],
    correct_index: 2,
    hint: "Recitals provide interpretive guidance on the articles. This one is about the form consent must take.",
  },
];

// ─── Active mock — change question_type to test different games ───────────────

export const MOCK_GAME_OF_THE_DAY: GameOfTheDay = {
  date: new Date().toISOString().slice(0, 10),
  question_type: "phish_or_legit",
  questions: MOCK_PHISH_QUESTIONS,
};

export const ALL_MOCKS: Record<string, GameOfTheDay> = {
  build_a_password: {
    date: "2025-01-01",
    question_type: "build_a_password",
    questions: MOCK_BUILD_PASSWORD_QUESTIONS,
  },
  spot_the_weakest_password: {
    date: "2025-01-02",
    question_type: "spot_the_weakest_password",
    questions: MOCK_SPOT_WEAKEST_QUESTIONS,
  },
  build_a_passphrase: {
    date: "2025-01-03",
    question_type: "build_a_passphrase",
    questions: MOCK_BUILD_PASSPHRASE_QUESTIONS,
  },
  phish_or_legit: {
    date: "2025-01-04",
    question_type: "phish_or_legit",
    questions: MOCK_PHISH_QUESTIONS,
  },
  multiple_choice: {
    date: "2025-01-05",
    question_type: "multiple_choice",
    questions: MOCK_MULTIPLE_CHOICE_QUESTIONS,
  },
  cookie_banners: {
    date: "2025-01-06",
    question_type: "cookie_banners",
  },
};
