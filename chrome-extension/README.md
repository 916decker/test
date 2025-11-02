# 🤖 LLM Prompt Manager - Chrome Extension

Never lose your favorite LLM prompts again! This Chrome extension lets you save, manage, and quickly access your most-used prompts with a simple right-click.

## 🎯 Perfect For

- **Prompt Engineers** - Keep your best prompts at your fingertips
- **AI Power Users** - Stop searching through old conversations
- **Content Creators** - Reuse your winning prompt templates
- **Developers** - Quick access to code review/optimization prompts
- **Anyone using Claude, ChatGPT, or other LLM tools**

## ✨ Features

### Right-Click Access
- Right-click anywhere on a webpage to see your prompts
- Click a prompt to copy it to your clipboard
- Automatically inserts into text fields if you're focused on one

### Easy Management
- Add new prompts with name + text
- Edit existing prompts anytime
- Delete prompts you no longer need
- All prompts sync across your Chrome browsers (when signed in)

### Simple & Fast
- No login required
- No external servers
- All data stored locally in Chrome
- Works offline

## 📥 Installation

### Step 1: Get the Files
The extension is in the `chrome-extension` folder of this repository.

### Step 2: Load in Chrome

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the `chrome-extension` folder
   - Click "Select Folder"

4. **Done!** 🎉
   - You should see "LLM Prompt Manager" in your extensions list
   - The extension icon will appear in your Chrome toolbar

### Optional: Pin the Extension
- Click the puzzle piece icon (🧩) in your Chrome toolbar
- Find "LLM Prompt Manager"
- Click the pin icon to keep it visible

## 🚀 How to Use

### Adding Your First Prompt

1. **Click the extension icon** in your toolbar
2. **Enter a name** (e.g., "Scrutinize Answer")
3. **Enter your prompt text**:
   ```
   Please review your previous answer as if you were a subject matter expert.
   Rate the quality 1-10 and provide specific improvements to make it a 10/10.
   ```
4. **Click "Add Prompt"**

### Using Your Prompts

#### Method 1: Right-Click Menu (Recommended)
1. Go to any LLM website (Claude.ai, ChatGPT, etc.)
2. Right-click in the text input area
3. Hover over "LLM Prompts"
4. Click your desired prompt
5. It's automatically copied AND inserted!

#### Method 2: Manual Copy
1. Click the extension icon
2. Click the "📋 Copy" button next to any prompt
3. Paste it wherever you need it (Ctrl+V / Cmd+V)

### Managing Prompts

- **Edit**: Click "✏️ Edit" to modify name or text
- **Delete**: Click "🗑️" to remove a prompt (asks for confirmation)
- **Organize**: Prompts appear in the order you added them

## 💡 Suggested Prompts to Add

Here are some powerful prompts to get you started:

### 1. Scrutinize & Improve
```
Review your previous answer as an expert critic. Rate it 1-10 and explain what would make it a perfect 10. Then provide that improved version.
```

### 2. Technical Deep Dive
```
Explain this in technical detail. Assume I have advanced knowledge. Include edge cases, performance considerations, and best practices.
```

### 3. Simplify for Beginners
```
Explain this concept as if I'm a complete beginner. Use analogies and avoid jargon. Make it engaging and easy to understand.
```

### 4. Code Review
```
Review this code for: bugs, security issues, performance problems, best practices, and readability. Provide specific improvements with examples.
```

### 5. Expand Ideas
```
Take this concept and expand it into 5 different variations or approaches. Be creative and think outside the box.
```

### 6. Research Assistant
```
Provide a comprehensive overview of this topic with: key concepts, common misconceptions, practical applications, and recommended resources for learning more.
```

## 🔧 Technical Details

### Built With
- **Manifest V3** - Latest Chrome extension standard
- **Chrome Storage API** - Syncs across devices
- **Context Menus API** - Right-click integration
- **Clipboard API** - One-click copying
- **Pure JavaScript** - No frameworks, fast and lightweight

### Storage
- Uses Chrome's `sync` storage (automatically syncs if signed into Chrome)
- No size limits for reasonable usage (up to 100KB per prompt, 102,400 bytes total)
- Stored locally in Chrome (not on any external server)

### Permissions Explained
- `contextMenus` - Adds right-click menu options
- `storage` - Saves your prompts
- `clipboardWrite` - Copies prompts to clipboard
- `notifications` - Shows "Copied!" notification
- `scripting` - Inserts text into active fields
- `activeTab` - Only accesses the current tab when you use a prompt

### Privacy
- **No data leaves your computer** (except Chrome Sync if enabled)
- **No analytics or tracking**
- **No external API calls**
- **Open source** - Review the code yourself

## 📂 File Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── background.js       # Context menu logic
├── popup.html         # Popup interface
├── popup.js           # Popup functionality
├── styles.css         # Styling
└── README.md          # This file
```

## 🐛 Troubleshooting

### Extension won't load
- Make sure Developer Mode is enabled in `chrome://extensions/`
- Check that you selected the correct folder
- Look for error messages in the Extensions page

### Right-click menu not showing
- Refresh the webpage after installing the extension
- Make sure you're right-clicking in a text-editable area
- Check if the extension is enabled in `chrome://extensions/`

### Prompts not syncing
- Chrome Sync only works if you're signed into Chrome
- Check Chrome sync settings: chrome://settings/syncSetup
- Syncing may take a few moments

### Can't copy to clipboard
- Make sure the extension has clipboard permissions
- Some websites block clipboard access
- Try clicking the extension icon and using the Copy button directly

### Text not inserting automatically
- The auto-insert only works in standard text fields
- Some websites use custom input components that block this
- In these cases, the text is still copied - just paste manually

## 🎨 Customization

### Want to modify the extension?

1. **Edit the files** in the `chrome-extension` folder
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the LLM Prompt Manager card
3. **Test your changes**

### Common Customizations

**Change colors**: Edit `styles.css`
**Modify context menu text**: Edit `background.js` line 17-18
**Change popup size**: Edit `styles.css` line 8
**Add keyboard shortcuts**: Add to `manifest.json` (see [Chrome docs](https://developer.chrome.com/docs/extensions/reference/commands/))

## 🔄 Version History

### v1.0 (Current)
- ✅ Right-click context menu
- ✅ Add, edit, delete prompts
- ✅ Copy to clipboard
- ✅ Auto-insert into text fields
- ✅ Chrome Sync support
- ✅ Notifications

### Future Ideas
- 📁 Organize prompts into folders
- 🔍 Search prompts
- 📤 Import/export prompt collections
- ⌨️ Keyboard shortcuts
- 🏷️ Tag system
- 📊 Usage statistics

## 🤝 Contributing

Found a bug? Have an idea?
- Edit the code and test it yourself
- Share improvements with others
- This is your tool - make it work for you!

## 📝 License

This is an open template - use it however you want!

## 🎓 Learn More

### Chrome Extension Docs
- [Getting Started](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Context Menus API](https://developer.chrome.com/docs/extensions/reference/contextMenus/)

### LLM Prompt Resources
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Claude Prompting](https://docs.anthropic.com/claude/docs/prompt-engineering)

---

**Made with ❤️ for LLM enthusiasts**

*Stop searching for prompts. Start using them.*
