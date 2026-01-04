const ACTION_API = 'https://en.wikipedia.org/w/api.php';
const USER_AGENT = 'NoveltyGamesBot/1.0';

async function fetchBatch(titles) {
    const params = new URLSearchParams({ action: 'query', titles: titles.join('|'), prop: 'links|description', pllimit: 'max', format: 'json' });
    const res = await fetch(`${ACTION_API}?${params}`, { headers: { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip' } });
    if (res.status !== 200) return 0;
    const data = await res.json();
    return Object.keys(data.query.pages).filter(id => id > 0).length;
}

async function run() {
    // Get real titles by fetching links from Finland
    const seedRes = await fetch(`${ACTION_API}?action=query&titles=Finland&prop=links&pllimit=500&plnamespace=0&format=json`, { headers: { 'User-Agent': USER_AGENT } });
    const seedData = await seedRes.json();
    const page = Object.values(seedData.query.pages)[0];
    const allTitles = page.links.map(l => l.title);
    console.log('Got', allTitles.length, 'unique titles from Finland article\n');

    // Test: 4 concurrent batches of 50 titles each (200 total)
    console.log('Test: 4 concurrent batches of 50 titles (200 articles)...');
    const start = Date.now();
    const batches = [
        allTitles.slice(0, 50),
        allTitles.slice(50, 100),
        allTitles.slice(100, 150),
        allTitles.slice(150, 200)
    ];

    const results = await Promise.all(batches.map(b => fetchBatch(b)));
    const totalPages = results.reduce((a, b) => a + b, 0);
    const elapsed = (Date.now() - start) / 1000;

    console.log('  Time:', elapsed.toFixed(2) + 's');
    console.log('  Pages fetched:', totalPages);
    console.log('  Articles/sec:', (totalPages / elapsed).toFixed(1));
    console.log('  HTTP requests: 4');

    // Compare: Old approach - 200 sequential single requests
    console.log('\nCompare: 200 sequential single requests (old approach)...');
    const start2 = Date.now();
    let success2 = 0;
    for (let i = 0; i < 200; i++) {
        const params = new URLSearchParams({ action: 'query', titles: allTitles[i], prop: 'links|description', pllimit: '50', format: 'json' });
        const res = await fetch(`${ACTION_API}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
        if (res.ok) success2++;
    }
    const elapsed2 = (Date.now() - start2) / 1000;

    console.log('  Time:', elapsed2.toFixed(2) + 's');
    console.log('  Pages fetched:', success2);
    console.log('  Articles/sec:', (success2 / elapsed2).toFixed(1));
    console.log('  HTTP requests: 200');

    console.log('\n=== Speedup: ' + ((totalPages / elapsed) / (success2 / elapsed2)).toFixed(1) + 'x faster ===');
}

run();
