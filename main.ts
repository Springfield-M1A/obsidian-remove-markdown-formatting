import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface RemoveMarkdownFormattingSettings {
	customPhrases: string[];
	enabledPatterns: { [key: string]: boolean };
}

// 문법 리스트
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

const DEFAULT_SETTINGS: RemoveMarkdownFormattingSettings = {
	customPhrases: ['', '', ''],
	enabledPatterns: MARKDOWN_PATTERNS.reduce((acc, pattern) => {
		acc[pattern.key] = true;
		return acc;
	}, {} as Record<string, boolean>)
};

export default class RemoveMarkdownFormattingPlugin extends Plugin {
	settings: RemoveMarkdownFormattingSettings;

	async onload() {
		await this.loadSettings();

		MARKDOWN_PATTERNS.forEach(pattern => {
			if (this.settings.enabledPatterns[pattern.key]) {
				this.addCommand({
					id: `remove-${pattern.key}`,
					name: `Remove ${pattern.label}`,
					editorCallback: (editor: Editor, view: MarkdownView) => {
						const selected = editor.getSelection();
						const cleaned = removePattern(selected, pattern.key);
						editor.replaceSelection(cleaned);
					}
				});
			}
		});

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
				const selectedText = editor.getSelection();
				if (!selectedText) return;

				MARKDOWN_PATTERNS.forEach(pattern => {
					if (this.settings.enabledPatterns[pattern.key]) {
						menu.addItem(item => {
							item.setTitle(`Remove ${pattern.label}`)
								.setIcon('eraser')
								.onClick(() => {
									const cleaned = removePattern(selectedText, pattern.key);
									editor.replaceSelection(cleaned);
								});
						});
					}
				});
			})
		);

		this.addSettingTab(new RemoveMarkdownFormattingSettingTab(this.app, this));
	}

	async onunload() {}

	async loadSettings() {
		const loaded = await this.loadData();
		const fallback = MARKDOWN_PATTERNS.reduce((acc, pattern) => {
			acc[pattern.key] = true;
			return acc;
		}, {} as Record<string, boolean>);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
		this.settings.enabledPatterns = Object.assign({}, fallback, this.settings.enabledPatterns);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function removePattern(text: string, key: string): string {
	switch (key) {
		case 'asterisk':
			return text.replace(/\*\*?|\*\*/g, '');
		case 'inline-code':
			return text.replace(/`+/g, '');
		case 'latex':
			return text.replace(/\$+/g, '');
		case 'highlight':
			return text.replace(/==/g, '');
		case 'comment':
			return text.replace(/%%.*?%%/gs, '');
		case 'header':
			return text.replace(/^#+\s*/gm, '');
		case 'list':
			return text.replace(/^\s*[-*+]\s+/gm, '');
		case 'numbered-list':
			return text.replace(/^\s*\d+\.\s+/gm, '');
		case 'quote':
			return text.replace(/^>\s*/gm, '');
		case 'task':
			return text.replace(/^\s*[-*]\s+\[.\]\s+/gm, '');
		default:
			return text;
	}
}

class RemoveMarkdownFormattingSettingTab extends PluginSettingTab {
	plugin: RemoveMarkdownFormattingPlugin;

	constructor(app: App, plugin: RemoveMarkdownFormattingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Custom Phrase Settings' });

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

		containerEl.createEl('h2', { text: 'Markdown Syntax Removal Settings' });

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
	}
}