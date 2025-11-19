# 🔒 Trello List Title Lock Power-Up

**Stop Butler Automations from Breaking!**

This Trello Power-Up prevents accidental list name changes that break your Butler Automations. Lock your list titles with a simple checkbox, and they can't be renamed until unlocked.

## 🎯 Why You Need This

If you use Trello's Butler Automations, you know the pain:
- Someone renames "To Do" to "Todo" → ❌ Automation breaks
- Someone changes "In Progress" to "In-Progress" → ❌ Automation breaks
- Someone updates "Done" to "Completed" → ❌ Automation breaks

**This Power-Up solves that problem.**

## ✨ Features

- 🔒 **Lock any list title** with one click
- 🔓 **Unlock when needed** for legitimate changes
- 🛡️ **Auto-revert** unauthorized changes (with webhook server)
- 🎯 **No coding required** - simple checkbox interface
- 👀 **Visual badges** show which lists are locked
- ⚡ **Works with Butler** - protects your automations

## 🚀 Quick Start (2 Options)

### Option 1: Basic Mode (No Server) ⭐ Easiest

Perfect if you want visual indicators and team reminders.

1. **Host the Power-Up files online** (use Glitch - instructions below)
2. **Add to your Trello board** (instructions below)
3. **Lock your lists** from the list menu (···)

**What you get:**
- ✅ Visual 🔒 badges on locked lists
- ✅ Team members see lock status
- ✅ Requires unlock before editing
- ⚠️ Relies on team awareness (no automatic reversion)

### Option 2: Full Protection (With Webhook Server) 🔐 Most Secure

Automatically reverts any unauthorized list name changes.

1. **Deploy the webhook server** (use Glitch - instructions below)
2. **Set up Trello webhooks** (one command - instructions below)
3. **Lock your lists** from the list menu (···)

**What you get:**
- ✅ Everything from Basic Mode
- ✅ **Automatic reversion** of name changes
- ✅ **Real enforcement** - changes get undone immediately
- ✅ **Foolproof protection** for Butler Automations

---

## 📋 Detailed Setup Instructions

### Step 1: Get Your Trello API Credentials

