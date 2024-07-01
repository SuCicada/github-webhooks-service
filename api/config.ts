import path from "path";
import dotenv from "dotenv";
import * as fs from "node:fs";

export function initEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    console.log("envPath", envPath)
    if (fs.existsSync(envPath)) {
        const result = dotenv.config({path: envPath});
        if (result.error) {
            throw result.error;
        }
    }
}
