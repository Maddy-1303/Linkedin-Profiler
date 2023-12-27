document.getElementById("openProfileBtn").addEventListener("click", function () {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        console.log(url);

        const urlRegex = /^https:\/\/www\.linkedin\.com\//;
        if (urlRegex.test(url)) {
        
            chrome.tabs.sendMessage(tabs[0].id, { action: "executeContentScript" });
        } else {
            displayMessage("This is not a valid LinkedIn URL.");
        }
    });
});

function displayMessage(message) {
    // Display a message in the popup
    const errorMessageContainer = document.getElementById("errorMessage");
    errorMessageContainer.textContent = message;

    // Clear the message after a short delay
    setTimeout(() => {
        errorMessageContainer.textContent = '';
    }, 3000);
}
