// ============================================================================
// DATA MANAGEMENT AND INITIALIZATION
// ============================================================================

// Initialize quotes array - will be populated from localStorage or defaults
let quotes = [];

// Variable to store currently selected category filter
let selectedCategory = 'all';

// Server sync variables
let isSyncing = false;
let lastSyncTime = null;
let syncInterval = null;
let serverQuotes = [];

// Conflict resolution
let pendingConflicts = [];

// Default quotes to use if localStorage is empty
const defaultQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    category: "Inspiration"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    category: "Motivation"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    category: "Inspiration"
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    category: "Wisdom"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "Success"
  },
  {
    text: "Believe you can and you're halfway there.",
    category: "Motivation"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    category: "Perseverance"
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    category: "Life"
  }
];

// ============================================================================
// SERVER SIMULATION AND SYNC FUNCTIONS
// ============================================================================

/**
 * Fetches quotes from the server (simulated using JSONPlaceholder)
 * Maps the posts to quote format for our application
 */
async function fetchQuotesFromServer() {
  try {
    showSyncStatus('Fetching from server...', 'syncing');
    
    // Simulate server fetch using JSONPlaceholder
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Transform posts into quote format
    serverQuotes = posts.map(post => ({
      text: post.title,
      category: post.userId % 2 === 0 ? "Server Wisdom" : "Server Insight",
      id: post.id,
      source: 'server'
    }));
    
    console.log('Fetched quotes from server:', serverQuotes.length);
    updateServerCount();
    
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching from server:', error);
    showSyncStatus('Sync failed: ' + error.message, 'error');
    showNotification('Failed to fetch from server: ' + error.message, 'error');
    return [];
  }
}

/**
 * Posts local quotes to the server (simulated)
 * In a real application, this would save data to the server
 */
async function postQuotesToServer(quotesToPost) {
  try {
    // Simulate posting to server using JSONPlaceholder
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Synced Quotes',
        body: JSON.stringify(quotesToPost),
        userId: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Posted quotes to server:', result);
    return true;
  } catch (error) {
    console.error('Error posting to server:', error);
    return false;
  }
}

/**
 * Syncs local data with server data
 * Handles conflict detection and resolution
 */
async function syncQuotes() {
  if (isSyncing) {
    console.log('Sync already in progress');
    return;
  }
  
  isSyncing = true;
  showSyncStatus('Syncing with server...', 'syncing');
  
  try {
    // Step 1: Fetch quotes from server
    const serverData = await fetchQuotesFromServer();
    
    if (serverData.length === 0) {
      showSyncStatus('No server data available', 'error');
      return;
    }
    
    // Step 2: Detect conflicts and new quotes
    const { conflicts, newServerQuotes } = detectConflicts(serverData);
    
    // Step 3: Handle conflicts if any exist
    if (conflicts.length > 0) {
      console.log('Conflicts detected:', conflicts.length);
      pendingConflicts = conflicts;
      showConflictModal(conflicts);
    }
    
    // Step 4: Merge new server quotes (non-conflicting)
    if (newServerQuotes.length > 0) {
      console.log('Adding new server quotes:', newServerQuotes.length);
      quotes.push(...newServerQuotes);
      saveQuotes();
      populateCategories();
      updateQuoteStats();
    }
    
    // Step 5: Post local quotes to server
    await postQuotesToServer(quotes);
    
    // Update sync status
    lastSyncTime = new Date();
    showSyncStatus('Sync successful', 'success');
    updateSyncTime();
    
    if (conflicts.length === 0 && newServerQuotes.length > 0) {
      showNotification(`Sync complete! Added ${newServerQuotes.length} new quotes from server.`);
    } else if (conflicts.length === 0 && newServerQuotes.length === 0) {
      showNotification('Sync complete! No changes detected.');
    }
    
    // Refresh display
    showRandomQuote();
    
  } catch (error) {
    console.error('Sync error:', error);
    showSyncStatus('Sync failed', 'error');
    showNotification('Sync failed: ' + error.message, 'error');
  } finally {
    isSyncing = false;
  }
}

/**
 * Detects conflicts between local and server data
 * Returns conflicts and new server quotes
 */
