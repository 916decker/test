// ============================================================
// Suppress duplicate ID runtime warnings
// ============================================================
const _origChromeRuntimeError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('Cannot create item with duplicate id')
  ) {
    return; // ignore harmless duplicate-id warning
  }
  _origChromeRuntimeError(...args);
};

// Initialize context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// Debounce context menu updates to prevent duplicate ID errors
let contextMenuUpdateTimer = null;
function scheduleContextMenuUpdate() {
  if (contextMenuUpdateTimer) {
    clearTimeout(contextMenuUpdateTimer);
  }
  contextMenuUpdateTimer = setTimeout(() => {
    createContextMenus();
    contextMenuUpdateTimer = null;
  }, 100); // 100ms debounce
}

// Listen for storage changes and update context menu
chrome.storage.onChanged.addListener((changes, namespace) => {
  // Listen to BOTH sync and local storage (we use both now)
  if ((namespace === 'sync' || namespace === 'local') && (changes.prompts || changes.folders)) {
    scheduleContextMenuUpdate();
  }
});

// Storage helper that checks both sync and local
async function getStorage(keys) {
  // Try sync first
  let data = await chrome.storage.sync.get(keys);
  if (data && Object.keys(data).length > 0) {
    return data;
  }
  // Fallback to local
  return await chrome.storage.local.get(keys);
}

// Helper to create context menu items with error suppression
function createMenuItem(options) {
  try {
    chrome.contextMenus.create(options, () => {
      // Suppress "duplicate id" runtime errors
      if (chrome.runtime.lastError) {
        if (!chrome.runtime.lastError.message.includes('duplicate id')) {
          console.error('Context menu error:', chrome.runtime.lastError);
        }
        // Silently ignore duplicate id errors
      }
    });
  } catch (error) {
    if (!error.message.includes('duplicate id')) {
      console.error('Context menu creation error:', error);
    }
  }
}

