# 📱 Complete Trello Deployment Guide
## Step-by-Step: From Zero to Locked Lists (Including Mobile Protection)

This guide walks you through EVERY step needed to deploy the List Title Lock Power-Up to Trello, including full mobile app protection.

---

## 🎯 What You'll Accomplish

By the end of this guide:
- ✅ Power-Up deployed and hosted (free)
- ✅ Power-Up registered with Trello
- ✅ Power-Up installed on your board
- ✅ Lists locked and protected on desktop **AND mobile**
- ✅ Automatic revert of any rename attempts (even from mobile)

**Time Required:** 15-20 minutes

---

## 📋 Prerequisites

Before you start, make sure you have:
- [ ] A Trello account (free or paid - both work)
- [ ] Board admin access (for the board you want to protect)
- [ ] A web browser (Chrome, Firefox, Safari, Edge)
- [ ] Basic ability to copy/paste text

**No coding knowledge required!**

---

# Part 1: Get Your Trello API Credentials

## Step 1.1: Get Your API Key

1. **Open your web browser**
2. **Go to:** https://trello.com/app-key
3. **Log in** to Trello if prompted
4. **Copy your API Key** - it's the long string in the yellow box at the top
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
5. **Save it somewhere safe** - open Notepad/TextEdit and paste it there

**Screenshot reference:**
```
┌─────────────────────────────────────┐
│ Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 │  ← Copy this
└─────────────────────────────────────┘
```

## Step 1.2: Get Your Token

