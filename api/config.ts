import path from "path";
import dotenv from "dotenv";

export function initEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    console.log("envPath", envPath)
    const result = dotenv.config({path: envPath});
    if (result.error) {
        throw result.error;
    }
}