function detectConflicts(serverData) {
  const conflicts = [];
  const newServerQuotes = [];
  
  // Simple conflict detection strategy:
  // - If a quote text exists in both but with different categories, it's a conflict
  // - If a quote only exists on server, it's new
  
  serverData.forEach(serverQuote => {
    // Check if this quote text exists locally
    const localMatch = quotes.find(q => 
      q.text.toLowerCase().trim() === serverQuote.text.toLowerCase().trim()
    );
    
    if (localMatch) {
      // Check if categories differ (conflict)
      if (localMatch.category !== serverQuote.category) {
        conflicts.push({
          local: localMatch,
          server: serverQuote,
          type: 'category_mismatch'
        });
      }
    } else {
      // New quote from server
      newServerQuotes.push(serverQuote);
    }
  });
  
  return { conflicts, newServerQuotes };
}

/**
 * Shows the conflict resolution modal
 */
function showConflictModal(conflicts) {
  const modal = document.getElementById('conflictModal');
  const conflictList = document.getElementById('conflictList');
  
  conflictList.innerHTML = '';
  
  conflicts.forEach((conflict, index) => {
    const conflictItem = document.createElement('div');
    conflictItem.className = 'conflict-item';
    conflictItem.innerHTML = `
      <h4>Conflict ${index + 1}: "${conflict.local.text.substring(0, 50)}..."</h4>
      <p><strong>Local:</strong> Category: ${conflict.local.category}</p>
      <p><strong>Server:</strong> Category: ${conflict.server.category}</p>
      <div class="conflict-choice">
        <button onclick="resolveConflict(${index}, 'local')">Keep Local</button>
        <button onclick="resolveConflict(${index}, 'server')">Use Server</button>
      </div>
    `;
    conflictList.appendChild(conflictItem);
  });
  
  modal.style.display = 'block';
}

/**
 * Closes the conflict resolution modal
 */
function closeConflictModal() {
  const modal = document.getElementById('conflictModal');
  modal.style.display = 'none';
  pendingConflicts = [];
}

/**
 * Resolves a single conflict
 */
function resolveConflict(index, choice) {
  if (index >= pendingConflicts.length) return;
  
  const conflict = pendingConflicts[index];
  
  if (choice === 'server') {
    // Update local quote with server data
    const localIndex = quotes.findIndex(q => q.text === conflict.local.text);
    if (localIndex !== -1) {
      quotes[localIndex] = { ...conflict.server };
    }
  }
  // If 'local', we keep the local version (do nothing)
  
  // Remove this conflict from pending
  pendingConflicts.splice(index, 1);
  
  // If no more conflicts, close modal and save
  if (pendingConflicts.length === 0) {
    closeConflictModal();
    saveQuotes();
    populateCategories();
    showRandomQuote();
    showNotification('Conflicts resolved successfully!');
  } else {
    // Refresh the modal with remaining conflicts
    showConflictModal(pendingConflicts);
  }
}

/**
 * Resolves all conflicts with the same choice
 */
function resolveAllConflicts(choice) {
  if (choice === 'server') {
    // Update all local quotes with server data
    pendingConflicts.forEach(conflict => {
      const localIndex = quotes.findIndex(q => q.text === conflict.local.text);
      if (localIndex !== -1) {
        quotes[localIndex] = { ...conflict.server };
      }
    });
    showNotification('All conflicts resolved using server data.');
  } else {
    showNotification('All conflicts resolved keeping local data.');
  }
  
  closeConflictModal();
  saveQuotes();
  populateCategories();
  showRandomQuote();
}

/**
 * Starts periodic syncing
 */
function startPeriodicSync(intervalMinutes = 5) {
  // Clear any existing interval
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Set up new interval
  syncInterval = setInterval(() => {
    console.log('Automatic sync triggered');
    syncQuotes();
  }, intervalMinutes * 60 * 1000);
  
  console.log(`Periodic sync started (every ${intervalMinutes} minutes)`);
}

/**
 * Stops periodic syncing
 */
function stopPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Periodic sync stopped');
  }
}

/**
 * Updates the sync status display
 */
function showSyncStatus(message, status = 'success') {
  const syncStatus = document.getElementById('syncStatus');
  const syncText = document.getElementById('syncText');
  
  syncText.textContent = message;
  
  // Remove all status classes
  syncStatus.classList.remove('syncing', 'error');
  
  // Add appropriate status class
  if (status === 'syncing') {
    syncStatus.classList.add('syncing');
  } else if (status === 'error') {
    syncStatus.classList.add('error');
  }
}

