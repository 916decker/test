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

  // Check for captured text from "Edit before saving" feature
  await checkForCapturedText();
});

// ============================================================================
// AUTO-FILL CAPTURED TEXT (for "Edit before saving" feature)
// ============================================================================

async function checkForCapturedText() {
  // Check if there's temporary captured text from context menu
  const tempData = await chrome.storage.local.get(['tempPromptText', 'tempSourceUrl']);

  if (tempData.tempPromptText) {
    // Auto-fill the prompt text field
    promptTextInput.value = tempData.tempPromptText;

    // Focus on the name field so user can immediately type the title
    promptNameInput.focus();

    // Show a helpful toast
    showToast('✏️ Text captured! Add a title and save', 'info');

    // Clear the temporary storage
    await chrome.storage.local.remove(['tempPromptText', 'tempSourceUrl']);

    // Optionally: Scroll to the add prompt section if it's not visible
    promptNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

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
  await smartStorage.set({ autoBackupEnabled: isEnabled });
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
  const data = await smartStorage.get(['folders']);
  let folders = data.folders || [];

  if (folders.length === 0) {
    folders = [{
      id: 'default',
      name: 'Uncategorized',
      isDefault: true
    }];
    await smartStorage.set({ folders });
  }
}

async function loadFolders() {
  const data = await smartStorage.get(['folders']);
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

  const data = await smartStorage.get(['folders']);
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
  await smartStorage.set({ folders });

  newFolderInput.value = '';
  await loadFolders();
  showToast('Folder created successfully!');
  await performAutoBackup();
}

async function deleteFolder(folderId) {
  if (!confirm('Delete this folder? Prompts will be moved to Uncategorized.')) {
    return;
  }

  const data = await smartStorage.get(['folders', 'prompts']);
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

  await smartStorage.set({ folders, prompts });
  await loadFolders();
  await loadPrompts();
  showToast('Folder deleted');
  await performAutoBackup();
}

// ============================================================================
// PROMPTS MANAGEMENT
// ============================================================================

async function loadPrompts() {
  const data = await smartStorage.get(['prompts', 'folders']);
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

  const data = await smartStorage.get(['prompts']);
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

  await smartStorage.set({ prompts });

  promptNameInput.value = '';
  promptTextInput.value = '';

  await loadPrompts();
  showToast('Prompt added successfully!');
  await performAutoBackup();
}

async function usePrompt(index) {
  const data = await smartStorage.get(['prompts']);
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
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[index]) {
    prompts[index].usageCount = (prompts[index].usageCount || 0) + 1;
    prompts[index].lastUsed = Date.now();
    await smartStorage.set({ prompts });

    // Refresh displays
    await displayRecentlyUsed();
    await loadPrompts();
  }
}

async function duplicatePrompt(index) {
  const data = await smartStorage.get(['prompts']);
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
  await smartStorage.set({ prompts });

  await loadPrompts();
  showToast('Prompt duplicated!');
  await performAutoBackup();
}

async function deletePrompt(index) {
  if (!confirm('Move this prompt to trash?')) {
    return;
  }

  const data = await smartStorage.get(['prompts', 'trash']);
  const prompts = data.prompts || [];
  const trash = data.trash || [];

  const deletedPrompt = prompts[index];
  if (deletedPrompt) {
    deletedPrompt.deletedAt = Date.now();
    trash.push(deletedPrompt);
  }

  prompts.splice(index, 1);

  await smartStorage.set({ prompts, trash });
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

  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  selectedPromptIndices.forEach(index => {
    if (prompts[index]) {
      prompts[index].folderId = targetFolderId;
    }
  });

  await smartStorage.set({ prompts });

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

  const data = await smartStorage.get(['prompts', 'trash']);
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

  await smartStorage.set({ prompts, trash });

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
  const data = await smartStorage.get(['prompts']);
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
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[index]) {
    prompts[index].favorite = !prompts[index].favorite;
    await smartStorage.set({ prompts });

    await loadPrompts();
    await displayFavorites();
    showToast(prompts[index].favorite ? 'Added to favorites!' : 'Removed from favorites');
    await performAutoBackup();
  }
}

