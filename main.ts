import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// 설정 타입
interface RemoveMarkdownFormattingSettings {
	// 커스텀 문구 리스트
	customPhrases: string[];
	// 문법별 체크박스 상태
	enabledPatterns: { [key: string]: boolean };
}

// 기본 설정
const DEFAULT_SETTINGS: RemoveMarkdownFormattingSettings = {
	customPhrases: ['', '', ''],
	enabledPatterns: MARKDOWN_PATTERNS.reduce((acc, pattern) => {
		acc[pattern.key] = false; // 기본은 전부 false
		return acc;
	}, {} as Record<string, boolean>)
};

// 제거 가능한 문법 리스트 + 예시
const MARKDOWN_PATTERNS = [
	{ key: 'asterisk', label: 'Asterisk (*, **)', example: '*italic* or **bold**' },
	{ key: 'inline-code', label: 'Inline Code (`)', example: '`inline code`' },
	{ key: 'latex', label: 'LaTeX ($)', example: '$latex$' },
	{ key: 'highlight', label: 'Highlight (==)', example: '==highlight==' },
	{ key: 'comment', label: 'Comment (%%)', example: '%%comment%%' },
	{ key: 'header', label: 'Header (#)', example: '# Header 1' },
	{ key: 'list', label: 'Unordered List (-)', example: '- List item' },
	{ key: 'numbered-list', label: 'Numbered List (1.)', example: '1. List item' },
	{ key: 'quote', label: 'Quote (>)', example: '> Quoted text' },
	{ key: 'task', label: 'Task List (- [ ])', example: '- [ ] Task item' },
];

export default class RemoveMarkdownFormattingPlugin extends Plugin {
	settings: RemoveMarkdownFormattingSettings;

	async onload() {
		await this.loadSettings();

		// 명령어 등록 예시 (별 * 제거)
		this.addCommand({
			id: 'remove-asterisks',
			name: 'Remove Asterisks (*)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selectedText = editor.getSelection();
				const cleanedText = selectedText.replace(/\*/g, ''); // * 모두 제거
				editor.replaceSelection(cleanedText);
			}
		});

		this.addSettingTab(new RemoveMarkdownFormattingSettingTab(this.app, this));
	}

	async onunload() {
		// 언로드 처리 (필요 없으면 비워둠)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

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

		containerEl.createEl('h2', { text: 'Markdown Syntax Removal Settings' });

		// 문법 제거 체크박스
		MARKDOWN_PATTERNS.forEach(pattern => {
			new Setting(containerEl)
				.setName(pattern.label)
				.setDesc(pattern.example)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.enabledPatterns[pattern.key] || false)
					.onChange(async (value) => {
						this.plugin.settings.enabledPatterns[pattern.key] = value;
						await this.plugin.saveSettings();
					}));
		});

		containerEl.createEl('h2', { text: 'Custom Phrase Settings' });

		// 커스텀 문구 입력창 3개
		for (let i = 0; i < 3; i++) {
			new Setting(containerEl)
				.setName(`Custom Phrase ${i + 1}`)
				.addText(text => text
					.setPlaceholder(`Enter custom phrase ${i + 1}`)
					.setValue(this.plugin.settings.customPhrases[i] || '')
					.onChange(async (value) => {
						this.plugin.settings.customPhrases[i] = value;
						await this.plugin.saveSettings();
					}));
		}
	}
}