const FALLBACK = { title: "Oublie pas !", body: "", url: "/" };

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

async function openTarget(url) {
  const target = new URL(url, self.location.origin);
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

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
