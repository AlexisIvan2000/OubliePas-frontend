export const DEFAULT_TIMEZONE = "UTC";

export function browserTimezone(intl = Intl) {
  try {
    return intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    // Un navigateur sans base de fuseaux, ou une API rabotee : le compte reste
    // sur ce qu'il a, et le serveur continue de calculer en UTC.
    return null;
  }
}

export function timezoneToAdopt(stored, detected) {
  if (!detected || detected === stored) {
    return null;
  }
  // Seuls les comptes restes au defaut sont corriges. Ecraser un fuseau choisi
  // dans les reglages par celui d'un navigateur de passage — un portable en
  // voyage, un poste emprunte — retirerait a quelqu'un un reglage qu'il a pose
  // lui-meme, et il ne saurait meme pas quoi accuser.
  if (stored && stored !== DEFAULT_TIMEZONE) {
    return null;
  }
  return detected;
}

export function knownTimezones(intl = Intl) {
  try {
    return intl.supportedValuesOf("timeZone");
  } catch {
    // Un navigateur qui ne rend pas la liste ne doit pas laisser un reglage
    // vide : le sien et le defaut valent mieux que rien.
    return [...new Set([browserTimezone(intl), DEFAULT_TIMEZONE].filter(Boolean))].sort();
  }
}

export function todayIn(timezone, now = new Date()) {
  // en-CA rend AAAA-MM-JJ, la forme que le reste du code attend, et
  // Intl fait la conversion de fuseau que Date ne sait pas faire seul.
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || DEFAULT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    // Un nom que ce navigateur ne connait pas ne doit pas vider l'ecran : on
    // retombe sur l'heure de la machine, qui est presque toujours la bonne.
    const mois = String(now.getMonth() + 1).padStart(2, "0");
    const jour = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${mois}-${jour}`;
  }
}

export function startOfDayIn(timezone, now = new Date()) {
  // Une Date posee sur minuit du jour local de cette personne : ce qu'attendent
  // les formateurs, qui prennent une Date et non une chaine.
  const [annee, mois, jour] = todayIn(timezone, now).split("-").map(Number);
  return new Date(annee, mois - 1, jour);
}
