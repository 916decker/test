# 📁 Document Management & LLM Productivity Tools

A complete toolkit for organizing your business documents and supercharging your LLM workflow.

## 🎯 What This Includes

### 1. 📁 Google Drive Document Management System
Automatically creates a professional folder structure in your Google Drive to organize:
- AI Processes & Workflows
- Business Processes & SOPs
- Business Assets (Brand, Templates, Media)
- Knowledge Base & Documentation
- Important Information & Strategic Planning
- Archive for completed projects

### 2. 🤖 LLM Prompt Manager Chrome Extension
Never lose your favorite prompts again! Quick-access Chrome extension for:
- Save your most-used LLM prompts
- Right-click menu for instant access
- Copy prompts with one click
- Auto-insert into text fields
- Works with Claude, ChatGPT, and any LLM tool

## 📦 What's Included

| File/Folder | Description |
|------|-------------|
| `create_drive_structure.py` | Python script that creates the entire folder structure |
| `requirements.txt` | Required Python packages |
| `SETUP_INSTRUCTIONS.md` | Step-by-step guide (beginner-friendly) |
| `FOLDER_STRUCTURE.md` | Visual map of the folder hierarchy |
| `ORGANIZATIONAL_GUIDE.md` | Complete guide for using and maintaining the system |
| `chrome-extension/` | **NEW!** Chrome extension for managing LLM prompts |

## ⚡ Quick Start

### 🤖 Chrome Extension (Recommended to install first!)

**Perfect if you use LLMs regularly and want instant access to your prompts**

1. Open the `chrome-extension/` folder
2. Follow the instructions in `chrome-extension/README.md`
3. Takes 2 minutes to install
4. Start saving your prompts immediately

👉 **Full guide**: [chrome-extension/README.md](chrome-extension/README.md)

### 📁 Google Drive Setup

**Perfect if you need to organize your business documents**

#### Option 1: Run the Automated Script (Recommended)

1. **Install Python** (if you don't have it)
   - Download from https://python.org/downloads/

2. **Get Google Drive API Credentials**
   - Follow the detailed steps in `SETUP_INSTRUCTIONS.md`

3. **Run the script**
   ```bash
   pip install -r requirements.txt
   python create_drive_structure.py
   ```

4. **Done!** Your folder structure is created in Google Drive

#### Option 2: Manual Setup

1. Open `FOLDER_STRUCTURE.md`
2. Manually create folders in Google Drive following the structure
3. Takes about 15 minutes

## 📚 Documentation

### For Setup
👉 **Start here**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- Complete step-by-step guide
- Non-technical, beginner-friendly
- Troubleshooting included

### For Understanding the Structure
👉 **Read this**: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)
- Visual folder hierarchy
- Naming conventions
- Access permissions guide

### For Daily Use
👉 **Reference this**: [ORGANIZATIONAL_GUIDE.md](ORGANIZATIONAL_GUIDE.md)
- How to organize documents
- Team workflows
- Best practices
- Maintenance schedules

## 🎨 Features

### Folder Organization
- 6 main categories with logical subcategories
- Numbered folders to maintain order
- Department-based structure
- Archive system for completed work

### Naming Conventions
- Standardized file naming: `YYYY-MM-DD_Category_Description_v#.ext`
- Version control built-in
- Easy to search and sort

### Permission System
- Role-based access (Admin, Editor, Viewer)
- Department-based permissions
- Secure document sharing

### Tagging & Color Coding
- Color-coded folders by status
- Hashtag system for searchability
- Star important documents

### Document Lifecycle
- Draft → Review → Approved → Active → Archive
- Clear status tracking
- Version management

## 🏢 Perfect For

- Small teams (2-10 people)
- Growing businesses
- Remote teams
- Teams with multiple processes
- AI-focused companies
- Knowledge-intensive businesses

## 🔐 Security

