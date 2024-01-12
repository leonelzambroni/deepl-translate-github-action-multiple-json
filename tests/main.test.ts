import type { SpyInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MainFunctionParams, main } from "../src/main";
import fs from "fs";

vi.mock("deepl-node", () => ({
	TargetLanguageCode: "",
}));

describe("main - HTMLlike files", () => {
	const mockTranslator = {
		translateText: vi.fn().mockResolvedValue(() =>
			Promise.resolve({
				text: "translated text",
			}),
		),
	} as any;

	vi.mock("deepl-node");
	vi.mock("fs");

	let mockTranslatorSpy: SpyInstance;
	let existsSpy: SpyInstance;
	let readFileSyncSpy: SpyInstance;
	let writeFileSyncSpy: SpyInstance;
	let writeFileSpy: SpyInstance;
	let readFileSpy: SpyInstance;

	const fakeInputFileFolderPath = "test";
	const fakeInputFilename = "inputFilePath.md";
	const fakeOutputFileNamePattern = `${fakeInputFileFolderPath}/`;
	const fakeTempFilePath = "to_translate.txt";
	const fakeReadFileResult = Buffer.from("Your mocked data here");

	beforeEach(() => {
		mockTranslatorSpy = vi.spyOn(mockTranslator, "translateText");
		existsSpy = vi.mocked(fs.existsSync).mockReturnValue(true);
		readFileSyncSpy = vi
			.mocked(fs.readFileSync)
			.mockReturnValue("readFile sync result");
		writeFileSyncSpy = vi.mocked(fs.writeFileSync).mockReturnValue();
		writeFileSpy = vi
			.mocked(fs.writeFile)
			.mockImplementation((path, data, callback) => {
				callback(null);
			});
		readFileSpy = vi.mocked(fs.readFile).mockImplementation(((
			_path: any,
			_encoding,
			callback: (err: any, data: Buffer) => void,
		) => {
			callback(null, fakeReadFileResult); // Pass the mocked data
		}) as any);
	});
	afterEach(() => {
		vi.clearAllMocks();
	});
	test("should run without errors", async () => {
		const testParams: MainFunctionParams = {
			translator: mockTranslator,
			inputFilePath: `${fakeInputFileFolderPath}/${fakeInputFilename}`,
			outputFileNamePrefix: fakeOutputFileNamePattern,
			tempFilePath: fakeTempFilePath,
			fileExtensionsThatAllowForIgnoringBlocks: [".html", ".xml", ".md"],
			targetLanguages: ["de"],
		};
		await expect(main(testParams)).resolves.not.toThrow();
		expect(mockTranslatorSpy).toHaveBeenCalled();
	});
});

describe("main - JSON files", () => {
	const mockTranslator = {
		translateText: vi.fn().mockResolvedValue(() =>
			Promise.resolve({
				text: "{'someKey': 'translated text'}",
			}),
		),
	} as any;

	vi.mock("deepl-node");
	vi.mock("fs");

	let mockTranslatorSpy: SpyInstance;
	let existsSpy: SpyInstance;
	let readFileSyncSpy: SpyInstance;
	let writeFileSyncSpy: SpyInstance;
	let writeFileSpy: SpyInstance;
	let readFileSpy: SpyInstance;

	const fakeInputFileFolderPath = "test";
	const fakeInputFilename = "inputFilePath.json";
	const fakeOutputFileNamePattern = `${fakeInputFileFolderPath}/{language}.json`;
	const fakeTempFilePath = "to_translate.txt";
	const testJSON = {
		welcome: "Welcome, {name}!",
		language: "Language",
		description: "This is a wonderful world isn't it?",
	};
	const testJSONstring = JSON.stringify(testJSON);

	const fakeReadFileResult = Buffer.from(testJSONstring);

	beforeEach(() => {
		mockTranslatorSpy = vi.spyOn(mockTranslator, "translateText");
		existsSpy = vi.mocked(fs.existsSync).mockReturnValue(true);
		readFileSyncSpy = vi.mocked(fs.readFileSync).mockReturnValue(testJSONstring);
		writeFileSyncSpy = vi.mocked(fs.writeFileSync).mockReturnValue();
		writeFileSpy = vi
			.mocked(fs.writeFile)
			.mockImplementation((path, data, callback) => {
				callback(null);
			});
		readFileSpy = vi.mocked(fs.readFile).mockImplementation(((
			_path: any,
			_encoding,
			callback: (err: any, data: Buffer) => void,
		) => {
			callback(null, fakeReadFileResult); // Pass the mocked data
		}) as any);
	});
	afterEach(() => {
		vi.clearAllMocks();
	});
	test("should run without errors", async () => {
		const testParams: MainFunctionParams = {
			translator: mockTranslator,
			inputFilePath: `${fakeInputFileFolderPath}/${fakeInputFilename}`,
			outputFileNamePattern: fakeOutputFileNamePattern,
			tempFilePath: fakeTempFilePath,
			fileExtensionsThatAllowForIgnoringBlocks: [".html", ".xml", ".md"],
			targetLanguages: ["de"],
		};
		await expect(main(testParams)).resolves.not.toThrow();
		expect(mockTranslatorSpy).toHaveBeenCalled();
	});
});