/**
 * Updates the last sync time display
 */
function updateSyncTime() {
  const syncTime = document.getElementById('syncTime');
  if (lastSyncTime) {
    const timeStr = lastSyncTime.toLocaleTimeString();
    syncTime.textContent = `Last synced: ${timeStr}`;
  }
}

/**
 * Updates server quote count in statistics
 */
function updateServerCount() {
  const serverCountElement = document.getElementById('serverCount');
  if (serverCountElement) {
    serverCountElement.textContent = serverQuotes.length;
  }
}

// ============================================================================
// LOCAL STORAGE FUNCTIONS
// ============================================================================

/**
 * Loads quotes from localStorage
 * If no quotes exist in localStorage, uses default quotes
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
      console.log('Quotes loaded from localStorage:', quotes.length);
    } catch (error) {
      console.error('Error parsing quotes from localStorage:', error);
      quotes = [...defaultQuotes];
      saveQuotes();
    }
  } else {
    // First time user - use default quotes
    quotes = [...defaultQuotes];
    saveQuotes();
    console.log('Initialized with default quotes');
  }
  
  updateQuoteStats();
}

/**
 * Saves the current quotes array to localStorage
 */
function saveQuotes() {
  try {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log('Quotes saved to localStorage');
    updateQuoteStats();
  } catch (error) {
    console.error('Error saving quotes to localStorage:', error);
    showNotification('Error saving quotes. Storage may be full.', 'error');
  }
}

/**
 * Loads the last selected category filter from localStorage
 */
function loadLastSelectedFilter() {
  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    selectedCategory = savedFilter;
    const filterSelect = document.getElementById('categoryFilter');
    if (filterSelect) {
      filterSelect.value = selectedCategory;
    }
    console.log('Loaded last selected filter:', selectedCategory);
  }
}

/**
 * Saves the selected category filter to localStorage
 */
function saveSelectedFilter() {
  try {
    localStorage.setItem('selectedCategory', selectedCategory);
    console.log('Saved selected filter:', selectedCategory);
  } catch (error) {
    console.error('Error saving filter to localStorage:', error);
  }
}

// ============================================================================
// SESSION STORAGE FUNCTIONS
// ============================================================================

/**
 * Saves the last viewed quote to sessionStorage
 */
