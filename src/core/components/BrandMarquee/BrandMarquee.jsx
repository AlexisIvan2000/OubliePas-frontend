import { useMemo } from "react";

import styles from "./BrandMarquee.module.css";

const FOLDER = "/assets/logos";

const LOGOS = [
  { name: "Netflix", file: "netflix-logo-icon.svg" },
  { name: "Spotify", file: "spotify-2.svg" },
  { name: "Disney+", file: "disney-wbackground.svg" },
  { name: "Prime Video", file: "prime-video-1.svg" },
  { name: "Apple TV+", file: "apple-tv.svg" },
  { name: "Apple Music", file: "apple-music.svg" },
  { name: "YouTube", file: "youtube-icon-5.svg" },
  { name: "iCloud", file: "icloud.svg" },
  { name: "Google One", file: "google-one.svg" },
  { name: "Microsoft 365", file: "Microsoft-365.svg" },
  { name: "Adobe Acrobat", file: "adobe-acrobat-reader-icon-2020-.svg" },
  { name: "Claude", file: "claude-logo.svg" },
  { name: "ChatGPT", file: "openai-2.svg" },
  { name: "Shopify", file: "shopify.svg" },
  { name: "GoDaddy", file: "godaddy.svg" },
  { name: "Bell", file: "bell-canada.svg" },
  { name: "Rogers", file: "rogers-logo.svg" },
];

function lanes() {
  const first = LOGOS.filter((entry, index) => index % 2 === 0);
  const second = LOGOS.filter((entry, index) => index % 2 === 1);
  return [first, second];
}

function Lane({ entries, reverse }) {
  const doubled = entries.concat(entries);

  return (
    <div className={styles.lane}>
      <div className={reverse ? `${styles.track} ${styles.reverse}` : styles.track}>
        {doubled.map((entry, index) => (
          <span className={styles.chip} key={`${entry.file}-${index}`}>
            <span className={`${styles.mark} ${styles.logoMark}`}>
              <img
                className={styles.logo}
                src={`${FOLDER}/${entry.file}`}
                alt=""
                loading="lazy"
              />
            </span>
            <span className={styles.name}>{entry.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrandMarquee({ label }) {
  const [first, second] = useMemo(() => lanes(), []);

  return (
    <div className={styles.marquee} role="img" aria-label={label}>
      <Lane entries={first} />
      <Lane entries={second} reverse />
    </div>
  );
}
