import { prisma } from "@/lib/prisma";

export const USER_INFO_KEYS = {
  name: "name",
  email: "email",
  dateOfBirth: "dateOfBirth",
  displayName: "displayName",
} as const;

export type UserInfoKey = (typeof USER_INFO_KEYS)[keyof typeof USER_INFO_KEYS];

export type UserProfile = {
  name: string;
  email: string;
  dateOfBirth: string;
  displayName: string;
};

export async function getUserInfoMap() {
  const rows = await prisma.userInfo.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Partial<
    Record<UserInfoKey, string>
  >;
}

export async function getUserInfoValue(key: UserInfoKey) {
  const row = await prisma.userInfo.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setUserInfoValue(key: UserInfoKey, value: string) {
  return prisma.userInfo.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function setUserInfoEntries(
  entries: Partial<Record<UserInfoKey, string>>
) {
  const pairs = Object.entries(entries).filter(
    (entry): entry is [UserInfoKey, string] =>
      typeof entry[1] === "string" && entry[1].length > 0
  );

  await prisma.$transaction(
    pairs.map(([key, value]) =>
      prisma.userInfo.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const map = await getUserInfoMap();
  if (!map.name || !map.email || !map.dateOfBirth) {
    return null;
  }

  return {
    name: map.name,
    email: map.email,
    dateOfBirth: map.dateOfBirth,
    displayName: map.displayName?.trim() || map.name,
  };
}

export async function getAppDisplayName() {
  const map = await getUserInfoMap();
  return map.displayName?.trim() || map.name?.trim() || null;
}

export function getUserGreetingName(name: string) {
  const first = name.trim().split(/\s+/)[0];
  return first || name;
}
