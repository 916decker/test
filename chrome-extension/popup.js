// DOM elements
const promptNameInput = document.getElementById('promptName');
const promptTextInput = document.getElementById('promptText');
const addPromptBtn = document.getElementById('addPrompt');
const promptsList = document.getElementById('promptsList');
const emptyState = document.getElementById('emptyState');

// Load prompts when popup opens
document.addEventListener('DOMContentLoaded', loadPrompts);

// Add prompt button click
addPromptBtn.addEventListener('click', addPrompt);

// Allow Enter key in name input to add prompt
promptNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPrompt();
  }
});

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
