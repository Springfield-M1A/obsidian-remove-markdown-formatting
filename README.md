# Remove Markdown Formatting

A flexible obsidian plugint that allows you to selectively remove specific markdown syntax or custom phrases from your selected text.

## Features

-   Remove only specific markdown syntax you choose (e.g., `\*`, `$`, `=`, etc.)
-   Support for removing user-defined custom phrases.
-   Independent command for each removal target.
-   Hotkey support for each command.
-   Context menu and command palette support.

## How It Works

1. Select a portion of text in your Obsidian note (or the entire note).
2. Use the command palette or context menu to select the desired removal option.
3. Only the selected markdown syntax or custom phrases will be removed.
4. The rest of the text remains unchanged.

## Available Commands

-   Remove Asterisks (`*`)
-   Remove Inline Code (`` ` ``)
-   Remove LaTeX Syntax (`$`)
-   Remove Highlight Syntax (`==`)
-   Remove Comment Syntax (`%%`)
-   Remove Custom Phrase 1
-   Remove Custom Phrase 2
-   Remove Custom Phrase 3

Each command can be assigned a hotkey for quick access.

## Settings

-   Define which custom phrases to remove
-   Manage multiple custom phrases independently

## License

[MIT License](./LICENSE)
