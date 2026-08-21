import { normalizeSearch } from "./commitment";

const brand = (name, category, extra = {}) => ({
  id: normalizeSearch(name).replace(/\W+/g, "-"),
  name,
  category,
  ...extra,
});

const generic = (id, category, extra = {}) => ({
  id,
  labelKey: `catalog.${id}`,
  category,
  ...extra,
});

const SUBSCRIPTIONS = [
  brand("Netflix", "entertainment"),
  brand("Spotify", "music"),
  brand("Disney+", "entertainment"),
  brand("Amazon Prime", "other"),
  brand("Prime Video", "entertainment"),
  brand("Apple TV+", "entertainment"),
  brand("Apple Music", "music"),
  brand("YouTube Premium", "entertainment"),
  brand("YouTube Music", "music"),
  brand("Crave", "entertainment"),
  brand("HBO Max", "entertainment"),
  brand("Paramount+", "entertainment"),
  brand("Hulu", "entertainment"),
  brand("Peacock", "entertainment"),
  brand("Canal+", "entertainment"),
  brand("Mubi", "entertainment"),
  brand("Deezer", "music"),
  brand("Tidal", "music"),
  brand("Amazon Music", "music"),
  brand("SoundCloud", "music"),
  brand("Qobuz", "music"),
  brand("Pandora", "music"),
  brand("Audible", "entertainment"),
  brand("Kindle Unlimited", "entertainment"),
  brand("Kobo Plus", "entertainment"),
  brand("Storytel", "entertainment"),
  brand("Twitch", "entertainment"),
  brand("PlayStation Plus", "entertainment"),
  brand("Xbox Game Pass", "entertainment"),
  brand("Nintendo Switch Online", "entertainment"),
  brand("EA Play", "entertainment"),
  brand("Ubisoft+", "entertainment"),
  brand("Microsoft 365", "software"),
  brand("Google Workspace", "software"),
  brand("Adobe Creative Cloud", "software"),
  brand("Adobe Photoshop", "software"),
  brand("Canva", "software"),
  brand("Figma", "software"),
  brand("Notion", "software"),
  brand("Slack", "software"),
  brand("Zoom", "software"),
  brand("ChatGPT Plus", "software"),
  brand("Claude Pro", "software"),
  brand("GitHub", "software"),
  brand("JetBrains", "software", { frequency: "yearly" }),
  brand("Linear", "software"),
  brand("Todoist", "software"),
  brand("Evernote", "software"),
  brand("Trello", "software"),
  brand("Asana", "software"),
  brand("Grammarly", "software"),
  brand("1Password", "software"),
  brand("LastPass", "software"),
  brand("Bitwarden", "software"),
  brand("NordVPN", "software"),
  brand("ExpressVPN", "software"),
  brand("Surfshark", "software"),
  brand("Proton", "software"),
  brand("Norton", "software", { frequency: "yearly" }),
  brand("McAfee", "software", { frequency: "yearly" }),
  brand("Bitdefender", "software", { frequency: "yearly" }),
  brand("Squarespace", "software"),
  brand("Wix", "software"),
  brand("Shopify", "software"),
  brand("WordPress", "software"),
  brand("Vercel", "software"),
  brand("Netlify", "software"),
  brand("DigitalOcean", "software"),
  brand("Cloudflare", "software"),
  brand("Namecheap", "software", { frequency: "yearly" }),
  brand("GoDaddy", "software", { frequency: "yearly" }),
  brand("Autodesk", "software", { frequency: "yearly" }),
  brand("Google One", "storage"),
  brand("iCloud+", "storage"),
  brand("Dropbox", "storage"),
  brand("OneDrive", "storage"),
  brand("Backblaze", "storage"),
  brand("pCloud", "storage"),
  brand("Mega", "storage"),
  brand("Box", "storage"),
  brand("Sync.com", "storage"),
  brand("Strava", "fitness"),
  brand("Peloton", "fitness"),
  brand("Apple Fitness+", "fitness"),
  brand("MyFitnessPal", "fitness"),
  brand("Fitbit Premium", "fitness"),
  brand("Whoop", "fitness"),
  brand("Freeletics", "fitness"),
  brand("Nike Training Club", "fitness"),
  brand("Garmin Connect+", "fitness"),
  generic("gym", "fitness"),
  generic("yoga", "fitness"),
  brand("The New York Times", "news"),
  brand("The Guardian", "news"),
  brand("The Economist", "news"),
  brand("Financial Times", "news"),
  brand("Bloomberg", "news"),
  brand("Le Monde", "news"),
  brand("Le Devoir", "news"),
  brand("La Presse", "news"),
  brand("Wired", "news"),
  brand("National Geographic", "news"),
  brand("Medium", "news"),
  brand("Substack", "news"),
  brand("Costco", "other", { frequency: "yearly" }),
  brand("CAA", "other", { frequency: "yearly" }),
  generic("charity", "other"),
  generic("cloudGaming", "entertainment"),
  generic("meals", "other"),
  generic("petFood", "other"),
];

const INVOICES = [
  generic("rent", "housing"),
  generic("mortgage", "housing"),
  generic("condoFees", "housing"),
  generic("maintenance", "housing"),
  generic("electricity", "energy"),
  generic("naturalGas", "energy"),
  generic("heatingOil", "energy"),
  generic("water", "energy"),
  brand("Hydro-Québec", "energy"),
  brand("Énergir", "energy"),
  brand("Hydro One", "energy"),
  brand("BC Hydro", "energy"),
  generic("internet", "internet"),
  generic("mobile", "internet"),
  generic("landline", "internet"),
  generic("cable", "internet"),
  brand("Bell", "internet"),
  brand("Vidéotron", "internet"),
  brand("Rogers", "internet"),
  brand("Telus", "internet"),
  brand("Fizz", "internet"),
  brand("Koodo", "internet"),
  brand("Freedom Mobile", "internet"),
  generic("homeInsurance", "insurance"),
  generic("carInsurance", "insurance"),
  generic("lifeInsurance", "insurance"),
  generic("healthInsurance", "insurance"),
  generic("petInsurance", "insurance"),
  generic("transitPass", "transport"),
  generic("carPayment", "transport"),
  generic("fuel", "transport"),
  generic("parking", "transport"),
  generic("vehicleRegistration", "transport", { frequency: "yearly" }),
  generic("propertyTax", "taxes"),
  generic("schoolTax", "taxes", { frequency: "yearly" }),
  generic("incomeTax", "taxes", { frequency: "yearly" }),
  generic("bankFees", "other"),
  generic("childcare", "other"),
  generic("tuition", "other"),
  generic("storageUnit", "other"),
];

export const CATALOG = { subscription: SUBSCRIPTIONS, invoice: INVOICES };
export const SUGGESTION_LIMIT = 8;

export function catalogLabel(t, entry) {
  return entry.labelKey ? t(entry.labelKey) : entry.name;
}

export function findSuggestions(t, type, query, limit = SUGGESTION_LIMIT) {
  const entries = CATALOG[type] ?? [];
  const needle = normalizeSearch(query);

  if (!needle) {
    return entries.slice(0, limit);
  }

  const scored = [];
  for (const entry of entries) {
    const haystack = normalizeSearch(catalogLabel(t, entry));
    const at = haystack.indexOf(needle);
    if (at === 0) {
      scored.push({ entry, rank: 0 });
    } else if (at > 0) {
      scored.push({ entry, rank: 1 });
    }
  }

  return scored
    .sort((left, right) => left.rank - right.rank)
    .slice(0, limit)
    .map((row) => row.entry);
}