async function displayFavorites() {
  const data = await smartStorage.get(['prompts']);
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

  const data = await smartStorage.get(['prompts']);
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

    await smartStorage.set({ prompts });
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

  const data = await smartStorage.get(['prompts']);
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
  const data = await smartStorage.get(['trash']);
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
  const data = await smartStorage.get(['trash']);
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
  const data = await smartStorage.get(['trash', 'prompts']);
  const trash = data.trash || [];
  const prompts = data.prompts || [];

  const restored = trash[index];
  if (restored) {
    delete restored.deletedAt;
    prompts.push(restored);
  }

  trash.splice(index, 1);

  await smartStorage.set({ trash, prompts });
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

  const data = await smartStorage.get(['trash']);
  const trash = data.trash || [];

  trash.splice(index, 1);

  await smartStorage.set({ trash });
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
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  const movedPrompt = prompts[draggedIndex];
  prompts.splice(draggedIndex, 1);
  prompts.splice(targetIndex, 0, movedPrompt);

  await smartStorage.set({ prompts });
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
  const data = await smartStorage.get(['prompts']);
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
  const data = await smartStorage.get(['prompts', 'folders']);
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

    const existingData = await smartStorage.get(['prompts', 'folders']);
    let existingFolders = existingData.folders || [];
    let defaultFolder = existingFolders.find(f => f.isDefault);

    // Safety patch: ensure default folder exists
    if (!defaultFolder) {
      const newDefault = {
        id: 'folder_default_' + Date.now(),
        name: 'Default',
        isDefault: true
      };
      existingFolders.push(newDefault);
      await smartStorage.set({ folders: existingFolders });
      defaultFolder = newDefault;
      showToast('Created default folder');
    }

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

    // Normalize prompts - ensure all required fields are present
    const baseTimestamp = Date.now();
    validPrompts = validPrompts.map((p, index) => ({
      id: p.id || `prompt_${baseTimestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      name: p.name,
      text: p.text,
      favorite: p.favorite !== undefined ? p.favorite : false,
      usageCount: p.usageCount !== undefined ? p.usageCount : 0,
      lastUsed: p.lastUsed !== undefined ? p.lastUsed : null,
      createdAt: p.createdAt || baseTimestamp + index,
      history: Array.isArray(p.history) ? p.history : [],
      folderId: p.folderId // Already mapped above
    }));

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

      await smartStorage.set({ prompts: mergedPrompts, folders: mergedFolders });
      showToast(`Added ${validPrompts.length} prompts!`);
    } else {
      const newFolders = [defaultFolder, ...importedFolders.filter(f => !f.isDefault).map(f => ({
        id: folderIdMap[f.id],
        name: f.name,
        isDefault: false
      }))];

      await smartStorage.set({ prompts: validPrompts, folders: newFolders });
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
  const data = await smartStorage.get(['prompts', 'folders']);
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

  // Validate file type
  if (!file.name.endsWith('.json')) {
    showToast('Please select a JSON file', 'error');
    fileInput.value = '';
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large (max 5MB)', 'error');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const importData = JSON.parse(e.target.result);

      // Validate schema
      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        showToast('Invalid file format!', 'error');
        fileInput.value = '';
        return;
      }

      // Validate each prompt has required fields
      const validPromptCount = importData.prompts.filter(p =>
        p.name && typeof p.name === 'string' &&
        p.text && typeof p.text === 'string'
      ).length;

      if (validPromptCount === 0) {
        showToast('No valid prompts found in file!', 'error');
        fileInput.value = '';
        return;
      }

      const existingData = await smartStorage.get(['prompts', 'folders']);
      let existingFolders = existingData.folders || [];
      let defaultFolder = existingFolders.find(f => f.isDefault);

      // Safety patch: ensure default folder exists
      if (!defaultFolder) {
        const newDefault = {
          id: 'folder_default_' + Date.now(),
          name: 'Default',
          isDefault: true
        };
        existingFolders.push(newDefault);
        await smartStorage.set({ folders: existingFolders });
        defaultFolder = newDefault;
        showToast('Created default folder');
      }

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

      // Normalize prompts - ensure all required fields are present
      const baseTimestamp = Date.now();
      validPrompts = validPrompts.map((p, index) => ({
        id: p.id || `prompt_${baseTimestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        name: p.name,
        text: p.text,
        favorite: p.favorite !== undefined ? p.favorite : false,
        usageCount: p.usageCount !== undefined ? p.usageCount : 0,
        lastUsed: p.lastUsed !== undefined ? p.lastUsed : null,
        createdAt: p.createdAt || baseTimestamp + index,
        history: Array.isArray(p.history) ? p.history : [],
        folderId: p.folderId // Already mapped above
      }));

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

        await smartStorage.set({ prompts: mergedPrompts, folders: mergedFolders });
        showToast(`Added ${validPrompts.length} prompts!`);
      } else {
        const newFolders = [defaultFolder, ...importedFolders.filter(f => !f.isDefault).map(f => ({
          id: folderIdMap[f.id],
          name: f.name,
          isDefault: false
        }))];

        await smartStorage.set({ prompts: validPrompts, folders: newFolders });
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
  const data = await smartStorage.get(['autoBackupEnabled']);
  autoBackupToggle.checked = data.autoBackupEnabled || false;
}

async function performAutoBackup() {
  const settings = await smartStorage.get(['autoBackupEnabled']);

  if (!settings.autoBackupEnabled) {
    return;
  }

  const data = await smartStorage.get(['prompts', 'folders']);
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
// STORAGE QUOTA MANAGEMENT
// ============================================================================

// Storage wrapper that handles quota exceeded errors
const smartStorage = {
  async get(keys) {
    // Try sync first, fallback to local
    try {
      const syncData = await chrome.storage.sync.get(keys);
      // Check if we have data in sync
      if (syncData && Object.keys(syncData).length > 0) {
        return syncData;
      }
    } catch (error) {
      console.warn('Sync storage unavailable, using local:', error);
    }

    // Fallback to local storage
    return await chrome.storage.local.get(keys);
  },

  async set(items) {
    // Calculate approximate size
    const dataSize = JSON.stringify(items).length;
    const SYNC_QUOTA_BYTES_PER_ITEM = 8192;

    // If data is too large, use local storage
    if (dataSize > SYNC_QUOTA_BYTES_PER_ITEM * 0.8) {
      console.warn(`Data size (${dataSize} bytes) exceeds sync quota, using local storage`);
      await chrome.storage.local.set(items);
      showToast('Large dataset - using local storage', 'info');
      return { usedLocal: true };
    }

    // Try sync storage first
    try {
      await chrome.storage.sync.set(items);
      return { usedLocal: false };
    } catch (error) {
      // Check if it's a quota error
      if (error.message && error.message.includes('QUOTA')) {
        console.warn('Quota exceeded, falling back to local storage:', error);
        await chrome.storage.local.set(items);
        showToast('Switched to local storage (quota limit)', 'warning');
        return { usedLocal: true };
      }
      // Re-throw other errors
      throw error;
    }
  }
};

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

// ============================================================================
// V2.1 NEW FEATURES
// ============================================================================

// Dark Mode
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const autoThemeToggle = document.getElementById('autoThemeToggle');

// Settings Panel
settingsBtn.addEventListener('click', () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.style.display = 'none';
});

// Dark Mode Functions
async function initializeDarkMode() {
  const settings = await smartStorage.get(['darkMode', 'autoTheme']);

  darkModeToggle.checked = settings.darkMode || false;
  autoThemeToggle.checked = settings.autoTheme || false;

  applyTheme(settings);

  // Listen for system theme changes
  if (settings.autoTheme) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (autoThemeToggle.checked) {
        document.body.classList.toggle('dark-mode', e.matches);
      }
    });
  }
}

