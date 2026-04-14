/**
 * Migration: add avatarImage field to all profile documents that don't have it.
 * Run once: node scripts/migrate-avatar-field.mjs
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read MONGODB_URI from .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const match = envContent.match(/^MONGODB_URI=(.+)$/m);
if (!match) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = match[1].trim();

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const profiles = db.collection("profiles");

  // Add avatarImage: "" to every document that doesn't already have the field
  const result = await profiles.updateMany(
    { avatarImage: { $exists: false } },
    { $set: { avatarImage: "" } },
  );

  console.log(
    `Migration complete: ${result.matchedCount} documents matched, ${result.modifiedCount} updated.`,
  );

  // Show current state
  const all = await profiles.find({}).toArray();
  for (const p of all) {
    console.log(
      `  ${p._id}: avatarImage = ${JSON.stringify(p.avatarImage ?? "(missing)")}`,
    );
  }
} finally {
  await client.close();
}
