# 📱 Mobile App Protection Testing Guide

## How to Verify List Locks Work on Mobile

This guide walks you through testing that your list title locks work on **both desktop and mobile** Trello apps.

---

## Why Mobile Testing Matters

Butler Automations can break when list names are changed from **any** device:
- ❌ Desktop web browser
- ❌ **Mobile apps (iOS/Android)** ← Often forgotten!
- ❌ API integrations
- ❌ Third-party tools

This Power-Up protects against ALL of these because it works at the **webhook level**, intercepting changes regardless of source.

---

## Prerequisites

Before testing, make sure:
- ✅ Power-Up is installed on your Trello board
- ✅ Webhook server is running (Glitch/Replit/etc.)
- ✅ Webhook is set up for your board
- ✅ At least one list is locked with a 🔒 badge

**Haven't set this up yet?** See [TRELLO_DEPLOYMENT_GUIDE.md](TRELLO_DEPLOYMENT_GUIDE.md)

---

## Test 1: Desktop Web Browser Protection

### Step 1: Lock a Test List

1. Open your Trello board in a web browser
2. Create a new list called "Test List - Do Not Rename"
3. Click the list menu (···)
4. Click "🔒 Lock List Title"
5. Verify you see the 🔒 badge

### Step 2: Try to Rename (Desktop)

1. Click on the list title "Test List - Do Not Rename"
2. Edit it to "RENAMED FROM DESKTOP"
3. Press Enter or click outside

### Step 3: Watch the Magic

**What should happen:**
- The name changes briefly to "RENAMED FROM DESKTOP"
- Within 2-5 seconds, it **automatically reverts** to "Test List - Do Not Rename"
- This is the webhook protection working!

**If it doesn't revert:**
- Check your Glitch logs for errors
- Verify webhook is set up: Run the health check in your browser
  ```
  https://your-project.glitch.me/health
  ```
