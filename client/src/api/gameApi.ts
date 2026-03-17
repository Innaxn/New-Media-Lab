// ─────────────────────────────────────────────────────────────────────────────
// API Service — Glass House
//
// All game content is fetched from the backend via the shared axios instance.
// When the request fails (network error, non-2xx status, or unexpected shape)
// the function falls back to the bundled mock data so the app remains playable
// in development and offline scenarios.
//
// To point at a real backend set VITE_API_BASE_URL in your .env file.
// ─────────────────────────────────────────────────────────────────────────────

import type { AxiosError } from "axios";
import axiosWithoutInterceptors from "./axios_config";
import type {
  GameConfig,
  PasswordBuildConfig,
  SpotWeakConfig,
  PassphraseConfig,
  CookieLevelConfig,
  PhishingLevel,
  ApiResponse,
} from "./types";

// ─── Shared axios instance ────────────────────────────────────────────────────

const http = axiosWithoutInterceptors();

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await http.get<ApiResponse<T>>(path);

    const { data: envelope } = response;

    if (!envelope.success) {
      throw new Error(envelope.error ?? "Unknown API error");
    }

    return envelope.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    // Log with enough context for debugging without leaking sensitive info
    console.warn(
      `[API] GET ${path} failed (${axiosErr.message ?? String(err)}). Using fallback data.`,
    );
    return fallback;
  }
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

const MOCK_PASSWORD_BUILD: PasswordBuildConfig = {
  minStrengthToPass: 3,
  rules: [
    { id: "minLength", label: "12+ characters", value: 12, points: 1 },
    { id: "upper", label: "Uppercase letter", pattern: "[A-Z]", points: 1 },
    { id: "lower", label: "Lowercase letter", pattern: "[a-z]", points: 1 },
    { id: "number", label: "Number", pattern: "[0-9]", points: 1 },
    {
      id: "symbol",
      label: "Special character",
      pattern: "[^A-Za-z0-9]",
      points: 1,
    },
    { id: "noCommon", label: "Not a common word", pattern: "", points: 1 },
  ],
  bannedPatterns: [
    "password",
    "sunshine",
    "princess",
    "football",
    "dragon",
    "master",
    "monkey",
    "shadow",
    "qwerty",
    "letmein",
    "iloveyou",
    "admin",
    "welcome",
    "login",
    "hello",
    "baseball",
    "superman",
    "batman",
  ],
  successMessage:
    '"P@ssw0rd" satisfies most rules but cracks in seconds — predictable substitution pattern. ' +
    'A passphrase like "correct-horse-battery-staple" takes centuries and is easier to remember.',
};

const MOCK_SPOT_WEAK: SpotWeakConfig = {
  scenario:
    "A security analyst has dumped four passwords from a recent breach investigation. " +
    "Which one would a hacker crack first?",
  candidates: [
    {
      id: "c1",
      value: "Tr0ub4dor&3",
      isWeakest: false,
      explanation:
        "Complex-looking but follows a well-known L33t substitution pattern — dictionary attack fodder.",
      entropyLabel: "~28 bits",
    },
    {
      id: "c2",
      value: "password1",
      isWeakest: true,
      explanation:
        "Found in every breach list ever published. Cracked in milliseconds. Appears in 3.6M+ leaked accounts.",
      entropyLabel: "~6 bits",
    },
    {
      id: "c3",
      value: "xkQ$8mN!vPz2",
      isWeakest: false,
      explanation:
        "12 truly random characters — high entropy, brute-force resistant.",
      entropyLabel: "~72 bits",
    },
    {
      id: "c4",
      value: "correct-horse-battery-staple",
      isWeakest: false,
      explanation:
        "The XKCD passphrase — 44 bits of entropy, easy to remember, centuries to crack.",
      entropyLabel: "~44 bits",
    },
  ],
  hint: "Think about what a hacker would try first. Which password appears in every leaked credential list?",
};

