// Array of quote objects with text and category properties
const quotes = [
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

// Function to display a random quote
function showRandomQuote() {
  // Get the quote display container
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Select a random quote from the array
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  
  // Clear previous content
  quoteDisplay.innerHTML = '';
  
  // Create elements for quote text
  const quoteText = document.createElement('div');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${randomQuote.text}"`;
  
  // Create element for quote category
  const quoteCategory = document.createElement('div');
  quoteCategory.className = 'quote-category';
  quoteCategory.textContent = `- Category: ${randomQuote.category}`;
  
  // Append elements to the display container
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to create the add quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteFormContainer');
  
  // Clear any existing form
  formContainer.innerHTML = '';
  
  // Create form container div
  const formDiv = document.createElement('div');
  formDiv.className = 'add-quote-form';
  
  // Create heading
  const heading = document.createElement('h2');
  heading.textContent = 'Add Your Own Quote';
  formDiv.appendChild(heading);
  
  // Create input for quote text
  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';
  formDiv.appendChild(quoteInput);
  
  // Create input for quote category
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  formDiv.appendChild(categoryInput);
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'form-buttons';
  
  // Create add quote button
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;
  buttonContainer.appendChild(addButton);
  
  formDiv.appendChild(buttonContainer);
  
  // Append the form to the container
  formContainer.appendChild(formDiv);
}

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate input
  if (quoteText === '' || quoteCategory === '') {
    alert('Please enter both quote text and category!');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: quoteText,
    category: quoteCategory
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Display the newly added quote
  showRandomQuote();
  
  // Show success message
  alert('Quote added successfully!');
}

// Function to export quotes (optional utility)
function exportQuotes() {
  return JSON.stringify(quotes, null, 2);
}

// Event listener for the "Show New Quote" button
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to the new quote button
  const newQuoteButton = document.getElementById('newQuote');
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // Display an initial quote when page loads
  showRandomQuote();
  
  // Create the add quote form
  createAddQuoteForm();
});

// Alternative approach: Using the onclick attribute in HTML
// If you prefer to use the HTML approach mentioned in the requirements:
/*
<div>
  <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
  <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
  <button onclick="addQuote()">Add Quote</button>
</div>
*/