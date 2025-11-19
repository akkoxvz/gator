import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config";

export default defineConfig({
    schema: "./src/lib/db",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: readConfig().dbUrl
    }
});