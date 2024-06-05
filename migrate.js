import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  const migrationDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationDir);

  for (const file of files) {
    const filePath = path.join(migrationDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      await query(sql);
      console.log(`Migration ${file} ran successfully`);
    } catch (err) {
      console.error(`Error running migration ${file}:`, err);
    }
  }
};

runMigration()
  .then(() => {
    console.log("All migrations ran successfully");
    process.exit();
  })
  .catch((err) => {
    console.error("Error running migrations:", err);
    process.exit(1);
  });
