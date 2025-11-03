// ============================================================================
// LLM PROMPT MANAGER - COMPREHENSIVE POPUP SCRIPT
// ============================================================================

// Global state
let bulkModeActive = false;
let selectedPromptIndices = new Set();
let currentEditingIndex = null;
let draggedElement = null;
let draggedIndex = null;

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

// Search elements
const searchInput = document.getElementById('searchInput');
const bulkModeToggle = document.getElementById('bulkModeToggle');

// Bulk mode elements
const bulkActionsBar = document.getElementById('bulkActionsBar');
const bulkSelectedCount = document.getElementById('bulkSelectedCount');
const bulkMoveFolder = document.getElementById('bulkMoveFolder');
const bulkMoveBtn = document.getElementById('bulkMoveBtn');
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const bulkCancelBtn = document.getElementById('bulkCancelBtn');

// Recent and favorites
const recentSection = document.getElementById('recentSection');
const recentPromptsList = document.getElementById('recentPromptsList');
const favoritesSection = document.getElementById('favoritesSection');
const favoritePromptsList = document.getElementById('favoritePromptsList');

// Trash elements
const trashSection = document.getElementById('trashSection');
const viewTrashBtn = document.getElementById('viewTrashBtn');
const trashList = document.getElementById('trashList');

// Modal elements
const editModal = document.getElementById('editModal');
const editPromptName = document.getElementById('editPromptName');
const editPromptFolder = document.getElementById('editPromptFolder');
const editPromptText = document.getElementById('editPromptText');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const variableModal = document.getElementById('variableModal');
const variableInputs = document.getElementById('variableInputs');
const insertWithVariablesBtn = document.getElementById('insertWithVariablesBtn');
const cancelVariablesBtn = document.getElementById('cancelVariablesBtn');

const shareModal = document.getElementById('shareModal');
const shareCode = document.getElementById('shareCode');
const copyShareCodeBtn = document.getElementById('copyShareCodeBtn');
const closeShareBtn = document.getElementById('closeShareBtn');
const sharePromptsBtn = document.getElementById('sharePromptsBtn');

const importCodeModal = document.getElementById('importCodeModal');
const importCodeInput = document.getElementById('importCodeInput');
const importCodeBtn = document.getElementById('importCodeBtn');
const cancelImportCodeBtn = document.getElementById('cancelImportCodeBtn');
const importFromCodeBtn = document.getElementById('importFromCodeBtn');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  await initializeFolders();
  await loadFolders();
  await loadPrompts();
  loadAutoBackupSetting();
  await displayRecentlyUsed();
  await displayFavorites();
  await loadTrash();
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Add prompt
addPromptBtn.addEventListener('click', addPrompt);
promptNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addPrompt();
});

// Export/Import
exportBtn.addEventListener('click', exportPrompts);
importBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importPrompts);

// Folders
addFolderBtn.addEventListener('click', addFolder);
newFolderInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addFolder();
});
filterFolderSelect.addEventListener('change', () => loadPrompts());

// Auto-backup
autoBackupToggle.addEventListener('change', async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.sync.set({ autoBackupEnabled: isEnabled });
  if (isEnabled) {
    showToast('Auto-backup enabled!');
    await performAutoBackup();
  } else {
    showToast('Auto-backup disabled.');
  }
});

// Search
searchInput.addEventListener('input', handleSearch);

// Bulk mode
bulkModeToggle.addEventListener('click', toggleBulkMode);
bulkCancelBtn.addEventListener('click', exitBulkMode);
bulkMoveBtn.addEventListener('click', bulkMovePrompts);
bulkDeleteBtn.addEventListener('click', bulkDeletePrompts);

// Trash
viewTrashBtn.addEventListener('click', toggleTrashView);

// Share/Import modals
sharePromptsBtn.addEventListener('click', openShareModal);
closeShareBtn.addEventListener('click', () => closeModal(shareModal));
copyShareCodeBtn.addEventListener('click', copyShareCode);

importFromCodeBtn.addEventListener('click', () => openModal(importCodeModal));
cancelImportCodeBtn.addEventListener('click', () => closeModal(importCodeModal));
importCodeBtn.addEventListener('click', importFromCode);

