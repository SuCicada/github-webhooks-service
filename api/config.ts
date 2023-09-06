import path from "path";
import fs from "fs";
import * as yaml from "js-yaml";
import {ApiConfig} from "./types";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({path: envPath});
if (result.error) {
    throw result.error;
}

let API_YAML = path.join(__dirname, '../api.yaml');
let fileContents = fs.readFileSync(API_YAML, 'utf-8');
let yamlData = yaml.load(fileContents);

const apiConfig = yamlData as ApiConfig
// const apiConfig = Object.assign(new ApiConfig(), yamlData);
if (apiConfig.server) {
    apiConfig.server.password = process.env.SERVER_PASSWORD
} else {
    apiConfig.server = {
        password: process.env.SERVER_PASSWORD
    }
}
export {apiConfig}
console.log("apiConfig load")
// class Config {
//     private constructor() {
//     }
// }