function applyTheme(settings) {
  if (settings.autoTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
  } else {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }
}

darkModeToggle.addEventListener('change', async (e) => {
  const darkMode = e.target.checked;
  await smartStorage.set({ darkMode });

  if (!autoThemeToggle.checked) {
    document.body.classList.toggle('dark-mode', darkMode);
  }

  showToast(darkMode ? 'Dark mode enabled' : 'Light mode enabled');
});

autoThemeToggle.addEventListener('change', async (e) => {
  const autoTheme = e.target.checked;
  await smartStorage.set({ autoTheme });

  if (autoTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
    showToast('Auto theme enabled');
  } else {
    applyTheme({ darkMode: darkModeToggle.checked, autoTheme: false });
    showToast('Auto theme disabled');
  }
});

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', initializeDarkMode);

// Collapsible Sections
document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const section = header.closest('.collapsible-section');
    section.classList.toggle('collapsed');

    // Save state
    const sectionName = header.dataset.section;
    chrome.storage.local.set({
      [`section_${sectionName}_collapsed`]: section.classList.contains('collapsed')
    });
  });
});

// Restore collapsed states
async function restoreCollapsedStates() {
  const states = await chrome.storage.local.get(null);

  document.querySelectorAll('.section-header').forEach(header => {
    const sectionName = header.dataset.section;
    const isCollapsed = states[`section_${sectionName}_collapsed`];

    if (isCollapsed) {
      header.closest('.collapsible-section').classList.add('collapsed');
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreCollapsedStates);

// Debounced Search
let searchDebounceTimer;
const SEARCH_DEBOUNCE_MS = 150;

const originalHandleSearch = handleSearch;
handleSearch = function() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    originalHandleSearch();
  }, SEARCH_DEBOUNCE_MS);
};

// Templates Library
const templatesBtn = document.getElementById('templatesBtn');
const templatesModal = document.getElementById('templatesModal');
const closeTemplatesBtn = document.getElementById('closeTemplatesBtn');
const templatesList = document.getElementById('templatesList');