// Edit modal
cancelEditBtn.addEventListener('click', () => closeModal(editModal));
saveEditBtn.addEventListener('click', saveEdit);

// Variable modal
cancelVariablesBtn.addEventListener('click', () => closeModal(variableModal));

// Modal close on X
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    closeModal(modal);
  });
});

// Modal close on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ============================================================================
// FOLDERS MANAGEMENT
// ============================================================================

async function initializeFolders() {
  const data = await chrome.storage.sync.get(['folders']);
  let folders = data.folders || [];

  if (folders.length === 0) {
    folders = [{
      id: 'default',
      name: 'Uncategorized',
      isDefault: true
    }];
    await chrome.storage.sync.set({ folders });
  }
}

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

    if (!folder.isDefault) {
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'folder-delete';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => deleteFolder(folder.id);
      folderTag.appendChild(deleteBtn);
    }

    foldersList.appendChild(folderTag);
  });

  updateFolderSelects(folders);
}

function updateFolderSelects(folders) {
  // Update prompt folder select
  promptFolderSelect.innerHTML = '<option value="">Select folder...</option>';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    if (folder.isDefault) option.selected = true;
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

  // Update edit modal select
  editPromptFolder.innerHTML = '';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    editPromptFolder.appendChild(option);
  });

  // Update bulk move select
  bulkMoveFolder.innerHTML = '<option value="">Move to folder...</option>';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    bulkMoveFolder.appendChild(option);
  });
}

async function addFolder() {
  const name = newFolderInput.value.trim();
  if (!name) {
    alert('Please enter a folder name');
    return;
  }

  const data = await chrome.storage.sync.get(['folders']);
  const folders = data.folders || [];

  if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    alert('A folder with this name already exists');
    return;
  }

  const newFolder = {
    id: 'folder_' + Date.now(),
    name: name,
    isDefault: false
  };

  folders.push(newFolder);
  await chrome.storage.sync.set({ folders });

  newFolderInput.value = '';
  await loadFolders();
  showToast('Folder created successfully!');
  await performAutoBackup();
}

async function deleteFolder(folderId) {
  if (!confirm('Delete this folder? Prompts will be moved to Uncategorized.')) {
    return;
  }

  const data = await chrome.storage.sync.get(['folders', 'prompts']);
  let folders = data.folders || [];
  let prompts = data.prompts || [];

  folders = folders.filter(f => f.id !== folderId);

  const defaultFolder = folders.find(f => f.isDefault);
  prompts = prompts.map(p => {
    if (p.folderId === folderId) {
      return { ...p, folderId: defaultFolder.id };
    }
    return p;
  });

  await chrome.storage.sync.set({ folders, prompts });
  await loadFolders();
  await loadPrompts();
  showToast('Folder deleted');
  await performAutoBackup();
}

// ============================================================================
// PROMPTS MANAGEMENT
// ============================================================================

async function loadPrompts() {
  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  let prompts = data.prompts || [];
  const folders = data.folders || [];

  // Filter by folder
  const selectedFolder = filterFolderSelect.value;
  if (selectedFolder !== 'all') {
    prompts = prompts.filter(p => p.folderId === selectedFolder);
  }

  // Filter by search
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    prompts = prompts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.text.toLowerCase().includes(searchTerm)
    );
  }

  if (prompts.length === 0) {
    emptyState.style.display = 'block';
    promptsList.innerHTML = '';
  } else {
    emptyState.style.display = 'none';
    displayPrompts(prompts, folders);
  }
}

