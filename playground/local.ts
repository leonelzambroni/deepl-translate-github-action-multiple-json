import * as deepl from "deepl-node";
import path from "path";
import { main } from "../src/main";

const authKey = process.env.deepl_api_key as string;
const translator = new deepl.Translator(authKey);
const playgroundPath = "playground"
const inputFilePath = path.join(playgroundPath, "nested.json");
const outputFileNamePattern = path.join(playgroundPath, "locales/{language}/nested.json");
const targetLanguages = ["ja"] as deepl.TargetLanguageCode[];

(async () => {
	await main({
		translator,
		inputFilePath,
		outputFileNamePattern,
		targetLanguages,
	});
})();
