"use client";

import { MotionConfig, motion, type HTMLMotionProps } from "motion/react";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** Respecte le réglage « réduire les animations » du visiteur. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Apparition douce quand l'élément entre à l'écran. */
export function Reveal({ delay = 0, y = 18, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease, delay }}
      {...props}
    />
  );
}

/** Conteneur qui fait apparaître ses enfants en cascade. */
export function Stagger({ gap = 0.07, ...props }: HTMLMotionProps<"div"> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease } },
      }}
      {...props}
    />
  );
}
