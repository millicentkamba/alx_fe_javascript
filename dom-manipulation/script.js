// ---------------------------
// Quotes Array
// ---------------------------
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// ---------------------------
// DOM Elements
// ---------------------------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportQuotesBtn = document.getElementById('exportQuotesBtn');
const importQuotesInput = document.getElementById('importQuotesInput');

// ---------------------------
// Local Storage Functions
// ---------------------------
function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// ---------------------------
// Session Storage Functions
// ---------------------------
function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    displayQuote(quote);
  } else {
    showRandomQuote();
  }
}

// ---------------------------
// Display Functions
// ---------------------------
function displayQuote(quote) {
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <p class="quote-category">- ${quote.category}</p>
  `;
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  displayQuote(quote);
  saveLastViewedQuote(quote);
}

// ---------------------------
// Add Quote Function
// ---------------------------
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add to array
  const newQuoteObj = { text, category };
  quotes.push(newQuoteObj);

  // Update DOM
  displayQuote(newQuoteObj);

  // Save to localStorage
  saveQuotesToLocalStorage();

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

// ---------------------------
// Export Quotes
// ---------------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ---------------------------
// Import Quotes
// ---------------------------
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        saveQuotesToLocalStorage();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (error) {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

// ---------------------------
// Event Listeners
// ---------------------------
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
exportQuotesBtn.addEventListener('click', exportToJsonFile);
importQuotesInput.addEventListener('change', importFromJsonFile);

// ---------------------------
// Initialization
// ---------------------------
loadQuotesFromLocalStorage();
loadLastViewedQuote();
