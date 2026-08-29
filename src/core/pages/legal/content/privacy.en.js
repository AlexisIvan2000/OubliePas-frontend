export default {
  title: "Privacy policy",
  intro:
    "This page describes exactly what {entity} collects, why, where it is processed and how long it is kept. It describes how the application actually works, not an intention.",
  sections: [
    {
      id: "controller",
      heading: "1. Who handles your data",
      body: [
        "{entity} is responsible for the personal information described here. For any question or request, write to {email}.",
      ],
    },
    {
      id: "collected",
      heading: "2. What we collect",
      body: ["Only what is needed to run the service:"],
      groups: [
        {
          label: "Your account",
          items: [
            "first name, last name (optional) and email address;",
            "a hash of your password, never the password itself;",
            "a profile photo, if you add one;",
            "your display currency;",
            "a Google account identifier, only if you choose that sign-in method;",
            "the dates your account was created and last changed.",
          ],
        },
        {
          label: "What you enter",
          items: [
            "your subscriptions and bills: name, category, amount, frequency, start and end dates, notes;",
            "the due dates generated from them: date, amount, paid or skipped status, settlement date;",
            "your reminder preferences.",
          ],
        },
        {
          label: "Security and session",
          items: [
            "hashes of verification, reset and email-change codes, with their expiry;",
            "attempt and resend counters, to limit abuse;",
            "hashes of session tokens, with their expiry.",
          ],
        },
      ],
    },
    {
      id: "never",
      heading: "3. What we do not collect",
      body: ["This list matters as much as the previous one."],
      list: [
        "No bank connection. The app links to no financial institution.",
        "No card or payment data.",
        "No advertising trackers, no third-party pixels, no ad networks. The only measurement is a cookieless page count, described below.",
        "No location data.",
        "No profiling and no automated decisions about you.",
      ],
    },
    {
      id: "purposes",
      heading: "4. Why we process it",
      list: [
        "Create and manage your account, and verify your email address.",
        "Show your subscriptions and bills, and work out your totals.",
        "Send the due-date reminders you have switched on.",
        "Send the emails an account cannot work without: verification, password reset, email change.",
        "Protect the service against unauthorised access and abuse.",
      ],
      after: [
        "These uses are necessary to deliver the service you asked for. Reminders additionally depend on your choice, which you can withdraw at any time.",
      ],
    },
    {
      id: "cookies",
      heading: "5. Cookies and local storage",
      body: [
        "A single cookie is set: the one that keeps your session open. It is unreadable by page JavaScript and is used only to renew your sign-in.",
        "Your browser also keeps, locally, your access token along with your theme and language preferences. That information never leaves your device except to authenticate you.",
        "Audience measurement is limited to a page-view count handled by the site host. It sets no cookie and keeps no identifier in your browser, which is why there is no consent banner.",
      ],
    },
    {
      id: "processors",
      heading: "6. The providers involved",
      body: ["We rely on a deliberately small number of processors:"],
      groups: [
        {
          label: "Email delivery",
          items: [
            "A sending service receives your email address and the message content in order to deliver it. It receives neither your amounts nor your notes, apart from what appears in a reminder: the line name, the amount and the due date.",
          ],
        },
        {
          label: "Profile photo storage",
          items: ["An object storage service hosts only the photo you upload."],
        },
        {
          label: "Google sign-in",
          items: [
            "Only if you use that sign-in method. Google then passes us your email address, your name and your photo. We never receive your Google password.",
          ],
        },
        {
          label: "Hosting",
          items: [
            "The server and the database are hosted with an infrastructure provider, where your data sits at rest.",
          ],
        },
        {
          label: "Audience measurement",
          items: [
            "The site host counts page views so that we know what is being read. It receives the page address, the referrer and the device type. No cookie is set, no identifier is kept in your browser, and this measurement is never tied to your account.",
          ],
        },
      ],
      after: ["We do not sell, rent or trade your information with anyone else."],
    },
    {
      id: "retention",
      heading: "7. How long we keep it",
      list: [
        "Account and content: for as long as your account exists.",
        "Verification and reset codes: a few minutes, then they expire.",
        "Session tokens: until they expire or are revoked, on sign-out for instance.",
        "After account deletion: the data is erased, including your subscriptions, your bills and their due dates.",
      ],
    },
    {
      id: "rights",
      heading: "8. Your rights",
      body: ["At any time you can:"],
      list: [
        "view and correct your information from your settings;",
        "delete your account and all associated data;",
        "switch reminders off, individually or entirely;",
        "request a copy of your information by writing to {email};",
        "lodge a complaint with the privacy authority for your territory.",
      ],
    },
    {
      id: "security",
      heading: "9. How it is protected",
      list: [
        "Passwords are hashed with an algorithm designed to resist brute-force attacks. They are never stored in the clear and cannot be reversed.",
        "One-time codes and session tokens are stored as hashes, never in the clear.",
        "Traffic to the server goes over an encrypted connection.",
        "The session cookie is unreadable by JavaScript, which limits session theft.",
        "No system is infallible. Should an incident affect your information, we will notify you, and the competent authority where the law requires it.",
      ],
    },
    {
      id: "transfers",
      heading: "10. Processing outside the territory",
      body: [
        "Some providers may process or store data outside {jurisdictionEn}. Where that happens, we make sure an adequate level of protection is in place, by contract or through the provider's own commitments.",
      ],
    },
    {
      id: "minors",
      heading: "11. Minors",
      body: [
        "The service is not intended for children under 14. If we learn that an account was created by a child below that age, we delete it.",
      ],
    },
    {
      id: "changes",
      heading: "12. Changes",
      body: [
        "Any significant change to this policy will be announced by email or in the app before it takes effect. The date of the latest update appears at the top of this page.",
      ],
    },
  ],
};
