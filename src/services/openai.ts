import OpenAI from "openai";
import { CONFIG } from "../config";

export const openai = new OpenAI({
	apiKey: CONFIG.OPENAI_API_KEY,
	organization: CONFIG.OPENAI_ORGANIZATION || null,
});