"use server";

import { revalidatePath } from "next/cache";
import { parseDate } from "@/lib/form";
import {
  setUserInfoEntries,
  USER_INFO_KEYS,
} from "@/lib/user-info";

export type UserInfoActionState = {
  error?: string;
  success?: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function revalidateUserPaths() {
  revalidatePath("/");
  revalidatePath("/debts");
  revalidatePath("/incomes");
  revalidatePath("/investments");
  revalidatePath("/assets");
}

export async function saveUserInfo(
  _prevState: UserInfoActionState,
  formData: FormData
): Promise<UserInfoActionState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { error: "Name is required" };
    }

    const displayName =
      String(formData.get("displayName") ?? "").trim() || name;

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return { error: "Enter a valid email address" };
    }

    const dateOfBirth = parseDate(formData.get("dateOfBirth"), "Date of birth");
    const today = new Date();
    if (dateOfBirth > today) {
      return { error: "Date of birth cannot be in the future" };
    }

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
    const day = String(dateOfBirth.getDate()).padStart(2, "0");

    await setUserInfoEntries({
      [USER_INFO_KEYS.name]: name,
      [USER_INFO_KEYS.displayName]: displayName,
      [USER_INFO_KEYS.email]: email,
      [USER_INFO_KEYS.dateOfBirth]: `${year}-${month}-${day}`,
    });

    revalidateUserPaths();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save your profile",
    };
  }
}
