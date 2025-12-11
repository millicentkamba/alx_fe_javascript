// ============================================================================
// DATA MANAGEMENT AND INITIALIZATION
// ============================================================================

// Initialize quotes array - will be populated from localStorage or defaults
let quotes = [];

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
// DISPLAY FUNCTIONS
// ============================================================================

/**
 * Displays a random quote from the quotes array
 * Also saves the quote to sessionStorage as the last viewed quote
 */
function showRandomQuote() {
  if (quotes.length === 0) {
    showNotification('No quotes available. Add some quotes first!', 'error');
    return;
  }
  
  // Get the quote display container
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Select a random quote from the array
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  
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
  if (quoteCountElement) {
    quoteCountElement.textContent = quotes.length;
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
 */
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate input
  if (quoteText === '' || quoteCategory === '') {
    showNotification('Please enter both quote text and category!', 'error');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Display the newly added quote
  showRandomQuote();
  
  // Show success notification
  showNotification('Quote added successfully!');
  
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
      
      // Add imported quotes to existing array
      quotes.push(...validQuotes);
      
      // Save to localStorage
      saveQuotes();
      
      // Display a random quote from the imported ones
      showRandomQuote();
      
      // Show success notification
      showNotification(`Successfully imported ${validQuotes.length} quotes!`);
      
      console.log('Quotes imported:', validQuotes.length);
      
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
  
  // Add event listener to the "Show New Quote" button
  const newQuoteButton = document.getElementById('newQuote');
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // Add event listener to the export button
  const exportButton = document.getElementById('exportQuotes');
  exportButton.addEventListener('click', exportToJsonFile);
  
  // Add event listener to the file input
  const importFileInput = document.getElementById('importFile');
  importFileInput.addEventListener('change', importFromJsonFile);
  
  // Create the add quote form
  createAddQuoteForm();
  
  // Check if there's a last viewed quote in sessionStorage
  const lastViewed = getLastViewedQuote();
  if (lastViewed) {
    console.log('Last viewed quote (this session):', lastViewed.quote);
    console.log('Viewed at:', lastViewed.timestamp);
  }
  
  // Display an initial quote
  showRandomQuote();
  
  console.log('Application initialized successfully');
  console.log('Total quotes available:', quotes.length);
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
    saveQuotes();
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
  console.log('SessionStorage last viewed:', sessionStorage.getItem('lastViewedQuote'));
  console.log('Current quotes array length:', quotes.length);
  console.groupEnd();
}

// Make utility functions available in console for testing
window.clearAllData = clearAllData;
window.logStorageInfo = logStorageInfo;