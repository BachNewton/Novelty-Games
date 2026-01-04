const ACTION_API = 'https://en.wikipedia.org/w/api.php';
const USER_AGENT = 'NoveltyGamesBot/1.0 (https://github.com/BachNewton/Novelty-Games; hobby project)';
const BATCH_SIZE = 50; // Wikipedia API limit (500 requires apihighlimits permission)

// Session cookies for Action API (set after login)
let actionApiCookies = '';

/**
 * Login to Wikipedia Action API with bot credentials.
 * Required for 500 titles/request rate limit.
 * Throws on failure with descriptive error message.
 */
export async function login() {
    const username = process.env.WIKI_BOT_USERNAME;
    const password = process.env.WIKI_BOT_PASSWORD;

    if (!username || !password) {
        throw new Error('Missing WIKI_BOT_USERNAME or WIKI_BOT_PASSWORD in .env');
    }

    // Step 1: Get login token
    const tokenRes = await fetch(`${ACTION_API}?action=query&meta=tokens&type=login&format=json`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip' }
    });

    if (!tokenRes.ok) {
        throw new Error(`Failed to get login token: HTTP ${tokenRes.status}`);
    }

    const cookies = tokenRes.headers.getSetCookie();
    const tokenData = await tokenRes.json();
    const loginToken = tokenData.query?.tokens?.logintoken;

    if (!loginToken) {
        throw new Error('No login token in response');
    }

    // Step 2: Login
    const loginRes = await fetch(ACTION_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies.map(c => c.split(';')[0]).join('; '),
            'User-Agent': USER_AGENT
        },
        body: new URLSearchParams({
            action: 'login',
            lgname: username,
            lgpassword: password,
            lgtoken: loginToken,
            format: 'json'
        })
    });

    if (!loginRes.ok) {
        throw new Error(`Login request failed: HTTP ${loginRes.status}`);
    }

    // Capture session cookies
    const loginCookies = loginRes.headers.getSetCookie();
    actionApiCookies = [...cookies, ...loginCookies].map(c => c.split(';')[0]).join('; ');

    const loginData = await loginRes.json();
    if (loginData.login?.result === 'Success') {
        console.log(`Logged in as ${loginData.login.lgusername}\n`);
        return true;
    }

    throw new Error(`Login failed: ${loginData.login?.reason || 'Unknown error'}`);
}

// Fetch a single article with all its links (handles continuation)
async function fetchArticleLinks(title) {
    const links = [];
    let plcontinue = null;

    do {
        const params = new URLSearchParams({
            action: 'query',
            titles: title,
            prop: 'links',
            pllimit: 'max',
            plnamespace: '0',
            format: 'json'
        });
        if (plcontinue) params.set('plcontinue', plcontinue);

        const headers = { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip' };
        if (actionApiCookies) headers['Cookie'] = actionApiCookies;

        const response = await fetch(`${ACTION_API}?${params}`, { headers });
        if (!response.ok) return links;

        const data = await response.json();
        const page = Object.values(data.query.pages)[0];

        if (page.links) {
            for (const link of page.links) {
                links.push(link.title);
            }
        }

        plcontinue = data.continue?.plcontinue;
    } while (plcontinue);

    return links;
}

/** Fetch batch of articles in a single API request (uses POST for large batches). */
async function fetchBatch(titles) {
    const params = new URLSearchParams({
        action: 'query',
        titles: titles.join('|'),
        prop: 'links|description|info',
        pllimit: 'max',
        plnamespace: '0',
        inprop: 'url',
        format: 'json'
    });

    const headers = {
        'User-Agent': USER_AGENT,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    if (actionApiCookies) headers['Cookie'] = actionApiCookies;

    try {
        // Use POST to avoid URL length limits with large title batches
        const response = await fetch(ACTION_API, {
            method: 'POST',
            headers,
            body: params
        });

        if (!response.ok) {
            return titles.map(t => ({ requestedTitle: t, error: `HTTP ${response.status}` }));
        }

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error(`\nJSON parse error: ${text.slice(0, 200)}`);
            return titles.map(t => ({ requestedTitle: t, error: 'Invalid JSON' }));
        }

        // Check for valid response
        if (!data.query?.pages) {
            console.error('\nUnexpected API response:', JSON.stringify(data).slice(0, 200));
            return titles.map(t => ({ requestedTitle: t, error: 'Invalid API response' }));
        }

        const results = [];
        const needsContinuation = [];

        // Build a map of normalized titles to requested titles
        const normalizedMap = {};
        if (data.query?.normalized) {
            for (const n of data.query.normalized) {
                normalizedMap[n.to] = n.from;
            }
        }

        for (const page of Object.values(data.query.pages)) {
            const requestedTitle = normalizedMap[page.title] || page.title;

            if (page.missing !== undefined) {
                results.push({ requestedTitle, error: 'Page not found' });
                continue;
            }

            const links = page.links ? page.links.map(l => l.title) : [];

            results.push({
                requestedTitle,
                title: page.title,
                description: page.description || '',
                link: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
                links,
                needsContinuation: !!data.continue?.plcontinue
            });

            // Track pages that may need more links
            if (data.continue?.plcontinue) {
                needsContinuation.push(page.title);
            }
        }

        // Fetch remaining links for pages that need continuation
        if (needsContinuation.length > 0) {
            await Promise.all(needsContinuation.map(async (title) => {
                const result = results.find(r => r.title === title);
                if (result) {
                    const allLinks = await fetchArticleLinks(title);
                    result.links = allLinks;
                    delete result.needsContinuation;
                }
            }));
        }

        // Add any missing titles (not returned by API)
        const returnedTitles = new Set(results.map(r => r.requestedTitle));
        for (const title of titles) {
            if (!returnedTitles.has(title)) {
                results.push({ requestedTitle: title, error: 'Not returned by API' });
            }
        }

        return results;
    } catch (e) {
        return titles.map(t => ({ requestedTitle: t, error: `Network error: ${e.message}` }));
    }
}

/**
 * Process articles in batches of 500 (bot rate limit).
 */
export async function processBatchArticles(titles) {
    if (titles.length <= BATCH_SIZE) {
        return fetchBatch(titles);
    }

    // Split into chunks and process in parallel
    const chunks = [];
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
        chunks.push(titles.slice(i, i + BATCH_SIZE));
    }

    const chunkResults = await Promise.all(chunks.map(chunk => fetchBatch(chunk)));
    return chunkResults.flat();
}
