import type { TargetLanguageCode, Translator } from "deepl-node";
import fs from "fs";
import path from "path";
import { TranslatedJSONResults, buildOutputFileName, removeKeepTagsFromString, replaceAll, translateRecursive } from "./utils";


export interface MainFunctionParams{
	translator: Translator;
	inputFilePath: string;
	outputFileNamePattern: string;
	targetLanguages: TargetLanguageCode[];
}

export async function main(params: MainFunctionParams) {
	const {
		translator,
		inputFilePath,
		outputFileNamePattern,
		targetLanguages,
	} = params;
	const fileExtension = path.extname(inputFilePath);
	

	if (fileExtension === ".json") {
		fs.readFile(inputFilePath, "utf8", async (err, jsonString) => {
			if (err) {
				console.info("Error reading file", err);
				return;
			}

			try {
				const inputJson = JSON.parse(jsonString);
				const translatedRecords = {} as TranslatedJSONResults;
				const translatedResults = await translateRecursive(inputJson, targetLanguages, translator, translatedRecords);

				for (const targetLanguage of targetLanguages) {
					const targetLang = targetLanguage as TargetLanguageCode;
					const outputFileName = buildOutputFileName(targetLang, outputFileNamePattern);
					const resultJson = JSON.stringify(translatedResults[targetLang]);
					const outputFolderPath = path.dirname(outputFileName);
					if (!fs.existsSync(outputFolderPath)) {
						fs.mkdirSync(outputFolderPath, { recursive: true });
					}
					fs.writeFile(outputFileName, resultJson, function (err) {
						if (err) return console.info(err);
						console.info(`Translated ${outputFileName} into ${targetLang}`);
					});
				}
			} catch (err) {
				console.info("Error parsing JSON string", err);
			}
		});
	}
}
