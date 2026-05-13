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
  const url = process.env.REACT_APP_SECRET_NAME as string | undefined;
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

const MOCK_BUILD_PASSWORD_QUESTIONS: BuildPasswordQuestion[] = [];

// ─── Mock: Spot the Weakest DONE───────────────────────────────────────────────────

const MOCK_SPOT_WEAKEST_QUESTIONS: SpotWeakestQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    scenario: "A user is setting up a temporary password for a guest account.",
    hint: "Look for the most common, predictable sequences used by millions of people.",
    candidates: [
      {
        id: "c1",
        value: "password123",
        is_weakest: true,
        explanation:
          "This is one of the most common passwords globally and is found in every basic cracking dictionary.",
        entropy_label: "~20 bits",
      },
      {
        id: "c2",
        value: "jK9#mN2!p",
        is_weakest: false,
        explanation:
          "A random mix of characters provides high entropy and is resistant to dictionary attacks.",
        entropy_label: "~60 bits",
      },
      {
        id: "c3",
        value: "Purple-Rain-Cloudy",
        is_weakest: false,
        explanation:
          "Passphrases using unrelated words are long and difficult for computers to guess, despite being easy for humans to remember.",
        entropy_label: "~75 bits",
      },
      {
        id: "c4",
        value: "zP9vR3mK",
        is_weakest: false,
        explanation:
          "High randomness and lack of dictionary words make this a strong candidate.",
        entropy_label: "~45 bits",
      },
    ],
  },
  {
    id: 2,
    difficulty: "medium",
    scenario:
      "An employee is creating a corporate password for their internal workstation.",
    hint: "Attackers often target patterns that combine a known entity (like a company name) with a current date.",
    candidates: [
      {
        id: "c1",
        value: "Globex2024!",
        is_weakest: true,
        explanation:
          "The 'Company + Year + Symbol' pattern is highly predictable and is a primary target for corporate credential stuffing attacks.",
        entropy_label: "~35 bits",
      },
      {
        id: "c2",
        value: "vP2#zR8!kL",
        is_weakest: false,
        explanation:
          "Random characters without a predictable pattern offer strong protection.",
        entropy_label: "~60 bits",
      },
      {
        id: "c3",
        value: "Blue-Ocean-Deep-99",
        is_weakest: false,
        explanation:
          "Combining a long passphrase with a number significantly increases the effort required to crack it.",
        entropy_label: "~80 bits",
      },
      {
        id: "c4",
        value: "mK7-pL2-xS9",
        is_weakest: false,
        explanation:
          "Segmented random strings avoid dictionary patterns and are quite strong.",
        entropy_label: "~50 bits",
      },
    ],
  },
  {
    id: 3,
    difficulty: "hard",
    scenario:
      "An IT professional wants a 'complex' password that meets all character requirements.",
    hint: "Don't be fooled by symbols; common character substitutions (Leet-speak) are easily calculated by modern cracking tools.",
    candidates: [
      {
        id: "c1",
        value: "S3cur1ty2024!",
        is_weakest: true,
        explanation:
          "While it looks complex, 'Leet-speak' (3 for e, 1 for i) and the addition of a year are standard rules in cracking software, making it very weak.",
        entropy_label: "~40 bits",
      },
      {
        id: "c2",
        value: "kS7#mN2@pX",
        is_weakest: false,
        explanation:
          "True randomness is far superior to 'complexity' based on substitutions.",
        entropy_label: "~60 bits",
      },
      {
        id: "c3",
        value: "Forest-Wind-Silent-Moon",
        is_weakest: false,
        explanation:
          "Length is the most important factor in entropy. A long passphrase outweighs complex characters.",
        entropy_label: "~90 bits",
      },
      {
        id: "c4",
        value: "zP9-vR3-mK7",
        is_weakest: false,
        explanation:
          "Avoids dictionary words and predictable sequences, providing a high level of security.",
        entropy_label: "~55 bits",
      },
    ],
  },
];

// ─── Mock: Build a Passphrase DONE─────────────────────────────────────────────────
const MOCK_BUILD_PASSPHRASE_QUESTIONS: BuildPassphraseQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    word_bank: [
      "remock",
      "maronite",
      "inlying",
      "beulah",
      "adage",
      "floricin",
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
      "kame",
      "araroba",
      "hydatid",
      "olykoek",
      "fluidize",
      "sluice",
      "birching",
      "catchy",
      "formene",
      "geotonic",
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
      "meethelp",
      "limbo",
      "unfired",
      "gallet",
      "cadbote",
      "digynian",
      "kurdish",
      "neiper",
      "monodize",
      "serology",
      "dumontia",
      "sabazios",
      "kroner",
      "tuna",
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

// ─── Mock: Multiple Choice DONE ────────────────────────────────────────────────────
const MOCK_MULTIPLE_CHOICE_QUESTIONS: MultipleChoiceQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    question:
      "Which of the following is the best practice for creating a strong password?",
    options: [
      "Using your date of birth",
      "Using a mix of uppercase letters, lowercase letters, numbers, and symbols",
      "Using the word 'password123'",
      "Using your pet's name",
    ],
    correct_index: 1,
    hint: "Complexity makes it much harder for hackers to guess your password.",
  },
  {
    id: 2,
    difficulty: "easy",
    question: "What is the primary purpose of Two-Factor Authentication (2FA)?",
    options: [
      "To make the login process slower",
      "To replace the need for a password entirely",
      "To add an extra layer of security by requiring a second form of identification",
      "To encrypt your hard drive",
    ],
    correct_index: 2,
    hint: "It ensures that knowing the password alone isn't enough to access an account.",
  },
  {
    id: 3,
    difficulty: "medium",
    question:
      "You receive an urgent email from your bank asking you to click a link to 'verify your account' to avoid suspension. What is the safest action?",
    options: [
      "Click the link and enter your details immediately",
      "Reply to the email asking for more information",
      "Ignore the link and contact your bank via their official app or phone number",
      "Forward the email to your friends to see if they got it too",
    ],
    correct_index: 2,
    hint: "This is a common tactic called 'phishing' designed to steal credentials.",
  },
  {
    id: 4,
    difficulty: "medium",
    question:
      "Why is it risky to access sensitive information, like online banking, while connected to public Wi-Fi at a cafe?",
    options: [
      "Public Wi-Fi is usually too slow for banking apps",
      "Your battery will drain faster",
      "Unencrypted data sent over public networks can be intercepted by others",
      "Public Wi-Fi automatically deletes your browser history",
    ],
    correct_index: 2,
    hint: "Open networks often lack the encryption needed to keep your data private from other users on the same network.",
  },
  {
    id: 5,
    difficulty: "hard",
    question:
      "Under the General Data Protection Regulation (GDPR), what does the 'Right to Erasure' (also known as the Right to be Forgotten) entitle a user to do?",
    options: [
      "Request that a company delete their personal data under certain conditions",
      "Prevent any company from ever collecting their data in the future",
      "Force a company to pay them for using their data",
      "Anonymize their identity across the entire internet",
    ],
    correct_index: 0,
    hint: "This right focuses on the ability of an individual to have their personal data removed from a controller's records.",
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