function saveLastViewedQuote(quote) {
  try {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify({
      quote: quote,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

/**
 * Retrieves the last viewed quote from sessionStorage
 */
function getLastViewedQuote() {
  try {
    const lastViewed = sessionStorage.getItem('lastViewedQuote');
    return lastViewed ? JSON.parse(lastViewed) : null;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return null;
  }
}

// ============================================================================
// CATEGORY MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Extracts unique categories from the quotes array
 */
function getUniqueCategories() {
  const categories = quotes.map(quote => quote.category);
  const uniqueCategories = [...new Set(categories)];
  return uniqueCategories.sort();
}

/**
 * Populates the category filter dropdown with unique categories
 */
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (!categoryFilter) {
    console.error('Category filter element not found');
    return;
  }
  
  const categories = getUniqueCategories();
  const currentSelection = categoryFilter.value;
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  if (currentSelection && (currentSelection === 'all' || categories.includes(currentSelection))) {
    categoryFilter.value = currentSelection;
  } else {
    categoryFilter.value = 'all';
    selectedCategory = 'all';
  }
  
  console.log('Categories populated:', categories.length);
  
  const categoryCountElement = document.getElementById('categoryCount');
  if (categoryCountElement) {
    categoryCountElement.textContent = categories.length;
  }
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Filters quotes based on the selected category
 */
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  selectedCategory = categoryFilter.value;
  
  saveSelectedFilter();
  
  console.log('Filtering by category:', selectedCategory);
  
  updateFilterIndicator();
  showRandomQuote();
  updateQuoteStats();
}

/**
 * Gets filtered quotes based on the selected category
 */
function getFilteredQuotes() {
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

/**
 * Updates the filter indicator to show current filter status
 */
function updateFilterIndicator() {
  const indicatorElement = document.getElementById('filterIndicator');
  if (!indicatorElement) return;
  
  const filteredQuotes = getFilteredQuotes();
  
  if (selectedCategory === 'all') {
    indicatorElement.innerHTML = '';
  } else {
    indicatorElement.innerHTML = `
      <span class="filter-indicator">
        📌 Showing ${filteredQuotes.length} quote${filteredQuotes.length !== 1 ? 's' : ''} 
        in "${selectedCategory}"
      </span>
    `;
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

/**
 * Displays a random quote from the filtered quotes array
 */
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `
      <div class="no-quotes-message">
        <p>😕 No quotes available in "${selectedCategory}" category.</p>
        <p>Try selecting a different category or add new quotes!</p>
      </div>
    `;
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  saveLastViewedQuote(randomQuote);
  
  quoteDisplay.innerHTML = '';
  
  const quoteText = document.createElement('div');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  const quoteCategory = document.createElement('div');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— Category: ${randomQuote.category}`;
  
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  console.log('Displayed quote:', randomQuote);
}

/**
 * Updates the quote statistics display
 */
function updateQuoteStats() {
  const quoteCountElement = document.getElementById('quoteCount');
  const filteredCountElement = document.getElementById('filteredCount');
  
  if (quoteCountElement) {
    quoteCountElement.textContent = quotes.length;
  }
  
  if (filteredCountElement) {
    const filteredQuotes = getFilteredQuotes();
    filteredCountElement.textContent = filteredQuotes.length;
  }
}

/**
 * Shows a notification message to the user
 */
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification show';
  
  if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  }
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ============================================================================
// FORM CREATION AND QUOTE MANAGEMENT
// ============================================================================

/**
 * Creates the add quote form dynamically
 */
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteFormContainer');
  formContainer.innerHTML = '';
  
  const formDiv = document.createElement('div');
  formDiv.className = 'add-quote-form';
  
  const heading = document.createElement('h2');
  heading.textContent = '✨ Add Your Own Quote';
  formDiv.appendChild(heading);
  
  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';
  formDiv.appendChild(quoteInput);
  
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  formDiv.appendChild(categoryInput);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'form-buttons';
  
  const addButton = document.createElement('button');
  addButton.textContent = '➕ Add Quote';
  addButton.onclick = addQuote;
  buttonContainer.appendChild(addButton);
  
  formDiv.appendChild(buttonContainer);
  formContainer.appendChild(formDiv);
}

/**
 * Adds a new quote to the quotes array and saves to localStorage
 */
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  if (quoteText === '' || quoteCategory === '') {
    showNotification('Please enter both quote text and category!', 'error');
    return;
  }
  
  const existingCategories = getUniqueCategories();
  const isNewCategory = !existingCategories.includes(quoteCategory);
  
  const newQuote = {
    text: quoteText,
    category: quoteCategory,
    source: 'local'
  };
  
  quotes.push(newQuote);
  saveQuotes();
  
  if (isNewCategory) {
    populateCategories();
    console.log('New category added:', quoteCategory);
  }
  
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  updateFilterIndicator();
  updateQuoteStats();
  showRandomQuote();
  
  const message = isNewCategory 
    ? `Quote added successfully! New category "${quoteCategory}" created.`
    : 'Quote added successfully!';
  showNotification(message);
  
  console.log('New quote added:', newQuote);
}

// ============================================================================
// JSON IMPORT/EXPORT FUNCTIONS
// ============================================================================

/**
 * Exports all quotes to a JSON file
 */
function exportToJsonFile() {
  if (quotes.length === 0) {
    showNotification('No quotes to export!', 'error');
    return;
  }
  
  try {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `quotes_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification(`Successfully exported ${quotes.length} quotes!`);
    console.log('Quotes exported:', quotes.length);
  } catch (error) {
    console.error('Error exporting quotes:', error);
    showNotification('Error exporting quotes. Please try again.', 'error');
  }
}

/**
 * Imports quotes from a JSON file
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  if (!file.name.endsWith('.json')) {
    showNotification('Please select a valid JSON file!', 'error');
    return;
  }
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid file format. Expected an array of quotes.');
      }
      
      const validQuotes = importedQuotes.filter(quote => {
        return quote.text && quote.category && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string';
      });
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file.');
      }
      
      const existingCategories = getUniqueCategories();
      
      quotes.push(...validQuotes);
      saveQuotes();
      populateCategories();
      
      const newCategories = getUniqueCategories();
      const addedCategories = newCategories.filter(cat => !existingCategories.includes(cat));
      
      updateFilterIndicator();
      showRandomQuote();
      
      let message = `Successfully imported ${validQuotes.length} quotes!`;
      if (addedCategories.length > 0) {
        message += ` (${addedCategories.length} new categor${addedCategories.length > 1 ? 'ies' : 'y'})`;
      }
      showNotification(message);
      
      console.log('Quotes imported:', validQuotes.length);
      if (addedCategories.length > 0) {
        console.log('New categories added:', addedCategories);
      }
      
      if (validQuotes.length < importedQuotes.length) {
        const invalidCount = importedQuotes.length - validQuotes.length;
        setTimeout(() => {
          showNotification(`Note: ${invalidCount} invalid quotes were skipped.`, 'error');
        }, 3500);
      }
      
    } catch (error) {
      console.error('Error importing quotes:', error);
      showNotification(`Error importing quotes: ${error.message}`, 'error');
    }
  };
  
  fileReader.onerror = function() {
    showNotification('Error reading file. Please try again.', 'error');
  };
  
  fileReader.readAsText(file);
  event.target.value = '';
}

// ============================================================================
// EVENT LISTENERS AND INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Application initializing...');
  
  loadQuotes();
  populateCategories();
  loadLastSelectedFilter();
  
  // Event Listeners
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
    newQuoteButton.addEventListener('click', showRandomQuote);
    console.log('✓ Show New Quote button event listener attached');
  }
  
  const exportButton = document.getElementById('exportQuotes');
  if (exportButton) {
    exportButton.addEventListener('click', exportToJsonFile);
    console.log('✓ Export button event listener attached');
  }
  
  const importFileInput = document.getElementById('importFile');
  if (importFileInput) {
    importFileInput.addEventListener('change', importFromJsonFile);
    console.log('✓ Import file input event listener attached');
  }
  
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterQuotes);
    console.log('✓ Category filter event listener attached');
  }
  
  const syncButton = document.getElementById('syncButton');
  if (syncButton) {
    syncButton.addEventListener('click', syncQuotes);
    console.log('✓ Sync button event listener attached');
  }
  
  createAddQuoteForm();
  updateFilterIndicator();
  
  const lastViewed = getLastViewedQuote();
  if (lastViewed) {
    console.log('Last viewed quote (this session):', lastViewed.quote);
    console.log('Viewed at:', lastViewed.timestamp);
  }
  
  showRandomQuote();
  
  // Start periodic sync (every 5 minutes)
  startPeriodicSync(5);
  
  // Initial server fetch
  syncQuotes();
  
  console.log('Application initialized successfully');
  console.log('Total quotes available:', quotes.length);
  console.log('Selected category filter:', selectedCategory);
  console.log('Periodic sync enabled: every 5 minutes');
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clears all data from localStorage and sessionStorage
 */
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    localStorage.clear();
    sessionStorage.clear();
    quotes = [...defaultQuotes];
    selectedCategory = 'all';
    saveQuotes();
    populateCategories();
    showRandomQuote();
    showNotification('All data cleared. Default quotes restored.');
    console.log('All data cleared');
  }
}

/**
 * Logs current storage information to console
 */
function logStorageInfo() {
  console.group('Storage Information');
  console.log('LocalStorage quotes:', localStorage.getItem('quotes'));
  console.log('LocalStorage selected category:', localStorage.getItem('selectedCategory'));
  console.log('SessionStorage last viewed:', sessionStorage.getItem('lastViewedQuote'));
  console.log('Current quotes array length:', quotes.length);
  console.log('Current selected category:', selectedCategory);
  console.log('Filtered quotes count:', getFilteredQuotes().length);
  console.log('Unique categories:', getUniqueCategories());
  console.log('Server quotes:', serverQuotes.length);
  console.log('Last sync time:', lastSyncTime);
  console.groupEnd();
}

// Make utility functions available in console for testing
window.clearAllData = clearAllData;
window.logStorageInfo = logStorageInfo;
window.syncQuotes = syncQuotes;
window.stopPeriodicSync = stopPeriodicSync;
window.startPeriodicSync = startPeriodicSync;