function displayPrompts(prompts, folders) {
  promptsList.innerHTML = '';

  prompts.forEach((prompt, index) => {
    const folder = folders.find(f => f.id === prompt.folderId);
    const folderName = folder ? folder.name : 'Uncategorized';

    const promptCard = document.createElement('div');
    promptCard.className = 'prompt-card' + (bulkModeActive ? ' bulk-mode' : '');
    promptCard.draggable = !bulkModeActive;

    // Drag and drop handlers
    if (!bulkModeActive) {
      promptCard.addEventListener('dragstart', handleDragStart);
      promptCard.addEventListener('dragover', handleDragOver);
      promptCard.addEventListener('drop', handleDrop);
      promptCard.addEventListener('dragend', handleDragEnd);
    }

    // Build card content
    const promptHeader = document.createElement('div');
    promptHeader.className = 'prompt-header';

    // Bulk mode checkbox
    if (bulkModeActive) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'prompt-checkbox';
      checkbox.checked = selectedPromptIndices.has(index);
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedPromptIndices.add(index);
        } else {
          selectedPromptIndices.delete(index);
        }
        updateBulkSelectionCount();
      });
      promptHeader.appendChild(checkbox);
    }

    // Drag handle
    if (!bulkModeActive) {
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      dragHandle.textContent = '⋮⋮';
      promptHeader.appendChild(dragHandle);
    }

    const promptName = document.createElement('h3');
    promptName.textContent = prompt.name;

    // Version badge if has history
    if (prompt.history && prompt.history.length > 0) {
      const versionBadge = document.createElement('span');
      versionBadge.className = 'version-badge';
      versionBadge.textContent = `v${prompt.history.length + 1}`;
      promptName.appendChild(versionBadge);
    }

    const promptActions = document.createElement('div');
    promptActions.className = 'prompt-actions';

    // Favorite button
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'prompt-favorite-btn' + (prompt.favorite ? ' favorited' : '');
    favoriteBtn.textContent = '⭐';
    favoriteBtn.onclick = () => toggleFavorite(index);
    promptActions.appendChild(favoriteBtn);

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋';
    copyBtn.className = 'btn-copy';
    copyBtn.onclick = () => usePrompt(index);
    promptActions.appendChild(copyBtn);

    // Duplicate button
    const duplicateBtn = document.createElement('button');
    duplicateBtn.textContent = '📄';
    duplicateBtn.className = 'btn-duplicate';
    duplicateBtn.title = 'Duplicate';
    duplicateBtn.onclick = () => duplicatePrompt(index);
    promptActions.appendChild(duplicateBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'btn-edit';
    editBtn.onclick = () => openEditModal(index, prompt);
    promptActions.appendChild(editBtn);

    // History button (if has versions)
    if (prompt.history && prompt.history.length > 0) {
      const historyBtn = document.createElement('button');
      historyBtn.textContent = '🕐';
      historyBtn.className = 'btn-history';
      historyBtn.title = 'View History';
      historyBtn.onclick = () => viewHistory(index);
      promptActions.appendChild(historyBtn);
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'btn-delete';
    deleteBtn.onclick = () => deletePrompt(index);
    promptActions.appendChild(deleteBtn);

    promptHeader.appendChild(promptName);
    promptHeader.appendChild(promptActions);

    // Folder badge
    const folderBadge = document.createElement('div');
    folderBadge.className = 'folder-badge';
    folderBadge.textContent = `📁 ${folderName}`;

    // Usage count if exists
    if (prompt.usageCount) {
      const usageSpan = document.createElement('span');
      usageSpan.style.marginLeft = '8px';
      usageSpan.style.color = '#4285f4';
      usageSpan.textContent = `• Used ${prompt.usageCount}x`;
      folderBadge.appendChild(usageSpan);
    }

    const promptText = document.createElement('p');
    promptText.className = 'prompt-text';
    promptText.textContent = prompt.text;

    promptCard.appendChild(promptHeader);
    promptCard.appendChild(folderBadge);
    promptCard.appendChild(promptText);

    // Store index as data attribute
    promptCard.dataset.index = index;

    promptsList.appendChild(promptCard);
  });
}

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

  prompts.push({
    name,
    text,
    folderId,
    favorite: false,
    usageCount: 0,
    lastUsed: null,
    createdAt: Date.now(),
    history: []
  });

  await chrome.storage.sync.set({ prompts });

  promptNameInput.value = '';
  promptTextInput.value = '';

  await loadPrompts();
  showToast('Prompt added successfully!');
  await performAutoBackup();
}

async function usePrompt(index) {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];
  const prompt = prompts[index];

  if (!prompt) return;

  // Check for variables
  const variables = extractVariables(prompt.text);

  if (variables.length > 0) {
    // Show variable input modal
    showVariableModal(prompt.text, variables, index);
  } else {
    // Copy directly
    await copyPromptText(prompt.text, prompt.name, index);
  }
}

