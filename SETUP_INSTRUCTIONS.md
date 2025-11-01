# 🚀 Super Simple Setup Guide
## Create Your Google Drive Folder Structure in 5 Easy Steps

**Time needed**: 10-15 minutes
**Technical level**: Beginner-friendly
**What you'll need**: A Google account and internet connection

---

## ⚡ Quick Overview

You'll be running a simple Python script that automatically creates all your folders in Google Drive. Don't worry - I'll walk you through every step!

---

## 📋 Step 1: Install Python (If You Don't Have It)

### Check if you already have Python:

**On Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type `python --version` and press Enter

**On Mac:**
1. Press `Command + Space`
2. Type `terminal` and press Enter
3. Type `python3 --version` and press Enter

**If you see a version number (like Python 3.11.x)**, you're good! Skip to Step 2.

**If you get an error**, install Python:

### Installing Python:

**Windows:**
1. Go to https://www.python.org/downloads/
2. Click the big yellow "Download Python" button
3. Run the installer
4. ⚠️ **IMPORTANT**: Check the box "Add Python to PATH" at the bottom
5. Click "Install Now"
6. Wait for installation to complete

**Mac:**
1. Go to https://www.python.org/downloads/
2. Click the big yellow "Download Python" button
3. Open the downloaded .pkg file
4. Follow the installation wizard
5. Click through and complete installation

---

## 📋 Step 2: Get Your Google Drive API Credentials

This tells Google that you're allowed to create folders.

### Detailed Steps:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project:**
   - Click the dropdown at the top (says "Select a project")
   - Click "NEW PROJECT" in the top-right
   - Project name: Type "Document Management"
   - Click "CREATE"
   - Wait 10-20 seconds for it to be created

3. **Enable Google Drive API:**
   - Make sure your new project is selected (check the dropdown at top)
   - In the search bar at the very top, type: `Google Drive API`
   - Click on "Google Drive API" from the results
   - Click the blue "ENABLE" button
   - Wait for it to enable (about 5 seconds)

4. **Create Credentials:**
   - On the left sidebar, click "Credentials" (key icon)
   - Click "CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"

5. **Configure OAuth Consent Screen** (if prompted):
   - Click "CONFIGURE CONSENT SCREEN"
   - Select "External" (or "Internal" if you have Google Workspace)
   - Click "CREATE"
   - Fill in required fields:
     - App name: "Document Manager"
     - User support email: Your email
     - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Click "SAVE AND CONTINUE" again (skip scopes)
   - Click "SAVE AND CONTINUE" again (skip test users)
   - Click "BACK TO DASHBOARD"

6. **Back to Creating Credentials:**
   - Click "Credentials" in left sidebar again
   - Click "CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: Select "Desktop app"
   - Name: "Document Manager Desktop"
   - Click "CREATE"

7. **Download the Credentials File:**
   - A popup will appear with your credentials
   - Click "DOWNLOAD JSON"
   - Save the file - remember where it goes!
   - **IMPORTANT**: Rename this file to exactly: `credentials.json`

---

## 📋 Step 3: Set Up Your Files

1. **Create a folder on your computer:**
   - Create a new folder anywhere you like
   - Name it something like "Drive Setup"

2. **Put these files in that folder:**
   - The `credentials.json` file you just downloaded
   - The `create_drive_structure.py` file (I created this for you)
   - The `requirements.txt` file (I created this for you)

3. **Make sure all 3 files are in the same folder!**

---

## 📋 Step 4: Install Required Software

**On Windows:**

1. Open the folder where you put the files
2. In the address bar at the top, type `cmd` and press Enter
   - This opens a command window in your folder
3. Copy and paste this command:
   ```
   pip install -r requirements.txt
   ```
4. Press Enter
5. Wait for it to finish (30-60 seconds)
6. You should see "Successfully installed..." messages

**On Mac:**

1. Open Terminal (press Command + Space, type "terminal")
2. Type `cd ` (with a space after cd)
3. Drag your "Drive Setup" folder into the Terminal window
4. Press Enter
5. Copy and paste this command:
   ```
   pip3 install -r requirements.txt
   ```
6. Press Enter
7. Wait for it to finish (30-60 seconds)

---

## 📋 Step 5: Run the Script!

**On Windows:**

1. In the same command window from Step 4, type:
   ```
   python create_drive_structure.py
   ```
2. Press Enter

**On Mac:**

1. In the same Terminal window from Step 4, type:
   ```
   python3 create_drive_structure.py
   ```
2. Press Enter

### What Happens Next:

1. **Enter Company Name:**
   - The script will ask: "Enter your company name"
   - Type your company name and press Enter
   - (Or just press Enter to use "Your Company")

2. **Browser Window Opens:**
   - Your web browser will automatically open
   - You'll see a Google sign-in page

3. **Sign In and Authorize:**
   - Sign in with your Google account
   - You might see a warning "Google hasn't verified this app"
   - Click "Advanced" → "Go to Document Manager (unsafe)"
   - This is normal - it's YOUR app, so it's safe!
   - Click "Allow" to give permissions
   - Click "Allow" again to confirm

4. **Watch the Magic:**
   - The Terminal/Command window will show progress
   - You'll see checkmarks as each folder is created
   - Takes about 30-60 seconds

5. **Success!**
   - You'll see: "🎉 SUCCESS! Your document management system is ready!"
   - You'll get a link to your new folder structure

---

## ✅ You're Done!

### What Now?

1. **Go to Google Drive:**
   - Visit: https://drive.google.com
   - Look for "[Your Company Name] - Document Hub"
   - Click on it to see your new folder structure!

2. **Start Organizing:**
   - Upload your existing documents
   - Follow the naming conventions in FOLDER_STRUCTURE.md
   - Share folders with your team

---

## 🆘 Troubleshooting

### "Python not found" or "command not found"
- **Solution**: Go back to Step 1 and install Python
- Make sure you checked "Add Python to PATH" during installation

### "credentials.json not found"
- **Solution**: Make sure credentials.json is in the same folder as the script
- Check that it's named exactly `credentials.json` (not credentials.json.txt)

### "ModuleNotFoundError"
- **Solution**: Run the pip install command from Step 4 again
- Make sure you're in the correct folder

### "Failed to create root folder"
- **Solution**: Make sure you clicked "Allow" when authorizing the app
- Try running the script again - it will use saved credentials

### Browser doesn't open
- **Solution**: Copy the URL shown in the Terminal and paste it in your browser manually

### Still stuck?
- Check that all 3 files are in the same folder
- Make sure you have internet connection
- Try restarting and running the script again

---

## 🔒 Security Notes

- The `credentials.json` file is private - don't share it
- The `token.pickle` file (created after first run) is also private
- These files allow access to YOUR Google Drive only
- Keep them secure!

---

## 🎯 Next Steps

After your structure is created:

1. Read `FOLDER_STRUCTURE.md` for organization guidelines
2. Read `ORGANIZATIONAL_GUIDE.md` for best practices
3. Set up team permissions in Google Drive
4. Start migrating your documents
5. Share the guides with your team

---

**Questions?** Re-read the step you're stuck on carefully. Most issues come from skipping a small detail!

**Last Updated**: 2025-11-01
**Version**: 1.0
