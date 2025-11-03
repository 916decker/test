# 📖 LLM Prompt Manager - Complete User Guide

Welcome to the LLM Prompt Manager! This comprehensive guide will help you master all features of this powerful Chrome extension.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Features](#basic-features)
3. [Advanced Features](#advanced-features)
4. [Organization](#organization)
5. [Backup & Sharing](#backup--sharing)
6. [Tips & Best Practices](#tips--best-practices)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Pin the extension icon to your toolbar for easy access

### First Steps

1. **Click the extension icon** in your Chrome toolbar
2. **Create your first folder** (optional but recommended for organization)
3. **Add your first prompt**:
   - Enter a name (e.g., "Scrutinize Answer")
   - Select a folder
   - Enter your prompt text
   - Click "Add Prompt"

---

## Basic Features

### 1. Adding Prompts

**Method 1: Standard Add**
1. Open the extension popup
2. Fill in:
   - **Prompt Name**: Short, descriptive name
   - **Folder**: Select from dropdown
   - **Prompt Text**: Your full prompt
3. Click "Add Prompt"

**Tips:**
- Use clear, descriptive names
- Press Enter in the name field to quickly add
- Organize with folders from the start

### 2. Using Prompts

**Method 1: Right-Click Menu** (Recommended)
1. Go to any website (ChatGPT, Claude.ai, etc.)
2. Right-click anywhere
3. Hover over "LLM Prompts"
4. Select your desired prompt
5. It's automatically inserted if you're in a text field!

**Method 2: Copy from Popup**
1. Click the extension icon
2. Click the 📋 (copy) button next to any prompt
3. Paste wherever you need it (Ctrl+V / Cmd+V)

**Method 3: Quick Access**
- **Recently Used**: Shows your last 5 used prompts at the top
- **Favorites**: Star your best prompts for instant access

### 3. Managing Prompts

**Edit a Prompt**
1. Click the ✏️ (edit) button
2. Modify name, folder, or text in the modal
3. Click "Save Changes"
- **Note**: Editing creates a version history!

**Duplicate a Prompt**
1. Click the 📄 (duplicate) button
2. A copy is created with " (Copy)" suffix
3. Edit the duplicate as needed

**Delete a Prompt**
1. Click the 🗑️ (delete) button
2. Confirm deletion
3. Prompt moves to Trash (can be restored!)

---

## Advanced Features

### 🔍 Search

**Real-time Search**
- Type in the search bar at the top
- Searches both prompt names AND content
- Works with folder filtering
- Instant results as you type

**Search Tips:**
- Search for keywords: "code", "review", "email"
- Find prompts by content: "explain like"
- Combine with folder filter for precision

### ⭐ Favorites

**Why Use Favorites?**
- Instant access to your best prompts
- Displayed at the top of the popup
- Perfect for daily-use prompts

**How to Use:**
1. Click the ⭐ button on any prompt
2. Gold star = favorited
3. Click again to unfavorite
4. Favorites appear in dedicated section

### ⚡ Recently Used

**Automatic Tracking**
- Extension tracks when you use each prompt
- Shows last 5 used prompts
- Displays usage count (e.g., "15x")
- Shows time since last use

**Usage Analytics:**
- See "Used Xx" count on each prompt card
- Identify your most useful prompts
- Optimize your prompt library

### 🔤 Variable Substitution

**What Are Variables?**
Variables let you create reusable prompt templates with placeholders.

**Syntax:**
```
{{variableName}}
```

**Example:**
```
Please review this {{topic}} and explain it for a {{audience}} audience.
```

**How It Works:**
1. Create prompt with {{variable}} syntax
2. When you use the prompt, a modal appears
3. Fill in values for each variable
4. Extension replaces {{variables}} with your values
5. Final text is copied to clipboard

**Real-World Examples:**

**Code Review Template:**
```
Review this {{language}} code for:
- Bugs and errors
- Performance issues in {{framework}}
- Best practices for {{use_case}}
Provide specific improvements with examples.
```

**Email Template:**
```
Write a {{tone}} email to {{recipient}} about {{subject}}.
Key points to include: {{key_points}}
```

**Study Helper:**
```
Explain {{concept}} as if I'm a {{level}} student.
Use analogies related to {{interest}}.
Include 3 practice questions.
```

### 📁 Folders & Organization

**Creating Folders:**
1. Enter folder name in "Folders" section
2. Press Enter or click "+ Add Folder"
3. Folder appears immediately

**Folder Best Practices:**
- **By Category**: Work, Personal, Study, Code
- **By Platform**: ChatGPT, Claude, Gemini
- **By Function**: Debugging, Writing, Learning
- **By Project**: Project A, Project B

**Managing Folders:**
- Click X to delete (prompts move to "Uncategorized")
- Default folder can't be deleted
- Use folder filter to view specific folders

### ☑️ Bulk Operations

**Why Use Bulk Mode?**
- Move many prompts to different folders
- Delete multiple prompts at once
- Reorganize your library quickly

**How to Use:**
1. Click "Select Multiple" button
2. Checkboxes appear on all prompts
3. Select prompts you want to modify
4. Choose action:
   - **Move**: Select folder and click "Move Selected"
   - **Delete**: Click "Delete Selected"
5. Click "Cancel" to exit bulk mode

**Tips:**
- Use with folder filter to bulk-move categories
- Combine with search to bulk-delete old prompts
- Select count shows number selected

### 🗑️ Trash & Recovery

**Soft Delete System:**
- Deleted prompts go to Trash (not permanent)
- Trash keeps items until you manually delete them
- Restore anytime

**How to Use:**
1. Delete a prompt (moves to Trash automatically)
2. Open Trash section
3. Click "View Trash"
4. Options:
   - **Restore**: ↩️ Returns prompt to library
   - **Delete**: ❌ Permanently removes (cannot undo)

**Best Practices:**
- Check Trash before permanent deletion
- Keep Trash for emergency recovery
- Clean up Trash periodically

### 🕐 Version History

**Automatic Versioning:**
- Every edit creates a new version
- Previous versions are saved
- View full history anytime

**How It Works:**
1. Edit a prompt's text
2. Save changes
3. Version badge appears (e.g., "v3")
4. Click 🕐 (history) button to view all versions

**Version History Shows:**
- Current version
- All previous versions
- Timestamps for each edit
- Full text of each version

**Use Cases:**
- Revert to better previous version
- Track prompt evolution
- Compare changes over time

### 🔀 Drag & Drop Reordering

**Reorder Your Prompts:**
1. Hover over a prompt card
2. Grab the ⋮⋮ (drag handle) that appears
3. Drag to desired position
4. Drop to reorder
5. Changes save automatically

**Tips:**
- Put most-used prompts at top
- Group related prompts together
- Use with folder filtering for organization

---

## Organization

### Naming Conventions

**Prompt Names:**
- ✅ **Good**: "Code Review - Security Focus", "Email - Formal Proposal"
- ❌ **Bad**: "prompt1", "test", "aaa"

**Tips:**
- Be specific and descriptive
- Include key purpose
- Use prefixes for grouping
- Keep under 50 characters

### Folder Strategies

**Strategy 1: By Use Case**
```
📁 Code & Development
📁 Writing & Content
📁 Learning & Study
📁 Business & Email
```

**Strategy 2: By Platform**
```
📁 ChatGPT Optimized
📁 Claude Prompts
📁 General Purpose
```

**Strategy 3: By Frequency**
```
📁 Daily Use
📁 Weekly Use
📁 Occasional
📁 Archive
```

### Tagging with Names

Since there's no tag system yet, use naming conventions:
```
"[CODE] Review PR for security"
"[EMAIL] Follow-up template"
"[STUDY] Explain concept simply"
```

---

## Backup & Sharing

### 📥 Export (Backup)

**Manual Export:**
1. Click "📥 Export Prompts"
2. JSON file downloads automatically
3. File name: `llm-prompts-backup-YYYY-MM-DD.json`
4. Store safely (cloud storage recommended)

**What's Included:**
- All prompts
- All folders
- Version history
- Usage statistics
- Favorites status

### 🔄 Auto-Backup

**Enable Auto-Backup:**
1. Toggle "Auto-backup to Downloads folder"
2. Backups save automatically when you:
   - Add a prompt
   - Edit a prompt
   - Delete a prompt
   - Add/delete folders

**Backup Location:**
```
Downloads/LLM-Prompts-Backup/
```

**Pro Tip:**
Sync this folder with Dropbox, Google Drive, or OneDrive for automatic cloud backup!

### 📤 Import (Restore)

**From JSON File:**
1. Click "📤 Import Prompts"
2. Select backup JSON file
3. Choose import mode:
   - **Add**: Merges with existing prompts
   - **Replace**: Deletes current and imports new

**Import Options:**
- Maintains folder structure
- Preserves version history
- Keeps usage statistics

### 🔗 Share Prompts

**Share with Others:**
1. Click "🔗 Share Prompts"
2. Copy the generated share code
3. Send code to recipient
4. They click "📝 Import from Code"
5. Paste code and import

**What Gets Shared:**
- All your prompts
- Folder structure
- Prompt text only (no personal usage data)

**Privacy:**
- Share codes are Base64 encoded
- No server upload (local only)
- No tracking or analytics

---

## Tips & Best Practices

### Prompt Writing Tips

**Be Specific:**
❌ "Help me with code"
✅ "Review this Python function for bugs, performance issues, and suggest optimizations"

**Use Structure:**
```
Act as a [ROLE].
Your task is to [TASK].
Consider: [CRITERIA]
Output format: [FORMAT]
```

**Include Examples:**
```
Explain [concept].
Use analogies like:
- [Example 1]
- [Example 2]
```

### Organization Tips

1. **Start with 3-5 folders**: Don't over-organize initially
2. **Use favorites for daily prompts**: Star your top 5-10
3. **Review monthly**: Clean up, consolidate, improve
4. **Version control**: Edit instead of creating duplicates
5. **Backup weekly**: Export before major changes

### Performance Tips

1. **Use right-click menu**: Faster than opening popup
2. **Learn your favorites**: Memorize location in menu
3. **Use search**: Faster than scrolling
4. **Bulk operations**: Reorganize in batches
5. **Recently used**: Access last-used prompts instantly

### Workflow Integration

**Morning Routine:**
1. Check recently used
2. Star new valuable prompts
3. Review and improve based on usage

**Weekly Maintenance:**
1. Export backup
2. Clean up trash
3. Review low-usage prompts (keep or delete?)
4. Update frequently-used prompts

**Monthly Review:**
1. Analyze usage statistics
2. Consolidate similar prompts
3. Update folder structure
4. Share best prompts with team

---

## Keyboard Shortcuts

### Current Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Prompt | `Enter` in name field |
| Add Folder | `Enter` in folder field |
| Close Modal | `Esc` or click backdrop |
| Search | Click search box, start typing |

### Pro Tips

- **Tab Navigation**: Use Tab to move between fields
- **Enter to Submit**: Press Enter in input fields
- **Esc to Cancel**: Close modals without mouse

---

## Troubleshooting

### Extension Not Loading

**Solution:**
1. Go to `chrome://extensions/`
2. Find "LLM Prompt Manager"
3. Click refresh icon (🔄)
4. If error appears, click "Errors" button to see details

### Right-Click Menu Not Showing

**Solutions:**
1. **Refresh the webpage** after installing extension
2. **Check extension is enabled** in `chrome://extensions/`
3. **Try different website** (some block context menus)
4. **Reload extension** (refresh button)

### Prompts Not Syncing

**Chrome Sync Requirements:**
- Signed into Chrome with Google account
- Sync enabled in Chrome settings
- Check: `chrome://settings/syncSetup`

**Solution:**
1. Sign into Chrome
2. Enable "Extensions" in sync settings
3. Wait a few moments for sync

### Auto-Backup Not Working

**Check:**
1. Toggle is enabled (blue)
2. Downloads permission granted
3. Check `Downloads/LLM-Prompts-Backup/` folder

**Solution:**
- Disable and re-enable auto-backup toggle
- Try manual export first
- Check browser download settings

### Variables Not Working

**Common Issues:**
1. **Wrong syntax**: Use `{{variable}}` not `{variable}` or `$variable`
2. **Spaces in name**: Use `{{firstName}}` not `{{first name}}`
3. **Special characters**: Stick to letters, numbers, underscores

**Correct Examples:**
```
✅ {{topic}}
✅ {{user_name}}
✅ {{level1}}
❌ {topic}
❌ {{first name}}
❌ ${variable}
```

### Drag & Drop Not Working

**Solutions:**
1. **Exit bulk mode** (drag disabled in bulk mode)
2. **Hover to see handle** (⋮⋮ appears on hover)
3. **Grab the handle** not the card itself
4. **Try another prompt** to test

### Import Failed

**Common Issues:**
1. **Corrupted file**: Try downloading backup again
2. **Wrong format**: Ensure it's a JSON file from this extension
3. **Old version**: Update extension to latest version

**Solution:**
- Verify JSON file opens in text editor
- Check file starts with `{"exportDate":`
- Try sharing feature instead

---

## Advanced Use Cases

### Team Collaboration

**Scenario**: Share best prompts with team

**Solution:**
1. Curate your best prompts in specific folder
2. Export prompts
3. Share JSON file via Slack/email
4. Team members import
5. Everyone has same prompt library!

### Multi-Device Sync

**Scenario**: Use same prompts on work and home computers

**Solution 1: Chrome Sync** (Automatic)
- Sign into Chrome on both devices
- Enable Extensions sync
- Prompts sync automatically

**Solution 2: Cloud Backup** (Manual)
- Enable auto-backup
- Sync `Downloads/LLM-Prompts-Backup/` with cloud
- Import on second device

### Prompt Development Workflow

**Scenario**: Iterative prompt improvement

**Workflow:**
1. Create initial prompt
2. Use and test
3. Edit based on results (creates version)
4. Test new version
5. View history to compare
6. Keep best version

**Benefits:**
- Track what works
- Never lose good versions
- Learn what improves results

### Project-Specific Libraries

**Scenario**: Different prompts for different projects

**Solution:**
1. Create folder per project
2. Use folder filter when working
3. Export project folder as backup
4. Share with project teammates

---

## Frequently Asked Questions

### Is my data private?

**Yes!**
- All data stored locally in Chrome
- No external servers
- No analytics or tracking
- Chrome Sync is optional and uses Google's secure sync

### How many prompts can I store?

**Limit:**
- Chrome sync storage: ~100KB total
- Roughly 200-500 prompts depending on length
- Chrome shows warning if approaching limit

### Can I use on other browsers?

**Currently:**
- Chrome and Chromium-based browsers (Edge, Brave, Opera)
- Firefox: Would need port (manifest v3 compatibility)

### Can I export to other formats?

**Current:**
- JSON format only

**Workaround:**
- Open JSON in text editor
- Copy/paste prompts to:
  - Notion
  - Google Docs
  - Markdown files
  - etc.

### Will my prompts be deleted if I uninstall?

**Yes!**
- Uninstalling removes all local data
- **Always export before uninstalling**
- Consider enabling auto-backup

---

## Getting Help

### Resources

- **GitHub Issues**: Report bugs or request features
- **README.md**: Quick start guide
- **This Guide**: Comprehensive documentation

### Common Questions

**Q: How do I share with team?**
A: Use Export → send JSON file → team imports

**Q: Lost my prompts, can I recover?**
A: If auto-backup enabled, check `Downloads/LLM-Prompts-Backup/`

**Q: Can I use variables in variables?**
A: No, `{{var1_{{var2}}}}` won't work. Use simple names.

**Q: Why aren't my edits saving?**
A: Click "Save Changes" button in modal, don't just close it

---

## Appendix: Data Structure

### Storage Format

```json
{
  "prompts": [
    {
      "name": "Prompt Name",
      "text": "Prompt text here",
      "folderId": "folder_12345",
      "favorite": false,
      "usageCount": 5,
      "lastUsed": 1699999999999,
      "createdAt": 1699999999999,
      "history": [
        {
          "name": "Old Name",
          "text": "Old text",
          "timestamp": 1699999999999
        }
      ]
    }
  ],
  "folders": [
    {
      "id": "default",
      "name": "Uncategorized",
      "isDefault": true
    }
  ],
  "trash": [],
  "autoBackupEnabled": true
}
```

---

## Changelog

### Version 2.0 (Current)
- ✅ Search functionality
- ✅ Bulk operations
- ✅ Recently used tracking
- ✅ Favorites system
- ✅ Edit modal (no more browser prompts!)
- ✅ Variable substitution
- ✅ Trash/soft delete
- ✅ Drag & drop reordering
- ✅ Version history
- ✅ Share with codes
- ✅ Auto-backup
- ✅ Usage statistics

### Version 1.0
- Basic prompt management
- Folders
- Export/Import
- Right-click menu

---

## Quick Reference Card

### Essential Actions

| Want to... | Do this... |
|-----------|------------|
| Add prompt | Fill form → Add Prompt |
| Use prompt | Right-click → LLM Prompts → Select |
| Find prompt | Type in search box |
| Star favorite | Click ⭐ on prompt |
| Organize | Create folders, drag to reorder |
| Backup | Click 📥 Export or enable auto-backup |
| Share | Click 🔗 Share → Copy code |
| Bulk move | Select Multiple → Check items → Move |
| Edit prompt | Click ✏️ → Edit in modal → Save |
| View history | Click 🕐 on versioned prompts |
| Recover deleted | Open Trash → Restore |

---

**Made with ❤️ for LLM enthusiasts**

*Stop searching for prompts. Start managing them like a pro.*