- OAuth 2.0 authentication with Google
- No passwords stored
- Credentials kept locally
- Role-based access control
- Audit trail via Google Drive

## 🛠️ Technical Details

**Requirements:**
- Python 3.7+
- Google account
- Internet connection

**Dependencies:**
- google-auth
- google-auth-oauthlib
- google-auth-httplib2
- google-api-python-client

**Platforms:**
- Windows
- macOS
- Linux

## 📖 How to Use

### After Setup

1. **Upload documents** to appropriate folders
2. **Apply naming conventions** to all files
3. **Set up permissions** for team members
4. **Share the guides** with your team
5. **Start using** the system for all new documents

### Maintenance

- **Daily**: Save new docs in correct folders
- **Weekly**: Review and organize
- **Monthly**: Archive old documents
- **Quarterly**: Full audit and cleanup

## 🎓 Learning Resources

### Getting Started (Read First)
1. `SETUP_INSTRUCTIONS.md` - Set up the system
2. `FOLDER_STRUCTURE.md` - Understand the structure
3. `ORGANIZATIONAL_GUIDE.md` - Learn best practices

### Reference (Keep Handy)
- Naming conventions guide
- Permission matrix
- Search operators
- Troubleshooting section

### Team Onboarding
Share these in order:
1. Visual tour of folder structure
2. Naming conventions
3. Document lifecycle
4. Team workflows

## 🚀 Roadmap

### Google Drive System
- [ ] Integration with Slack notifications
- [ ] Automated archival based on dates
- [ ] Dashboard for document statistics
- [ ] Templates library expansion
- [ ] AI-powered document categorization
- [ ] Automated duplicate detection

### Chrome Extension
- [x] Right-click context menu
- [x] Add, edit, delete prompts
- [x] Copy to clipboard
- [x] Auto-insert into text fields
- [ ] Organize prompts into folders
- [ ] Search prompts
- [ ] Import/export prompt collections
- [ ] Keyboard shortcuts
- [ ] Tag system

## 🤝 Contributing

This is designed to be customized for your team!

**To customize:**
1. Edit `create_drive_structure.py` to change folder structure
2. Update `FOLDER_STRUCTURE.md` with your changes
3. Modify naming conventions in `ORGANIZATIONAL_GUIDE.md`
4. Run the script to create your custom structure

## 📝 License

This is an open template - use it however works best for your team!

## 💡 Tips for Success

1. **Start simple** - Don't try to organize everything on day 1
2. **Be consistent** - Follow naming conventions from the start
3. **Get buy-in** - Make sure the team understands why this matters
4. **Iterate** - The system should evolve with your team
5. **Celebrate wins** - When someone finds a doc quickly, acknowledge it!

## 🆘 Troubleshooting

**Script won't run?**
- Check that Python is installed
- Verify all files are in same folder
- Make sure credentials.json is present

**Can't authenticate?**
- Follow Google Cloud setup steps carefully
- Check that Drive API is enabled
- Try deleting token.pickle and re-authenticating

**Folders not created?**
- Check your internet connection
- Verify you granted permissions
- Look for error messages in terminal

**More help**: See detailed troubleshooting in `SETUP_INSTRUCTIONS.md`

## 📧 Support

For issues with:
- **Setup**: Check `SETUP_INSTRUCTIONS.md`
- **Organization**: Check `ORGANIZATIONAL_GUIDE.md`
- **Structure**: Check `FOLDER_STRUCTURE.md`
- **Script errors**: Check error message and troubleshooting section

## 🎉 Success Metrics

After 30 days, you should see:
- ✅ Zero "where is that file?" questions
- ✅ Faster onboarding for new team members
- ✅ No lost documents
- ✅ Easier collaboration
- ✅ Better knowledge preservation

---

**Created**: 2025-11-01
**Version**: 1.0
**Status**: Ready to use

**Get Started**: Open `SETUP_INSTRUCTIONS.md` and follow the steps!