1. **On the same page** (https://trello.com/app-key)
2. **Scroll down** to the "Token" section
3. **Click the green "Token" link** (manually generate Token)
4. **Click "Allow"** to authorize
5. **Copy the token** that appears
   - It's much longer than the API key (64 characters)
   - It looks like: `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4a3a2a1a0a9a8a7a6`
6. **Save it** with your API Key in Notepad/TextEdit

**Important:** Keep these safe! Anyone with these can access your Trello account.

---

# Part 2: Deploy to Glitch (Free Hosting)

## Step 2.1: Create a Glitch Account

1. **Go to:** https://glitch.com
2. **Click "Sign In"** in the top right
3. **Choose one:**
   - Sign in with GitHub
   - Sign in with Facebook
   - Sign in with email
4. **Verify your email** if required

## Step 2.2: Create Your Project

1. **Click "New Project"** (big button on the right)
2. **Select:** "glitch-hello-node"
3. **Wait** for the project to load (5-10 seconds)
4. You'll see a code editor with files on the left

## Step 2.3: Clear Out Default Files

1. **Click on each file** in the left sidebar and delete it:
   - Click `server.js` → Click "Delete this file" at bottom
   - Click `package.json` → Click "Delete this file" at bottom
   - Do this for ALL files you see

2. **When done**, your project should have NO files (empty)

## Step 2.4: Upload Your Power-Up Files

1. **Download the Power-Up files** from this repository
2. **In Glitch**, create a folder called `public` first
3. **Upload these files to the ROOT** of your Glitch project:
   - `server.js`
   - `manifest.json`
   - `package.json`
   - `glitch.json`
4. **Upload these files INSIDE the `public/` folder:**
   - `public/client.js`
   - `public/index.html`
   - `public/info.html`

5. **Wait** for files to upload (you'll see them appear on the left)

**Important:** The `public/` folder holds the files Trello loads. The server code stays in the root so it's not exposed publicly.

## Step 2.5: Configure Environment Variables

1. **Click ".env"** in the file list (or create it if it doesn't exist)
2. **Delete** any existing content
3. **Paste this** (we'll fill in the values next):

```
TRELLO_API_KEY=
TRELLO_TOKEN=
CALLBACK_URL=
TRELLO_PLUGIN_ID=
```

4. **Fill in your values:**

```
TRELLO_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TRELLO_TOKEN=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4a3a2a1a0a9a8a7a6
CALLBACK_URL=https://YOUR-PROJECT-NAME.glitch.me
TRELLO_PLUGIN_ID=
```

5. **For CALLBACK_URL:**
   - Look at the top of the Glitch window
   - You'll see your project name (e.g., "aromatic-substantial-brain")
   - Your URL is: `https://aromatic-substantial-brain.glitch.me`
   - Replace "YOUR-PROJECT-NAME" with your actual project name

6. **For TRELLO_PLUGIN_ID (fill this in after Step 3):**
   - You'll get this after creating your Power-Up in Step 3
   - It's in the URL: `https://trello.com/power-ups/PLUGIN_ID/edit`
   - Come back and fill it in after Step 3.4

**Example complete .env file:**
```
TRELLO_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TRELLO_TOKEN=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4a3a2a1a0a9a8a7a6
CALLBACK_URL=https://aromatic-substantial-brain.glitch.me
TRELLO_PLUGIN_ID=507f1f77bcf86cd799439011
```

## Step 2.6: Test Your Deployment

1. **Click "Show"** at the top → **"In a New Window"**
2. **You should see:**
   - "List Lock Power-Up server running"
   - Your API key (partially hidden)
   - Webhook endpoint URL

3. **If you see errors:**
   - Check that all files are uploaded
   - Check that .env values are correct (no extra spaces)
   - Click "Logs" button to see error details

4. **Copy your Glitch URL** (you'll need it in the next steps)
   - Example: `https://aromatic-substantial-brain.glitch.me`

---

# Part 3: Register Your Power-Up with Trello

## Step 3.1: Go to Power-Up Admin

1. **Go to:** https://trello.com/power-ups/admin
2. **Log in** to Trello if needed
3. **You'll see:** "Create new Power-Up" button

## Step 3.2: Create Your Power-Up

1. **Click "New"** or **"Create new Power-Up"**

2. **Fill in the form:**

| Field | What to Enter | Example |
|-------|---------------|---------|
| **Name** | List Title Lock | List Title Lock |
| **Workspace** | Select YOUR workspace | My Workspace |
| **Iframe connector URL** | Your Glitch URL + `/index.html` | https://aromatic-substantial-brain.glitch.me/index.html |
| **Email** | Your email address | you@example.com |
| **Support contact** | Your email address | you@example.com |
| **Author** | Your name or company | John Doe |

3. **Example filled form:**
```
Name: List Title Lock
Workspace: My Workspace
Iframe connector URL: https://aromatic-substantial-brain.glitch.me/index.html
Email: john@example.com
Support contact: john@example.com
Author: John Doe
```

4. **Click "Create"** at the bottom

## Step 3.3: Configure Capabilities

After creating, you'll be on the Power-Up settings page.

1. **Scroll down to "Capabilities"**

2. **Enable these capabilities** (check the boxes):
   - ✅ `board-buttons`
   - ✅ `list-actions`
   - ✅ `list-badges`
   - ✅ `authorization-status`
   - ✅ `show-authorization`

3. **Leave everything else unchecked**

4. **Click "Save"** at the bottom

## Step 3.4: Note Your Power-Up ID (Important!)

1. **Look at the URL** in your browser
   - It looks like: `https://trello.com/power-ups/POWER_UP_ID/edit`
2. **Copy the POWER_UP_ID** from the URL
   - Example: `507f1f77bcf86cd799439011`
3. **Save it** - you'll need it for the manifest.json

## Step 3.5: Update Manifest File

1. **Go back to Glitch**
2. **Click on `manifest.json`**
3. **Find this line:**
   ```json
   "author": "Your Name",
   ```
4. **Change "Your Name"** to your actual name
5. **The file should look like this:**
   ```json
   {
     "name": "List Title Lock",
     "details": "Lock your Trello list titles to prevent accidental changes that break Butler Automations",
     "icon": {
       "url": "https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Flock-icon.png?1523016259068"
     },
     "author": "John Doe",
     "capabilities": [
       "board-buttons",
       "list-actions",
       "list-badges",
       "authorization-status",
       "show-authorization"
     ],
     "connectors": {
       "iframe": {
         "url": "./index.html"
       }
     }
   }
   ```

6. **Glitch auto-saves** - no need to click save

---

# Part 4: Enable on Your Board

## Step 4.1: Open Your Trello Board

1. **Go to Trello:** https://trello.com
2. **Open the board** you want to protect
3. **Make sure you're a board admin** (check under "Show Menu" → "More" → "Board Settings")

## Step 4.2: Add the Power-Up

1. **Click "Show Menu"** (top right corner)
2. **Click "Power-Ups"**
3. **Scroll down** to find your Power-Up
   - It might be under "Custom" section
   - Look for "List Title Lock"

4. **Click "Add"** next to your Power-Up

5. **Click "Authorize"** when prompted
   - This gives the Power-Up permission to work

6. **You should see:** "List Title Lock" appears in your enabled Power-Ups list

## Step 4.3: Verify It's Working

1. **Click any list menu (···)** on your board
2. **You should see:** "🔒 Lock List Title" option in the menu
3. **If you see this** → Success! The Power-Up is working!

4. **If you DON'T see it:**
   - Refresh the page
   - Check that the Power-Up is enabled (step 4.2)
   - Check Glitch is still running (go to your Glitch project, click "Show")
   - Check browser console for errors (press F12)

---

# Part 5: Set Up Webhooks (Mobile Protection)

**This step is CRITICAL for mobile app protection!**

Without webhooks, the Power-Up only works in the web interface. With webhooks, list names are protected even when someone uses the mobile app.

## Step 5.1: Get Your Board ID

1. **Open your Trello board** in a web browser
2. **Look at the URL** in the address bar
   - Example: `https://trello.com/b/AbCd1234/my-board-name`
3. **Copy the part after `/b/` and before the next `/`**
   - In the example above: `AbCd1234`
4. **Save it** - this is your Board ID

**Visual guide:**
```
https://trello.com/b/AbCd1234/my-board-name
                     ^^^^^^^^
                     This is your Board ID
```

## Step 5.2: Set Up the Webhook (Easy Method)

1. **Open your browser console:**
   - **Chrome/Edge:** Press F12 or Ctrl+Shift+J (Windows) / Cmd+Option+J (Mac)
   - **Firefox:** Press F12 or Ctrl+Shift+K (Windows) / Cmd+Option+K (Mac)
   - **Safari:** Enable Developer menu first, then Cmd+Option+C

2. **Click the "Console" tab** (if not already selected)

3. **Copy this code** and replace the values:

```javascript
fetch('https://YOUR-GLITCH-PROJECT.glitch.me/api/setup-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardId: 'YOUR-BOARD-ID',
    callbackUrl: 'https://YOUR-GLITCH-PROJECT.glitch.me'
  })
}).then(r => r.json()).then(data => {
  console.log('Webhook setup result:', data);
  if (data.success) {
    console.log('✅ SUCCESS! Mobile protection is now active!');
  } else {
    console.error('❌ ERROR:', data.message);
  }
});
```

4. **Replace these values:**
   - `YOUR-GLITCH-PROJECT` → Your actual Glitch project name (2 places)
   - `YOUR-BOARD-ID` → Your Board ID from Step 5.1

5. **Example with real values:**
```javascript
fetch('https://aromatic-substantial-brain.glitch.me/api/setup-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    boardId: 'AbCd1234',
    callbackUrl: 'https://aromatic-substantial-brain.glitch.me'
  })
}).then(r => r.json()).then(data => {
  console.log('Webhook setup result:', data);
  if (data.success) {
    console.log('✅ SUCCESS! Mobile protection is now active!');
  } else {
    console.error('❌ ERROR:', data.message);
  }
});
```

6. **Paste into the console** and press Enter

7. **You should see:**
   ```
   Webhook setup result: {success: true, webhook: {...}}
   ✅ SUCCESS! Mobile protection is now active!
   ```

8. **If you see an error:**
   - Check that Glitch is running
   - Verify your .env variables are correct
   - Make sure Board ID is correct
   - Check Glitch logs for details

## Step 5.3: Verify Webhook is Active

1. **In the console**, run this command (replace with your values):

```javascript
fetch('https://YOUR-GLITCH-PROJECT.glitch.me/health')
  .then(r => r.json())
  .then(data => console.log('Server status:', data));
```

2. **You should see:**
   ```
   Server status: {status: 'healthy', service: 'Trello List Lock Power-Up', timestamp: '...'}
   ```

3. **This means:** Your webhook server is running and ready to protect your lists!

---

# Part 6: Lock Your Lists

## Step 6.1: Lock Your First List

1. **Go to your Trello board**
2. **Choose a list** you want to lock (start with a test list if you want)
3. **Click the list menu (···)** in the top right of the list
4. **Click "🔒 Lock List Title"**
5. **You'll see:** A success message popup
6. **Look at the list:** It now has a **🔒 badge** next to the title

**Congratulations!** Your first list is locked!

## Step 6.2: Lock All Critical Lists

**Which lists should you lock?**

Lock any list that's used in:
- ✅ Butler automation "when" triggers (e.g., "when a card is moved to Done")
- ✅ Butler automation "then" actions (e.g., "move the card to Archive")
- ✅ Email-to-board addresses (list-specific emails)
- ✅ Any external integrations that reference the list name
- ✅ Critical workflow lists (like "To Do", "In Progress", "Done")

**How to identify them:**
1. Click "Automation" (top right)
2. Click "Rules" to see your automations
3. Note which lists are mentioned in the rules
4. Lock those lists!

**Pro tip:** Lock them NOW before you forget!

---

# Part 7: Test Mobile Protection

**This is the important part - make sure mobile is protected!**

## Step 7.1: Test on Desktop First

1. **Lock a test list** (follow Step 6.1)
2. **Try to rename it:**
   - Click the list title
   - Try to edit the name
   - Type a new name
3. **Within 2-3 seconds**, the name should **revert back** to the original
4. **You should see** the name change back automatically

**If this works** → Your webhook protection is active! ✅

## Step 7.2: Test on Mobile App

1. **Install Trello mobile app** (if you haven't already)
   - **iOS:** App Store → "Trello"
   - **Android:** Play Store → "Trello"

2. **Open your board** in the app

3. **Find a locked list** (one with a 🔒 badge)

4. **Try to rename it:**
   - Tap the list title
   - Edit the name
   - Save the change

5. **Watch what happens:**
   - The change might appear to save
   - But within 5-10 seconds, the name will **revert back** to the original
   - This is the webhook protection working!

6. **Refresh the board:**
   - Pull down to refresh
   - The list title is back to the original locked name ✅

**This confirms:** Mobile protection is working! Even if someone renames a list from the mobile app, it automatically reverts.

## Step 7.3: Test Unlocking

1. **On desktop**, open your board
2. **Click the list menu (···)** on a locked list
3. **Click "🔓 Unlock List Title"**
4. **The 🔒 badge disappears**
5. **Now try renaming** - it should work!
6. **Lock it again** when done

---

# Part 8: Team Rollout

## Step 8.1: Announce to Your Team

Send this message to your team:

```
📢 Important Update: List Title Protection

We've added a new Power-Up to protect our Trello board from accidental list renames that break Butler Automations.

What you need to know:
- Lists with a 🔒 badge are locked and cannot be renamed
- If you need to rename a locked list, ask [YOUR NAME] to unlock it first
- This prevents our Butler automations from breaking when list names change
- This works on desktop AND mobile - locked lists cannot be renamed anywhere

Please don't try to rename lists with 🔒 badges!

Questions? Ask [YOUR NAME]
```

## Step 8.2: Document Your Locked Lists

Create a Trello card (or document) listing:
- Which lists are locked
- Why they're locked
- Who can unlock them
- What automations depend on them

**Example:**
```
🔒 Locked Lists:

1. "To Do" - Used in 3 Butler automations
2. "In Progress" - Used in 2 Butler automations
3. "Done" - Used in 5 Butler automations
4. "Archive" - Used in auto-archive automation

Contact: John Doe (john@example.com) to unlock
```

## Step 8.3: Set Expectations

**Tell your team:**
- ✅ DO: Ask before renaming any list
- ✅ DO: Check for the 🔒 badge
- ✅ DO: Report if automations break
- ❌ DON'T: Try to work around the locks
- ❌ DON'T: Rename locked lists (even if you "think" it's okay)

---

# Part 9: Maintenance

## Keep Glitch Running (Prevent Sleep)

Glitch projects go to "sleep" after 5 minutes of inactivity. To prevent this:

### Option 1: UptimeRobot (Free, Recommended)

1. **Go to:** https://uptimerobot.com
2. **Sign up** (free account)
3. **Click "Add New Monitor"**
4. **Fill in:**
   - Monitor Type: HTTP(s)
   - Friendly Name: Trello List Lock
   - URL: `https://YOUR-PROJECT.glitch.me/health`
   - Monitoring Interval: 5 minutes
5. **Click "Create Monitor"**

Now UptimeRobot will ping your server every 5 minutes, keeping it awake 24/7!

### Option 2: Upgrade Glitch (Paid)

Pay $8/month for Glitch Pro to keep your project always running.

## Monitor Your Webhook

1. **Check Glitch logs regularly:**
   - Go to your Glitch project
   - Click "Logs" button
   - Look for any errors

2. **Test weekly:**
   - Try renaming a locked list
   - Verify it reverts automatically
   - Check on both desktop and mobile

3. **If webhook stops working:**
   - Check that Glitch is running
   - Check UptimeRobot is active
   - Re-run webhook setup (Part 5, Step 5.2)

---

# 🎉 Success Checklist

You're done when ALL of these are true:

- [ ] Power-Up shows in my board's Power-Ups list
- [ ] "🔒 Lock List Title" appears in list menus
- [ ] Locking a list shows a 🔒 badge
- [ ] Locked lists automatically revert when renamed (desktop)
- [ ] Locked lists automatically revert when renamed (mobile app)
- [ ] Glitch project is running (check "Show" button)
- [ ] Webhook is set up (Part 5 complete)
- [ ] UptimeRobot is monitoring (or Glitch Pro enabled)
- [ ] Team has been notified
- [ ] Critical lists are locked

---

# 🆘 Troubleshooting

## Power-Up doesn't appear in Trello

**Fix:**
1. Check Iframe URL in Power-Up settings includes `/index.html`
2. Verify Glitch project is running (click "Show")
3. Try disabling and re-enabling the Power-Up
4. Clear browser cache and reload

## Lock button doesn't appear

**Fix:**
1. Refresh the Trello page
2. Check browser console for errors (F12)
3. Verify capabilities are enabled in Power-Up settings
4. Make sure you're a board admin

## Locks don't revert (webhook not working)

**Fix:**
1. Check Glitch logs for errors
2. Verify .env variables are correct
3. Re-run webhook setup (Part 5)
4. Test with: `fetch('https://YOUR-PROJECT.glitch.me/health')`
5. Check that Board ID is correct

## Mobile app protection not working

**Fix:**
1. Verify webhook is set up (Part 5)
2. Check Glitch is running and not asleep
3. Set up UptimeRobot to keep Glitch awake
4. Test on desktop first - if desktop works, mobile will too
5. Allow 5-10 seconds for revert on mobile (slower than desktop)

## Glitch project keeps sleeping

**Fix:**
1. Set up UptimeRobot (see Part 9)
2. Or upgrade to Glitch Pro ($8/month)

## "Unauthorized" errors in Glitch logs

**Fix:**
1. Check TRELLO_API_KEY is correct in .env
2. Check TRELLO_TOKEN is correct in .env
3. Token may have expired - generate a new one:
   - Go to https://trello.com/app-key
   - Generate new token
   - Update .env in Glitch

---

# 🎯 Quick Reference

## Your Important URLs

Save these for future reference:

| What | URL | Notes |
|------|-----|-------|
| Glitch Project | `https://glitch.com/edit/#!/YOUR-PROJECT` | Edit your code |
| Glitch App | `https://YOUR-PROJECT.glitch.me` | Your running app |
| Trello Power-Up Admin | `https://trello.com/power-ups/admin` | Manage Power-Up settings |
| Trello API Key | `https://trello.com/app-key` | Get credentials |
| UptimeRobot | `https://uptimerobot.com` | Keep Glitch awake |

## Your Important Values

| What | Your Value | Where Used |
|------|------------|------------|
| API Key | `____________` | .env, webhook setup |
| Token | `____________` | .env |
| Glitch URL | `____________` | .env (CALLBACK_URL), iframe URL |
| Board ID | `____________` | Webhook setup |
| Power-Up ID | `____________` | Reference only |

---

# 🚀 You're Done!

Your Trello lists are now protected on **desktop AND mobile**!

**What you accomplished:**
- ✅ Deployed a Trello Power-Up (free!)
- ✅ Locked critical list titles
- ✅ Protected Butler Automations from breaking
- ✅ Enabled automatic revert on all platforms
- ✅ Set up monitoring to keep it running 24/7

**Enjoy unbreakable Trello automations!** 🎉

---

**Need help?** Check the [Troubleshooting](#-troubleshooting) section above or see the [main README](README.md) for more details.
