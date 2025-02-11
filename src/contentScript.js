// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "populatePrompt") {
    const { selector } = request;
    const textarea = document.querySelector(selector);
    
    if (textarea) {
      // Set the value
      textarea.value = request.text;
      
      // Trigger input event to make the LLM recognize the change
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus the textarea
      textarea.focus();
      
      sendResponse({ success: true });
    } else {
      sendResponse({ 
        success: false, 
        error: `Input not found for selector: ${selector}` 
      });
    }
  }
}); 