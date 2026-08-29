import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { checkApiUrl } from "../../../vite.guards";
import fr from "../../core/translation/dictionaries/fr.json";

describe("l'adresse de l'API ne peut pas manquer en production", () => {
  it("un build de production sans adresse echoue", () => {
    // Sans cette garde, le repli de developpement part en production et chaque
    // visiteur interroge sa propre machine.
    expect(() => checkApiUrl("production", undefined)).toThrow(/VITE_API_URL manquante/);
    expect(() => checkApiUrl("production", "")).toThrow(/VITE_API_URL manquante/);
  });

  it("une adresse relative est refusee", () => {
    expect(() => checkApiUrl("production", "api.oubliepas.com")).toThrow(/absolue/);
    expect(() => checkApiUrl("production", "/v1")).toThrow(/absolue/);
  });

  it("une adresse absolue passe", () => {
    expect(() => checkApiUrl("production", "https://api.oubliepas.com")).not.toThrow();
    expect(() => checkApiUrl("production", "http://api.oubliepas.com")).not.toThrow();
  });

  it("le developpement garde son repli", () => {
    expect(() => checkApiUrl("development", undefined)).not.toThrow();
  });

  it("la configuration branche bien la garde", () => {
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