async function copyPromptText(text, name, index) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`"${name}" copied to clipboard!`);

    // Update usage stats
    await incrementUsageCount(index);
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast('Failed to copy prompt', 'error');
  }
}

async function incrementUsageCount(index) {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[index]) {
    prompts[index].usageCount = (prompts[index].usageCount || 0) + 1;
    prompts[index].lastUsed = Date.now();
    await chrome.storage.sync.set({ prompts });

    // Refresh displays
    await displayRecentlyUsed();
    await loadPrompts();
  }
}

async function duplicatePrompt(index) {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];
  const original = prompts[index];

  if (!original) return;

  const duplicate = {
    ...original,
    name: original.name + ' (Copy)',
    usageCount: 0,
    lastUsed: null,
    createdAt: Date.now(),
    history: []
  };

  prompts.push(duplicate);
  await chrome.storage.sync.set({ prompts });

  await loadPrompts();
  showToast('Prompt duplicated!');
  await performAutoBackup();
}

async function deletePrompt(index) {
  if (!confirm('Move this prompt to trash?')) {
    return;
  }

  const data = await chrome.storage.sync.get(['prompts', 'trash']);
  const prompts = data.prompts || [];
  const trash = data.trash || [];

  const deletedPrompt = prompts[index];
  if (deletedPrompt) {
    deletedPrompt.deletedAt = Date.now();
    trash.push(deletedPrompt);
  }

  prompts.splice(index, 1);

  await chrome.storage.sync.set({ prompts, trash });
  await loadPrompts();
  await loadTrash();
  showToast('Prompt moved to trash');
  await performAutoBackup();
}

// ============================================================================
// SEARCH
// ============================================================================

function handleSearch() {
  loadPrompts();
}

// ============================================================================
// BULK MODE
// ============================================================================

function toggleBulkMode() {
  bulkModeActive = !bulkModeActive;

  if (bulkModeActive) {
    enterBulkMode();
  } else {
    exitBulkMode();
  }
}

function enterBulkMode() {
  bulkModeActive = true;
  selectedPromptIndices.clear();
  bulkModeToggle.classList.add('active');
  bulkModeToggle.textContent = 'Exit Bulk Mode';
  bulkActionsBar.style.display = 'flex';
  loadPrompts();
}

function exitBulkMode() {
  bulkModeActive = false;
  selectedPromptIndices.clear();
  bulkModeToggle.classList.remove('active');
  bulkModeToggle.textContent = 'Select Multiple';
  bulkActionsBar.style.display = 'none';
  loadPrompts();
}

function updateBulkSelectionCount() {
  bulkSelectedCount.textContent = `${selectedPromptIndices.size} selected`;
}

