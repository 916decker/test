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
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'manage-prompts') {
    // Open the extension popup
    chrome.action.openPopup();
    return;
  }

  // Handle prompt selection
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
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
}
