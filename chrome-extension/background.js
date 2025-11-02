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
      const promptName = prompts[index].name;

      try {
        // Insert/paste the prompt directly into the page
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: insertOrPasteText,
          args: [promptText]
        });

        // Show notification
        if (chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            title: 'Prompt Inserted!',
            message: `"${promptName}" inserted into page`,
            priority: 0
          });
        }
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