async function bulkMovePrompts() {
  const targetFolderId = bulkMoveFolder.value;

  if (!targetFolderId) {
    alert('Please select a folder');
    return;
  }

  if (selectedPromptIndices.size === 0) {
    alert('No prompts selected');
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  selectedPromptIndices.forEach(index => {
    if (prompts[index]) {
      prompts[index].folderId = targetFolderId;
    }
  });

  await chrome.storage.sync.set({ prompts });

  showToast(`Moved ${selectedPromptIndices.size} prompts`);
  exitBulkMode();
  await loadPrompts();
  await performAutoBackup();
}

async function bulkDeletePrompts() {
  if (selectedPromptIndices.size === 0) {
    alert('No prompts selected');
    return;
  }

  if (!confirm(`Move ${selectedPromptIndices.size} prompts to trash?`)) {
    return;
  }

  const data = await chrome.storage.sync.get(['prompts', 'trash']);
  const prompts = data.prompts || [];
  const trash = data.trash || [];

  // Sort indices in descending order to avoid index shifting
  const sortedIndices = Array.from(selectedPromptIndices).sort((a, b) => b - a);

  sortedIndices.forEach(index => {
    if (prompts[index]) {
      prompts[index].deletedAt = Date.now();
      trash.push(prompts[index]);
      prompts.splice(index, 1);
    }
  });

  await chrome.storage.sync.set({ prompts, trash });

  showToast(`Moved ${sortedIndices.length} prompts to trash`);
  exitBulkMode();
  await loadPrompts();
  await loadTrash();
  await performAutoBackup();
}

// ============================================================================
// RECENTLY USED
// ============================================================================

async function displayRecentlyUsed() {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  const recentPrompts = prompts
    .filter(p => p.lastUsed)
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, 5);

  if (recentPrompts.length === 0) {
    recentSection.style.display = 'none';
    return;
  }

  recentSection.style.display = 'block';
  recentPromptsList.innerHTML = '';

  recentPrompts.forEach(prompt => {
    const index = prompts.indexOf(prompt);
    const item = document.createElement('div');
    item.className = 'recent-prompt-item';
    item.onclick = () => usePrompt(index);

    const info = document.createElement('div');
    info.className = 'recent-prompt-info';

    const name = document.createElement('div');
    name.className = 'recent-prompt-name';
    name.textContent = prompt.name;

    const time = document.createElement('div');
    time.className = 'recent-prompt-time';
    time.textContent = formatTimeAgo(prompt.lastUsed);

    info.appendChild(name);
    info.appendChild(time);

    const count = document.createElement('div');
    count.className = 'recent-prompt-count';
    count.textContent = `${prompt.usageCount || 0}x`;

    item.appendChild(info);
    item.appendChild(count);
    recentPromptsList.appendChild(item);
  });
}

// ============================================================================
// FAVORITES
// ============================================================================

async function toggleFavorite(index) {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[index]) {
    prompts[index].favorite = !prompts[index].favorite;
    await chrome.storage.sync.set({ prompts });

    await loadPrompts();
    await displayFavorites();
    showToast(prompts[index].favorite ? 'Added to favorites!' : 'Removed from favorites');
    await performAutoBackup();
  }
}

async function displayFavorites() {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  const favorites = prompts.filter(p => p.favorite);

  if (favorites.length === 0) {
    favoritesSection.style.display = 'none';
    return;
  }

  favoritesSection.style.display = 'block';
  favoritePromptsList.innerHTML = '';

  favorites.forEach(prompt => {
    const index = prompts.indexOf(prompt);
    const item = document.createElement('div');
    item.className = 'favorite-prompt-item';
    item.onclick = () => usePrompt(index);

    const name = document.createElement('div');
    name.className = 'favorite-prompt-name';
    name.textContent = prompt.name;

    const star = document.createElement('span');
    star.className = 'favorite-star';
    star.textContent = '⭐';

    item.appendChild(name);
    item.appendChild(star);
    favoritePromptsList.appendChild(item);
  });
}

// ============================================================================
// EDIT MODAL
// ============================================================================

function openEditModal(index, prompt) {
  currentEditingIndex = index;
  editPromptName.value = prompt.name;
  editPromptText.value = prompt.text;
  editPromptFolder.value = prompt.folderId;
  openModal(editModal);
}

async function saveEdit() {
  if (currentEditingIndex === null) return;

  const newName = editPromptName.value.trim();
  const newText = editPromptText.value.trim();
  const newFolderId = editPromptFolder.value;

  if (!newName || !newText) {
    alert('Name and text cannot be empty');
    return;
  }

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[currentEditingIndex]) {
    const oldPrompt = { ...prompts[currentEditingIndex] };

    // Add to history if text changed
    if (oldPrompt.text !== newText) {
      if (!prompts[currentEditingIndex].history) {
        prompts[currentEditingIndex].history = [];
      }
      prompts[currentEditingIndex].history.push({
        text: oldPrompt.text,
        name: oldPrompt.name,
        timestamp: Date.now()
      });
    }

    prompts[currentEditingIndex].name = newName;
    prompts[currentEditingIndex].text = newText;
    prompts[currentEditingIndex].folderId = newFolderId;

    await chrome.storage.sync.set({ prompts });
    await loadPrompts();
    showToast('Prompt updated successfully!');
    await performAutoBackup();
  }

  closeModal(editModal);
  currentEditingIndex = null;
}

// ============================================================================
// VARIABLE SUBSTITUTION
// ============================================================================

function extractVariables(text) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

