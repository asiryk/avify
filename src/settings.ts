import { App, PluginSettingTab, Setting } from "obsidian";
import AvifyPlugin from "./main";

export interface AvifySettings {
	assetsFolder: string;
	quality: number;
	enabled: boolean;
}

export const DEFAULT_SETTINGS: AvifySettings = {
	assetsFolder: "Assets",
	quality: 85,
	enabled: true,
};

export class AvifySettingTab extends PluginSettingTab {
	plugin: AvifyPlugin;

	constructor(app: App, plugin: AvifyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Enabled")
			.setDesc("Automatically convert dropped/pasted images to AVIF")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Assets folder")
			.setDesc("Folder where converted AVIF images are stored")
			.addText((text) =>
				text
					.setPlaceholder("Assets")
					.setValue(this.plugin.settings.assetsFolder)
					.onChange(async (value) => {
						this.plugin.settings.assetsFolder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Quality")
			.setDesc("AVIF compression quality (1–100)")
			.addSlider((slider) =>
				slider
					.setLimits(1, 100, 1)
					.setValue(this.plugin.settings.quality)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.quality = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
