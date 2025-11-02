// DOM elements
const promptNameInput = document.getElementById('promptName');
const promptTextInput = document.getElementById('promptText');
const promptFolderSelect = document.getElementById('promptFolder');
const addPromptBtn = document.getElementById('addPrompt');
const promptsList = document.getElementById('promptsList');
const emptyState = document.getElementById('emptyState');
const exportBtn = document.getElementById('exportPrompts');
const importBtn = document.getElementById('importPrompts');
const fileInput = document.getElementById('fileInput');
const autoBackupToggle = document.getElementById('autoBackupToggle');
const newFolderInput = document.getElementById('newFolderName');
const addFolderBtn = document.getElementById('addFolder');
const foldersList = document.getElementById('foldersList');
const filterFolderSelect = document.getElementById('filterFolder');

// Load prompts, folders, and settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  await initializeFolders();
  await loadFolders();
  await loadPrompts();
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

// Add folder button click
addFolderBtn.addEventListener('click', addFolder);

// Allow Enter key in folder input
newFolderInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addFolder();
  }
});

// Folder filter change
filterFolderSelect.addEventListener('change', () => {
  loadPrompts();
});

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

// Initialize folders (create default if none exist)
async function initializeFolders() {
  const data = await chrome.storage.sync.get(['folders']);
  let folders = data.folders || [];

  if (folders.length === 0) {
    // Create default "Uncategorized" folder
    folders = [{
      id: 'default',
      name: 'Uncategorized',
      isDefault: true
    }];
    await chrome.storage.sync.set({ folders });
  }
}

// Load and display folders
async function loadFolders() {
  const data = await chrome.storage.sync.get(['folders']);
  const folders = data.folders || [];

  // Update folders list display
  foldersList.innerHTML = '';
  folders.forEach(folder => {
    const folderTag = document.createElement('div');
    folderTag.className = 'folder-tag' + (folder.isDefault ? ' default' : '');

    const folderName = document.createElement('span');
    folderName.textContent = folder.name;
    folderTag.appendChild(folderName);

    // Only add delete button for non-default folders
    if (!folder.isDefault) {
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'folder-delete';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => deleteFolder(folder.id);
      folderTag.appendChild(deleteBtn);
    }

    foldersList.appendChild(folderTag);
  });

  // Update folder selects
  updateFolderSelects(folders);
}

// Update folder dropdown selects
function updateFolderSelects(folders) {
  // Update prompt folder select (for adding prompts)
  promptFolderSelect.innerHTML = '<option value="">Select folder...</option>';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    if (folder.isDefault) {
      option.selected = true;
    }
    promptFolderSelect.appendChild(option);
  });

  // Update filter select
  filterFolderSelect.innerHTML = '<option value="all">All Folders</option>';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    filterFolderSelect.appendChild(option);
  });
}

// Add new folder
async function addFolder() {
  const name = newFolderInput.value.trim();

  if (!name) {
    alert('Please enter a folder name');
    return;
  }

  const data = await chrome.storage.sync.get(['folders']);
  const folders = data.folders || [];

  // Check for duplicate names
  if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    alert('A folder with this name already exists');
    return;
  }

  // Create new folder
  const newFolder = {
    id: 'folder_' + Date.now(),
    name: name,
    isDefault: false
  };

  folders.push(newFolder);
  await chrome.storage.sync.set({ folders });

  // Clear input
  newFolderInput.value = '';

  // Reload folders
  await loadFolders();
  showToast('Folder created successfully!');

  // Auto-backup
  await performAutoBackup();
}

// Delete folder
async function deleteFolder(folderId) {
  if (!confirm('Delete this folder? Prompts in this folder will be moved to Uncategorized.')) {
    return;
  }

  const data = await chrome.storage.sync.get(['folders', 'prompts']);
  let folders = data.folders || [];
  let prompts = data.prompts || [];

  // Remove folder
  folders = folders.filter(f => f.id !== folderId);

  // Move prompts to default folder
  const defaultFolder = folders.find(f => f.isDefault);
  prompts = prompts.map(p => {
    if (p.folderId === folderId) {
      return { ...p, folderId: defaultFolder.id };
    }
    return p;
  });

  await chrome.storage.sync.set({ folders, prompts });

  // Reload
  await loadFolders();
  await loadPrompts();
  showToast('Folder deleted');

  // Auto-backup
  await performAutoBackup();
}

// Load auto-backup setting
async function loadAutoBackupSetting() {
  const data = await chrome.storage.sync.get(['autoBackupEnabled']);
  autoBackupToggle.checked = data.autoBackupEnabled || false;
}