// ============================================================
// Helper function to save a prompt (reusable)
// Feature #6: Saves source URL with prompt
// ============================================================
async function savePromptToStorage(selectedText, sourceUrl = null, folderId = null) {
  console.log('[savePromptToStorage] Called with text length:', selectedText?.length || 0);

  if (!selectedText || !selectedText.trim()) {
    console.warn('[savePromptToStorage] No text provided or text is empty');
    return false;
  }

  // Get folders to find the default folder
  const data = await getStorage(['prompts', 'folders']);
  let folders = data.folders || [];
  let prompts = data.prompts || [];

  console.log('[savePromptToStorage] Current prompts count:', prompts.length);
  console.log('[savePromptToStorage] Current folders count:', folders.length);

  // Ensure default folder exists
  let defaultFolder = folders.find(f => f.isDefault);
  if (!defaultFolder) {
    defaultFolder = {
      id: 'folder_default_' + Date.now(),
      name: 'Default',
      isDefault: true
    };
    folders.push(defaultFolder);
  }

  // Use provided folderId or default
  const targetFolderId = folderId || defaultFolder.id;

  // Create the new prompt with normalization
  const timestamp = Date.now();
  const newPrompt = {
    id: `prompt_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    name: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
    text: selectedText,
    favorite: false,
    usageCount: 0,
    lastUsed: null,
    createdAt: timestamp,
    history: [],
    folderId: targetFolderId,
    sourceUrl: sourceUrl || null  // Feature #6: Save source URL
  };

  // Add to prompts array
  prompts.push(newPrompt);

  console.log('[savePromptToStorage] Created new prompt:', newPrompt.id);
  console.log('[savePromptToStorage] Total prompts after save:', prompts.length);

  // Save to storage (will use smartStorage logic)
  const dataSize = JSON.stringify({ prompts, folders }).length;
  const SYNC_QUOTA_BYTES_PER_ITEM = 8192;

  if (dataSize > SYNC_QUOTA_BYTES_PER_ITEM * 0.8) {
    console.log('[savePromptToStorage] Saving to local storage (size limit)');
    await chrome.storage.local.set({ prompts, folders });
  } else {
    try {
      console.log('[savePromptToStorage] Saving to sync storage');
      await chrome.storage.sync.set({ prompts, folders });
    } catch (error) {
      // Fallback to local if sync fails
      console.warn('[savePromptToStorage] Sync failed, falling back to local storage:', error);
      await chrome.storage.local.set({ prompts, folders });
    }
  }

  console.log('[savePromptToStorage] Save complete!');
  return newPrompt;
}

// Create context menus based on saved prompts and folders
async function createContextMenus() {
  // Remove all existing context menus and wait for completion
  try {
    await chrome.contextMenus.removeAll();
  } catch (error) {
    console.error('Error removing context menus:', error);
  }

  // Small delay to ensure removeAll completes
  await new Promise(resolve => setTimeout(resolve, 50));

  // Create parent menu
  createMenuItem({
    id: 'llm-prompt-manager',
    title: 'LLM Prompts',
    contexts: ['all']
  });

  // Get saved prompts and folders
  const data = await getStorage(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    // Show a message if no prompts are saved
    createMenuItem({
      id: 'no-prompts',
      parentId: 'llm-prompt-manager',
      title: 'No prompts saved yet',
      contexts: ['all'],
      enabled: false
    });
  } else {
    // Group prompts by folder
    folders.forEach(folder => {
      const folderPrompts = prompts.filter(p => p.folderId === folder.id);

      if (folderPrompts.length > 0) {
        // Create folder submenu
        createMenuItem({
          id: `folder-${folder.id}`,
          parentId: 'llm-prompt-manager',
          title: `📁 ${folder.name}`,
          contexts: ['all']
        });

        // Add prompts under this folder
        folderPrompts.forEach((prompt, promptIndex) => {
          // Find actual index in full prompts array
          const actualIndex = prompts.findIndex(p => p === prompt);

          createMenuItem({
            id: `prompt-${actualIndex}`,
            parentId: `folder-${folder.id}`,
            title: prompt.name,
            contexts: ['all']
          });
        });
      }
    });
  }

  // Add "Manage Prompts" option
  createMenuItem({
    id: 'manage-prompts',
    parentId: 'llm-prompt-manager',
    title: '⚙️ Manage Prompts',
    contexts: ['all']
  });

  // Feature #5: Character count badge in menu title
  // Only show this menu when text is selected
  createMenuItem({
    id: 'save-selection-parent',
    title: '💾 Save to LLM Prompt Manager',
    contexts: ['selection']
  });

  // Feature #2: Folder submenu - Quick save to specific folders
  folders.forEach(folder => {
    createMenuItem({
      id: `save-to-folder-${folder.id}`,
      parentId: 'save-selection-parent',
      title: `📁 ${folder.name}`,
      contexts: ['selection']
    });
  });

  // Feature #3: Edit before saving option
  createMenuItem({
    id: 'save-selection-edit',
    parentId: 'save-selection-parent',
    title: '✏️ Edit before saving...',
    contexts: ['selection']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'manage-prompts') {
    // Try to open popup, but show notification if it fails
    try {
      await chrome.action.openPopup();
    } catch (error) {
      // Popup can't be opened programmatically in some contexts
      chrome.notifications.create({
        type: 'basic',
        title: 'Open Extension',
        message: 'Click the extension icon to manage your prompts'
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError);
        }
      });
    }
    return;
  }

  // Feature #3: Handle edit before saving
  if (info.menuItemId === 'save-selection-edit') {
    const selectedText = info.selectionText;

    if (selectedText && selectedText.trim()) {
      // Store selected text temporarily
      await chrome.storage.local.set({
        tempPromptText: selectedText,
        tempSourceUrl: tab.url
      });

      // Try to open popup programmatically
      try {
        await chrome.action.openPopup();
      } catch (error) {
        // Fallback: Show notification asking user to click extension icon
        chrome.notifications.create({
          type: 'basic',
          title: '✏️ Text Captured!',
          message: 'Click the extension icon to edit and save. Text is already filled in!'
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error('Notification error:', chrome.runtime.lastError);
          }
        });
      }
    }
    return;
  }

  // Feature #2: Handle save to specific folder
  if (info.menuItemId.startsWith('save-to-folder-')) {
    const folderId = info.menuItemId.replace('save-to-folder-', '');
    const selectedText = info.selectionText;

    console.log('[SAVE] Attempting to save highlighted text to folder:', folderId);
    console.log('[SAVE] Selected text length:', selectedText?.length || 0);

    if (selectedText && selectedText.trim()) {
      // Feature #5: Get character count
      const charCount = selectedText.length;

      // Save with specific folder ID and source URL
      const newPrompt = await savePromptToStorage(selectedText, tab.url, folderId);

      if (newPrompt) {
        // Get folder name for notification
        const data = await getStorage(['folders']);
        const folders = data.folders || [];
        const folder = folders.find(f => f.id === folderId);

        chrome.notifications.create({
          type: 'basic',
          title: '✅ Prompt Saved!',
          message: `"${newPrompt.name}" (${charCount} chars)\nSaved to ${folder ? folder.name : 'Default'}`
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error('Notification error:', chrome.runtime.lastError);
          }
        });
      } else {
        console.error('Failed to save prompt - savePromptToStorage returned false');
      }
    } else {
      console.warn('[SAVE] No text selected or text is empty');
      chrome.notifications.create({
        type: 'basic',
        title: '⚠️ No Text Selected',
        message: 'Please highlight some text before saving to LLM Prompt Manager'
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError);
        }
      });
    }
    return;
  }

  // Handle prompt selection (insert into page)
  if (info.menuItemId.startsWith('prompt-')) {
    const index = parseInt(info.menuItemId.replace('prompt-', ''));
    const data = await getStorage(['prompts']);
    const prompts = data.prompts || [];

    if (prompts[index]) {
      const promptText = prompts[index].text;
      const promptName = prompts[index].name;

      try {
        // Insert/paste the prompt directly into the page
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: insertOrPasteText,
          args: [promptText]
        });
      } catch (error) {
        console.error('Failed to insert prompt:', error);
      }
    }
  }
});

// Feature #1: Keyboard Shortcut Handler (Alt+Shift+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-selection') {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) return;

    try {
      // Execute script to get selected text
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      const selectedText = results[0]?.result;

      if (selectedText && selectedText.trim()) {
        // Feature #5: Get character count
        const charCount = selectedText.length;

        // Save the prompt with source URL
        const newPrompt = await savePromptToStorage(selectedText, tab.url);

        if (newPrompt) {
          // Show notification with keyboard indicator (platform-aware)
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const shortcut = isMac ? 'Cmd+Shift+S' : 'Alt+Shift+S';

          chrome.notifications.create({
            type: 'basic',
            title: `⚡ Prompt Saved! (${shortcut})`,
            message: `"${newPrompt.name}" (${charCount} chars)\nFrom: ${tab.title}`
          }, (notificationId) => {
            if (chrome.runtime.lastError) {
              console.error('Notification error:', chrome.runtime.lastError);
            }
          });
        } else {
          console.error('Failed to save prompt via keyboard - savePromptToStorage returned false');
        }
      } else {
        // No text selected - show warning notification (platform-aware)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const shortcut = isMac ? 'Cmd+Shift+S' : 'Alt+Shift+S';

        chrome.notifications.create({
          type: 'basic',
          title: 'No Text Selected',
          message: `Please select some text before using ${shortcut}`
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error('Notification error:', chrome.runtime.lastError);
          }
        });
      }
    } catch (error) {
      console.error('Failed to save selection via keyboard:', error);
    }
  }
});

// Function to insert or paste text into page (runs in page context)
function insertOrPasteText(text) {
  // Try to find the active/focused element first
  let targetElement = document.activeElement;

  // Check if active element is editable
  const isEditable = targetElement && (
    targetElement.tagName === 'TEXTAREA' ||
    targetElement.tagName === 'INPUT' ||
    targetElement.isContentEditable
  );

  if (isEditable) {
    // Insert into the focused editable element
    if (targetElement.isContentEditable) {
      // For contenteditable elements (like rich text editors)
      document.execCommand('insertText', false, text);
    } else {
      // For input and textarea elements
      const start = targetElement.selectionStart || 0;
      const end = targetElement.selectionEnd || 0;
      const currentValue = targetElement.value || '';
      targetElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
      targetElement.selectionStart = targetElement.selectionEnd = start + text.length;

      // Trigger input event for frameworks (React, Vue, etc.)
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
      targetElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else {
    // No focused editable element - find the first available text input on the page
    const textInputs = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');

    if (textInputs.length > 0) {
      // Focus and insert into the first text input found
      const firstInput = textInputs[0];
      firstInput.focus();

      if (firstInput.isContentEditable) {
        document.execCommand('insertText', false, text);
      } else {
        firstInput.value = (firstInput.value || '') + text;
        firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        firstInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      // Last resort: copy to clipboard using the old reliable method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.top = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
}
