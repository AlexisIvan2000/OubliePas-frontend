import { useState } from "react";

import { avatarColor } from "../../utils/avatarColor";
import { cx } from "../../utils/classNames";
import styles from "./Avatar.module.css";

export function Avatar({ seed = "", initials = "", src, size = 30, shape = "circle", title }) {
  const [brokenSrc, setBrokenSrc] = useState(null);
  const showImage = Boolean(src) && src !== brokenSrc;

  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size / 2.6),
    backgroundColor: showImage ? "transparent" : avatarColor(seed || initials),
    borderRadius: shape === "circle" ? "50%" : Math.round(size / 3.4),
  };

  return (
    <span className={cx(styles.avatar, shape === "circle" && styles.circle)} style={style} title={title}>
      {showImage ? (
        <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setBrokenSrc(src)} />
      ) : (
        initials
      )}
    </span>
  );
}