- See [Troubleshooting](#troubleshooting) section below

---

## Test 2: Mobile App Protection (iOS)

### Step 1: Install Trello Mobile App

1. Open App Store on your iPhone/iPad
2. Search for "Trello"
3. Download and install
4. Log in with your Trello account

### Step 2: Open Your Board

1. Open the Trello app
2. Navigate to the board with locked lists
3. Find your "Test List - Do Not Rename" list
4. You should see the 🔒 badge on the list

### Step 3: Try to Rename (iOS)

1. **Tap the list title** "Test List - Do Not Rename"
2. **Edit it** to "RENAMED FROM IPHONE"
3. **Tap "Done"** or tap outside the field
4. **Watch closely...**

### Step 4: Verify Protection

**What should happen:**
- The change appears to save (you see "RENAMED FROM IPHONE")
- The app might show it changed
- **Within 5-10 seconds**, pull down to refresh the board
- The name is back to "Test List - Do Not Rename" ✅

**Alternative method if you don't see immediate revert:**
1. Close the list
2. Reopen the list
3. Name should be back to original

**Why the slight delay on mobile?**
- Mobile apps cache data locally
- The webhook instantly reverts the change on Trello's servers
- But the mobile app takes a few seconds to sync the change back
- This is normal and expected!

---

## Test 3: Mobile App Protection (Android)

### Step 1: Install Trello Mobile App

1. Open Google Play Store on your Android device
2. Search for "Trello"
3. Download and install
4. Log in with your Trello account

### Step 2: Open Your Board

1. Open the Trello app
2. Navigate to the board with locked lists
3. Find your "Test List - Do Not Rename" list
4. You should see the 🔒 badge on the list

### Step 3: Try to Rename (Android)

1. **Tap the list title** "Test List - Do Not Rename"
2. **Edit it** to "RENAMED FROM ANDROID"
3. **Tap the checkmark** or tap outside
4. **Watch closely...**

### Step 4: Verify Protection

**What should happen:**
- The change appears to save (you see "RENAMED FROM ANDROID")
- **Within 5-10 seconds**, swipe down to refresh the board
- The name is back to "Test List - Do Not Rename" ✅

**If you don't see it revert:**
1. Try closing and reopening the board
2. Force-close the app and reopen
3. Name should be back to original

---

## Test 4: Verify via Dashboard

### Step 1: Open the Dashboard

1. Open your browser
2. Go to: `https://your-project.glitch.me/dashboard`
3. You should see the monitoring dashboard

### Step 2: Check Activity Log

Look for these entries after your mobile test:

```
🔄 list-update: List renamed: "Test List - Do Not Rename" → "RENAMED FROM IPHONE"
🔒 lock-detected: Locked list detected, reverting
✅ revert: Successfully reverted list to "Test List - Do Not Rename"
```

**This confirms:**
- Webhook received the mobile change
- Detected the list was locked
- Successfully reverted the change

### Step 3: Check Statistics

The dashboard should show:
- **List Renames:** Increased by 1
- **Protected (Reverted):** Increased by 1
- **Errors:** Should be 0

---

## Test 5: Multiple Users (Team Test)

### Setup

1. Have a team member with the Trello mobile app installed
2. Give them access to your test board
3. Lock a test list

### Test

1. **You** (admin) lock a list from desktop
2. **Team member** tries to rename from their mobile device
3. **Watch both devices:**
   - Change appears on their mobile
   - But reverts within seconds
   - Your desktop shows the list never changed

### Result

**This proves:**
- Mobile protection works for all users, not just admins
- Real-world scenario tested
- Your Butler Automations are safe!

---

## How It Works (Technical Details)

### The Protection Flow

```
1. User renames list on mobile app
   └─> Mobile app sends request to Trello API
       └─> Trello API updates list name
           └─> Trello API sends webhook to your server
               └─> Your server checks if list is locked
                   └─> If locked: Server sends API request to revert name
                       └─> Trello API reverts the name
                           └─> Mobile app syncs and shows original name
```

**Key point:** The protection happens at the **API level**, not the UI level. That's why it works on mobile!

### Why This Works on Mobile

✅ **Webhooks monitor ALL changes**
- Desktop changes → Webhook triggered
- Mobile changes → Webhook triggered
- API changes → Webhook triggered
- Any source → Webhook triggered

✅ **Server responds automatically**
- No human intervention needed
- Works 24/7
- Instant response (< 1 second)

✅ **Change is reverted via API**
- Mobile app receives the revert
- Syncs back to original name
- Butler Automations never see the change

---

## Timing Expectations

### Desktop Web Browser
- **Visual change:** Immediate
- **Revert time:** 2-5 seconds
- **User experience:** Obvious and immediate

### Mobile Apps (iOS/Android)
- **Visual change:** Immediate
- **Revert time:** 5-15 seconds (due to mobile sync)
- **User experience:** May require refresh/reopen

### Why Mobile is Slower
- Mobile apps cache data locally
- Sync interval is longer (battery optimization)
- Network latency on mobile networks
- Multiple API round-trips needed

**But it still works!** The important thing is Butler Automations never see the wrong name.

---

## Troubleshooting

### Test 1 Failed: Desktop Doesn't Revert

**Possible causes:**
1. Webhook not set up correctly
2. Glitch server is asleep
3. .env variables incorrect

**Fix:**
1. Check Glitch logs for errors
2. Run health check: `https://your-project.glitch.me/health`
3. Verify webhook setup (see deployment guide)
4. Check .env has correct TRELLO_API_KEY and TRELLO_TOKEN

### Test 2/3 Failed: Mobile Doesn't Revert

**Possible causes:**
1. Same as desktop issues
2. Mobile app needs manual refresh
3. Network connectivity issues on mobile

**Fix:**
1. First, verify desktop test works (Test 1)
2. If desktop works, mobile will too - just needs time
3. Force-close and reopen the mobile app
4. Check dashboard to confirm webhook received the event
5. Wait up to 30 seconds, then refresh

### Dashboard Shows Errors

**Check Glitch logs:**
1. Go to your Glitch project
2. Click "Logs" button
3. Look for error messages

**Common errors:**
- "Unauthorized" → Check TRELLO_TOKEN is valid
- "Not found" → Check list still exists
- "Timeout" → Network/server issue, will retry automatically

### Mobile Shows Old Name but Dashboard Shows Revert

**This is actually SUCCESS!**
- Revert happened on server
- Mobile just needs to sync
- Close and reopen the app
- Or wait for automatic sync (30-60 seconds)

### No Activity in Dashboard

**Possible causes:**
1. Webhook not set up
2. Testing on wrong board
3. List not actually locked

**Fix:**
1. Verify webhook setup with browser console command
2. Check you're on the correct board
3. Confirm list has 🔒 badge
4. Try locking/unlocking a list to generate activity

---

## Real-World Testing Checklist

Use this checklist to verify everything works:

### Desktop Testing
- [ ] Lock a list from desktop
- [ ] Try to rename it
- [ ] Verify it reverts within 5 seconds
- [ ] Check dashboard shows the event

### iOS Testing
- [ ] Open board on iPhone/iPad
- [ ] Try to rename a locked list
- [ ] Wait 10 seconds and refresh
- [ ] Verify name is back to original
- [ ] Check dashboard shows mobile event

### Android Testing
- [ ] Open board on Android device
- [ ] Try to rename a locked list
- [ ] Wait 10 seconds and refresh
- [ ] Verify name is back to original
- [ ] Check dashboard shows mobile event

### Team Testing
- [ ] Have team member try to rename on mobile
- [ ] Verify they see the revert too
- [ ] Check dashboard shows their username in log

### Butler Automation Safety
- [ ] Create a Butler rule using a locked list name
- [ ] Try to rename the list from mobile
- [ ] Verify the Butler rule still works after revert

---

## Success Indicators

### ✅ You're Protected When:

1. **Desktop test** passes (reverts in 2-5 seconds)
2. **Mobile test** passes (reverts in 5-15 seconds after refresh)
3. **Dashboard** shows all events:
   - Webhook received
   - Lock detected
   - Revert successful
4. **No errors** in statistics
5. **Team members** can't rename locked lists (any device)

### 🎉 Bonus: Show Your Team

1. Record a screen recording on mobile
2. Show trying to rename a locked list
3. Show it reverting automatically
4. Share with team to demonstrate the protection

**This builds confidence that your Butler Automations are safe!**

---

## Advanced Testing

### Test Edge Cases

1. **Rapid renames:** Try changing name multiple times quickly
   - Expected: All reverted, might see brief flickering

2. **Offline mobile:** Rename while mobile is offline, then go online
   - Expected: Revert happens when mobile reconnects

3. **Simultaneous changes:** Two people rename at once
   - Expected: Both reverted to original

4. **Very long names:** Try 255-character list name
   - Expected: Works fine, reverted normally

### Performance Testing

1. **Lock 10+ lists** on one board
2. **Try renaming all of them** (desktop and mobile)
3. **Check dashboard** for any timeouts or errors
4. **Expected:** All should revert successfully

---

## Mobile-Specific FAQs

### Q: Does this slow down Trello on mobile?
**A:** No! The protection happens server-side. Mobile app performance is unchanged.

### Q: Will I get notifications when lists are reverted?
**A:** No automatic notifications, but you can see activity in the dashboard.

### Q: Can I disable mobile protection but keep desktop?
**A:** No, webhook protection works for all platforms equally. This is a feature, not a bug!

### Q: What if my mobile app is out of date?
**A:** Doesn't matter! Protection works at the API level, not app level.

### Q: Does this work on mobile web browser?
**A:** Yes! Mobile web is just another source. All changes are protected.

### Q: Can users bypass this by editing list names in the Trello API directly?
**A:** No! Webhooks catch ALL API changes, even direct API calls.

---

## Summary

**Mobile protection works because:**
- ✅ Webhooks monitor ALL changes (desktop, mobile, API)
- ✅ Server responds automatically in < 1 second
- ✅ Revert happens at API level (not UI level)
- ✅ Works 24/7 without human intervention

**You've successfully protected your lists when:**
- ✅ Desktop test passes
- ✅ Mobile test passes (iOS and/or Android)
- ✅ Dashboard shows all events correctly
- ✅ Team members can't break your Butler Automations

---

## Next Steps

1. ✅ **Test with your team** - have everyone try renaming on their devices
2. ✅ **Lock critical lists** - all lists used in Butler Automations
3. ✅ **Monitor dashboard** - check weekly for any issues
4. ✅ **Educate team** - explain why lists are locked
5. ✅ **Enjoy unbreakable automations!** 🎉

---

**Need help?** See [TRELLO_DEPLOYMENT_GUIDE.md](TRELLO_DEPLOYMENT_GUIDE.md) for troubleshooting or [README.md](README.md) for full documentation.

**Questions about mobile?** Check the [Troubleshooting](#troubleshooting) section above or your Glitch logs for details.
