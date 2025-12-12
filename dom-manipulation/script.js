// ============================================================================
// DATA MANAGEMENT AND INITIALIZATION
// ============================================================================

// Initialize quotes array - will be populated from localStorage or defaults
let quotes = [];

// Variable to store currently selected category filter
let selectedCategory = 'all';

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
 * This data persists only for the current browser session
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
 * @returns {Array} Array of unique category strings
 */
function getUniqueCategories() {
  const categories = quotes.map(quote => quote.category);
  const uniqueCategories = [...new Set(categories)];
  return uniqueCategories.sort();
}

/**
 * Populates the category filter dropdown with unique categories
 * This function dynamically updates the dropdown based on available quotes
 */
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (!categoryFilter) {
    console.error('Category filter element not found');
    return;
  }
  
  // Get unique categories from quotes
  const categories = getUniqueCategories();
  
  // Store current selection
  const currentSelection = categoryFilter.value;
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (currentSelection && (currentSelection === 'all' || categories.includes(currentSelection))) {
    categoryFilter.value = currentSelection;
  } else {
    categoryFilter.value = 'all';
    selectedCategory = 'all';
  }
  
  console.log('Categories populated:', categories.length);
  
  // Update category count in stats
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
 * Updates the display to show only quotes matching the selected category
 */
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  selectedCategory = categoryFilter.value;
  
  // Save the selected filter to localStorage
  saveSelectedFilter();
  
  console.log('Filtering by category:', selectedCategory);
  
  // Update filter indicator
  updateFilterIndicator();
  
  // Update the displayed quote
  showRandomQuote();
  
  // Update statistics
  updateQuoteStats();
}

/**
 * Gets filtered quotes based on the selected category
 * @returns {Array} Array of quotes matching the filter
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
 * Also saves the quote to sessionStorage as the last viewed quote
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
  
  // Select a random quote from filtered array
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  // Save to sessionStorage
  saveLastViewedQuote(randomQuote);
  
  // Clear previous content
  quoteDisplay.innerHTML = '';
  
  // Create elements for quote text
  const quoteText = document.createElement('div');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  // Create element for quote category
  const quoteCategory = document.createElement('div');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `— Category: ${randomQuote.category}`;
  
  // Append elements to the display container
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
  
  // Change color based on type
  if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  }
  
  // Hide after 3 seconds
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
 * Also updates the category dropdown if a new category is added
 */
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate input
  if (quoteText === '' || quoteCategory === '') {
    showNotification('Please enter both quote text and category!', 'error');
    return;
  }
  
  // Check if this is a new category
  const existingCategories = getUniqueCategories();
  const isNewCategory = !existingCategories.includes(quoteCategory);
  
  // Create new quote object
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  // Update categories dropdown if new category was added
  if (isNewCategory) {
    populateCategories();
    console.log('New category added:', quoteCategory);
  }
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Update filter indicator and stats
  updateFilterIndicator();
  updateQuoteStats();
  
  // Display the newly added quote
  showRandomQuote();
  
  // Show success notification
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
 * Creates a downloadable file using Blob and URL.createObjectURL
 */
function exportToJsonFile() {
  if (quotes.length === 0) {
    showNotification('No quotes to export!', 'error');
    return;
  }
  
  try {
    // Convert quotes array to JSON string with formatting
    const jsonString = JSON.stringify(quotes, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `quotes_${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
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
 * Reads the file and adds quotes to the existing array
 * Updates categories if new ones are introduced
 */
function importFromJsonFile(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Validate file type
  if (!file.name.endsWith('.json')) {
    showNotification('Please select a valid JSON file!', 'error');
    return;
  }
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      // Parse the JSON content
      const importedQuotes = JSON.parse(e.target.result);
      
      // Validate that it's an array
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid file format. Expected an array of quotes.');
      }
      
      // Validate quote structure
      const validQuotes = importedQuotes.filter(quote => {
        return quote.text && quote.category && 
               typeof quote.text === 'string' && 
               typeof quote.category === 'string';
      });
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file.');
      }
      
      // Get existing categories before import
      const existingCategories = getUniqueCategories();
      
      // Add imported quotes to existing array
      quotes.push(...validQuotes);
      
      // Save to localStorage
      saveQuotes();
      
      // Update categories dropdown (will include any new categories)
      populateCategories();
      
      // Get new categories after import
      const newCategories = getUniqueCategories();
      const addedCategories = newCategories.filter(cat => !existingCategories.includes(cat));
      
      // Update display
      updateFilterIndicator();
      showRandomQuote();
      
      // Show success notification
      let message = `Successfully imported ${validQuotes.length} quotes!`;
      if (addedCategories.length > 0) {
        message += ` (${addedCategories.length} new categor${addedCategories.length > 1 ? 'ies' : 'y'})`;
      }
      showNotification(message);
      
      console.log('Quotes imported:', validQuotes.length);
      if (addedCategories.length > 0) {
        console.log('New categories added:', addedCategories);
      }
      
      // Show warning if some quotes were invalid
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
  
  // Read the file as text
  fileReader.readAsText(file);
  
  // Reset file input so the same file can be imported again
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
  
  // Load quotes from localStorage
  loadQuotes();
  
  // Populate categories in dropdown
  populateCategories();
  
  // Load last selected filter
  loadLastSelectedFilter();
  
  // Add event listener to the "Show New Quote" button
  const newQuoteButton = document.getElementById('newQuote');
  if (newQuoteButton) {
    newQuoteButton.addEventListener('click', showRandomQuote);
    console.log('✓ Show New Quote button event listener attached');
  }
  
  // Add event listener to the export button
  const exportButton = document.getElementById('exportQuotes');
  if (exportButton) {
    exportButton.addEventListener('click', exportToJsonFile);
    console.log('✓ Export button event listener attached');
  }
  
  // Add event listener to the file input
  const importFileInput = document.getElementById('importFile');
  if (importFileInput) {
    importFileInput.addEventListener('change', importFromJsonFile);
    console.log('✓ Import file input event listener attached');
  }
  
  // Add event listener to the category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterQuotes);
    console.log('✓ Category filter event listener attached');
  }
  
  // Create the add quote form
  createAddQuoteForm();
  
  // Update filter indicator
  updateFilterIndicator();
  
  // Check if there's a last viewed quote in sessionStorage
  const lastViewed = getLastViewedQuote();
  if (lastViewed) {
    console.log('Last viewed quote (this session):', lastViewed.quote);
    console.log('Viewed at:', lastViewed.timestamp);
  }
  
  // Display an initial quote (respecting the filter)
  showRandomQuote();
  
  console.log('Application initialized successfully');
  console.log('Total quotes available:', quotes.length);
  console.log('Selected category filter:', selectedCategory);
  console.log('Export function available:', typeof exportToJsonFile === 'function');
  console.log('Import function available:', typeof importFromJsonFile === 'function');
  console.log('Filter function available:', typeof filterQuotes === 'function');
  console.log('Populate categories function available:', typeof populateCategories === 'function');
});

// ============================================================================
// UTILITY FUNCTIONS (Optional - for debugging)
// ============================================================================

/**
 * Clears all data from localStorage and sessionStorage
 * Useful for testing or resetting the application
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
 * Useful for debugging
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
  console.groupEnd();
}

// Make utility functions available in console for testing
window.clearAllData = clearAllData;
window.logStorageInfo = logStorageInfo;