// DOM elements
const promptNameInput = document.getElementById('promptName');
const promptTextInput = document.getElementById('promptText');
const addPromptBtn = document.getElementById('addPrompt');
const promptsList = document.getElementById('promptsList');
const emptyState = document.getElementById('emptyState');
const exportBtn = document.getElementById('exportPrompts');
const importBtn = document.getElementById('importPrompts');
const fileInput = document.getElementById('fileInput');
const autoBackupToggle = document.getElementById('autoBackupToggle');

// Load prompts and settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadPrompts();
  loadAutoBackupSetting();
});

// Add prompt button click
addPromptBtn.addEventListener('click', addPrompt);

// Export prompts button click
exportBtn.addEventListener('click', exportPrompts);

// Import prompts button click
importBtn.addEventListener('click', () => fileInput.click());

// File input change (when user selects a file)
fileInput.addEventListener('change', importPrompts);

// Auto-backup toggle change
autoBackupToggle.addEventListener('change', async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.sync.set({ autoBackupEnabled: isEnabled });

  if (isEnabled) {
    showToast('Auto-backup enabled! Backups will save to Downloads folder.');
    // Do an immediate backup
    await performAutoBackup();
  } else {
    showToast('Auto-backup disabled.');
  }
});

// Allow Enter key in name input to add prompt
promptNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPrompt();
  }
});

// Load auto-backup setting
async function loadAutoBackupSetting() {
  const data = await chrome.storage.sync.get(['autoBackupEnabled']);
  autoBackupToggle.checked = data.autoBackupEnabled || false;
}

// Load and display prompts
async function loadPrompts() {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts.length === 0) {
    emptyState.style.display = 'block';
    promptsList.innerHTML = '';
  } else {
    emptyState.style.display = 'none';
    displayPrompts(prompts);
  }
}

// Display prompts in the list
function displayPrompts(prompts) {
  promptsList.innerHTML = '';

  prompts.forEach((prompt, index) => {
    const promptCard = document.createElement('div');
    promptCard.className = 'prompt-card';

    const promptHeader = document.createElement('div');
    promptHeader.className = 'prompt-header';

    const promptName = document.createElement('h3');
    promptName.textContent = prompt.name;

    const promptActions = document.createElement('div');
    promptActions.className = 'prompt-actions';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy';
    copyBtn.className = 'btn-copy';
    copyBtn.onclick = () => copyPrompt(prompt);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.className = 'btn-edit';
    editBtn.onclick = () => editPrompt(index, prompt);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'btn-delete';
    deleteBtn.onclick = () => deletePrompt(index);

    promptActions.appendChild(copyBtn);
    promptActions.appendChild(editBtn);
    promptActions.appendChild(deleteBtn);

    promptHeader.appendChild(promptName);
    promptHeader.appendChild(promptActions);

    const promptText = document.createElement('p');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt.text;

    promptCard.appendChild(promptHeader);
    promptCard.appendChild(promptText);

    promptsList.appendChild(promptCard);
  });
}

// Add new prompt
async function addPrompt() {
  const name = promptNameInput.value.trim();
  const text = promptTextInput.value.trim();

  if (!name || !text) {
    alert('Please enter both name and prompt text');
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  prompts.push({ name, text });

  await chrome.storage.sync.set({ prompts });

  // Clear inputs
  promptNameInput.value = '';
  promptTextInput.value = '';

  // Reload prompts
  loadPrompts();

  // Show success message
  showToast('Prompt added successfully!');

  // Auto-backup if enabled
  await performAutoBackup();
}

// Copy prompt to clipboard
async function copyPrompt(prompt) {
  try {
    await navigator.clipboard.writeText(prompt.text);
    showToast(`"${prompt.name}" copied to clipboard!`);
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast('Failed to copy prompt', 'error');
  }
}

// Edit prompt
async function editPrompt(index, prompt) {
  const newName = window.prompt('Edit prompt name:', prompt.name);
  if (newName === null) return; // User cancelled

  const newText = window.prompt('Edit prompt text:', prompt.text);
  if (newText === null) return; // User cancelled

  if (!newName.trim() || !newText.trim()) {
    alert('Name and text cannot be empty');
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  prompts[index] = { name: newName.trim(), text: newText.trim() };

  await chrome.storage.sync.set({ prompts });
  loadPrompts();
  showToast('Prompt updated successfully!');

  // Auto-backup if enabled
  await performAutoBackup();
}

// Delete prompt
async function deletePrompt(index) {
  if (!confirm('Are you sure you want to delete this prompt?')) {
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  prompts.splice(index, 1);

  await chrome.storage.sync.set({ prompts });
  loadPrompts();
  showToast('Prompt deleted');

  // Auto-backup if enabled
  await performAutoBackup();
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// Export prompts to JSON file
async function exportPrompts() {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts.length === 0) {
    showToast('No prompts to export!', 'error');
    return;
  }

  // Create export data with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    promptCount: prompts.length,
    prompts: prompts
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `llm-prompts-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Exported ${prompts.length} prompts successfully!`);
}

// Import prompts from JSON file
async function importPrompts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);

      // Validate the data structure
      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        showToast('Invalid file format!', 'error');
        return;
      }

      // Validate each prompt has name and text
      const validPrompts = importData.prompts.filter(p => p.name && p.text);

      if (validPrompts.length === 0) {
        showToast('No valid prompts found in file!', 'error');
        return;
      }

      // Ask user if they want to merge or replace
      const shouldMerge = confirm(
        `Found ${validPrompts.length} prompts in backup.\n\n` +
        `Click OK to ADD these to your existing prompts.\n` +
        `Click Cancel to REPLACE all your current prompts.`
      );

      if (shouldMerge) {
        // Merge with existing prompts
        const data = await chrome.storage.sync.get(['prompts']);
        const existingPrompts = data.prompts || [];
        const mergedPrompts = [...existingPrompts, ...validPrompts];
        await chrome.storage.sync.set({ prompts: mergedPrompts });
        showToast(`Added ${validPrompts.length} prompts!`);
      } else {
        // Replace all prompts
        await chrome.storage.sync.set({ prompts: validPrompts });
        showToast(`Imported ${validPrompts.length} prompts!`);
      }

      // Reload the display
      loadPrompts();

      // Clear the file input
      fileInput.value = '';

    } catch (error) {
      console.error('Import error:', error);
      showToast('Failed to import prompts. Invalid file format.', 'error');
      fileInput.value = '';
    }
  };

  reader.readAsText(file);
}

// Perform auto-backup to Downloads folder
async function performAutoBackup() {
  const settings = await chrome.storage.sync.get(['autoBackupEnabled']);

  // Only backup if auto-backup is enabled
  if (!settings.autoBackupEnabled) {
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts.length === 0) {
    return; // Nothing to backup
  }

  // Create export data with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    promptCount: prompts.length,
    prompts: prompts
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download to Downloads folder
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url: url,
      filename: `LLM-Prompts-Backup/llm-prompts-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      saveAs: false, // Don't prompt, just save automatically
      conflictAction: 'overwrite' // Overwrite if file exists
    });
  } catch (error) {
    console.error('Auto-backup failed:', error);
  } finally {
    URL.revokeObjectURL(url);
  }
}