function showVariableModal(promptText, variables, promptIndex) {
  variableInputs.innerHTML = '';

  variables.forEach(varName => {
    const group = document.createElement('div');
    group.className = 'variable-input-group';

    const label = document.createElement('label');
    label.textContent = varName + ':';

    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.varName = varName;
    input.placeholder = `Enter value for ${varName}`;

    group.appendChild(label);
    group.appendChild(input);
    variableInputs.appendChild(group);
  });

  // Store prompt info
  variableModal.dataset.promptText = promptText;
  variableModal.dataset.promptIndex = promptIndex;

  openModal(variableModal);

  // Focus first input
  const firstInput = variableInputs.querySelector('input');
  if (firstInput) firstInput.focus();
}

insertWithVariablesBtn.onclick = async function() {
  const promptText = variableModal.dataset.promptText;
  const promptIndex = parseInt(variableModal.dataset.promptIndex);

  let finalText = promptText;

  const inputs = variableInputs.querySelectorAll('input');
  inputs.forEach(input => {
    const varName = input.dataset.varName;
    const value = input.value.trim() || `{{${varName}}}`;
    finalText = finalText.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), value);
  });

  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];
  const prompt = prompts[promptIndex];

  if (prompt) {
    await copyPromptText(finalText, prompt.name, promptIndex);
  }

  closeModal(variableModal);
};

// ============================================================================
// TRASH / SOFT DELETE
// ============================================================================

async function loadTrash() {
  const data = await chrome.storage.sync.get(['trash']);
  const trash = data.trash || [];

  if (trash.length === 0) {
    trashSection.style.display = 'none';
    return;
  }

  trashSection.style.display = 'block';
}

function toggleTrashView() {
  if (trashList.style.display === 'none') {
    displayTrash();
    trashList.style.display = 'block';
    viewTrashBtn.textContent = 'Hide Trash';
  } else {
    trashList.style.display = 'none';
    viewTrashBtn.textContent = 'View Trash';
  }
}

async function displayTrash() {
  const data = await chrome.storage.sync.get(['trash']);
  const trash = data.trash || [];

  trashList.innerHTML = '';

  if (trash.length === 0) {
    trashList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Trash is empty</p>';
    return;
  }

  trash.forEach((item, index) => {
    const trashItem = document.createElement('div');
    trashItem.className = 'trash-item';

    const info = document.createElement('div');
    info.className = 'trash-item-info';

    const name = document.createElement('div');
    name.className = 'trash-item-name';
    name.textContent = item.name;

    info.appendChild(name);

    const actions = document.createElement('div');
    actions.className = 'trash-item-actions';

    const restoreBtn = document.createElement('button');
    restoreBtn.textContent = '↩️ Restore';
    restoreBtn.className = 'btn-restore';
    restoreBtn.onclick = () => restoreFromTrash(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌ Delete';
    deleteBtn.className = 'btn-permanent-delete';
    deleteBtn.onclick = () => permanentDelete(index);

    actions.appendChild(restoreBtn);
    actions.appendChild(deleteBtn);

    trashItem.appendChild(info);
    trashItem.appendChild(actions);
    trashList.appendChild(trashItem);
  });
}

async function restoreFromTrash(index) {
  const data = await chrome.storage.sync.get(['trash', 'prompts']);
  const trash = data.trash || [];
  const prompts = data.prompts || [];

  const restored = trash[index];
  if (restored) {
    delete restored.deletedAt;
    prompts.push(restored);
  }

  trash.splice(index, 1);

  await chrome.storage.sync.set({ trash, prompts });
  await displayTrash();
  await loadTrash();
  await loadPrompts();
  showToast('Prompt restored!');
  await performAutoBackup();
}

async function permanentDelete(index) {
  if (!confirm('Permanently delete this prompt? This cannot be undone.')) {
    return;
  }

  const data = await chrome.storage.sync.get(['trash']);
  const trash = data.trash || [];

  trash.splice(index, 1);

  await chrome.storage.sync.set({ trash });
  await displayTrash();
  await loadTrash();
  showToast('Prompt permanently deleted');
}

// ============================================================================
// DRAG & DROP
// ============================================================================

function handleDragStart(e) {
  draggedElement = e.target;
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';

  const target = e.target.closest('.prompt-card');
  if (target && target !== draggedElement) {
    target.classList.add('drag-over');
  }
  return false;
}

async function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const target = e.target.closest('.prompt-card');
  if (!target || target === draggedElement) return false;

  const targetIndex = parseInt(target.dataset.index);

  // Reorder prompts
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];

  const movedPrompt = prompts[draggedIndex];
  prompts.splice(draggedIndex, 1);
  prompts.splice(targetIndex, 0, movedPrompt);

  await chrome.storage.sync.set({ prompts });
  await loadPrompts();
  showToast('Prompt reordered');
  await performAutoBackup();

  return false;
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.prompt-card').forEach(card => {
    card.classList.remove('drag-over');
  });
  draggedElement = null;
  draggedIndex = null;
}