const PROMPT_TEMPLATES = [
  {
    category: 'CODE REVIEW',
    name: 'Security-Focused Code Review',
    description: 'Review code for security vulnerabilities, input validation, and authentication issues.',
    text: 'Review this code for security issues including:\n- Input validation and sanitization\n- Authentication and authorization\n- SQL injection and XSS vulnerabilities\n- Secure data storage\n- API security\nProvide specific fixes with code examples.'
  },
  {
    category: 'CODE REVIEW',
    name: 'Performance Code Review',
    description: 'Analyze code for performance bottlenecks and optimization opportunities.',
    text: 'Analyze this code for performance improvements:\n- Identify bottlenecks and inefficiencies\n- Suggest algorithmic optimizations\n- Recommend caching strategies\n- Highlight resource usage issues\nProvide benchmarks and optimized code examples.'
  },
  {
    category: 'WRITING',
    name: 'Professional Email',
    description: 'Draft professional business emails with proper tone and structure.',
    text: 'Write a professional email about {{topic}} to {{recipient}}.\nTone: {{tone}}\nKey points:\n- {{point1}}\n- {{point2}}\n- {{point3}}\nKeep it concise and actionable.'
  },
  {
    category: 'WRITING',
    name: 'Blog Post Outline',
    description: 'Create comprehensive blog post outlines with SEO considerations.',
    text: 'Create a blog post outline about {{topic}} for {{audience}}.\nInclude:\n- Compelling title (SEO optimized)\n- Introduction hook\n- 5-7 main sections with subpoints\n- Conclusion with CTA\n- Meta description\nTarget length: {{word_count}} words'
  },
  {
    category: 'LEARNING',
    name: 'Explain Like I\'m 5',
    description: 'Simplify complex topics using analogies and simple language.',
    text: 'Explain {{concept}} as if I\'m 5 years old.\nUse:\n- Simple everyday analogies\n- No technical jargon\n- Short sentences\n- Relatable examples from daily life\nMake it fun and engaging!'
  },
  {
    category: 'LEARNING',
    name: 'Technical Deep Dive',
    description: 'Comprehensive technical explanations with examples and edge cases.',
    text: 'Provide a technical deep dive on {{topic}}.\nCover:\n- Core concepts and principles\n- Implementation details\n- Common edge cases\n- Best practices\n- Performance considerations\n- Real-world examples\nAssume advanced knowledge.'
  },
  {
    category: 'BUSINESS',
    name: 'Meeting Notes Summary',
    description: 'Summarize meeting notes into action items and key decisions.',
    text: 'Summarize these meeting notes into:\n1. Key Decisions Made\n2. Action Items (with owners and deadlines)\n3. Open Questions\n4. Next Steps\n\nMake it concise and scannable.'
  },
  {
    category: 'BUSINESS',
    name: 'Project Proposal',
    description: 'Create structured project proposals with timeline and resources.',
    text: 'Create a project proposal for {{project_name}}.\nInclude:\n- Executive Summary\n- Problem Statement\n- Proposed Solution\n- Timeline & Milestones\n- Resource Requirements\n- Expected Outcomes\n- Risks & Mitigation\nTarget audience: {{stakeholders}}'
  },
  {
    category: 'DEBUGGING',
    name: 'Error Analysis',
    description: 'Analyze error messages and provide debugging steps.',
    text: 'Analyze this error and help me debug:\n\nError: {{error_message}}\n\nProvide:\n1. What the error means\n2. Common causes\n3. Step-by-step debugging approach\n4. Preventive measures\n5. Code examples of fixes'
  },
  {
    category: 'CREATIVE',
    name: 'Brainstorm Ideas',
    description: 'Generate creative ideas with different approaches.',
    text: 'Brainstorm {{number}} creative ideas for {{goal}}.\n\nFor each idea provide:\n- Catchy name\n- One-line description\n- Key benefits\n- Implementation difficulty (1-10)\n- Unique selling point\n\nThink outside the box!'
  }
];

templatesBtn.addEventListener('click', () => {
  loadTemplates();
  openModal(templatesModal);
});

closeTemplatesBtn.addEventListener('click', () => {
  closeModal(templatesModal);
});

function loadTemplates() {
  templatesList.innerHTML = '';

  PROMPT_TEMPLATES.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';

    card.innerHTML = `
      <div class="template-category">${template.category}</div>
      <div class="template-name">${template.name}</div>
      <div class="template-description">${template.description}</div>
    `;

    card.onclick = () => importTemplate(template);
    templatesList.appendChild(card);
  });
}

async function importTemplate(template) {
  const data = await smartStorage.get(['prompts', 'folders']);
  const prompts = data.prompts || [];
  const folders = data.folders || [];
  const defaultFolder = folders.find(f => f.isDefault);

  prompts.push({
    name: template.name,
    text: template.text,
    folderId: defaultFolder.id,
    favorite: false,
    usageCount: 0,
    lastUsed: null,
    createdAt: Date.now(),
    history: []
  });

  await smartStorage.set({ prompts });
  await loadPrompts();
  closeModal(templatesModal);
  showToast(`Template "${template.name}" imported!`);
  await performAutoBackup();
}

// Analytics Dashboard
const analyticsBtn = document.getElementById('analyticsBtn');
const analyticsModal = document.getElementById('analyticsModal');
const closeAnalyticsBtn = document.getElementById('closeAnalyticsBtn');

analyticsBtn.addEventListener('click', () => {
  loadAnalytics();
  openModal(analyticsModal);
});

closeAnalyticsBtn.addEventListener('click', () => {
  closeModal(analyticsModal);
});

