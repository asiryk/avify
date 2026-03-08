import { Notice, Plugin } from "obsidian";
import { AvifySettings, AvifySettingTab, DEFAULT_SETTINGS } from "./settings";
import { registerHandler } from "./handler";
import { checkMagickAvailable } from "./converter";

export default class AvifyPlugin extends Plugin {
	settings: AvifySettings;
	magickAvailable = false;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<AvifySettings>);
		registerHandler(this);
		this.addSettingTab(new AvifySettingTab(this.app, this));

		this.magickAvailable = await checkMagickAvailable();
		if (!this.magickAvailable) {
			const hint = process.platform === "darwin"
				? "brew install imagemagick"
				: "sudo apt install imagemagick";
			new Notice(`Avify: ImageMagick not found. Install with: ${hint}`);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
