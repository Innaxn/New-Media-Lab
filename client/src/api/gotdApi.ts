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

const MOCK_BUILD_PASSWORD_QUESTIONS: BuildPasswordQuestion[] = [
  {
    question: "Build the password adhering to the rules (easy)",
    rules: [
      {
        regex: "[a-z]",
        description: "At least one lowercase letter",
      },
      {
        regex: "\\d",
        description: "At least one number",
      },
      {
        regex: "^[A-Za-z0-9].*[A-Za-z0-9]$",
        description: "No special characters at start or end",
      },
      {
        regex: "^(?!.*(.)\\1\\1).*$",
        description: "Must not have a character repeated 3+ times",
      },
      {
        regex: ".{8,}",
        description: "At least 8 characters",
      },
    ],
    difficulty: "easy",
  },
  {
    question: "Build the password adhering to the rules (medium)",
    rules: [
      {
        regex: '^[A-Za-z0-9].*[!@#$%^&*(),.?\\":{}|<>].*[A-Za-z0-9]$',
        description: "Must contain a special character not at the start or end",
      },
      {
        regex: "^[^\\s]+ [^\\s]+$",
        description: "Must be exactly 2 words",
      },
    ],
    difficulty: "medium",
  },
  {
    question: "Build the password adhering to the rules (hard)",
    rules: [
      {
        regex: "^.{15,}$",
        description: "Total length must be at least 15 characters",
      },
      {
        regex:
          '^[^\\s]+ [^\\s]*[!@#$%^&*(),.?\\":{}|<>][^\\s]* [^\\s]+ [^\\s]+$',
        description:
          "Must contain at least one special character in the middle (not first or last word)",
      },
      {
        regex: '^(?=.*[!@#$%^&*(),.?\\":{}|<>])(?=.*\\d).+$',
        description:
          "Must contain at least one special character and one digit",
      },
      {
        regex: "^(?!\\d)(?:\\S+ )(?!\\d)(?:\\S+ )(?!\\d)(?:\\S+ )(?!\\d)\\S+$",
        description: "No word may start with a digit",
      },
    ],
    difficulty: "hard",
  },
];

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

// ─── Mock: Phish or Legit DONE ─────────────────────────────────────────────────────

