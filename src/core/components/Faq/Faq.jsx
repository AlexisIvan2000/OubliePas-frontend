import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { Icon } from "../Icon/Icon";
import styles from "./Faq.module.css";
import { FAQ_IDS } from "./faqItems";

const STEP_VH = 26;

function useScrollStep(count, enabled) {
  const ref = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled || !ref.current || typeof window === "undefined") {
      return undefined;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const node = ref.current;
      if (!node) {
        return;
      }
      const box = node.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      if (travel <= 0) {
        setStep(count - 1);
        return;
      }
      const progress = Math.min(Math.max(-box.top / travel, 0), 1);
      setStep(Math.min(Math.floor(progress * count), count - 1));
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count, enabled]);

  return [ref, step];
}

export function Faq({ ids = FAQ_IDS, scroll = false, title, description, className }) {
  const { t } = useTranslation();
  const [manual, setManual] = useState(scroll ? null : ids[0]);
  const [ref, step] = useScrollStep(ids.length, scroll);

  const open = manual ?? (scroll ? ids[step] : null);

  const toggle = useCallback((id) => {
    setManual((current) => (current === id ? "" : id));
  }, []);

  const list = (
    <div className={styles.list}>
      {ids.map((id) => {
        const expanded = open === id;
        return (
          <div key={id} className={cx(styles.item, expanded && styles.itemOpen)}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={`faq-${id}-q`}
                className={styles.question}
                aria-expanded={expanded}
                aria-controls={`faq-${id}`}
                onClick={() => toggle(id)}
              >
                <span className={styles.chip}>{t(`faq.items.${id}.q`)}</span>
                <span className={styles.sign} aria-hidden="true">
                  <Icon name={expanded ? "minus" : "add"} size={16} />
                </span>
              </button>
            </h3>

            <div
              className={cx(styles.reveal, !expanded && styles.revealClosed)}
              id={`faq-${id}`}
              role="region"
              aria-labelledby={`faq-${id}-q`}
              inert={!expanded}
            >
              <div className={styles.revealInner}>
                <p className={styles.answer}>{t(`faq.items.${id}.a`)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!scroll) {
    return <div className={cx(styles.faq, className)}>{list}</div>;
  }

  return (
    <section
      ref={ref}
      className={cx(styles.faq, styles.tall, className)}
      style={{ "--travel": `${ids.length * STEP_VH}vh` }}
    >
      <div className={styles.sticky}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>{title}</p>
          <p className={styles.lede}>{description}</p>
        </div>
        {list}
        <div className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressBar}
            style={{ "--fill": (step + 1) / ids.length }}
          />
        </div>
      </div>
    </section>
  );
}
