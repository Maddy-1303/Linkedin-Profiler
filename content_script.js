chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "executeContentScript") {
        executeContentScript();
    }
});

function executeContentScript() {
    const resultsContainer = document.querySelector('#search-results-container');

    if (resultsContainer) {
        console.log("Results container found:", resultsContainer);

        const scrollInterval = 1200; // Set the interval between scrolls in milliseconds
        const totalScrolls = document.getElementsByClassName("artdeco-list__item pl3 pv3 ").length;
        console.log(totalScrolls); // Set the total number of scrolls

        let scrollsCompleted = 0;

        for (let i = 0; i < totalScrolls; i++) {
            setTimeout(() => {
                resultsContainer.scrollBy(0, 250);
                console.log("Scrolled:", i + 1, "times");

                scrollsCompleted++;

                if (scrollsCompleted === totalScrolls) {
                    // All scrolls have completed, now execute LinkedIn people fetching code
                    fetchLinkedInPeople();
                }
            }, i * scrollInterval + getRandomDelay());
        }
    } else {
        console.error("Results container not found!");
    }
}

function fetchLinkedInPeople() {
    const profiles = Array.from(document.querySelectorAll('.flex.flex-column'));

    const linkedinPeople = profiles
        .filter(profile => {
            // Filter out profiles with undefined values
            const name = profile.querySelector('.artdeco-entity-lockup__title span')?.textContent?.trim();
            return name !== undefined;
        })
        .map(profile => {
            const profileLink = profile.querySelector('.artdeco-entity-lockup__title a')?.getAttribute('href');
            const name = profile.querySelector('.artdeco-entity-lockup__title span')?.textContent.trim();
            const photoUrl = profile.querySelector('.artdeco-entity-lockup__image img')?.getAttribute('src');
            const orgLinkElement = profile.querySelector('.artdeco-entity-lockup__subtitle a');
            const organizationName = orgLinkElement?.textContent.trim();
            const organizationLinkedInUid = orgLinkElement?.getAttribute('href')?.match(/\/company\/(\d+)/)?.[1];
            const title = profile.querySelector('.artdeco-entity-lockup__highlight-keyword')?.textContent.trim();
            const locationElement = profile.querySelector('.artdeco-entity-lockup__caption');
            const presentRawAddress = locationElement?.textContent.trim();

            return {
                href: `https://www.linkedin.com${profileLink}`,
                name,
                photo_url: photoUrl,
                organization_name: organizationName,
                organization_linkedin_uid: organizationLinkedInUid,
                title,
                present_raw_address: presentRawAddress,
            };
        });

    // Display the extracted data in the console
    console.log("LinkedIn people captured:", linkedinPeople);

    // Check if there is existing data in localStorage
    const existingData = localStorage.getItem('exlinkedinPeople');

    if (existingData) {
        // Merge the existing data with the new data
        const mergedData = JSON.stringify([...JSON.parse(existingData), ...linkedinPeople]);
        localStorage.setItem('exlinkedinPeople', mergedData);
    } else {
        // Save the new data to localStorage
        const newData = JSON.stringify(linkedinPeople);
        localStorage.setItem('exlinkedinPeople', newData);
    }

    // Check if there's a next page button
    const nextPageButton = document.querySelector('.artdeco-pagination__button--next');

    if (nextPageButton && !nextPageButton.hasAttribute('disabled')) {
        // If there is a next page and it's not disabled, click on it after a 5-second delay
      
        setTimeout(() => {
          
            if (click < 100) {
                nextPageButton.click();
               
                // Continue scrolling on the next page after 5 seconds
                setTimeout(() => {
                    executeContentScript();
                    click = click + 1;
                }, 5000);
    ;
                console.log("Page", click);
            } else {
                console.log("No more clicks.");
            }
        }, 5000);
    } else {
        console.log("No more pages to load.");
    }
}
 
function getRandomDelay() {
    // Returns a random delay between 0 and 1000 milliseconds
    return Math.floor(Math.random() * 1000);
}
let click = 1;