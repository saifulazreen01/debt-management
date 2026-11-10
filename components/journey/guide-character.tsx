import { cn } from "cn";
import type { JourneyCharacter, JourneyMood } from "@/lib/journey-characters";

const moodRing: Record<JourneyMood, string> = {
  calm: "ring-primary/30",
  focused: "ring-sky-400/40",
  caution: "ring-amber-400/50",
  celebrate: "ring-emerald-400/45",
  empty: "ring-white/40",
};

export function GuideAvatar({
  character,
  mood = "calm",
  size = "md",
}: {
  character: JourneyCharacter;
  mood?: JourneyMood;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "size-16 text-3xl" : size === "sm" ? "size-10 text-xl" : "size-12 text-2xl";

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-2",
        character.accent,
        moodRing[mood],
        sizeClass
      )}
    >
      <span className="select-none drop-shadow-sm">{character.emoji}</span>
      <span className="absolute -right-1 -bottom-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-foreground/80 shadow-sm dark:bg-white/15 dark:text-white/90">
        {character.name}
      </span>
    </div>
  );
}

export function GuideCharacter({
  character,
  mood = "calm",
  headline,
  message,
  tip,
  className,
  compact = false,
}: {
  character: JourneyCharacter;
  mood?: JourneyMood;
  headline: string;
  message: string;
  tip?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel-strong relative overflow-hidden rounded-2xl border border-white/40 p-4 sm:p-5",
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-gradient-to-br opacity-70 blur-2xl",
          character.accent
        )}
      />
      <div className="relative flex gap-3 sm:gap-4">
        <GuideAvatar character={character} mood={mood} size={compact ? "sm" : "lg"} />
        <div className="min-w-0 grid gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {character.name} · {character.role}
          </p>
          <p className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {headline}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
          {tip ? (
            <p className="mt-1 rounded-xl border border-white/40 bg-white/35 px-3 py-2 text-xs text-foreground/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white/80">
              Tip: {tip}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
