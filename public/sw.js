const VERSION = "v1";
const SHELL_CACHE = `oubliepas-shell-${VERSION}`;
const ASSET_CACHE = `oubliepas-assets-${VERSION}`;
const MINE = /^oubliepas-/;

const SHELL = "/";
const ASSETS = "/assets/";

// Chaque deploiement publie un bundle sous un nom empreinte que rien ne
// remplace jamais : sans cette coupe le cache grossit d'un bundle par livraison
// jusqu'a ce que le navigateur evince au hasard.
const MAX_ASSETS = 60;

const NAVIGATE = "navigate";
const ASSET = "asset";
const PASS = "pass";

const FALLBACK = { title: "Oublie pas !", body: "", url: "/" };

function strategyFor(request, origin) {
  if (request.method !== "GET") {
    return PASS;
  }
  // L'API vit sur un autre domaine : le test d'origine suffit a la tenir hors
  // du cache, et une reponse d'API mise en cache serait un montant faux montre
  // avec assurance.
  if (new URL(request.url).origin !== origin) {
    return PASS;
  }
  if (request.mode === NAVIGATE) {
    return NAVIGATE;
  }
  return new URL(request.url).pathname.startsWith(ASSETS) ? ASSET : PASS;
}

function storable(response) {
  // Une redirection ne se remet pas en cache : cache.put leve dessus.
  return response.ok && !response.redirected;
}

async function trim(cache) {
  const keys = await cache.keys();
  // cache.keys rend les entrees dans leur ordre d'insertion, donc les plus
  // anciennes en premier. Le plancher a zero n'est pas decoratif : une fin
  // negative fait compter slice depuis la fin du tableau, et le cache se
  // vidait par la tete des qu'il depassait la moitie de sa borne.
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ASSETS))) {
    await cache.delete(key);
  }
}

async function shellFirstFromNetwork(request) {
  // Le reseau d'abord, et c'est la ligne qui tient la promesse du rechargement
  // unique : servir la coquille depuis le cache obligerait un testeur ouvert
  // pendant un deploiement a recharger deux fois, une pour reveiller le worker
  // et une pour voir enfin la nouvelle version.
  try {
    const response = await fetch(request);
    if (storable(response)) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(SHELL, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(SHELL, { cacheName: SHELL_CACHE });
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function assetFirstFromCache(request) {
  // Vite empreinte ces noms : une reponse trouvee ici ne peut pas etre perimee,
  // elle peut seulement etre inutile.
  const cached = await caches.match(request, { cacheName: ASSET_CACHE });
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (storable(response)) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
    await trim(cache);
  }
  return response;
}

function readPayload(data) {
  if (!data) {
    return FALLBACK;
  }
  try {
    const parsed = data.json();
    return {
      title: parsed.title || FALLBACK.title,
      body: parsed.body || FALLBACK.body,
      url: parsed.url || FALLBACK.url,
    };
  } catch {
    // Un service de push peut livrer un corps vide pour reveiller le worker.
    // Sans notification affichee le navigateur en montre une generique, dans sa
    // langue et avec son texte : mieux vaut la notre, meme sans detail.
    return { ...FALLBACK, body: data.text() || FALLBACK.body };
  }
}

function sameOriginTarget(url) {
  const demande = new URL(url, self.location.origin);
  // La charge vient du serveur et seule notre paire VAPID peut pousser vers un
  // abonnement : aucune origine etrangere ne peut arriver ici aujourd'hui. Le
  // jour ou une de ces URL portera un morceau de contenu, cette ligne sera la
  // seule chose entre une notification et une page qui n'est pas la notre.
  return demande.origin === self.location.origin
    ? demande
    : new URL(FALLBACK.url, self.location.origin);
}

async function openTarget(url) {
  const target = sameOriginTarget(url);
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

  for (const client of windows) {
    if (new URL(client.url).origin !== target.origin) {
      continue;
    }
    // Ouvrir un second onglet sur une application deja ouverte laisserait deux
    // sessions cote a cote : on ramene celle qui existe sur la bonne page.
    const focused = await client.focus();
    if (focused?.navigate) {
      await focused.navigate(target.href);
    }
    return;
  }

  await self.clients.openWindow(target.href);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // cache: "reload" court-circuite le cache HTTP du navigateur : sans lui le
      // worker neuf naitrait en pre-cachant la coquille qu'il vient remplacer.
      await cache.put(SHELL, await fetch(new Request(SHELL, { cache: "reload" })));
    })(),
  );
  // Sans cela un worker corrige attendrait la fermeture de tous les onglets
  // pour prendre la main, c'est-a-dire indefiniment sur un telephone.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => MINE.test(name) && name !== SHELL_CACHE && name !== ASSET_CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const strategy = strategyFor(event.request, self.location.origin);

  if (strategy === NAVIGATE) {
    event.respondWith(shellFirstFromNetwork(event.request));
    return;
  }
  if (strategy === ASSET) {
    event.respondWith(assetFirstFromCache(event.request));
  }
});

self.addEventListener("push", (event) => {
  const payload = readPayload(event.data);
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/assets/logo-192.png",
      badge: "/assets/logo-192.png",
      // Une seule notification a la fois : un rappel plus recent remplace le
      // precedent au lieu d'empiler une colonne que personne ne lira.
      tag: "oubliepas-rappel",
      renotify: true,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(openTarget(event.notification.data?.url || FALLBACK.url));
});
