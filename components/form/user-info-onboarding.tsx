"use client";

import { useActionState } from "react";
import { saveUserInfo, type UserInfoActionState } from "@/app/actions/user-info";
import { GuideCharacter } from "@/components/journey/guide-character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { JOURNEY_CHARACTERS } from "@/lib/journey-characters";

const initialState: UserInfoActionState = {};

export function UserInfoOnboarding() {
  const [state, formAction, pending] = useActionState(
    saveUserInfo,
    initialState
  );

  useActionToast(state, pending, { successMessage: "Welcome aboard" });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <GuideCharacter
        character={JOURNEY_CHARACTERS.aiman}
        mood="empty"
        headline="Before we begin, tell me who you are"
        message="I am Aiman. Share your name, email, and birthday so this finance journey feels personal from day one."
        tip="This stays on your device database — just enough to greet you properly."
      />

      <form
        action={formAction}
        className="glass-panel-strong grid gap-4 rounded-2xl p-5 sm:p-6"
      >
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Your profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Required once when you first open the dashboard.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-name">Full name</Label>
          <Input
            id="user-name"
            name="name"
            placeholder="e.g. Saiful Azreen"
            autoComplete="name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-displayName">Display name</Label>
          <Input
            id="user-displayName"
            name="displayName"
            placeholder="Shown in the app title (optional)"
            autoComplete="nickname"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use your full name.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="user-dob">Date of birth</Label>
          <Input
            id="user-dob"
            name="dateOfBirth"
            type="date"
            required
          />
        </div>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Start my journey"}
        </Button>
      </form>
    </div>
  );
}