const MOCK_PASSPHRASE: PassphraseConfig = {
  wordBank: [
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
    "forest",
    "pigeon",
    "marble",
    "anchor",
    "3",
    "7",
    "!",
    "#",
  ],
  minWords: 4,
  separator: "-",
  successMessage:
    "Each additional word multiplies the search space exponentially. " +
    "A 5-word Diceware passphrase has 2⁶⁴ combinations. " +
    "In practice: use a password manager for every site, protected by one strong passphrase like this one.",
};

const MOCK_COOKIE_LEVELS: CookieLevelConfig[] = [
  // ── Level 1: Easy — ghost button ─────────────────────────────────────────
  {
    id: "ck-easy-1",
    title: "The News Site",
    difficulty: "easy",
    fakeUrl: "www.daily-herald.eu",
    instruction:
      "Reject all non-essential cookies to continue reading the article.",
    challengeType: "escape",
    correctActionId: "reject-btn",
    xpReward: 50,
    debrief:
      'The "Reject" option was a small, grey ghost link compared to the bold "Accept All" button. ' +
      "This is called Visual Asymmetry — explicitly prohibited by EDPB Guidelines 03/2022. " +
      "Both options must have equal visual weight.",
  },
  // ── Level 2: Easy — fake close button ────────────────────────────────────
  {
    id: "ck-easy-2",
    title: "The Travel Blog",
    difficulty: "easy",
    fakeUrl: "www.wander-tales.nl",
    instruction:
      "The ✕ looks like it closes the banner — but does it? Reject cookies correctly.",
    challengeType: "escape",
    correctActionId: "real-reject",
    xpReward: 60,
    debrief:
      "The ✕ button silently accepted all cookies. EDPB Guidelines 05/2020 §3.1.3 explicitly states: " +
      "closing or dismissing a banner must equal rejection, never consent.",
  },
  // ── Level 3: Medium — double negative language ────────────────────────────
  {
    id: "ck-medium-1",
    title: "The Shopping Portal",
    difficulty: "medium",
    fakeUrl: "www.shopcheap.nl",
    instruction:
      "Read carefully — the language is designed to confuse. Opt out of tracking.",
    challengeType: "escape",
    correctActionId: "uncheck-and-confirm",
    xpReward: 80,
    debrief:
      '"Do not uncheck to disable non-essential cookies" is a deliberate double negative. ' +
      "GDPR requires consent language to be plain, intelligible and unambiguous (Art. 7 + Recital 32). " +
      "Confusing language invalidates consent.",
  },
  // ── Level 4: Medium — spot 3 patterns ────────────────────────────────────
  {
    id: "ck-medium-2",
    title: "The Streaming Service",
    difficulty: "medium",
    fakeUrl: "www.streammax.eu",
    instruction:
      "This banner has 3 dark patterns hidden inside it. Tap each one to identify it.",
    challengeType: "spot",
    targets: [
      {
        id: "dp-pretick",
        type: "pre_ticked",
        title: "Pre-ticked Box",
        explanation:
          "Analytics cookies are pre-selected. GDPR Recital 32 explicitly states pre-ticked boxes do not constitute valid consent.",
        legalRef: "GDPR Recital 32",
      },
      {
        id: "dp-asymm",
        type: "visual_asymmetry",
        title: "Visual Asymmetry",
        explanation:
          'The bold "Accept All" vs tiny "save preferences" link steers users toward full consent. Prohibited by EDPB Guidelines 03/2022.',
        legalRef: "EDPB Guidelines 03/2022 §3.2",
      },
      {
        id: "dp-fake-close",
        type: "fake_close",
        title: "Fake Close Button",
        explanation:
          'The ✕ dismisses the banner but sets cookies to "accepted". EDPB: dismissal must equal rejection.',
        legalRef: "EDPB Guidelines 05/2020 §3.1.3",
      },
    ],
    xpReward: 100,
    debrief:
      "You identified all three patterns. In 2022, CNIL fined Google €150M and Facebook €60M specifically " +
      "for making cookie rejection harder than acceptance.",
  },
  // ── Level 5: Hard — four patterns + timer ────────────────────────────────
  {
    id: "ck-hard-1",
    title: "The Finance Platform",
    difficulty: "hard",
    fakeUrl: "www.fintracker.eu",
    instruction: "Find all 4 dark patterns before the 30-second timer expires.",
    challengeType: "spot",
    targets: [
      {
        id: "dp-pretick2",
        type: "pre_ticked",
        title: "Pre-ticked Marketing",
        explanation:
          "Marketing cookies pre-enabled is one of the most commonly fined GDPR violations.",
        legalRef: "GDPR Recital 32 + Art. 7",
      },
      {
        id: "dp-shaming",
        type: "confirm_shaming",
        title: "Confirmshaming",
        explanation:
          'The reject option reads "No thanks, I prefer a worse experience." Shaming users into accepting is a recognised dark pattern.',
        legalRef: "EDPB Guidelines 03/2022 §3.3.3",
      },
      {
        id: "dp-asymm2",
        type: "visual_asymmetry",
        title: "Visual Asymmetry",
        explanation:
          "Identical information, but the Accept path uses full-colour buttons while reject is plain text.",
        legalRef: "EDPB Guidelines 03/2022 §3.2",
      },
      {
        id: "dp-wall",
        type: "hidden_reject",
        title: "Information Wall",
        explanation:
          '"Full details" links to a 47-page PDF. GDPR Art. 12 requires information to be concise and intelligible.',
        legalRef: "GDPR Art. 12(1)",
      },
    ],
    xpReward: 150,
    debrief:
      "All four patterns found. At the hard level, patterns are subtle and layered — exactly as they appear " +
      "on real sites. Always look for: language complexity, visual weight differences, pre-checked boxes, and walls of text.",
  },
  // ── Level 6: Hard — multi-step escape ────────────────────────────────────
  {
    id: "ck-hard-2",
    title: "The Social Network",
    difficulty: "hard",
    fakeUrl: "www.connecto.social",
    instruction:
      "Reject all cookies. Watch out — there are 3 steps designed to make you give up.",
    challengeType: "escape",
    correctActionId: "final-reject",
    xpReward: 175,
    debrief:
      "You navigated the Roach Motel — easy to accept, deliberately hard to reject. " +
      "GDPR Art. 7(3): withdrawing consent must be as easy as giving it. " +
      "Multi-step rejection flows that exceed the steps needed to accept are illegal.",
  },
];

