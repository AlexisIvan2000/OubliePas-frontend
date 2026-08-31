import { isApple, isStandalone } from "./platform";

export const INSTALLED = "installed";
export const AVAILABLE = "available";
export const MANUAL = "manual";
export const IDLE = "idle";

export function inspectInstall(win = globalThis, prompt = null) {
  return {
    standalone: isStandalone(win),
    apple: isApple(win?.navigator),
    prompt: Boolean(prompt),
  };
}

export function installState(env) {
  // L'ordre compte. Une app deja lancee depuis l'ecran d'accueil declenche
  // encore beforeinstallprompt sur certains Android : proposer l'installation
  // a qui l'a deja faite ferait douter de ce qui est installe.
  if (env.standalone) {
    return INSTALLED;
  }
  if (env.prompt) {
    return AVAILABLE;
  }
  // Safari ne declenche jamais beforeinstallprompt : sur iPhone l'ajout a
  // l'ecran d'accueil est un geste manuel, et c'est aussi le seul qui debloque
  // le push. Repondre IDLE ici cacherait la seule chose a faire.
  if (env.apple) {
    return MANUAL;
  }
  return IDLE;
}

export function hasSomethingToSay(state) {
  return state !== IDLE;
}
