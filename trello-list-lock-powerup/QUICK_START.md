# ⚡ Quick Start Guide (5 Minutes)

## The Absolute Fastest Way to Lock Your List Titles

### Prerequisites
- A Trello account
- A Glitch account (free - sign up at https://glitch.com)

---

## Step 1: Get Trello Credentials (2 minutes)

1. Go to: **https://trello.com/app-key**
2. Copy your **API Key** → Save it
3. Click the **"Token"** link → Click **"Allow"**
4. Copy your **Token** → Save it

---

## Step 2: Deploy to Glitch (2 minutes)

### Option A: Remix This Project (Easiest)
1. Click: **[Remix on Glitch](https://glitch.com/edit/#!/remix/trello-list-lock)**
   *(If this link doesn't work, use Option B below)*

### Option B: Manual Upload
1. Go to: **https://glitch.com**
2. Click: **New Project** → **glitch-hello-node**
3. Delete all existing files
4. Drag and drop ALL files from this folder into Glitch

---

## Step 3: Configure (1 minute)

1. In Glitch, click **".env"** in the file list
2. Add these 3 lines (replace with YOUR values):

```
TRELLO_API_KEY=paste-your-api-key-here
TRELLO_TOKEN=paste-your-token-here
CALLBACK_URL=https://your-glitch-project-name.glitch.me
```

**To get your Glitch URL:** Look at the top of the Glitch window - it shows your project name. Your URL is: `https://project-name.glitch.me`

3. Click **"Show"** at the top to verify it's running

---

## Step 4: Add to Trello (30 seconds)

1. Go to: **https://trello.com/power-ups/admin**
2. Click: **"New Power-Up"**
3. Fill in:
   - **Name:** List Title Lock
   - **Workspace:** (select yours)
   - **Iframe connector URL:** `https://your-glitch-project.glitch.me/index.html`
4. Enable capabilities:
   - ✅ board-buttons
   - ✅ list-actions
   - ✅ list-badges
5. Click **"Create"**

---

## Step 5: Enable on Board (30 seconds)

1. Open your Trello board
2. Click **"Show Menu"** → **"Power-Ups"**
3. Search: **"List Title Lock"**
4. Click **"Add"** → **"Authorize"**

---

## Step 6: Lock Your Lists! (10 seconds each)

1. Click the **menu (···)** on any list
2. Click **"🔒 Lock List Title"**
3. Done! The list now has a 🔒 badge

---

## ✅ You're All Set!

Your list titles are now locked and protected.

### What's Locked?
- List titles cannot be renamed (without unlocking first)
- Butler Automations are safe from accidental breakage
- Team members see the 🔒 badge as a reminder

### Optional: Enable Auto-Revert

To automatically undo any rename attempts:

1. Get your Board ID from the URL: `https://trello.com/b/BOARD_ID/name`
2. Open browser console (press **F12**)
3. Paste this (replace YOUR-values):

```javascript
fetch('https://your-glitch-project.glitch.me/api/setup-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardId: 'your-board-id',
    callbackUrl: 'https://your-glitch-project.glitch.me'
  })
}).then(r => r.json()).then(console.log);
```

4. Press **Enter**
5. Look for `"success": true`

**Now locked lists automatically revert if renamed!**

---

## 🎯 Test It

1. Lock a test list
2. Try to rename it
3. If auto-revert is enabled: Name changes back within seconds ✅
4. If not enabled: You see the 🔒 badge as a reminder

---

## 🆘 Troubleshooting

### Power-Up won't load?
- Check that your Glitch project is running (click "Show")
- Verify the iframe URL matches your Glitch URL exactly

### Lock button doesn't appear?
- Refresh your Trello board
- Make sure the Power-Up is enabled (check Power-Ups menu)

### Auto-revert not working?
- Check Glitch logs for errors
- Verify your webhook setup command succeeded
- Make sure .env values are correct

---

## 🎉 Done!

Your lists are now locked and your Butler Automations are safe!

**Need more details?** See the full [README.md](README.md)

**Having issues?** Check the [Troubleshooting section](README.md#-troubleshooting) in the main README
