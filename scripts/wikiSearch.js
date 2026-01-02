const ROOT_TITLE = 'Finland';
const ACTION_API = 'https://en.wikipedia.org/w/api.php';
const SUMMARY_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

// fetch all links from a Wikipedia article using Action API (handles pagination)
async function getLinks(title) {
    const links = new Set();
    let plcontinue = null;

    do {
        const params = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'links',
            pllimit: '500',
            plnamespace: '0', // only main namespace (articles)
            format: 'json'
        });
        if (plcontinue) params.set('plcontinue', plcontinue);

        const response = await fetch(`${ACTION_API}?${params}`);
        const data = await response.json();

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pageLinks = pages[pageId].links || [];

        for (const link of pageLinks) {
            links.add(link.title);
        }

        plcontinue = data.continue?.plcontinue;
    } while (plcontinue);

    return Array.from(links);
}

// fetch article summary using REST API
async function fetchArticleSummary(title) {
    try {
        const response = await fetch(SUMMARY_API + encodeURIComponent(title));
        if (!response.ok) {
            return { error: `HTTP ${response.status}` };
        }
        return await response.json();
    } catch (e) {
        return { error: `Network error: ${e.message}` };
    }
}

// process links in batches to avoid rate limiting
async function processBatch(titles, batchSize = 20, delayMs = 100) {
    const results = [];
    const seen = new Set();

    for (let i = 0; i < titles.length; i += batchSize) {
        const batch = titles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (title) => {
                const summary = await fetchArticleSummary(title);
                return { title, summary };
            })
        );

        for (const { title, summary } of batchResults) {
            if (summary.error) {
                console.log(`${summary.error} - ${title}`);
                results.push({ title, summary });
            } else if (!seen.has(summary.title)) {
                seen.add(summary.title);
                console.log(`${summary.title} - ${summary.description || 'No description'}`);
                results.push({ title, summary });
            }
        }

        // delay between batches
        if (i + batchSize < titles.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return results;
}

(async () => {
    console.log(`Starting wiki search for "${ROOT_TITLE}"...\n`);

    const links = await getLinks(ROOT_TITLE);
    console.log(`Found ${links.length} links\n`);

    await processBatch(links);

    console.log('\nDone!');
})();
