import { useState } from "react";

import { TextField } from "../TextField/TextField";
import styles from "./PasswordField.module.css";

export function PasswordField({ autoComplete = "current-password", ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? "Masquer" : "Afficher"}
        </button>
      }
      {...rest}
    />
  );
}
