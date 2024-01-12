import type { TargetLanguageCode } from "deepl-node";
import { Translator } from 'deepl-node';
import path from "path";
import { main } from "./main";
import fs from 'fs';

const authKey = process.env.deepl_api_key as string;
const translator = new Translator(authKey);
const inputFolderPath = path.join(
  process.env.GITHUB_WORKSPACE as string,
  process.env.input_folder_path as string,
);
const outputFileNamePattern = path.join(
  process.env.GITHUB_WORKSPACE as string,
  process.env.output_file_name_pattern as string,
);

(async () => {
  const targetLanguages =
    process.env.target_languages === "all"
      ? (await translator.getTargetLanguages()).map((lang) => lang.code) as TargetLanguageCode[]
      : process.env.target_languages !== undefined
      ? (process.env.target_languages?.split(",") as TargetLanguageCode[])
      : [];

  const inputFileNameList = process.env.input_file_names?.split(",") || [];

  async function processFile(fileName: string) {
    const currentInputFilePath = path.join(inputFolderPath, fileName.trim());
    const currentOutputFileNamePattern = modifyOutputFileNamePattern(outputFileNamePattern, fileName.trim());

    await main({
      translator,
      inputFilePath: currentInputFilePath,
      outputFileNamePattern: currentOutputFileNamePattern,
      targetLanguages,
    });
  }

  if (inputFileNameList.length > 0) {
    if (inputFileNameList[0].toLowerCase().endsWith('*.json')) {
      // Handle multiple JSON files in the folder
      const files = fs.readdirSync(inputFolderPath);
      for (const file of files) {
        await processFile(file);
      }
    } else {
      // Process individual file names
      for (const fileName of inputFileNameList) {
        await processFile(fileName);
      }
    }
  }
})();

function modifyOutputFileNamePattern(pattern: string, fileName: string): string {
  if (pattern.toLowerCase().endsWith('{base}')) {
    return pattern.replace(/\{base\}/i, path.parse(fileName + '.json').name);
  }
  return pattern;
}
