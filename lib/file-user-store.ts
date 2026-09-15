import "server-only";

import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type ManagedChild = {
  name: string;
  membershipStatus: "paid" | "unpaid" | "pending";
  nextPayment: string;
};

type StoredUser = {
  email: string;
  username?: string;
  name: string;
  accountType?: "member" | "parent";
  children?: ManagedChild[];
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

type UserFile = { users: StoredUser[] };

const USER_FILE = process.env.KKHC_USER_FILE || path.join(process.cwd(), ".data", "kkhc-users.json");
let writeQueue: Promise<unknown> = Promise.resolve();

export async function registerFileUser(name: string, email: string, password: string) {
  return queueWrite(async () => {
    const document = await readUsers();
    const normalizedEmail = normalizeEmail(email);
    if (document.users.some((user) => user.email === normalizedEmail)) return { ok: false as const, reason: "exists" as const };

    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, passwordSalt);
    const user: StoredUser = { name: name.trim(), email: normalizedEmail, passwordHash, passwordSalt, createdAt: new Date().toISOString() };
    await writeUsers({ users: [...document.users, user] });
    return { ok: true as const, user: publicUser(user) };
  });
}

export async function verifyFileUser(email: string, password: string) {
  const document = await readUsers();
  const identifier = normalizeEmail(email);
  const user = document.users.find((row) => row.email === identifier || row.username?.toLowerCase() === identifier);
  if (!user) return null;
  const actualHash = await hashPassword(password, user.passwordSalt);
  const valid = safeEqual(actualHash, user.passwordHash);
  return valid ? publicUser(user) : null;
}

export async function getFileUser(email: string) {
  const document = await readUsers();
  const user = document.users.find((row) => row.email === normalizeEmail(email));
  return user ? publicUser(user) : null;
}

export async function provisionParentUser(name: string, username: string, password: string, childName: string) {
  return queueWrite(async () => {
    const document = await readUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const email = `${normalizedUsername}@local.kkhc`;
    if (document.users.some((user) => user.email === email || user.username === normalizedUsername)) return { ok: false as const, reason: "exists" as const };
    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, passwordSalt);
    const user: StoredUser = {
      name: name.trim(), email, username: normalizedUsername, accountType: "parent",
      children: [{ name: childName.trim(), membershipStatus: "pending", nextPayment: "Po aktivácii členstva" }],
      passwordHash, passwordSalt, createdAt: new Date().toISOString()
    };
    await writeUsers({ users: [...document.users, user] });
    return { ok: true as const, user: publicUser(user) };
  });
}

export async function updateFileUserSettings(currentEmail: string, newEmail: string, currentPassword: string, newPassword?: string) {
  return queueWrite(async () => {
    const document = await readUsers();
    const index = document.users.findIndex((row) => row.email === normalizeEmail(currentEmail));
    if (index < 0) return { ok: false as const, reason: "not_found" as const };
    const user = document.users[index];
    const valid = safeEqual(await hashPassword(currentPassword, user.passwordSalt), user.passwordHash);
    if (!valid) return { ok: false as const, reason: "invalid_password" as const };
    const normalizedNewEmail = normalizeEmail(newEmail);
    if (!normalizedNewEmail.includes("@")) return { ok: false as const, reason: "invalid_email" as const };
    if (document.users.some((row, rowIndex) => rowIndex !== index && row.email === normalizedNewEmail)) return { ok: false as const, reason: "exists" as const };
    user.email = normalizedNewEmail;
    if (newPassword) {
      user.passwordSalt = crypto.randomBytes(16).toString("hex");
      user.passwordHash = await hashPassword(newPassword, user.passwordSalt);
    }
    document.users[index] = user;
    await writeUsers(document);
    return { ok: true as const, user: publicUser(user) };
  });
}

function readUsers(): Promise<UserFile> {
  return fs.readFile(USER_FILE, "utf8").then((raw) => {
    const parsed = JSON.parse(raw) as Partial<UserFile>;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  }).catch(() => ({ users: [] }));
}

async function writeUsers(document: UserFile) {
  await fs.mkdir(path.dirname(USER_FILE), { recursive: true });
  const temporaryFile = `${USER_FILE}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(document, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporaryFile, USER_FILE);
}

function queueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

function hashPassword(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => error ? reject(error) : resolve(key.toString("hex")));
  });
}

function safeEqual(a: string, b: string) {
  const first = Buffer.from(a, "hex");
  const second = Buffer.from(b, "hex");
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function publicUser(user: StoredUser) {
  return { email: user.email, username: user.username || user.email, name: user.name, accountType: user.accountType || "member", children: user.children || [] };
}
