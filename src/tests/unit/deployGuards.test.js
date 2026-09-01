import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { checkApiUrl, isLocalUrl } from "../../../vite.guards";
import fr from "../../core/translation/dictionaries/fr.json";

const API_CONFIG = "src/core/network/apiConfig.js";

function repli() {
  const source = readFileSync(API_CONFIG, "utf8");
  const trouve = /import\.meta\.env\.VITE_API_URL \?\? "([^"]+)"/.exec(source);
  return trouve?.[1] ?? null;
}

// Les dimensions lues dans l'en-tete, sans dependance : le PNG les porte a
// position fixe, le JPEG dans le premier marqueur SOF rencontre.
function dimensions(octets) {
  if (octets.readUInt32BE(0) === 0x89504e47) {
    return `${octets.readUInt32BE(16)}x${octets.readUInt32BE(20)}`;
  }
  if (octets.readUInt16BE(0) !== 0xffd8) {
    return null;
  }
  let position = 2;
  while (position < octets.length) {
    if (octets[position] !== 0xff) {
      return null;
    }
    const marqueur = octets[position + 1];
    // Les SOF portent la taille, sauf DHT, DAC et les RSTn qui partagent la plage.
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
      return `${octets.readUInt16BE(position + 7)}x${octets.readUInt16BE(position + 5)}`;
    }
    position += 2 + octets.readUInt16BE(position + 2);
  }
  return null;
}

