export function analyzeContent(message) {
  const text =
    message.toLowerCase();
  const hasPhrase = (phrase) => new RegExp(`\\b${phrase}\\b`, "i").test(text);

  const detected = [];

  let risk = 0;

  const addThreat = ({
    type,
    title,
    detail,
    weight,
  }) => {
    risk += weight;

    detected.push({
      type,
      title,
      detail,
      weight,
    });
  };


  // URGENCY

  const urgencyWords = [
    "urgent",
    "immediately",
    "act now",
    "final warning",
    "expires today",
    "limited time",
    "within 24 hours",
    "don't wait",
    "respond immediately",
    "account will be closed",
  ];

  const urgency =
    urgencyWords.find((word) =>
      hasPhrase(word)
    );

  if (urgency) {
    addThreat({
      type: "urgency",
      title:
        "Urgency & pressure",
      detail:
        `Manipulation phrase "${urgency}" detected.`,
      weight: 18,
    });
  }


  // CREDENTIALS

  const credentialWords = [
    "otp",
    "password",
    "pin",
    "passcode",
    "verification code",
    "security code",
    "login details",
    "cvv",
  ];

  const credential =
    credentialWords.find((word) =>
      hasPhrase(word)
    );

  if (credential) {
    addThreat({
      type: "credential",
      title:
        "Credential request",
      detail:
        `Sensitive information "${credential}" is being requested.`,
      weight: 30,
    });
  }


  // PAYMENT

  const paymentWords = [
    "send money",
    "pay now",
    "bank transfer",
    "upi",
    "phonepe",
    "paytm",
    "gpay",
    "processing fee",
    "registration fee",
    "payment required",
  ];

  const payment =
    paymentWords.find((word) =>
      hasPhrase(word)
    );

  if (payment) {
    addThreat({
      type: "payment",
      title:
        "Financial request",
      detail:
        `Payment-related phrase "${payment}" detected.`,
      weight: 25,
    });
  }


  // PRIZE

  const prizeWords = [
    "you won",
    "winner",
    "lottery",
    "cash prize",
    "claim your prize",
    "free gift",
    "congratulations",
    "reward waiting",
  ];

  const prize =
    prizeWords.find((word) =>
      hasPhrase(word)
    );

  if (prize) {
    addThreat({
      type: "prize",
      title:
        "Prize / reward pattern",
      detail:
        `Unexpected reward phrase "${prize}" detected.`,
      weight: 20,
    });
  }


  // BANKING PHISHING

  const bankingWords = [
    "account suspended",
    "account blocked",
    "kyc expired",
    "update kyc",
    "verify your account",
    "debit card blocked",
    "bank account blocked",
  ];

  const banking =
    bankingWords.find((word) =>
      hasPhrase(word)
    );

  if (banking) {
    addThreat({
      type: "banking",
      title:
        "Banking phishing pattern",
      detail:
        `"${banking}" resembles common banking phishing language.`,
      weight: 20,
    });
  }


  // IMPERSONATION

  const authorityWords = [
    "police department",
    "income tax department",
    "customs officer",
    "bank manager",
    "government official",
    "courier department",
    "customer support agent",
  ];

  const authority =
    authorityWords.find((word) =>
      hasPhrase(word)
    );

  if (authority) {
    addThreat({
      type: "impersonation",
      title:
        "Authority impersonation",
      detail:
        `Possible impersonation of "${authority}".`,
      weight: 18,
    });
  }


  // REMOTE CONTROL

  const remoteWords = [
    "anydesk",
    "teamviewer",
    "remote access",
    "screen share",
    "install this app",
  ];

  const remote =
    remoteWords.find((word) =>
      hasPhrase(word)
    );

  if (remote) {
    addThreat({
      type: "remote",
      title:
        "Remote access request",
      detail:
        `"${remote}" may allow another person to control the device.`,
      weight: 30,
    });
  }


  // URL ANALYSIS

  const urls =
    message.match(
      /https?:\/\/[^\s]+|www\.[^\s]+/gi
    ) || [];

  if (urls.length) {
    const shorteners = [
      "bit.ly",
      "tinyurl.com",
      "t.co",
      "goo.gl",
      "cutt.ly",
      "shorturl.at",
    ];

    const suspiciousUrlWords = [
      "verify",
      "secure-login",
      "update-account",
      "claim",
      "reward",
      "bank-login",
      "wallet",
      "kyc",
    ];

    const suspiciousUrl =
      urls.find((url) => {
        try {
          const candidate = url.replace(/[),.!;]+$/, "");
          const parsed = new URL(/^www\./i.test(candidate) ? 'https://' + candidate : candidate);
          const hostname = parsed.hostname.toLowerCase();
          const shortened = shorteners.some(domain => hostname === domain || hostname.endsWith('.' + domain));
          const suspiciousWord = suspiciousUrlWords.some(word => parsed.href.toLowerCase().includes(word));
          const ipAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[');
          return shortened || suspiciousWord || ipAddress || Boolean(parsed.username || parsed.password);
        } catch {
          return false;
        }
      });

    if (suspiciousUrl) {
      addThreat({
        type: "url",
        title:
          "Suspicious link",
        detail:
          `Potential phishing link detected: ${suspiciousUrl}`,
        weight: 30,
      });
    }
  }


  const finalScore =
    Math.min(risk, 100);


  return {
    riskScore: finalScore,
    riskLevel: finalScore >= 70 ? "HIGH RISK" : finalScore >= 40 ? "SUSPICIOUS" : "LOW RISK",
    threats: detected,
  };
}
