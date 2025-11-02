// Initialize context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// Listen for storage changes and update context menu
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.prompts) {
    createContextMenus();
  }
});

// Create context menus based on saved prompts
async function createContextMenus() {
  // Remove all existing context menus
  await chrome.contextMenus.removeAll();

  // Create parent menu
  chrome.contextMenus.create({
    id: 'llm-prompt-manager',
    title: 'LLM Prompts',
    contexts: ['all']
  });

  // Get saved prompts
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts.length === 0) {
    // Show a message if no prompts are saved
    chrome.contextMenus.create({
      id: 'no-prompts',
      parentId: 'llm-prompt-manager',
      title: 'No prompts saved yet',
      contexts: ['all'],
      enabled: false
    });
  } else {
    // Create menu item for each prompt
    prompts.forEach((prompt, index) => {
      chrome.contextMenus.create({
        id: `prompt-${index}`,
        parentId: 'llm-prompt-manager',
        title: prompt.name,
        contexts: ['all']
      });
    });
  }

  // Add "Manage Prompts" option
  chrome.contextMenus.create({
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
    const data = await chrome.storage.sync.get(['prompts']);
    const prompts = data.prompts || [];

    if (prompts[index]) {
      const promptText = prompts[index].text;

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(promptText);

        // Show notification (optional - will work without icon)
        if (chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            title: 'Prompt Copied!',
            message: `"${prompts[index].name}" copied to clipboard`,
            priority: 0
          });
        }

        // Insert into the active text field if on an editable element
        if (info.editable) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: insertText,
            args: [promptText]
          });
        }
      } catch (error) {
        console.error('Failed to copy prompt:', error);
      }
    }
  }
});

// Function to insert text into active element
function insertText(text) {
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || activeElement.isContentEditable)) {
    if (activeElement.isContentEditable) {
      // For contenteditable elements
      document.execCommand('insertText', false, text);
    } else {
      // For input and textarea
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const currentValue = activeElement.value;
      activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + text.length;

      // Trigger input event for frameworks that listen to it
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// Add permission for notifications
chrome.permissions.contains({
  permissions: ['notifications']
}, (result) => {
  if (!result) {
    chrome.permissions.request({
      permissions: ['notifications']
    });
  }
});
