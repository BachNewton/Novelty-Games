const ROOT_URL = 'https://en.wikipedia.org/wiki/Finland';

// extract, normalize, filter and dedupe links from HTML
function getLinks(html, base = ROOT_URL) {
    const anchorRegex = /<a\s[^>]*href=(["'])(.*?)\1/gi;
    const links = new Set();
    let match;

    // helper to determine if a URL is an article link
    function isArticleLink(absUrl) {
        // require en.wikipedia.org host
        if (!absUrl.hostname || !absUrl.hostname.includes('en.wikipedia.org')) return false;
        // must be under /wiki/
        if (!absUrl.pathname.startsWith('/wiki/')) return false;
        const title = decodeURIComponent(absUrl.pathname.slice('/wiki/'.length));
        // exclude main page and any titles that contain ':' (namespaces)
        if (!title || title === 'Main_Page' || title.includes(':')) return false;
        return true;
    }

    while ((match = anchorRegex.exec(html)) !== null) {
        let href = match[2].trim();
        if (!href) continue;
        // Skip fragments and javascript/mailto/tel links
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
        try {
            const abs = new URL(href, base);
            // only include http(s) article links on en.wikipedia.org
            if ((abs.protocol === 'http:' || abs.protocol === 'https:') && isArticleLink(abs)) {
                links.add(abs.href);
            }
        } catch (e) {
            // ignore invalid URLs
        }
    }

    // return as array for easier consumption
    return Array.from(links);
}

(async () => {
    console.log('Starting wiki search script...');

    const response = await fetch(ROOT_URL);
    const html = await response.text();

    // use the new helper
    const links = getLinks(html, ROOT_URL);

    console.log(`Found ${links.length} unique links:`);
    for (const url of links) {
        console.log(url);
    }
})();