async function loadAnalytics() {
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  // Top prompts
  const topPrompts = prompts
    .filter(p => p.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);

  const topPromptsList = document.getElementById('topPromptsList');
  topPromptsList.innerHTML = '';

  if (topPrompts.length === 0) {
    topPromptsList.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">No usage data yet</p>';
  } else {
    topPrompts.forEach(prompt => {
      const item = document.createElement('div');
      item.className = 'top-prompt-item';
      item.innerHTML = `
        <span class="top-prompt-name">${prompt.name}</span>
        <span class="top-prompt-count">${prompt.usageCount}x</span>
      `;
      topPromptsList.appendChild(item);
    });
  }

  // Favorites count
  const favoritesCount = prompts.filter(p => p.favorite).length;
  document.getElementById('favoritesCount').innerHTML = `
    <div class="analytics-number">${favoritesCount}</div>
    <div class="analytics-label">Favorite Prompts</div>
  `;

  // Total usage
  const totalUsage = prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0);
  document.getElementById('totalUsage').innerHTML = `
    <div class="analytics-number">${totalUsage}</div>
    <div class="analytics-label">Total Uses</div>
  `;
}

// Quick Edit Mode (Double-click)
function enableQuickEdit(promptCard, index, prompt) {
  const nameElement = promptCard.querySelector('h3');
  const originalName = prompt.name;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'quick-edit-input';
  input.value = originalName;

  nameElement.replaceWith(input);
  input.focus();
  input.select();

  const saveEdit = async () => {
    const newName = input.value.trim();
    if (newName && newName !== originalName) {
      const data = await smartStorage.get(['prompts']);
      const prompts = data.prompts || [];
      if (prompts[index]) {
        prompts[index].name = newName;
        await smartStorage.set({ prompts });
        await loadPrompts();
        showToast('Prompt renamed!');
        await performAutoBackup();
      }
    } else {
      await loadPrompts(); // Reload to restore original
    }
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') loadPrompts();
  });
}

// Update displayPrompts to add double-click handler
const originalDisplayPrompts = displayPrompts;
displayPrompts = function(prompts, folders) {
  originalDisplayPrompts(prompts, folders);

  // Add double-click handlers
  document.querySelectorAll('.prompt-card').forEach((card, index) => {
    const nameElement = card.querySelector('h3');
    if (nameElement && prompts[index]) {
      nameElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        enableQuickEdit(card, index, prompts[index]);
      });
    }
  });
};

// Error Reporting System
async function logError(context, error) {
  const errorLog = {
    context,
    message: error.message || String(error),
    stack: error.stack,
    timestamp: Date.now(),
    version: '2.1'
  };

  // Store locally
  const data = await chrome.storage.local.get(['errorLogs']);
  const logs = data.errorLogs || [];
  logs.push(errorLog);

  // Keep last 50 errors
  if (logs.length > 50) {
    logs.shift();
  }

  await chrome.storage.local.set({ errorLogs: logs });

  console.error('Logged error:', errorLog);
}

// Wrap critical functions with error handling
window.addEventListener('error', (e) => {
  logError('Global error', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  logError('Unhandled promise rejection', e.reason);
});

// Migration System
const CURRENT_VERSION = '2.1';

async function runMigrations() {
  const data = await chrome.storage.local.get(['schemaVersion']);
  const currentSchema = data.schemaVersion || '1.0';

  if (currentSchema === CURRENT_VERSION) return;

  console.log(`Migrating from ${currentSchema} to ${CURRENT_VERSION}`);

  // Run migrations
  if (currentSchema === '1.0') {
    await migrateFrom1To2();
  }

  await chrome.storage.local.set({ schemaVersion: CURRENT_VERSION });
}

async function migrateFrom1To2() {
  // Add new fields to existing prompts
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  const migratedPrompts = prompts.map(p => ({
    ...p,
    favorite: p.favorite !== undefined ? p.favorite : false,
    usageCount: p.usageCount || 0,
    lastUsed: p.lastUsed || null,
    createdAt: p.createdAt || Date.now(),
    history: p.history || []
  }));

  await smartStorage.set({ prompts: migratedPrompts });
  console.log('Migration 1.0 -> 2.0 complete');
}

// Run migrations on load
document.addEventListener('DOMContentLoaded', runMigrations);

// ============================================================================
// V2.2 ADVANCED FEATURES
// ============================================================================

// ============================================================================
// NESTED FOLDERS
// ============================================================================

// Update folder data structure to support parent folders
async function initializeNestedFolders() {
  const data = await smartStorage.get(['folders']);
  let folders = data.folders || [];

  // Add parentId to existing folders if missing
  folders = folders.map(f => ({
    ...f,
    parentId: f.parentId || null,
    expanded: f.expanded !== undefined ? f.expanded : true
  }));

  await smartStorage.set({ folders });
}

// Enhanced folder display with nesting
async function loadFoldersNested() {
  const data = await smartStorage.get(['folders']);
  const folders = data.folders || [];

  foldersList.innerHTML = '';

  // Build folder tree
  const rootFolders = folders.filter(f => !f.parentId);

  function renderFolder(folder, level = 0) {
    const folderTag = document.createElement('div');
    folderTag.className = 'folder-tag' + (folder.isDefault ? ' default' : '');
    if (level > 0) folderTag.classList.add('folder-indent-' + level);

    const children = folders.filter(f => f.parentId === folder.id);
    if (children.length > 0) {
      folderTag.classList.add('has-children');

      const expandBtn = document.createElement('button');
      expandBtn.className = 'folder-expand-btn';
      expandBtn.textContent = folder.expanded ? '▼' : '▶';
      expandBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFolderExpand(folder.id);
      };
      folderTag.appendChild(expandBtn);
    }

    const folderName = document.createElement('span');
    folderName.textContent = folder.name;
    if (children.length > 0) {
      const indicator = document.createElement('span');
      indicator.className = 'subfolder-indicator';
      indicator.textContent = '(' + children.length + ')';
      folderName.appendChild(indicator);
    }
    folderTag.appendChild(folderName);

    if (!folder.isDefault) {
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'folder-delete';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => deleteFolder(folder.id);
      folderTag.appendChild(deleteBtn);
    }

    foldersList.appendChild(folderTag);

    // Render children
    if (folder.expanded && children.length > 0) {
      children.forEach(child => renderFolder(child, level + 1));
    }
  }

  rootFolders.forEach(folder => renderFolder(folder));

  // Update selects
  updateFolderSelects(folders);
}