describe("le repli de l'adresse d'API ne vise jamais une machine locale", () => {
  it("c'est l'invariante qui remplace la detection de plateforme", () => {
    // Un bundle construit sans VITE_API_URL part avec ce repli. Quand il valait
    // localhost, chaque visiteur interrogeait sa propre machine ; la garde
    // d'alors dependait d'une variable que Vercel n'expose pas toujours, et
    // elle ne s'est pas declenchee. Ici il n'y a rien a detecter.
    const valeur = repli();

    expect(valeur).toMatch(/^https?:\/\//);
    expect(isLocalUrl(valeur)).toBe(false);
  });

  it("le detecteur d'adresse locale reconnait les formes usuelles", () => {
    expect(isLocalUrl("http://localhost:8000")).toBe(true);
    expect(isLocalUrl("http://localhost")).toBe(true);
    expect(isLocalUrl("http://127.0.0.1:5173/")).toBe(true);
    expect(isLocalUrl("https://0.0.0.0")).toBe(true);
  });

  it("et laisse passer une vraie adresse publique", () => {
    expect(isLocalUrl("https://api.oubliepas.com")).toBe(false);
    expect(isLocalUrl("https://localhost-api.example.com")).toBe(false);
    expect(isLocalUrl(undefined)).toBe(false);
  });
});

describe("VITE_API_URL, quand elle est donnee", () => {
  it("une adresse relative est refusee", () => {
    expect(() => checkApiUrl("production", "api.oubliepas.com")).toThrow(/absolue/);
    expect(() => checkApiUrl("production", "/v1")).toThrow(/absolue/);
  });

  it("une adresse publique passe sans un mot", () => {
    expect(checkApiUrl("production", "https://api.oubliepas.com")).toBeNull();
  });

  it("une adresse locale construit, mais previent", () => {
    // Batir un bundle vers son propre poste est legitime ; le confondre avec un
    // bundle livrable ne l'est pas.
    expect(checkApiUrl("production", "http://localhost:8080")).toMatch(/local/);
  });

  it("l'absence de variable n'arrete plus rien", () => {
    // C'est le repli qui protege desormais, et le test plus haut le tient.
    expect(checkApiUrl("production", undefined)).toBeNull();
  });

  it("le developpement n'est jamais concerne", () => {
    expect(checkApiUrl("development", "http://localhost:8080")).toBeNull();
  });

  it("la configuration branche la garde", () => {
    const source = readFileSync("vite.config.js", "utf8");

    expect(source).toContain("checkApiUrl(");
    expect(source).toContain("process.env.VITE_API_URL");
  });
});

describe("l'ecran de panne lit le dictionnaire sans passer par le contexte", () => {
  it("les trois textes existent", () => {
    // Le composant importe fr.json directement, donc aucun des gardes qui
    // suivent t() ne verrait la disparition de ces cles.
    expect(fr.crash).toMatchObject({
      title: expect.any(String),
      body: expect.any(String),
      reload: expect.any(String),
    });
  });

  it("il n'appelle ni useTranslation ni un autre contexte", () => {
    // C'est la propriete qui le rend utile : il doit s'afficher quand c'est un
    // fournisseur qui a lance.
    const source = readFileSync("src/core/components/ErrorBoundary/CrashScreen.jsx", "utf8");

    expect(source).not.toContain("useTranslation");
    expect(source).not.toContain("useContext");
  });

  it("la frontiere enveloppe les fournisseurs, pas l'inverse", () => {
    const source = readFileSync("src/main.jsx", "utf8");

    expect(source.indexOf("<ErrorBoundary>")).toBeLessThan(source.indexOf("<ThemeProvider>"));
    expect(source.indexOf("<ErrorBoundary>")).toBeLessThan(
      source.indexOf("<TranslationProvider>"),
    );
  });

  it("le routeur montre le meme ecran sur une erreur de route", () => {
    const source = readFileSync("src/router.jsx", "utf8");

    expect(source).toContain("errorElement: <CrashScreen />");
  });
});

describe("le deploiement statique est decrit", () => {
  it("toute route inconnue est renvoyee vers index.html", () => {
    // Sans cette reecriture, recharger /abonnements rend un 404 : le routeur
    // est un createBrowserRouter, donc les chemins sont de vraies URL.
    const config = JSON.parse(readFileSync("vercel.json", "utf8"));

    expect(config.rewrites).toEqual([{ source: "/(.*)", destination: "/index.html" }]);
  });

  it("aucune regle ne fige les fichiers publics", () => {
    // public/assets/ contient des fichiers sans empreinte : un cache immuable
    // y garderait l'ancien logo pendant un an.
    const config = JSON.parse(readFileSync("vercel.json", "utf8"));
    const entetes = config.headers.flatMap((regle) => regle.headers.map((h) => h.key));

    expect(entetes).not.toContain("Cache-Control");
  });

  it("l'exemple d'environnement nomme la variable du build", () => {
    expect(readFileSync(".env.example", "utf8")).toContain("VITE_API_URL=");
  });
});

describe("l'application se laisse installer", () => {
  const manifeste = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));

  it("le worker est enregistre au demarrage, et pas seulement par le push", () => {
    // Tant que seul usePush l'enregistrait, quelqu'un qui n'activait jamais les
    // notifications n'avait aucun worker : ni installation proposee, ni page
    // lisible hors connexion.
    const source = readFileSync("src/main.jsx", "utf8");

    expect(source).toContain("registerServiceWorker()");
    expect(source).toContain("import.meta.env.PROD");
  });

  it("le worker reste a la racine de public", () => {
    // La portee d'un worker vient du chemin ou il est servi : ailleurs il ne
    // verrait ni les navigations a mettre en cache ni les pages a reveiller.
    expect(() => readFileSync("public/sw.js")).not.toThrow();
  });

  it("la page relie le manifeste et l'icone d'iOS", () => {
    const source = readFileSync("index.html", "utf8");

    expect(source).toContain('rel="manifest"');
    expect(source).toContain('rel="apple-touch-icon"');
  });

  it("une icone maskable existe", () => {
    // Sans elle Android pose l'icone telle quelle dans son cercle, avec une
    // marge blanche autour que rien n'explique.
    expect(manifeste.icons.some((icone) => icone.purpose === "maskable")).toBe(true);
  });

  it("les deux tailles que Chrome reclame sont declarees", () => {
    const tailles = manifeste.icons.map((icone) => icone.sizes);

    expect(tailles).toContain("192x192");
    expect(tailles).toContain("512x512");
  });

  it("chaque fichier annonce par le manifeste existe vraiment", () => {
    // Une capture renommee ne casse rien a l'ecran : elle fait seulement
    // disparaitre la boite d'installation de Chrome, sans un mot.
    const annonces = [...manifeste.icons, ...manifeste.screenshots, ...manifeste.shortcuts];
    const manquants = annonces
      .filter((entree) => entree.src)
      .filter((entree) => {
        try {
          readFileSync(`public${entree.src}`);
          return false;
        } catch {
          return true;
        }
      });

    expect(manquants).toEqual([]);
  });

  it("une capture au format telephone est declaree", () => {
    // Chrome sur Android ne montre sa boite d'installation riche que si au
    // moins une capture porte form_factor narrow. Sans elle, il installe quand
    // meme, avec sa boite sobre, et rien ne dit pourquoi.
    const etroites = manifeste.screenshots.filter(
      (capture) => capture.form_factor === "narrow",
    );

    expect(etroites).not.toHaveLength(0);
  });

  it("chaque taille annoncee est celle du fichier", () => {
    // Une capture remplacee par une autre de dimensions differentes fait
    // ignorer toutes les captures par Chrome, sans un mot. C'est le genre de
    // panne qu'on ne voit qu'en installant l'application.
    const fautes = [...manifeste.icons, ...manifeste.screenshots]
      .map((entree) => ({
        entree,
        reelle: dimensions(readFileSync(`public${entree.src}`)),
      }))
      .filter(({ entree, reelle }) => reelle && entree.sizes !== reelle)
      .map(({ entree, reelle }) => `${entree.src} declare ${entree.sizes}, mesure ${reelle}`);

    expect(fautes).toEqual([]);
  });

  it("le lecteur de dimensions sait lire les deux formats du depot", () => {
    // Un lecteur qui rend null sur tout ferait passer la garde a vide.
    expect(dimensions(readFileSync("public/assets/logo-192.png"))).toBe("192x192");
    expect(dimensions(readFileSync("public/assets/screenshots/notifications.jpg"))).toBe(
      "946x2049",
    );
  });

  it("les raccourcis visent des routes qui existent", () => {
    const routeur = readFileSync("src/router.jsx", "utf8");

    for (const raccourci of manifeste.shortcuts) {
      expect(routeur).toContain(`path: "${raccourci.url}"`);
    }
  });
});
