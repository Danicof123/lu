import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION
};
