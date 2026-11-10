import type { DsrLevel } from "@/lib/income";

export type JourneyCharacterId = "ria" | "tok" | "kip" | "nuri" | "aiman";

export type JourneyMood =
  | "calm"
  | "focused"
  | "caution"
  | "celebrate"
  | "empty";

export type JourneyCharacter = {
  id: JourneyCharacterId;
  name: string;
  emoji: string;
  role: string;
  accent: string;
};

export type JourneyMoment = {
  character: JourneyCharacter;
  mood: JourneyMood;
  headline: string;
  message: string;
  tip: string;
};

export const JOURNEY_CHARACTERS: Record<JourneyCharacterId, JourneyCharacter> =
  {
    ria: {
      id: "ria",
      name: "Ria",
      emoji: "🧭",
      role: "Monthly guide",
      accent: "from-teal-400/30 to-cyan-300/20",
    },
    tok: {
      id: "tok",
      name: "Tok",
      emoji: "🦉",
      role: "Debt-free coach",
      accent: "from-amber-300/30 to-orange-200/20",
    },
    kip: {
      id: "kip",
      name: "Kip",
      emoji: "🦊",
      role: "Pressure watch",
      accent: "from-rose-300/35 to-orange-200/20",
    },
    nuri: {
      id: "nuri",
      name: "Nuri",
      emoji: "🌱",
      role: "Progress buddy",
      accent: "from-emerald-300/30 to-lime-200/20",
    },
    aiman: {
      id: "aiman",
      name: "Aiman",
      emoji: "🪙",
      role: "Starter friend",
      accent: "from-sky-300/30 to-indigo-200/20",
    },
  };

export type JourneyContext = {
  remainingDebt: number;
  monthlyRepayment: number;
  dueCount: number;
  progress: number;
  dsrLevel: DsrLevel;
  monthsToFreedom?: number;
  freedomDateLabel?: string | null;
};

export function getJourneyMoment(context: JourneyContext): JourneyMoment {
  const {
    remainingDebt,
    monthlyRepayment,
    dueCount,
    progress,
    dsrLevel,
    monthsToFreedom,
    freedomDateLabel,
  } = context;

  if (remainingDebt <= 0 && monthlyRepayment <= 0) {
    return {
      character: JOURNEY_CHARACTERS.aiman,
      mood: "empty",
      headline: "Your debt journey starts here",
      message:
        "Add the loans you are paying. I will help you see what this month needs and when freedom is closer.",
      tip: "Start with the biggest monthly payment — clarity beats guessing.",
    };
  }

  if (remainingDebt <= 0) {
    return {
      character: JOURNEY_CHARACTERS.nuri,
      mood: "celebrate",
      headline: "You are debt-free right now",
      message:
        "No active balance left to chase. Keep protecting that breathing room.",
      tip: "Park the freed cash into savings or investments before new debt sneaks in.",
    };
  }

  if (dsrLevel === "high" || dsrLevel === "stretched") {
    return {
      character: JOURNEY_CHARACTERS.kip,
      mood: "caution",
      headline: "This month needs careful pacing",
      message:
        dueCount > 0
          ? `${dueCount} repayment${dueCount === 1 ? "" : "s"} are due and debt is taking a heavy share of income. Protect the essentials first.`
          : "Debt is taking a heavy share of income. Keep new borrowing paused and stick to the plan.",
      tip: "Pay the due dates first, then review any loan you can refinance or trim.",
    };
  }

  if (progress >= 60) {
    return {
      character: JOURNEY_CHARACTERS.nuri,
      mood: "celebrate",
      headline: "You have already cut most of the mountain",
      message:
        freedomDateLabel && monthsToFreedom != null
          ? `About ${monthsToFreedom} month${monthsToFreedom === 1 ? "" : "s"} left toward ${freedomDateLabel}. Keep the rhythm — it is working.`
          : "Your payoff progress is strong. Stay consistent and the finish line keeps moving closer.",
      tip: "If cash allows, one extra payment this month can shrink future interest.",
    };
  }

  if (dueCount > 0) {
    return {
      character: JOURNEY_CHARACTERS.ria,
      mood: "focused",
      headline: "This month has a clear job",
      message: `Set aside the repayment total and clear ${dueCount} due item${dueCount === 1 ? "" : "s"}. Small consistency beats late stress.`,
      tip: "Mark due days on your calendar the same week income lands.",
    };
  }

  return {
    character: JOURNEY_CHARACTERS.tok,
    mood: "calm",
    headline: "Steady path to debt-free",
    message:
      freedomDateLabel && monthsToFreedom != null
        ? `Keep current payments and you are aiming for ${freedomDateLabel} — roughly ${monthsToFreedom} month${monthsToFreedom === 1 ? "" : "s"} of discipline.`
        : "You are on a manageable path. Keep payments current and watch interest shrink over time.",
    tip: "Check remaining interest once a month so progress feels real.",
  };
}

export function getPageCompanion(
  page: "dashboard" | "debts" | "incomes" | "investments" | "assets"
): JourneyCharacter {
  switch (page) {
    case "debts":
      return JOURNEY_CHARACTERS.tok;
    case "incomes":
      return JOURNEY_CHARACTERS.ria;
    case "investments":
      return JOURNEY_CHARACTERS.nuri;
    case "assets":
      return JOURNEY_CHARACTERS.aiman;
    default:
      return JOURNEY_CHARACTERS.ria;
  }
}
