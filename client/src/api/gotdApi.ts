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
    question: "Build the password adhering to the rules",
    rules: [
      {
        regex: "[a-z]",
        description: "At least one lowercase letter",
      },
      {
        regex: "\\d",
        description: "At least one number",
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
        regex: "^[^\\s]+ [^\\s]+$",
        description: "Must be exactly 2 words",
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
      "Compare these two Amazon-themed emails. Which one is a phishing attempt?",
    teaching_point:
      "Spotting obvious red flags like generic greetings, mismatched domains (gmail.com), and non-HTTPS links.",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "Amazon Support",
          from_address: "amazon-security-alert@gmail.com",
          to: "user@example.com",
          date: "Fri, 27 Oct 2023 10:00:00 GMT",
          subject: "URGENT: Your account has been locked!",
          reply_to: "amazon-security-alert@gmail.com",
        },
        body: [
          {
            type: "text",
            content: "Dear Customer,",
            href: null,
            urgent: false,
          },
          {
            type: "text",
            content:
              "We detected unusual activity on your account. To prevent permanent deletion, you must verify your identity immediately.",
            href: null,
            urgent: true,
          },
          {
            type: "button",
            content: "Verify Account Now",
            href: "http://amazon-update-center.info/login",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Sender Address",
            explanation:
              "Amazon would never use a @gmail.com address for official account security alerts.",
          },
          {
            label: "Greeting",
            explanation:
              "Generic greetings like 'Dear Customer' are common in mass phishing campaigns.",
          },
          {
            label: "Link URL",
            explanation:
              "The link uses 'http' instead of 'https' and the domain 'amazon-update-center.info' is not an official Amazon domain.",
          },
        ],
        explanation:
          "This email is a textbook example of phishing: it uses a free email provider, a generic greeting, high urgency, and a suspicious non-secure link.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "Amazon.com",
          from_address: "no-reply@amazon.com",
          to: "user@example.com",
          date: "Fri, 27 Oct 2023 10:05:00 GMT",
          subject: "Your Amazon.com order has shipped",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content: "Hello Sarah,",
            href: null,
            urgent: false,
          },
          {
            type: "text",
            content:
              "Great news! Your order #123-456789 has been shipped and is on its way to you.",
            href: null,
            urgent: false,
          },
          {
            type: "link",
            content: "Track your package",
            href: "https://www.amazon.com/gp/your-account/order-history",
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Sender Address",
            explanation:
              "The email comes from the official @amazon.com domain.",
          },
          {
            label: "Personalization",
            explanation:
              "The email uses the customer's actual name ('Sarah') rather than a generic greeting.",
          },
        ],
        explanation:
          "This is a legitimate transactional email. It uses the correct domain, personalized greeting, and a secure HTTPS link to the official website.",
      },
    ],
  },
  {
    id: 2,
    difficulty: "medium",
    instruction:
      "One of these DHL shipment alerts is fake. Can you find the subtle clue?",
    teaching_point:
      "Identifying 'look-alike' domains and professional-looking but fraudulent URLs.",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "full",
        headers: {
          from_name: "DHL Express",
          from_address: "shipping-updates@dhl-parcel-tracking.net",
          to: "user@example.com",
          date: "Fri, 27 Oct 2023 11:20:00 GMT",
          subject: "Delivery Notification: Package Pending",
          reply_to: "support@dhl-parcel-tracking.net",
        },
        body: [
          {
            type: "text",
            content:
              "Your shipment is currently on hold at our sorting center due to an incomplete delivery address.",
            href: null,
            urgent: false,
          },
          {
            type: "text",
            content:
              "Please update your shipping details to avoid the package being returned to the sender.",
            href: null,
            urgent: true,
          },
          {
            type: "button",
            content: "Update Address",
            href: "https://dhl-delivery-status.com/update-info",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Sender Domain",
            explanation:
              "The domain 'dhl-parcel-tracking.net' is a look-alike. Official DHL emails typically come from 'dhl.com'.",
          },
          {
            label: "URL Destination",
            explanation:
              "The link points to 'dhl-delivery-status.com', which is not the official DHL corporate domain.",
          },
        ],
        explanation:
          "This is a medium-difficulty phish. It uses HTTPS and a professional tone, but the domain is a look-alike designed to trick users who don't check the exact domain name.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "full",
        headers: {
          from_name: "DHL Express",
          from_address: "noreply@dhl.com",
          to: "user@example.com",
          date: "Fri, 27 Oct 2023 11:25:00 GMT",
          subject: "Your DHL Express shipment is arriving today",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content:
              "Your package with tracking number 10001234567890 is out for delivery and is expected to arrive by 6 PM today.",
            href: null,
            urgent: false,
          },
          {
            type: "link",
            content: "View shipment details",
            href: "https://www.dhl.com/en/express/tracking.html",
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Domain Verification",
            explanation:
              "The sender and the link both use the official and verified 'dhl.com' domain.",
          },
        ],
        explanation:
          "This is a legitimate notification. The domain is the exact corporate domain of the company, and there are no requests for personal information or urgent payment.",
      },
    ],
  },
  {
    id: 3,
    difficulty: "hard",
    instruction:
      "These corporate emails look identical in style. Inspect the headers and domains carefully.",
    teaching_point:
      "Detecting high-fidelity phishing through precise domain analysis (subdomains vs. main domains).",
    emails: [
      {
        id: "email-1",
        is_phishing: true,
        focus_area: "headers",
        headers: {
          from_name: "Corp Payroll Dept",
          from_address: "payroll@corp-payroll.com",
          to: "employee@corp.com",
          date: "Fri, 27 Oct 2023 14:00:00 GMT",
          subject: "Action Required: Annual Tax Document Review",
          reply_to: "payroll@corp-payroll.com",
        },
        body: [
          {
            type: "text",
            content: "Dear Employee,",
            href: null,
            urgent: false,
          },
          {
            type: "text",
            content:
              "The annual tax review for the current fiscal year is now open. Please review your documents and sign the electronic acknowledgement by Friday.",
            href: null,
            urgent: false,
          },
          {
            type: "button",
            content: "Access Payroll Portal",
            href: "https://corp-payroll-portal.com/auth/login",
            urgent: false,
          },
        ],
        clues: [
          {
            label: "Domain Analysis",
            explanation:
              "The company's official domain is 'corp.com'. The sender is using 'corp-payroll.com', which is a separate registered domain, not a subdomain of 'corp.com'.",
          },
          {
            label: "URL Logic",
            explanation:
              "The destination 'corp-payroll-portal.com' is another external domain designed to look internal.",
          },
        ],
        explanation:
          "This is a highly polished phish. It avoids urgent language to build trust and uses a domain that looks like a corporate extension. Only a strict check of the root domain (corp.com vs corp-payroll.com) reveals the fraud.",
      },
      {
        id: "email-2",
        is_phishing: false,
        focus_area: "headers",
        headers: {
          from_name: "Corp Payroll Dept",
          from_address: "payroll@corp.com",
          to: "employee@corp.com",
          date: "Fri, 27 Oct 2023 14:10:00 GMT",
          subject: "Your monthly payslip is now available",
          reply_to: null,
        },
        body: [
          {
            type: "text",
            content:
              "Hello, your payslip for the period of October 2023 has been uploaded to the employee portal.",
            href: null,
            urgent: false,
          },
          {
            type: "link",
            content: "View Payslip",
            href: "https://payroll.corp.com/dashboard",
            urgent: null,
          },
        ],
        clues: [
          {
            label: "Subdomain Verification",
            explanation:
              "The link 'payroll.corp.com' is a legitimate subdomain of the primary corporate domain 'corp.com'.",
          },
        ],
        explanation:
          "This is a legitimate internal email. The sender address is exactly on the corporate domain, and the link is a proper subdomain of that same corporate domain.",
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
  question_type: "cookie_banners",
  // questions: MOCK_MULTIPLE_CHOICE_QUESTIONS,
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
