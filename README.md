# Remove Markdown Formatting

A flexible obsidian plugint that allows you to selectively remove specific markdown syntax or custom phrases from your selected text.

## Features

-   Remove only specific markdown syntax you choose (e.g., `\*`, `$`, `=`, etc.)
-   Support for removing user-defined custom phrases.
-   Independent command for each removal target.
-   Hotkey support for each command.
-   Context menu and command palette support.

## How It Works

![](https://i.imgur.com/a9pWlVF.png)

> Custom Palette

![](https://i.imgur.com/IwoUwgj.png)

> Context Menu

1. Select the text you want to modify.
2. Open the command palette (`Ctrl+P` or `Cmd+P`) and search for "Remove Markdown"
3. Choose the specific command for the markdown syntax or custom phrase you want to remove.
4. Alternatively, right-click on the selected text to access the context menu and choose the desired command.
5. The selected syntax or phrase will be removed, leaving the rest of the text intact.

## Available Commands

-   Remove Asterisks (`*`)
-   Remove Inline Code (`` ` ``)
-   Remove LaTeX Syntax (`$`)
-   Remove Highlight (`==`)
-   Remove Comment (`%%`)
-   Remove Header (`#`)
-   Remove Bullet List (`-`)
-   Remove Numbered List (`1.`)
-   Remove Quote (`>`)
-   Remove Task List (`- [ ]`)

-   Remove Custom Phrase 1
-   Remove Custom Phrase 2
-   Remove Custom Phrase 3

> Each command can be assigned a hotkey for quick access.

## Settings

-   Define which custom phrases to remove
-   Manage 3 custom phrases independently

## License

[MIT License](./LICENSE)
