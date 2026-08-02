import { Spinner } from "../components/Spinner/Spinner";
import styles from "./TranslationBoot.module.css";

export function TranslationLoading() {
  return (
    <div className={styles.boot}>
      <Spinner size={26} />
    </div>
  );
}