async function toggleFolderExpand(folderId) {
  const data = await smartStorage.get(['folders']);
  const folders = data.folders || [];

  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    folder.expanded = !folder.expanded;
    await smartStorage.set({ folders });
    await loadFoldersNested();
  }
}

// Override original loadFolders to use nested version
const originalLoadFolders = loadFolders;
loadFolders = async function() {
  await loadFoldersNested();
};

document.addEventListener('DOMContentLoaded', initializeNestedFolders);

// ============================================================================
// PROMPT EFFECTIVENESS TRACKING
// ============================================================================

// Add rating to prompts
async function ratePrompt(index, rating) {
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts[index]) {
    if (!prompts[index].ratings) {
      prompts[index].ratings = { up: 0, down: 0, userRating: null };
    }

    const currentRating = prompts[index].ratings.userRating;

    // Remove previous rating
    if (currentRating === 'up') prompts[index].ratings.up--;
    if (currentRating === 'down') prompts[index].ratings.down--;

    // Add new rating
    if (rating === currentRating) {
      // Toggle off
      prompts[index].ratings.userRating = null;
    } else {
      if (rating === 'up') prompts[index].ratings.up++;
      if (rating === 'down') prompts[index].ratings.down++;
      prompts[index].ratings.userRating = rating;
    }

    await smartStorage.set({ prompts });
    await loadPrompts();
    await performAutoBackup();
  }
}

// Override displayPrompts to add rating buttons
const originalDisplayPromptsV2 = displayPrompts;
displayPrompts = function(prompts, folders) {
  originalDisplayPromptsV2(prompts, folders);

  // Add rating buttons to each prompt
  document.querySelectorAll('.prompt-card').forEach((card, index) => {
    const prompt = prompts[index];
    if (!prompt) return;

    const header = card.querySelector('.prompt-header');
    const actions = header.querySelector('.prompt-actions');

    // Create rating section
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'prompt-rating';

    const thumbsUp = document.createElement('button');
    thumbsUp.className = 'btn-rating thumbs-up';
    thumbsUp.textContent = '👍';
    thumbsUp.title = 'Good prompt';
    if (prompt.ratings && prompt.ratings.userRating === 'up') {
      thumbsUp.classList.add('active');
    }
    thumbsUp.onclick = (e) => {
      e.stopPropagation();
      ratePrompt(index, 'up');
    };

    const thumbsDown = document.createElement('button');
    thumbsDown.className = 'btn-rating thumbs-down';
    thumbsDown.textContent = '👎';
    thumbsDown.title = 'Needs improvement';
    if (prompt.ratings && prompt.ratings.userRating === 'down') {
      thumbsDown.classList.add('active');
    }
    thumbsDown.onclick = (e) => {
      e.stopPropagation();
      ratePrompt(index, 'down');
    };

    ratingDiv.appendChild(thumbsUp);
    ratingDiv.appendChild(thumbsDown);

    // Show score if rated
    if (prompt.ratings && (prompt.ratings.up > 0 || prompt.ratings.down > 0)) {
      const score = prompt.ratings.up - prompt.ratings.down;
      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'rating-score ' + (score > 0 ? 'positive' : score < 0 ? 'negative' : '');
      scoreSpan.textContent = score > 0 ? '+' + score : score;
      ratingDiv.appendChild(scoreSpan);
    }

    // Insert before first action button
    if (actions.firstChild) {
      actions.insertBefore(ratingDiv, actions.firstChild);
    } else {
      actions.appendChild(ratingDiv);
    }
  });

  // Add double-click handlers (from v2.1)
  document.querySelectorAll('.prompt-card').forEach((card, index) => {
    const nameElement = card.querySelector('h3');
    if (nameElement && prompts[index]) {
      nameElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        enableQuickEdit(card, index, prompts[index]);
      });
    }
  });
};