// ─── Public API functions ─────────────────────────────────────────────────────

export async function fetchPasswordBuildConfig(): Promise<PasswordBuildConfig> {
  return apiFetch<PasswordBuildConfig>(
    "/api/game/password/build",
    MOCK_PASSWORD_BUILD,
  );
}

export async function fetchSpotWeakConfig(): Promise<SpotWeakConfig> {
  return apiFetch<SpotWeakConfig>(
    "/api/game/password/spot-weak",
    MOCK_SPOT_WEAK,
  );
}

export async function fetchPassphraseConfig(): Promise<PassphraseConfig> {
  return apiFetch<PassphraseConfig>(
    "/api/game/password/passphrase",
    MOCK_PASSPHRASE,
  );
}

export async function fetchCookieLevels(): Promise<CookieLevelConfig[]> {
  return apiFetch<CookieLevelConfig[]>(
    "/api/game/cookies/levels",
    MOCK_COOKIE_LEVELS,
  );
}

// ─── Phishing mock data ───────────────────────────────────────────────────────

const MOCK_PHISHING_LEVELS: PhishingLevel[] = [
  // ── Level 1: Easy — headers only, obvious spoofed domain ─────────────────
  {
    id: "ph-easy-1",
    title: "The Suspicious Sender",
    difficulty: "easy",
    instruction:
      "Examine the email headers carefully. Is this email legitimate or a phishing attempt?",
    teachingPoint:
      "Always check the actual sender address — not just the display name. Attackers set a friendly name like 'ING Bank' but send from a completely different domain.",
    emails: [
      {
        id: "ph-easy-1-a",
        isPhishing: true,
        focusArea: "headers",
        headers: {
          fromName: "ING Bank Nederland",
          fromAddress: "noreply@ing-secure-alerts.com",
          replyTo: "support@ing-phish.ru",
          to: "j.vandenberg@gmail.com",
          date: "Fri, 14 Mar 2025 08:42:11 +0100",
          subject: "⚠️ Your account has been temporarily locked",
        },
        clues: [
          {
            label: "Spoofed domain",
            explanation:
              "Real ING emails come from @ing.nl or @ing.com. The domain 'ing-secure-alerts.com' is a lookalike registered by attackers.",
          },
          {
            label: "Suspicious Reply-To",
            explanation:
              "Reply-To is routed to a .ru domain — completely unrelated to ING. Any reply you send goes straight to the attacker.",
          },
          {
            label: "Urgency in subject",
            explanation:
              "Account lock threats create panic and reduce critical thinking. Legitimate banks contact you by phone for serious issues.",
          },
        ],
        explanation:
          "The display name says 'ING Bank' but the real domain is 'ing-secure-alerts.com' — not ing.nl. The Reply-To going to a .ru address confirms this is a phishing attempt.",
        xpReward: 40,
      },
      {
        id: "ph-easy-1-b",
        isPhishing: false,
        focusArea: "headers",
        headers: {
          fromName: "GitHub",
          fromAddress: "noreply@github.com",
          to: "i.georgieva@radboud.nl",
          date: "Thu, 13 Mar 2025 16:03:45 +0000",
          subject: "[GitHub] A new SSH key was added to your account",
        },
        clues: [
          {
            label: "Verified domain",
            explanation:
              "noreply@github.com is GitHub's real domain. The sender matches exactly.",
          },
          {
            label: "No Reply-To trick",
            explanation:
              "No separate Reply-To set — replies go back to the same github.com domain.",
          },
          {
            label: "Specific subject",
            explanation:
              "The subject references a specific action on your account, not a generic threat.",
          },
        ],
        explanation:
          "This is a legitimate GitHub security notification. The sender domain matches exactly, there is no Reply-To mismatch, and the subject is specific rather than alarming.",
        xpReward: 40,
      },
    ],
  },

  // ── Level 2: Easy — body only, obvious urgency + bad link ─────────────────
  {
    id: "ph-easy-2",
    title: "The Urgent Request",
    difficulty: "easy",
    instruction:
      "Read the email body. Hover over any links to see where they actually go. Is this legitimate?",
    teachingPoint:
      "Hover over links before clicking — the real URL shown in your browser's status bar often reveals the truth. Mismatched display text and actual URLs are a core phishing indicator.",
    emails: [
      {
        id: "ph-easy-2-a",
        isPhishing: true,
        focusArea: "body",
        headers: {
          fromName: "DigiD",
          fromAddress: "beveiliging@digid-verificatie.com",
          to: "i.georgieva@radboud.nl",
          date: "Thu, 13 Mar 2025 22:11:44 +0100",
          subject: "Uw DigiD account is geblokkeerd",
        },
        body: [
          { type: "text", content: "Geachte gebruiker," },
          {
            type: "text",
            content:
              "Uw DigiD-account is tijdelijk geblokkeerd vanwege meerdere mislukte inlogpogingen.",
            urgent: true,
          },
          {
            type: "text",
            content:
              "Om uw account te deblokkeren klikt u op de onderstaande link:",
          },
          {
            type: "button",
            content: "Deblokkeer mijn DigiD",
            href: "http://digid-verificatie.com/deblokkeer",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "Let op: als u geen actie onderneemt binnen 12 uur wordt uw account permanent verwijderd.",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Lookalike domain",
            explanation:
              "Real DigiD is operated by Logius — emails come from @digid.nl or @logius.nl. 'digid-verificatie.com' is a separately registered fake domain.",
          },
          {
            label: "HTTP link",
            explanation:
              "The button points to http:// (unencrypted). No legitimate government service collects credentials over plain HTTP.",
          },
          {
            label: "12-hour threat",
            explanation:
              "Government agencies have formal processes — they never permanently delete accounts by email within hours. This pressure is fabricated.",
          },
          {
            label: "No BSN reference",
            explanation:
              "Real DigiD emails include partial verification like your last 3 BSN digits. Generic greetings with no personal reference are a red flag.",
          },
        ],
        explanation:
          "This is a DigiD phishing email — one of the most common in the Netherlands. The domain, HTTP link, and artificial 12-hour deadline all confirm it. DigiD credentials unlock tax records, benefits, and healthcare access.",
        xpReward: 50,
      },
      {
        id: "ph-easy-2-b",
        isPhishing: false,
        focusArea: "body",
        headers: {
          fromName: "LinkedIn",
          fromAddress: "messages-noreply@linkedin.com",
          to: "i.georgieva@radboud.nl",
          date: "Mon, 10 Mar 2025 10:00:00 +0000",
          subject: "You appeared in 12 searches this week",
        },
        body: [
          { type: "text", content: "Hi Ivelina," },
          {
            type: "text",
            content:
              "Your profile is getting attention. You appeared in 12 searches this week.",
          },
          {
            type: "button",
            content: "View who viewed your profile",
            href: "https://www.linkedin.com/notifications/?filter=all",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "You're receiving this because you have LinkedIn notifications enabled.",
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
              "messages-noreply@linkedin.com is a verified LinkedIn sending domain.",
          },
          {
            label: "HTTPS links only",
            explanation:
              "Both the CTA button and unsubscribe link resolve to www.linkedin.com over HTTPS — consistent with the sender.",
          },
          {
            label: "GDPR unsubscribe",
            explanation:
              "A functioning unsubscribe link is required by GDPR and CAN-SPAM. Phishing emails rarely include one.",
          },
          {
            label: "No credentials",
            explanation:
              "The email requests nothing — no password, no payment, no personal data. It is a passive notification.",
          },
        ],
        explanation:
          "Legitimate LinkedIn notification. The sender domain, HTTPS links, unsubscribe mechanism, and absence of any credential request all check out.",
        xpReward: 50,
      },
    ],
  },

  // ── Level 3: Medium — full email, spear phishing ─────────────────────────
  {
    id: "ph-medium-1",
    title: "The Spear Phish",
    difficulty: "medium",
    instruction:
      "This email uses personal details to seem credible. Analyse both the headers and body.",
    teachingPoint:
      "Spear phishing targets you specifically using harvested details — your real name, employer, or address. Personalisation lowers your guard. The only reliable indicator is often just the domain.",
    emails: [
      {
        id: "ph-medium-1-a",
        isPhishing: true,
        focusArea: "full",
        headers: {
          fromName: "IT Helpdesk — Radboud University",
          fromAddress: "helpdesk@ru-ict-support.nl",
          replyTo: "helpdesk@ru-ict-support.nl",
          to: "i.georgieva@radboud.nl",
          date: "Fri, 14 Mar 2025 09:15:03 +0100",
          subject: "Action required: Email storage quota exceeded (92%)",
        },
        body: [
          { type: "text", content: "Dear Ivelina," },
          {
            type: "text",
            content:
              "Our system has detected that your university email account has reached 92% of its storage quota (4.6 GB / 5 GB).",
          },
          {
            type: "text",
            content:
              "To prevent interruption of email services, please take action within 48 hours:",
            urgent: true,
          },
          {
            type: "button",
            content: "Request Storage Extension",
            href: "https://ru-ict-support.nl/quota-extend?token=a8f2c1",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "ICT Helpdesk — Radboud University, Houtlaan 4, 6525 XZ Nijmegen",
          },
        ],
        clues: [
          {
            label: "Lookalike domain",
            explanation:
              "Radboud's real ICT domain is ru.nl or science.ru.nl. 'ru-ict-support.nl' is a separately registered domain — a classic spear-phishing setup.",
          },
          {
            label: "Your real name used",
            explanation:
              "Attackers harvest names from university websites and LinkedIn. Personalisation is deliberate — it makes you lower your guard.",
          },
          {
            label: "Real address included",
            explanation:
              "Houtlaan 4 is a real Radboud address. Attackers research these. Correct physical addresses can be faked — always verify the domain.",
          },
          {
            label: "48-hour pressure",
            explanation:
              "ICT departments send automated warnings well in advance. A 48-hour ultimatum from an email link is not a legitimate helpdesk workflow.",
          },
        ],
        explanation:
          "Sophisticated spear phishing targeting Radboud staff. Uses your real name and the university's real address — but the domain is ru-ict-support.nl, not ru.nl. Always navigate to official portals directly.",
        xpReward: 70,
      },
      {
        id: "ph-medium-1-b",
        isPhishing: false,
        focusArea: "full",
        headers: {
          fromName: "Radboud University",
          fromAddress: "noreply@ru.nl",
          to: "i.georgieva@radboud.nl",
          date: "Wed, 12 Mar 2025 09:00:00 +0100",
          subject: "Reminder: thesis submission deadline — 28 March",
        },
        body: [
          { type: "text", content: "Dear Ivelina," },
          {
            type: "text",
            content:
              "This is a reminder that the deadline for thesis submission is 28 March 2025. Please ensure your document is uploaded to the student portal before 23:59.",
          },
          {
            type: "button",
            content: "Go to Student Portal",
            href: "https://www.ru.nl/students/thesis-portal",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "Questions? Contact your supervisor or the student administration at student@ru.nl.",
          },
        ],
        clues: [
          {
            label: "Real ru.nl domain",
            explanation:
              "noreply@ru.nl is Radboud's verified sending domain. Matches the link destination.",
          },
          {
            label: "HTTPS portal link",
            explanation:
              "The CTA resolves to https://www.ru.nl — the same domain as the sender.",
          },
          {
            label: "No urgency tricks",
            explanation:
              "A calm deadline reminder with no threats, no account lock warnings, and a fallback contact address.",
          },
          {
            label: "Specific action",
            explanation:
              "The email tells you exactly what to do and gives a contact for questions — not a generic 'click here immediately'.",
          },
        ],
        explanation:
          "Legitimate Radboud University notification. The sender domain ru.nl matches the link destination, and the email is calm, specific, and provides a real contact address.",
        xpReward: 70,
      },
    ],
  },

  // ── Level 4: Medium — headers only, subtle differences ───────────────────
  {
    id: "ph-medium-2",
    title: "Header Detective",
    difficulty: "medium",
    instruction:
      "These emails look similar at first glance. Focus only on the headers — spot the difference.",
    teachingPoint:
      "Attackers use Unicode homoglyphs and subdomain tricks to make domains look legitimate at a glance. 'paypal.com.secure-login.net' is not PayPal's domain — everything after the last dot before the path is the real domain.",
    emails: [
      {
        id: "ph-medium-2-a",
        isPhishing: true,
        focusArea: "headers",
        headers: {
          fromName: "PayPal",
          fromAddress: "service@paypal.com.secure-login.net",
          to: "j.dejong@hotmail.com",
          date: "Sat, 15 Mar 2025 14:22:00 +0100",
          subject: "Your PayPal account access is limited",
        },
        clues: [
          {
            label: "Subdomain trick",
            explanation:
              "'paypal.com' is a subdomain of 'secure-login.net' here — the real domain is secure-login.net, not paypal.com. Read domains right-to-left: net → secure-login → paypal.com (subdomain).",
          },
          {
            label: "Account limit bait",
            explanation:
              "PayPal's 'limited account' email is one of the most cloned phishing templates. The real PayPal domain is paypal.com with nothing after it.",
          },
        ],
        explanation:
          "The address 'service@paypal.com.secure-login.net' is NOT from PayPal. The real domain is secure-login.net. Paypal.com is just a subdomain label — a classic subdomain spoofing trick.",
        xpReward: 60,
      },
      {
        id: "ph-medium-2-b",
        isPhishing: false,
        focusArea: "headers",
        headers: {
          fromName: "PayPal",
          fromAddress: "service@paypal.com",
          to: "j.dejong@hotmail.com",
          date: "Tue, 11 Mar 2025 09:14:00 +0100",
          subject: "Receipt for your payment to Bol.com",
        },
        clues: [
          {
            label: "Exact domain match",
            explanation:
              "service@paypal.com — paypal.com is the real domain with no subdomains or extra suffixes.",
          },
          {
            label: "Transaction receipt",
            explanation:
              "A payment receipt email is expected behaviour after a transaction. No account threats, no urgency.",
          },
        ],
        explanation:
          "Legitimate PayPal email. The sender address is exactly paypal.com — no extra domains appended, no subdomain tricks.",
        xpReward: 60,
      },
    ],
  },

  // ── Level 5: Hard — full email, mixed set of 3 ───────────────────────────
  {
    id: "ph-hard-1",
    title: "Analyst Mode",
    difficulty: "hard",
    instruction:
      "Three emails — analyse everything. One slip and you lose points. Take your time.",
    teachingPoint:
      "At this level legitimate emails may contain some patterns that look suspicious (urgency, links, requests) while phishing emails may look very polished. Systematic header-then-body analysis beats gut feeling every time.",
    emails: [
      {
        id: "ph-hard-1-a",
        isPhishing: false,
        focusArea: "full",
        headers: {
          fromName: "Van Lanschot Kempen",
          fromAddress: "noreply@vanlanschotkempen.com",
          to: "i.georgieva@vanlanschotkempen.com",
          date: "Mon, 10 Mar 2025 08:00:00 +0100",
          subject: "Scheduled maintenance — portal unavailable 22:00–02:00",
        },
        body: [
          { type: "text", content: "Dear colleague," },
          {
            type: "text",
            content:
              "Planned maintenance will take the internal portal offline tonight from 22:00 to 02:00 CET. No action is required from you.",
          },
          {
            type: "text",
            content:
              "If you need access during this window, please contact the Service Desk at servicedesk@vanlanschotkempen.com or ext. 4400.",
          },
        ],
        clues: [
          {
            label: "Internal sending domain",
            explanation:
              "noreply@vanlanschotkempen.com is consistent with the recipient domain — an internal notification.",
          },
          {
            label: "No links or attachments",
            explanation:
              "A maintenance notice has no reason to include clickable links. The absence of links is itself a trust signal.",
          },
          {
            label: "Fallback contact given",
            explanation:
              "Provides an email and phone extension for queries — something phishing emails never do with real internal contacts.",
          },
        ],
        explanation:
          "Legitimate internal IT notice. No links, consistent domain, and a real internal contact number. Nothing to click, nothing requested.",
        xpReward: 80,
      },
      {
        id: "ph-hard-1-b",
        isPhishing: true,
        focusArea: "full",
        headers: {
          fromName: "Microsoft 365",
          fromAddress: "no-reply@microsoft-account-alert.com",
          replyTo: "bounce@mailtrack-analytics.io",
          to: "i.georgieva@radboud.nl",
          date: "Sun, 9 Mar 2025 03:17:44 +0000",
          subject: "Unusual sign-in activity detected on your account",
        },
        body: [
          {
            type: "text",
            content:
              "We detected a sign-in to your Microsoft account from an unrecognised device.",
            urgent: true,
          },
          {
            type: "text",
            content: "Location: Kyiv, Ukraine — Windows 11 — Chrome 122",
          },
          {
            type: "button",
            content: "Review activity and secure account",
            href: "http://microsoft-account-alert.com/secure?ref=radboud",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "If this was you, no action is needed. If not, click above immediately.",
            urgent: true,
          },
        ],
        clues: [
          {
            label: "Non-Microsoft domain",
            explanation:
              "Microsoft sends from @microsoft.com or @accountprotection.microsoft.com — never from 'microsoft-account-alert.com'.",
          },
          {
            label: "Tracking Reply-To",
            explanation:
              "Reply-To set to a third-party analytics domain — used to track whether targets respond, not a Microsoft address.",
          },
          {
            label: "Sent at 03:17 UTC",
            explanation:
              "Unusual sending times (overnight) are common with phishing campaigns run from different time zones.",
          },
          {
            label: "HTTP CTA button",
            explanation:
              "Microsoft account security pages are always HTTPS. An HTTP link for a 'secure your account' action is an immediate red flag.",
          },
          {
            label: "Ref parameter in URL",
            explanation:
              "The ?ref=radboud parameter identifies you as a target from this specific phishing batch — not something a legitimate security alert would include.",
          },
        ],
        explanation:
          "Polished Microsoft impersonation phish. The domain, HTTP link, overnight timestamp, tracking Reply-To, and URL parameter all confirm it. The scary location detail is fabricated.",
        xpReward: 80,
      },
      {
        id: "ph-hard-1-c",
        isPhishing: false,
        focusArea: "full",
        headers: {
          fromName: "DHL Express",
          fromAddress: "shipment-notification@dhl.com",
          to: "i.georgieva@radboud.nl",
          date: "Fri, 14 Mar 2025 11:42:00 +0100",
          subject: "Your shipment 1234567890 is out for delivery",
        },
        body: [
          {
            type: "text",
            content:
              "Your shipment is on its way. Expected delivery: today before 18:00.",
          },
          {
            type: "button",
            content: "Track shipment 1234567890",
            href: "https://www.dhl.com/nl-en/home/tracking/tracking-express.html?AWB=1234567890",
          },
          { type: "divider" },
          {
            type: "text",
            content:
              "If you have questions, contact DHL customer service at 088-0552000.",
          },
        ],
        clues: [
          {
            label: "Real dhl.com domain",
            explanation:
              "shipment-notification@dhl.com is DHL's verified sending domain for automated notifications.",
          },
          {
            label: "HTTPS tracking link",
            explanation:
              "The tracking button resolves to https://www.dhl.com — the same domain as the sender, with a specific AWB number.",
          },
          {
            label: "Specific tracking ID",
            explanation:
              "A real tracking number is included throughout, consistent with an actual shipment notification.",
          },
          {
            label: "Real customer number",
            explanation:
              "DHL's actual Netherlands customer service number (088-0552000) is included as a fallback.",
          },
        ],
        explanation:
          "Legitimate DHL shipment notification. Real domain, HTTPS link to the actual DHL tracking portal with a specific AWB, and a verifiable customer service number.",
        xpReward: 80,
      },
    ],
  },
];

// ─── Public API functions ─────────────────────────────────────────────────────

export async function fetchPhishingLevels(): Promise<PhishingLevel[]> {
  return apiFetch<PhishingLevel[]>(
    "/api/game/phishing/levels",
    MOCK_PHISHING_LEVELS,
  );
}

export async function fetchFullGameConfig(): Promise<GameConfig> {
  const [passwordBuild, spotWeak, passphrase, cookieLevels, phishingLevels] =
    await Promise.all([
      fetchPasswordBuildConfig(),
      fetchSpotWeakConfig(),
      fetchPassphraseConfig(),
      fetchCookieLevels(),
      fetchPhishingLevels(),
    ]);
  return { passwordBuild, spotWeak, passphrase, cookieLevels, phishingLevels };
}
