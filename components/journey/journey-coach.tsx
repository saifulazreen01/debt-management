import { GuideCharacter } from "@/components/journey/guide-character";
import {
  getJourneyMoment,
  type JourneyContext,
} from "@/lib/journey-characters";

export function JourneyCoach({
  context,
  className,
}: {
  context: JourneyContext;
  className?: string;
}) {
  const moment = getJourneyMoment(context);

  return (
    <GuideCharacter
      character={moment.character}
      mood={moment.mood}
      headline={moment.headline}
      message={moment.message}
      tip={moment.tip}
      className={className}
    />
  );
}
