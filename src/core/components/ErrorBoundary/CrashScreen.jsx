import fr from "../../translation/dictionaries/fr.json";
import styles from "./CrashScreen.module.css";

// L'ecran de panne lit le dictionnaire directement, sans passer par le contexte
// de traduction : il doit pouvoir s'afficher quand c'est justement un
// fournisseur qui a lance. Le francais est deja le repli du traducteur.
const TEXTS = fr.crash;

export function CrashScreen() {
  return (
    <div className={styles.screen} role="alert">
      <h1 className={styles.title}>{TEXTS.title}</h1>
      <p className={styles.body}>{TEXTS.body}</p>
      <button
        type="button"
        className={styles.action}
        onClick={() => window.location.assign("/")}
      >
        {TEXTS.reload}
      </button>
    </div>
  );
}
