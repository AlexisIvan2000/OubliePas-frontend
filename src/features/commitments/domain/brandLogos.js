import { normalizeSearch } from "./commitment";

const FOLDER = "/assets/logos";

const FILES = {
  netflix: "netflix-logo-icon.svg",
  spotify: "spotify-2.svg",
  "apple-tv": "apple-tv.svg",
  "apple-music": "apple-music.svg",
  disney: "disney-wbackground.svg",
  "prime-video": "prime-video-1.svg",
  "youtube-premium": "youtube-icon-5.svg",
  "youtube-music": "youtube-icon-5.svg",
  "claude-pro": "claude-logo.svg",
  "chatgpt-plus": "openai-2.svg",
  "microsoft-365": "Microsoft-365.svg",
  "adobe-creative-cloud": "adobe-acrobat-reader-icon-2020-.svg",
  shopify: "shopify.svg",
  bell: "bell-canada.svg",
  rogers: "rogers-logo.svg",
};

function slug(value) {
  return normalizeSearch(value ?? "")
    .replace(/\W+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function brandLogo(title) {
  const file = FILES[slug(title)];
  return file ? `${FOLDER}/${file}` : null;
}
