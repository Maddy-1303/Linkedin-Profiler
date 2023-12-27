chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "executeContentScript") {
        executeContentScript();
    }
});

function executeContentScript() {
    // Initialize an array to accumulate data from multiple pages
    let allLinkedinPeople = [];

    const resultsContainer = document.querySelector('#search-results-container');

    if (resultsContainer) {
        console.log("Results container found:", resultsContainer);

        // Scroll through the initial set of results
        scrollResults(resultsContainer);
    } else {
        console.error("Results container not found!");
    }

    function scrollResults(container) {
        const scrollInterval = 1000; // Set the interval between scrolls in milliseconds
        const totalScrolls = 25; // Set the total number of scrolls
        let stopScrolling = false;

        // Scroll through the initial set of results
        for (let i = 0; i < totalScrolls; i++) {
            setTimeout(() => {
                if (!stopScrolling) {
                    container.scrollBy(0, 205);
                    console.log("Scrolled:", i + 1, "times");

                    // Check if the "Next" button is disabled
                    const nextButton = document.querySelector('.artdeco-pagination__button--next[disabled]');
                    if (nextButton) {
                        console.log("No more pages to load.");
                        stopScrolling = true;
                    }

                    // If it's the last scroll, initiate data extraction
                    if (i === totalScrolls - 1 && !stopScrolling) {
                        extractData();
                    }
                }
            }, i * scrollInterval);
        }
    }

    function extractData() {
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

        // Accumulate data from multiple pages
        allLinkedinPeople = allLinkedinPeople.concat(linkedinPeople);

        // Store in localStorage
        localStorage.setItem('linkedinPeople', JSON.stringify(allLinkedinPeople));

        // Check if there's a next page button
        const nextPageButton = document.querySelector('.artdeco-pagination__button--next');

        if (nextPageButton && !nextPageButton.hasAttribute('disabled')) {
            // If there is a next page and it's not disabled, click on it after a random delay
            const randomDelay = getRandomDelay();
            setTimeout(() => {
                nextPageButton.click();
                // Continue scrolling on the next page
                scrollResults(document.querySelector('#search-results-container'));
            }, randomDelay);
        } else {
            console.log("No more pages to load.");
        }
    }

    function getRandomDelay() {
        // Returns a random delay between 500 and 1000 milliseconds
        return Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    }
}