// ============================================================================
// VERSIONING / HISTORY
// ============================================================================

async function viewHistory(index) {
  const data = await chrome.storage.sync.get(['prompts']);
  const prompts = data.prompts || [];
  const prompt = prompts[index];

  if (!prompt || !prompt.history || prompt.history.length === 0) {
    alert('No history available');
    return;
  }

  let message = `Version History for "${prompt.name}":\n\n`;
  message += `Current (v${prompt.history.length + 1}):\n${prompt.text}\n\n`;

  prompt.history.reverse().forEach((version, i) => {
    const versionNum = prompt.history.length - i;
    const date = new Date(version.timestamp).toLocaleString();
    message += `Version ${versionNum} (${date}):\n${version.text}\n\n`;
  });

  alert(message);
}

// ============================================================================
// SHARE / IMPORT
// ============================================================================

async function openShareModal() {
  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    showToast('No prompts to share!', 'error');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    promptCount: prompts.length,
    folderCount: folders.length,
    folders: folders,
    prompts: prompts
  };

  const encoded = btoa(JSON.stringify(exportData));
  shareCode.value = encoded;

  openModal(shareModal);
}

function copyShareCode() {
  shareCode.select();
  document.execCommand('copy');
  showToast('Share code copied to clipboard!');
}

async function importFromCode() {
  const code = importCodeInput.value.trim();

  if (!code) {
    showToast('Please paste a share code', 'error');
    return;
  }

  try {
    const decoded = atob(code);
    const importData = JSON.parse(decoded);

    if (!importData.prompts || !Array.isArray(importData.prompts)) {
      showToast('Invalid share code!', 'error');
      return;
    }

    const existingData = await chrome.storage.sync.get(['prompts', 'folders']);
    const existingFolders = existingData.folders || [];
    const defaultFolder = existingFolders.find(f => f.isDefault);

    let importedFolders = importData.folders || [];
    let folderIdMap = {};
    let validPrompts = importData.prompts.filter(p => p.name && p.text);

    if (importedFolders.length === 0) {
      validPrompts = validPrompts.map(p => ({
        ...p,
        folderId: defaultFolder.id
      }));
    } else {
      importedFolders.forEach(folder => {
        if (folder.isDefault) {
          folderIdMap[folder.id] = defaultFolder.id;
        } else {
          const newId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          folderIdMap[folder.id] = newId;
        }
      });

      validPrompts = validPrompts.map(p => ({
        ...p,
        folderId: folderIdMap[p.folderId] || defaultFolder.id
      }));
    }

    const shouldMerge = confirm(
      `Found ${validPrompts.length} prompts.\n\n` +
      `OK = Add to existing prompts\n` +
      `Cancel = Replace all prompts`
    );

    if (shouldMerge) {
      const existingPrompts = existingData.prompts || [];
      const mergedPrompts = [...existingPrompts, ...validPrompts];

      const newFolders = importedFolders.filter(f => !f.isDefault).map(f => ({
        id: folderIdMap[f.id],
        name: f.name,
        isDefault: false
      }));

      const mergedFolders = [...existingFolders, ...newFolders];

      await chrome.storage.sync.set({ prompts: mergedPrompts, folders: mergedFolders });
      showToast(`Added ${validPrompts.length} prompts!`);
    } else {
      const newFolders = [defaultFolder, ...importedFolders.filter(f => !f.isDefault).map(f => ({
        id: folderIdMap[f.id],
        name: f.name,
        isDefault: false
      }))];

      await chrome.storage.sync.set({ prompts: validPrompts, folders: newFolders });
      showToast(`Imported ${validPrompts.length} prompts!`);
    }

    await loadFolders();
    await loadPrompts();
    closeModal(importCodeModal);
    importCodeInput.value = '';
    await performAutoBackup();

  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import. Invalid code format.', 'error');
  }
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

async function exportPrompts() {
  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    showToast('No prompts to export!', 'error');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    promptCount: prompts.length,
    folderCount: folders.length,
    folders: folders,
    prompts: prompts
  };

  const jsonString = JSON.stringify(exportData, null, 2);
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

async function importPrompts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);

      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        showToast('Invalid file format!', 'error');
        return;
      }

      const existingData = await chrome.storage.sync.get(['prompts', 'folders']);
      const existingFolders = existingData.folders || [];
      const defaultFolder = existingFolders.find(f => f.isDefault);

      let importedFolders = importData.folders || [];
      let folderIdMap = {};
      let validPrompts = importData.prompts.filter(p => p.name && p.text);

      if (importedFolders.length === 0) {
        validPrompts = validPrompts.map(p => ({
          ...p,
          folderId: defaultFolder.id
        }));
      } else {
        importedFolders.forEach(folder => {
          if (folder.isDefault) {
            folderIdMap[folder.id] = defaultFolder.id;
          } else {
            const newId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            folderIdMap[folder.id] = newId;
          }
        });

        validPrompts = validPrompts.map(p => ({
          ...p,
          folderId: folderIdMap[p.folderId] || defaultFolder.id
        }));
      }

      if (validPrompts.length === 0) {
        showToast('No valid prompts found!', 'error');
        return;
      }

      const shouldMerge = confirm(
        `Found ${validPrompts.length} prompts.\n\n` +
        `OK = Add to existing\n` +
        `Cancel = Replace all`
      );

      if (shouldMerge) {
        const existingPrompts = existingData.prompts || [];
        const mergedPrompts = [...existingPrompts, ...validPrompts];

        const newFolders = importedFolders.filter(f => !f.isDefault).map(f => ({
          id: folderIdMap[f.id],
          name: f.name,
          isDefault: false
        }));

        const mergedFolders = [...existingFolders, ...newFolders];

        await chrome.storage.sync.set({ prompts: mergedPrompts, folders: mergedFolders });
        showToast(`Added ${validPrompts.length} prompts!`);
      } else {
        const newFolders = [defaultFolder, ...importedFolders.filter(f => !f.isDefault).map(f => ({
          id: folderIdMap[f.id],
          name: f.name,
          isDefault: false
        }))];

        await chrome.storage.sync.set({ prompts: validPrompts, folders: newFolders });
        showToast(`Imported ${validPrompts.length} prompts!`);
      }

      await loadFolders();
      await loadPrompts();
      fileInput.value = '';
      await performAutoBackup();

    } catch (error) {
      console.error('Import error:', error);
      showToast('Failed to import. Invalid file.', 'error');
      fileInput.value = '';
    }
  };

  reader.readAsText(file);
}

// ============================================================================
// AUTO BACKUP
// ============================================================================

async function loadAutoBackupSetting() {
  const data = await chrome.storage.sync.get(['autoBackupEnabled']);
  autoBackupToggle.checked = data.autoBackupEnabled || false;
}

async function performAutoBackup() {
  const settings = await chrome.storage.sync.get(['autoBackupEnabled']);

  if (!settings.autoBackupEnabled) {
    return;
  }

  const data = await chrome.storage.sync.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];

  if (prompts.length === 0) {
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    promptCount: prompts.length,
    folderCount: folders.length,
    folders: folders,
    prompts: prompts
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url: url,
      filename: `LLM-Prompts-Backup/llm-prompts-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      saveAs: false,
      conflictAction: 'overwrite'
    });
  } catch (error) {
    console.error('Auto-backup failed:', error);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// MODAL HELPERS
// ============================================================================

function openModal(modal) {
  modal.style.display = 'flex';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