const MOCK_PHISH_QUESTIONS: PhishOrLegitQuestion[] = [
  {
    id: 1,
    difficulty: "easy",
    instruction:
      "You received two shipping alerts. One is a scam trying to steal your credit card info. Which one is the phishing email?",
    teaching_point:
      "Always check the sender's email address. Official companies do not use free providers like @gmail.com or @outlook.com for official business, and they avoid generic greetings like 'Dear Customer'.",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "DHL Express Support",
          from_address: "dhl-shipping-update12@gmail.com",
          to: "user@example.com",
          date: "Wed, 22 May 2024 10:00:00 GMT",
          subject: "URGENT: Parcel delivery failure",
          reply_to: "dhl-shipping-update12@gmail.com",
        },
        body: [
          {
            type: "text",
            content:
              "Dear Customer,\n\nYour package is currently held at our warehouse due to an incomplete delivery address. To avoid the package being returned to the sender, please pay the small re-delivery fee of $2.99 immediately.",
            href: null,
            urgent: true,
          },
          {
            type: "button",
            content: "Pay Fee Now",
            href: "http://dhl-payment-portal-secure.xyz/pay",
            urgent: true,
          },
          {
            type: "text",
            content: "Thank you for choosing DHL.",
            href: null,
            urgent: false,
          },
        ],
        clues: [
          {
            label: "Sender Address",
            explanation:
              "The email is sent from a @gmail.com address, which is a huge red flag for a multi-billion dollar shipping company.",
          },
          {
            label: "Generic Greeting",
            explanation:
              "'Dear Customer' is a generic greeting used when the attacker doesn't know your actual name.",
          },
          {
            label: "Suspicious Link",
            explanation:
              "The URL uses 'http' instead of 'https' and ends in '.xyz', which is uncommon for official corporate sites.",
          },
        ],
        explanation:
          "This email is a classic phishing attempt using high urgency, a fake sender address, and a dangerous link to steal payment information.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "DHL Express",
          from_address: "noreply@dhl.com",
          to: "user@example.com",
          date: "Wed, 22 May 2024 10:05:00 GMT",
          subject: "Your shipment 84029174 is arriving today",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content:
              "Hello Sarah,\n\nYour shipment 84029174 is out for delivery and is expected to arrive by 5:00 PM today. You can track your package in real-time using the link below.",
            href: null,
            urgent: null,
          },
          {
            type: "link",
            content: "Track my package",
            href: "https://www.dhl.com/en/express/tracking.html?awb=84029174",
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Sender Domain",
            explanation:
              "The email comes from @dhl.com, the legitimate corporate domain.",
          },
          {
            label: "Personalization",
            explanation:
              "The email addresses the user by their actual name, Sarah.",
          },
        ],
        explanation:
          "This is a legitimate transactional email. It uses the correct domain, provides a specific tracking number, and contains no requests for payment or urgent passwords.",
      },
    ],
  },
  {
    id: 2,
    difficulty: "medium",
    instruction:
      "Your account security is being questioned. One of these is a sophisticated fake. Can you identify it?",
    teaching_point:
      "Attackers often use 'look-alike' domains (typosquatting). Look closely at the domain name for subtle misspellings or extra words that seem official but aren't.",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "headers",
        headers: {
          from_name: "Microsoft Account Team",
          from_address: "security-noreply@microsft-support.com",
          to: "user@example.com",
          date: "Wed, 22 May 2024 11:20:00 GMT",
          subject: "Unusual sign-in activity for your account",
          reply_to: "security-noreply@microsft-support.com",
        },
        body: [
          {
            type: "text",
            content:
              "We detected an unusual sign-in attempt from a new device in Moscow, Russia. If this was not you, please review your account activity immediately to secure your data.",
            href: null,
            urgent: null,
          },
          {
            type: "button",
            content: "Review Activity",
            href: "https://microsft-support.com/account/security-check",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Domain Typo",
            explanation:
              "The domain is 'microsft-support.com'. Note the missing 'o' in Microsoft ('microsft').",
          },
          {
            label: "Urgency",
            explanation:
              "The mention of a login from a foreign country is designed to panic the user into clicking without thinking.",
          },
        ],
        explanation:
          "This is a medium-difficulty phish. It looks professional and uses a believable scenario, but the domain name is a clever misspelling of the real brand.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "headers",
        headers: {
          from_name: "Microsoft account team",
          from_address:
            "account-security-noreply@accountprotection.microsoft.com",
          to: "user@example.com",
          date: "Wed, 22 May 2024 11:25:00 GMT",
          subject: "Security alert",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content:
              "Your password was recently changed. If you did not perform this action, you can recover your account using the link below.",
            href: null,
            urgent: null,
          },
          {
            type: "link",
            content: "Recover account",
            href: "https://account.microsoft.com/security",
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Official Domain",
            explanation:
              "The email ends in .microsoft.com, which is the official root domain.",
          },
        ],
        explanation:
          "This is a legitimate security alert. It points directly to the official microsoft.com domain without any typos or redirection.",
      },
    ],
  },
  {
    id: 3,
    difficulty: "hard",
    instruction:
      "You have received two emails regarding your corporate payroll and benefits. One is a highly targeted phishing attempt. Which one is it?",
    teaching_point:
      "In high-level phishing, attackers use perfect branding and personalized context. The only way to detect them is to scrutinize the sender's domain and the destination of the links against the company's actual infrastructure.",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "GlobalCorp Payroll",
          from_address: "payroll-admin@globalcorp-portal.com",
          to: "user@globalcorp.com",
          date: "Wed, 22 May 2024 14:00:00 GMT",
          subject: "Action Required: 2024 Benefit Selection Window",
          reply_to: "payroll-admin@globalcorp-portal.com",
        },
        body: [
          {
            type: "text",
            content:
              "Dear Employee,\n\nThe open enrollment window for your 2024 health and dental benefits is now open. To ensure your coverage continues without interruption, please verify your selections in the employee portal by Friday, May 24th.",
            href: null,
            urgent: null,
          },
          {
            type: "button",
            content: "Access Benefits Portal",
            href: "https://globalcorp-portal.com/auth/benefits-selection",
            urgent: false,
          },
          {
            type: "text",
            content: "Regards,\nGlobalCorp Human Resources",
            href: null,
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Domain Discrepancy",
            explanation:
              "The company domain is 'globalcorp.com', but this email comes from 'globalcorp-portal.com'. Attackers often register a separate domain that sounds like a sub-service (like a 'portal') to trick employees.",
          },
        ],
        explanation:
          "This is a hard phishing attempt. The tone is professional, the timing (benefits season) is realistic, and there are no obvious typos. Only a careful check of the domain reveals it is not the official company domain.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "GlobalCorp HR",
          from_address: "hr@globalcorp.com",
          to: "user@globalcorp.com",
          date: "Wed, 22 May 2024 14:10:00 GMT",
          subject: "Annual Performance Review Cycle",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content:
              "Hello,\n\nYour manager has submitted your performance review for the last quarter. You can now view the feedback and add your own comments via the internal HR system.",
            href: null,
            urgent: null,
          },
          {
            type: "link",
            content: "View Review",
            href: "https://internal.globalcorp.com/hr/performance/review_882",
            urgent: null,
          },
          {
            type: "text",
            content: "Thank you,\nHR Department",
            href: null,
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Internal Domain",
            explanation:
              "The link leads to a subdomain (internal.globalcorp.com) of the actual company domain.",
          },
        ],
        explanation:
          "This is a legitimate internal communication. It uses the correct primary domain and follows standard corporate communication patterns.",
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
  question_type: "build_a_password",
  questions: MOCK_BUILD_PASSWORD_QUESTIONS,
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