// Update analytics to show top rated
const originalLoadAnalytics = loadAnalytics;
loadAnalytics = async function() {
  await originalLoadAnalytics();

  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  // Top rated prompts
  const ratedPrompts = prompts
    .filter(p => p.ratings && (p.ratings.up > 0 || p.ratings.down > 0))
    .map(p => ({
      ...p,
      score: (p.ratings.up || 0) - (p.ratings.down || 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const topRatedList = document.getElementById('topRatedList');
  topRatedList.innerHTML = '';

  if (ratedPrompts.length === 0) {
    topRatedList.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">No ratings yet</p>';
  } else {
    ratedPrompts.forEach(prompt => {
      const item = document.createElement('div');
      item.className = 'rating-item';
      const scoreClass = prompt.score > 0 ? 'positive' : 'neutral';
      item.innerHTML = '<span class="rating-item-name">' + prompt.name + '</span><span class="rating-item-score ' + scoreClass + '">' + (prompt.score > 0 ? '+' : '') + prompt.score + '</span>';
      topRatedList.appendChild(item);
    });
  }
};

// ============================================================================
// PROMPT CHAINS
// ============================================================================

let currentEditingChain = null;
let chainPrompts = [];

const chainsBtn = document.getElementById('chainsBtn');
const chainsModal = document.getElementById('chainsModal');
const closeChainsBtn = document.getElementById('closeChainsBtn');
const chainsList = document.getElementById('chainsList');
const createChainBtn = document.getElementById('createChainBtn');

const chainEditorModal = document.getElementById('chainEditorModal');
const chainName = document.getElementById('chainName');
const chainDescription = document.getElementById('chainDescription');
const chainPromptsList = document.getElementById('chainPromptsList');
const addPromptToChainBtn = document.getElementById('addPromptToChainBtn');
const saveChainBtn = document.getElementById('saveChainBtn');
const cancelChainBtn = document.getElementById('cancelChainBtn');

chainsBtn.addEventListener('click', () => {
  loadChains();
  openModal(chainsModal);
});

closeChainsBtn.addEventListener('click', () => {
  closeModal(chainsModal);
});

createChainBtn.addEventListener('click', () => {
  openChainEditor();
});

cancelChainBtn.addEventListener('click', () => {
  closeModal(chainEditorModal);
});

saveChainBtn.addEventListener('click', saveChain);

addPromptToChainBtn.addEventListener('click', addPromptToChain);

async function loadChains() {
  const data = await smartStorage.get(['chains']);
  const chains = data.chains || [];

  chainsList.innerHTML = '';

  if (chains.length === 0) {
    chainsList.innerHTML = '<p class="chain-empty-state">No chains created yet. Create your first workflow!</p>';
    return;
  }

  chains.forEach((chain, index) => {
    const card = document.createElement('div');
    card.className = 'chain-card';

    const promptNames = chain.prompts.map(p => p.name).join(' → ');

    card.innerHTML = '<div class="chain-header"><span class="chain-name">' + chain.name + '</span><span class="chain-badge">' + chain.prompts.length + ' prompts</span></div><div class="chain-description">' + (chain.description || 'No description') + '</div><div class="chain-prompts-preview">Prompts: ' + promptNames + '</div><div class="chain-actions"><button class="btn-chain-action" data-action="run">▶ Run Chain</button><button class="btn-chain-action" data-action="edit">✏️ Edit</button><button class="btn-chain-action danger" data-action="delete">🗑️ Delete</button></div>';

    // Add click handlers
    card.querySelector('[data-action="run"]').onclick = (e) => {
      e.stopPropagation();
      runChain(chain);
      closeModal(chainsModal);
    };

    card.querySelector('[data-action="edit"]').onclick = (e) => {
      e.stopPropagation();
      editChain(index, chain);
    };

    card.querySelector('[data-action="delete"]').onclick = (e) => {
      e.stopPropagation();
      deleteChain(index);
    };

    chainsList.appendChild(card);
  });
}

function openChainEditor(chain = null, index = null) {
  currentEditingChain = index;
  chainPrompts = chain ? [...chain.prompts] : [];

  document.getElementById('chainEditorTitle').textContent = chain ? 'Edit Prompt Chain' : 'Create Prompt Chain';
  chainName.value = chain ? chain.name : '';
  chainDescription.value = chain ? chain.description || '' : '';

  renderChainPrompts();
  openModal(chainEditorModal);
  closeModal(chainsModal);
}

function editChain(index, chain) {
  openChainEditor(chain, index);
}

async function deleteChain(index) {
  if (!confirm('Delete this chain?')) return;

  const data = await smartStorage.get(['chains']);
  const chains = data.chains || [];
  chains.splice(index, 1);

  await smartStorage.set({ chains });
  await loadChains();
  showToast('Chain deleted');
}

async function addPromptToChain() {
  const data = await smartStorage.get(['prompts']);
  const prompts = data.prompts || [];

  if (prompts.length === 0) {
    alert('No prompts available. Create some prompts first!');
    return;
  }

  // Show prompt selector
  const promptNames = prompts.map((p, i) => (i + 1) + '. ' + p.name).join('\n');
  const selection = prompt('Select prompt to add (enter number):\n\n' + promptNames);

  if (selection) {
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < prompts.length) {
      const selectedPrompt = prompts[index];
      chainPrompts.push({
        id: selectedPrompt.name + '_' + Date.now(),
        name: selectedPrompt.name,
        text: selectedPrompt.text
      });
      renderChainPrompts();
    } else {
      alert('Invalid selection');
    }
  }
}

function renderChainPrompts() {
  chainPromptsList.innerHTML = '';

  if (chainPrompts.length === 0) {
    chainPromptsList.innerHTML = '<div class="chain-empty-state">No prompts added yet. Click "Add Prompt" to build your chain.</div>';
    return;
  }

  chainPrompts.forEach((prompt, index) => {
    const item = document.createElement('div');
    item.className = 'chain-prompt-item';

    item.innerHTML = '<div class="chain-prompt-order">' + (index + 1) + '</div><div class="chain-prompt-name">' + prompt.name + '</div><div class="chain-prompt-actions"><button class="btn-chain-prompt" data-action="up" title="Move up">▲</button><button class="btn-chain-prompt" data-action="down" title="Move down">▼</button><button class="btn-chain-prompt" data-action="remove" title="Remove">🗑️</button></div>';

    // Move up
    item.querySelector('[data-action="up"]').onclick = () => {
      if (index > 0) {
        [chainPrompts[index - 1], chainPrompts[index]] = [chainPrompts[index], chainPrompts[index - 1]];
        renderChainPrompts();
      }
    };

    // Move down
    item.querySelector('[data-action="down"]').onclick = () => {
      if (index < chainPrompts.length - 1) {
        [chainPrompts[index], chainPrompts[index + 1]] = [chainPrompts[index + 1], chainPrompts[index]];
        renderChainPrompts();
      }
    };

    // Remove
    item.querySelector('[data-action="remove"]').onclick = () => {
      chainPrompts.splice(index, 1);
      renderChainPrompts();
    };

    chainPromptsList.appendChild(item);
  });
}

async function saveChain() {
  const name = chainName.value.trim();
  const description = chainDescription.value.trim();

  if (!name) {
    alert('Please enter a chain name');
    return;
  }

  if (chainPrompts.length === 0) {
    alert('Please add at least one prompt to the chain');
    return;
  }

  const chain = {
    name,
    description,
    prompts: chainPrompts,
    createdAt: Date.now()
  };

  const data = await smartStorage.get(['chains']);
  const chains = data.chains || [];

  if (currentEditingChain !== null) {
    // Update existing
    chains[currentEditingChain] = chain;
  } else {
    // Add new
    chains.push(chain);
  }

  await smartStorage.set({ chains });
  await loadChains();
  closeModal(chainEditorModal);
  openModal(chainsModal);
  showToast(currentEditingChain !== null ? 'Chain updated!' : 'Chain created!');
}

async function runChain(chain) {
  showToast('Running chain: ' + chain.name);

  // Show execution indicator
  const indicator = document.createElement('div');
  indicator.className = 'chain-executing';
  indicator.innerHTML = '<div class="chain-executing-title">Running: ' + chain.name + '</div><div class="chain-executing-progress">Step 0 of ' + chain.prompts.length + '</div><div class="chain-progress-bar"><div class="chain-progress-fill" style="width: 0%"></div></div>';
  document.body.appendChild(indicator);

  // Execute prompts in sequence
  for (let i = 0; i < chain.prompts.length; i++) {
    const prompt = chain.prompts[i];

    // Update progress
    const progress = ((i + 1) / chain.prompts.length) * 100;
    indicator.querySelector('.chain-executing-progress').textContent = 'Step ' + (i + 1) + ' of ' + chain.prompts.length + ': ' + prompt.name;
    indicator.querySelector('.chain-progress-fill').style.width = progress + '%';

    // Copy prompt to clipboard
    await navigator.clipboard.writeText(prompt.text);

    // Wait for user to proceed
    if (i < chain.prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Remove indicator
  setTimeout(() => {
    document.body.removeChild(indicator);
    showToast('Chain "' + chain.name + '" completed!');
  }, 1500);
}

// Initialize chains storage
document.addEventListener('DOMContentLoaded', async () => {
  const data = await smartStorage.get(['chains']);
  if (!data.chains) {
    await smartStorage.set({ chains: [] });
  }
});