// Load and display prompts
async function loadPrompts() {
  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  let prompts = data.prompts || [];
  const folders = data.folders || [];

  // Apply folder filter
  const selectedFolder = filterFolderSelect.value;
  if (selectedFolder !== 'all') {
    prompts = prompts.filter(p => p.folderId === selectedFolder);
  }

  if (prompts.length === 0) {
    emptyState.style.display = 'block';
    promptsList.innerHTML = '';
  } else {
    emptyState.style.display = 'none';
    displayPrompts(prompts, folders);
  }
}

// Display prompts in the list
function displayPrompts(prompts, folders) {
  promptsList.innerHTML = '';

  prompts.forEach((prompt, index) => {
    // Get folder name
    const folder = folders.find(f => f.id === prompt.folderId);
    const folderName = folder ? folder.name : 'Uncategorized';
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

    // Folder badge
    const folderBadge = document.createElement('div');
    folderBadge.className = 'folder-badge';
    folderBadge.textContent = `📁 ${folderName}`;

    const promptText = document.createElement('p');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt.text;

    promptCard.appendChild(promptHeader);
    promptCard.appendChild(folderBadge);
    promptCard.appendChild(promptText);

    promptsList.appendChild(promptCard);
  });
}

// Add new prompt
async function addPrompt() {
  const name = promptNameInput.value.trim();
  const text = promptTextInput.value.trim();
  const folderId = promptFolderSelect.value;

  if (!name || !text) {
    alert('Please enter both name and prompt text');
    return;
  }

  if (!folderId) {
    alert('Please select a folder');
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  prompts.push({ name, text, folderId });

  await chrome.storage.sync.set({ prompts });

  // Clear inputs
  promptNameInput.value = '';
  promptTextInput.value = '';

  // Reload prompts
  await loadPrompts();

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
  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    showToast('No prompts to export!', 'error');
    return;
  }

  // Create export data with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0', // Updated to 2.0 for folder support
    promptCount: prompts.length,
    folderCount: folders.length,
    folders: folders,
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

      // Get existing data
      const existingData = await chrome.storage.sync.get(['prompts', 'folders']);
      const existingFolders = existingData.folders || [];
      const defaultFolder = existingFolders.find(f => f.isDefault);

      // Handle folders from import (v2.0+) or create mappings for old format (v1.0)
      let importedFolders = importData.folders || [];
      let folderIdMap = {};  // Maps old folder IDs to new ones

      // Validate each prompt has name and text
      let validPrompts = importData.prompts.filter(p => p.name && p.text);

      // Handle backwards compatibility - old exports without folders
      if (importedFolders.length === 0 && validPrompts.length > 0) {
        // Old format - assign all prompts to default folder
        validPrompts = validPrompts.map(p => ({
          ...p,
          folderId: defaultFolder.id
        }));
      } else if (importedFolders.length > 0) {
        // New format with folders - merge folders and remap IDs
        importedFolders.forEach(folder => {
          if (folder.isDefault) {
            // Map old default folder to existing default folder
            folderIdMap[folder.id] = defaultFolder.id;
          } else {
            // Create new ID for imported folder
            const newId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            folderIdMap[folder.id] = newId;
          }
        });

        // Update prompt folder IDs
        validPrompts = validPrompts.map(p => ({
          ...p,
          folderId: folderIdMap[p.folderId] || defaultFolder.id
        }));
      }

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
        // Merge folders and prompts
        const existingPrompts = existingData.prompts || [];
        const mergedPrompts = [...existingPrompts, ...validPrompts];

        // Add new folders (skip defaults and duplicates)
        const newFolders = importedFolders.filter(f => !f.isDefault).map(f => ({
          id: folderIdMap[f.id],
          name: f.name,
          isDefault: false
        }));

        const mergedFolders = [...existingFolders, ...newFolders];

        await chrome.storage.sync.set({ prompts: mergedPrompts, folders: mergedFolders });
        showToast(`Added ${validPrompts.length} prompts!`);
      } else {
        // Replace all - keep only default folder and add imported folders
        const newFolders = [defaultFolder, ...importedFolders.filter(f => !f.isDefault).map(f => ({
          id: folderIdMap[f.id],
          name: f.name,
          isDefault: false
        }))];

        await chrome.storage.sync.set({ prompts: validPrompts, folders: newFolders });
        showToast(`Imported ${validPrompts.length} prompts!`);
      }

      // Reload the display
      await loadFolders();
      await loadPrompts();

      // Clear the file input
      fileInput.value = '';

      // Auto-backup
      await performAutoBackup();

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

  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    return; // Nothing to backup
  }

  // Create export data with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    promptCount: prompts.length,
    folderCount: folders.length,
    folders: folders,
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
