import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 설정
interface RemoveMarkdownFormattingSettings {
	// 커스텀 문구
    customPhrases: string[];
    // 체크박스용 (문법 별)
    enabledPatterns: { [key: string]: boolean };
}

// 기본 설정
const DEFAULT_SETTINGS: RemoveMarkdownFormattingSettings = {
	customPhrases: []
}

// 플러그인 클래스
export default class RemoveMarkdownFormattingPlugin extends Plugin {
	settings: RemoveMarkdownFormattingSettings;

	async onload() {
		await this.loadSettings();

		// 명령어 등록
		this.addCommand({
			id: 'remove-asterisks',
			name: 'Remove Asterisks (*)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selectedText = editor.getSelection();
				const cleanedText = selectedText.replace(/\*/g, '');
				editor.replaceSelection(cleanedText);
			}
		});

		// 명령어 등록

		this.addSettingTab(new RemoveMarkdownFormattingSettingTab(this.app, this));
	}

	async onunload() {
		// 언로드 시 해야 할 작업은 없음 (지금은 비워둠)
	}

	// 설정 불러오기
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// 설정 저장하기
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// 설정 탭 클래스
class RemoveMarkdownFormattingSettingTab extends PluginSettingTab {
	plugin: RemoveMarkdownFormattingPlugin;

	constructor(app: App, plugin: RemoveMarkdownFormattingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Remove Markdown Formatting Settings' });

		// 커스텀 문구 설정 예시
		new Setting(containerEl)
			.setName('Custom phrases')
			.setDesc('Comma-separated list of custom phrases to remove.')
			.addTextArea(text => text
				.setPlaceholder('e.g. 가나다, ABC, 123')
				.setValue(this.plugin.settings.customPhrases.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.customPhrases = value.split(',').map(s => s.trim());
					await this.plugin.saveSettings();
				}));
	}
}