/**
 * Load the single project root `.env` (not `server/.env`).
 * Must be imported before any code that reads `process.env`.
 */
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(__dirname, "..", "..", ".env");

config({ path: rootEnvPath });