#### 1.1 Get Your API Key
1. Go to: https://trello.com/app-key
2. Log in to Trello if asked
3. Copy your **API Key** (save it somewhere - you'll need it soon)

#### 1.2 Get Your Token
1. On the same page, scroll down to "Token"
2. Click the green **"Token"** link
3. Click **"Allow"**
4. Copy your **Token** (save it with your API key)

### Step 2: Deploy to Glitch (Free Hosting)

#### 2.1 Create a Glitch Project
1. Go to: https://glitch.com
2. Click **"New Project"** → **"Import from GitHub"**
3. Or click **"New Project"** → **"glitch-hello-node"**

#### 2.2 Upload Your Files
1. In Glitch, delete all existing files
2. Upload these files from this folder:
   - `server.js`
   - `client.js`
   - `index.html`
   - `info.html`
   - `manifest.json`
   - `package.json`
   - `.env.example`

#### 2.3 Configure Environment Variables
1. In Glitch, click **".env"** in the file list
2. Add these variables (replace with your actual values):

```
TRELLO_API_KEY=your-api-key-from-step-1.1
TRELLO_TOKEN=your-token-from-step-1.2
CALLBACK_URL=https://your-project-name.glitch.me
```

**To find your Glitch URL:**
- Look at the top of Glitch - it shows your project name
- Your URL is: `https://your-project-name.glitch.me`

#### 2.4 Start the Server
1. Glitch will auto-start your server
2. Click **"Show"** → **"In a New Window"**
3. You should see: "List Lock Power-Up server running"

### Step 3: Register Your Power-Up with Trello

#### 3.1 Create a Power-Up
1. Go to: https://trello.com/power-ups/admin
2. Click **"New Power-Up"**
3. Fill in:
   - **Name:** List Title Lock
   - **Workspace:** Choose your workspace
   - **Iframe connector URL:** `https://your-project-name.glitch.me/index.html`
   - **Email:** Your email
   - **Support contact:** Your email
   - **Author:** Your name

4. Click **"Create"**

#### 3.2 Configure Capabilities
1. In the Power-Up settings, enable these capabilities:
   - ✅ **board-buttons**
   - ✅ **list-actions**
   - ✅ **list-badges**

2. Set the **App Key** in `manifest.json`:
   - Copy your Power-Up ID from the URL
   - Edit `manifest.json` in Glitch
   - Replace `your-app-key-here` with your Power-Up ID

3. Click **"Save"**

### Step 4: Add Power-Up to Your Board

1. Open your Trello board
2. Click **"Show Menu"** (top right)
3. Click **"Power-Ups"**
4. Search for **"List Title Lock"** (or find it under "Custom")
5. Click **"Add"**
6. Authorize the Power-Up

### Step 5: Set Up Webhooks (For Auto-Revert)

#### Option A: Automatic Setup (Recommended)
1. Open your browser console (F12)
2. Run this command (replace with your values):

```javascript
fetch('https://your-project-name.glitch.me/api/setup-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardId: 'your-board-id',
    callbackUrl: 'https://your-project-name.glitch.me'
  })
}).then(r => r.json()).then(console.log);
```

**To find your Board ID:**
- Open your Trello board
- Look at the URL: `https://trello.com/b/BOARD_ID/board-name`
- Copy the part after `/b/` and before the next `/`

#### Option B: Manual Setup
1. Go to: https://trello.com/app-key (you should still be logged in)
2. Scroll to "Token" and click to generate a new token (or use your existing one)
3. Use this URL (replace the values):

```
https://api.trello.com/1/webhooks?key=YOUR_API_KEY&token=YOUR_TOKEN&callbackURL=https://your-project-name.glitch.me/webhook&idModel=YOUR_BOARD_ID&description=List%20Title%20Lock
```

4. Visit that URL in your browser - you should see a success message

---

## 🎮 How to Use

### Locking a List
1. Click the list menu (**···**) on any list
2. Click **"🔒 Lock List Title"**
3. Done! The list now shows a 🔒 badge

### Unlocking a List
1. Click the list menu (**···**) on a locked list
2. Click **"🔓 Unlock List Title"**
3. Now you can rename the list

### What Happens When Locked

**Basic Mode (No Server):**
- List shows 🔒 badge
- Team sees it's locked
- Reminder to unlock before editing

**Full Protection Mode (With Server):**
- List shows 🔒 badge
- If someone renames it, the name **automatically reverts** within seconds
- Butler Automations stay safe! ✅

---

## 🔧 Troubleshooting

### Power-Up won't load
- ✅ Check that all files are uploaded to Glitch
- ✅ Make sure your Glitch project is running (click "Show")
- ✅ Verify the iframe URL in Power-Up settings matches your Glitch URL

### Locks don't appear
- ✅ Refresh your Trello board
- ✅ Check browser console for errors (F12)
- ✅ Make sure the Power-Up is enabled on your board

### Auto-revert not working
- ✅ Verify webhook is set up (check Step 5)
- ✅ Check Glitch logs for errors (click "Logs" button)
- ✅ Ensure TRELLO_API_KEY and TRELLO_TOKEN are correct in .env
- ✅ Make sure CALLBACK_URL matches your Glitch URL

### "Unauthorized" errors
- ✅ Re-generate your Trello token (it may have expired)
- ✅ Update TRELLO_TOKEN in Glitch .env
- ✅ Restart your Glitch project

---

## 📊 Alternative Deployment Options

### Replit (Alternative to Glitch)
1. Go to: https://replit.com
2. Create a new Node.js Repl
3. Upload files
4. Add secrets (Environment variables)
5. Run the server
6. Use the provided URL for your Power-Up

### Render (More Robust)
1. Go to: https://render.com
2. Create a new Web Service
3. Connect your GitHub repo
4. Set environment variables
5. Deploy
6. Use the provided URL for your Power-Up

### Your Own Server
1. Clone this repository
2. Install dependencies: `npm install`
3. Set environment variables in `.env`
4. Run: `npm start`
5. Use your server's public URL for the Power-Up

---

## 🎯 Best Practices

### Which Lists Should You Lock?

Lock any list that's used in:
- ✅ Butler automation triggers
- ✅ Butler automation actions
- ✅ API integrations
- ✅ External tools that reference list names
- ✅ Critical workflows

### When to Unlock

Only unlock when you need to:
- Legitimately rename a list
- Fix a typo in the original name
- Reorganize your board structure

**Pro Tip:** After renaming, immediately re-lock the list!

### Team Communication

1. **Announce locked lists** to your team
2. **Explain why** they're locked (Butler Automations)
3. **Designate one person** to manage locks (board admin)
4. **Document** which lists are critical (in board description)

---

## 🔐 Security & Privacy

- ✅ All data stays in your Trello account
- ✅ No external database used
- ✅ API credentials never shared
- ✅ Open source - you can audit the code
- ✅ Self-hosted - you control everything

---

## 💡 Pro Tips

1. **Lock immediately** after creating automation-critical lists
2. **Use consistent naming** for automation lists (e.g., "To Do", not "TODO" or "To-Do")
3. **Document your automations** so team knows which lists are critical
4. **Test your setup** by locking a test list and trying to rename it
5. **Keep your Glitch project active** (visit it monthly to prevent sleep mode)

---

## 📚 How It Works

### Technical Overview (For the Curious)

1. **Power-Up Frontend** (client.js):
   - Adds lock/unlock options to list menus
   - Stores lock status in Trello's pluginData storage
   - Shows visual badges on locked lists

2. **Webhook Server** (server.js):
   - Listens for Trello board updates
   - Checks if renamed list is locked
   - Automatically reverts unauthorized changes
   - Runs on Express.js (Node.js)

3. **Data Storage**:
   - Lock status: Stored in Trello's pluginData (per-list)
   - Original names: Stored with lock status
   - No external database needed

---

## 🆘 Need Help?

### Common Questions

**Q: Will this lock prevent me from moving cards?**
A: No! It only locks the list **title**. You can still add, move, and edit cards normally.

**Q: Can I lock some lists but not others?**
A: Yes! Each list has its own lock setting. Lock only the ones you need.

**Q: What if I lose access to unlock?**
A: Board admins can always unlock lists from the Power-Up settings.

**Q: Does this work with free Trello accounts?**
A: Yes! This works with all Trello account types.

**Q: Is this safe for production/business use?**
A: Yes! The code is simple, transparent, and follows Trello's best practices.

### Still Need Help?

1. Check the troubleshooting section above
2. Review your Glitch logs for error messages
3. Verify all setup steps were completed
4. Check that your API credentials are correct

---

## 🎉 Success Checklist

After setup, verify everything works:

- [ ] Power-Up appears in your board's Power-Ups menu
- [ ] List menus show "🔒 Lock List Title" option
- [ ] Locking a list shows 🔒 badge
- [ ] Info popup shows correct lock count
- [ ] Webhook server is running (if using full protection)
- [ ] Renaming a locked list auto-reverts (with server)
- [ ] Butler Automations work reliably

---

## 📝 Files in This Package

| File | Description |
|------|-------------|
| `README.md` | This file - complete setup guide |
| `server.js` | Webhook server for auto-revert (optional) |
| `client.js` | Power-Up frontend logic |
| `index.html` | Power-Up main interface |
| `info.html` | Lock status popup |
| `manifest.json` | Power-Up configuration |
| `package.json` | Node.js dependencies |
| `.env.example` | Environment variables template |
| `glitch.json` | Glitch deployment config |

---

## 🚀 Roadmap

**Potential future enhancements:**
- [ ] Permission-based unlocking (require password)
- [ ] Batch lock/unlock all lists
- [ ] Export/import lock configurations
- [ ] Slack notifications when locks change
- [ ] Admin dashboard for lock management
- [ ] Lock templates for common workflows

---

## 📜 License

MIT License - Use this freely for personal or commercial projects!

---

## 🙏 Acknowledgments

Built to solve the #1 frustration with Trello Butler Automations: lists getting renamed and breaking everything.

**Enjoy unbreakable automations!** 🎉

---

**Version:** 1.0.0
**Last Updated:** 2024-11-19
**Status:** ✅ Ready to use

**Get Started:** Jump to [Step 1: Get Your Trello API Credentials](#step-1-get-your-trello-api-credentials)
