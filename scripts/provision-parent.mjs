import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);
const username = "zuzana.ifkova";
const email = `${username}@local.kkhc`;
const password = process.env.KKHC_TEMP_PASSWORD || crypto.randomBytes(12).toString("base64url") + "!7";
const userFile = process.env.KKHC_USER_FILE || path.join(process.cwd(), ".data", "kkhc-users.json");
let document = { users: [] };
try { document = JSON.parse(await fs.readFile(userFile, "utf8")); } catch {}
if (document.users.some((user) => user.email === email || user.username === username)) {
  console.log(JSON.stringify({ created: false, username, reason: "exists" }));
  process.exit(0);
}
const passwordSalt = crypto.randomBytes(16).toString("hex");
const passwordHash = Buffer.from(await scrypt(password, passwordSalt, 64, { N: 16384, r: 8, p: 1 })).toString("hex");
document.users.push({
  email, username, name: "Zuzana Ifková", accountType: "parent",
  children: [{ name: "Liliana Ifková", membershipStatus: "pending", nextPayment: "Po aktivácii členstva" }],
  passwordHash, passwordSalt, createdAt: new Date().toISOString()
});
await fs.mkdir(path.dirname(userFile), { recursive: true });
await fs.writeFile(userFile, JSON.stringify(document, null, 2), { encoding: "utf8", mode: 0o600 });
console.log(JSON.stringify({ created: true, username, password }));
