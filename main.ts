import { App, Editor, MarkdownView, Menu, Plugin, PluginSettingTab, Setting, FuzzySuggestModal } from 'obsidian';

interface RemoveMarkdownFormattingSettings {
	customPhrases: string[];
	enabledPatterns: { [key: string]: boolean };
}

const MARKDOWN_PATTERNS = [
	{ key: 'asterisk', label: 'Asterisk (*, **)', example: '*italic* or **bold**' },
	{ key: 'inline-code', label: 'Inline Code (`)', example: '`inline code`' },
	{ key: 'latex', label: 'LaTeX ($)', example: '$latex$' },
	{ key: 'highlight', label: 'Highlight (=)', example: '==highlight==' },
	{ key: 'comment', label: 'Comment (%)', example: '%%comment%%' },
	{ key: 'header', label: 'Header (#)', example: '# Header, #Tag' },
	{ key: 'list', label: 'Unordered List (-)', example: '- List item' },
	{ key: 'numbered-list', label: 'Numbered List (1.)', example: '1. List item (⚠️ May affect numbers like "2025. Plan")' },
	{ key: 'quote', label: 'Quote (>)', example: '> Quoted text' },
	{ key: 'task', label: 'Task List (- [ ])', example: '- [ ] / - [x] Task item' },
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
						const cleaned = cleanLineIndentation(removePattern(selected, pattern.key));
						editor.replaceSelection(cleaned);
					}
				});
			}
		});

		[0, 1, 2].forEach(index => {
			this.addCommand({
				id: `remove-custom-${index + 1}`,
				name: `Remove Custom Phrase ${index + 1}`,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const phrase = this.settings.customPhrases[index]?.trim();
					if (!phrase) return;
					const selected = editor.getSelection();
					const cleaned = selected.split(phrase).join('');
					editor.replaceSelection(cleaned);
				}
			});
		});

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
				const selectedText = editor.getSelection();
				if (!selectedText) return;
				menu.addItem(item => {
					item.setTitle('Remove Markdown')
						.setIcon('eraser')
						.onClick(() => {
							new RemoveOptionModal(this.app, editor, this.settings).open();
						});
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

class RemoveOptionModal extends FuzzySuggestModal<string> {
	editor: Editor;
	settings: RemoveMarkdownFormattingSettings;

	constructor(app: App, editor: Editor, settings: RemoveMarkdownFormattingSettings) {
		super(app);
		this.editor = editor;
		this.settings = settings;
		this.setPlaceholder("Select markdown element to remove");
	}

	getItems(): string[] {
		const items: string[] = [];
		MARKDOWN_PATTERNS.forEach(p => {
			if (this.settings.enabledPatterns[p.key]) {
				items.push(p.label);
			}
		});
		this.settings.customPhrases.forEach((phrase, i) => {
			if (phrase.trim()) {
				items.push(`Custom Phrase ${i + 1}`);
			}
		});
		return items;
	}

	getItemText(item: string): string {
		return item;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent) {
		const text = this.editor.getSelection();
		const pattern = MARKDOWN_PATTERNS.find(p => item.startsWith(p.label));
		let cleaned = '';

		if (pattern) {
			cleaned = cleanLineIndentation(removePattern(text, pattern.key));
		} else if (item.startsWith('Custom Phrase')) {
			const index = parseInt(item.split(' ')[2]) - 1;
			const phrase = this.settings.customPhrases[index];
			cleaned = text.split(phrase).join('');
		}
		this.editor.replaceSelection(cleaned);
	}
}

function removePattern(text: string, key: string): string {
	switch (key) {
		case 'asterisk':
			return text.replace(/\*/g, '');
		case 'inline-code':
			return text.replace(/`/g, '');
		case 'latex':
			return text.replace(/\$/g, '');
		case 'highlight':
			return text.replace(/=/g, '');
		case 'comment':
			return text.replace(/%/g, '');
		case 'header':
			return text.replace(/#/g, '');
		case 'list':
			return text.replace(/-/g, '');
		case 'quote':
			return text.replace(/>/g, '');
		case 'numbered-list':
			return text.replace(/^\s*\d+\.\s+/gm, '');
        case 'task':
            return text.replace(/-\s+\[.{1}\]\s*/g, '');
		default:
			return text;
	}
}

function cleanLineIndentation(text: string): string {
	return text.split('\n').map(line => {
		if (/^\s*$/.test(line)) return '';
		if (/^\s+[^-\d>]/.test(line)) {
			return line.replace(/^\s{1,3}/, '');
		}
		return line;
	}).join('\n');
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