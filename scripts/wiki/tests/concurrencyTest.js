import 'dotenv/config';

const ACTION_API = 'https://en.wikipedia.org/w/api.php';
const USER_AGENT = 'NoveltyGamesBot/1.0 (https://github.com/BachNewton/Novelty-Games; hobby project)';

let cookies = '';

async function login() {
    const username = process.env.WIKI_BOT_USERNAME;
    const password = process.env.WIKI_BOT_PASSWORD;

    if (!username || !password) {
        console.log('No bot credentials - testing without auth\n');
        return false;
    }

    const tokenRes = await fetch(`${ACTION_API}?action=query&meta=tokens&type=login&format=json`, {
        headers: { 'User-Agent': USER_AGENT }
    });
    const tokenCookies = tokenRes.headers.getSetCookie();
    const tokenData = await tokenRes.json();
    const loginToken = tokenData.query.tokens.logintoken;

    const loginRes = await fetch(ACTION_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': tokenCookies.map(c => c.split(';')[0]).join('; '),
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

    const loginCookies = loginRes.headers.getSetCookie();
    cookies = [...tokenCookies, ...loginCookies].map(c => c.split(';')[0]).join('; ');

    const loginData = await loginRes.json();
    if (loginData.login?.result === 'Success') {
        console.log(`Logged in as ${loginData.login.lgusername}\n`);
        return true;
    }
    console.log('Login failed\n');
    return false;
}

async function makeRequest(title) {
    const params = new URLSearchParams({
        action: 'query',
        titles: title,
        prop: 'links|description',
        pllimit: '50',
        plnamespace: '0',
        format: 'json'
    });

    const headers = { 'User-Agent': USER_AGENT };
    if (cookies) headers['Cookie'] = cookies;

    const res = await fetch(`${ACTION_API}?${params}`, { headers });
    return res.status;
}

async function testConcurrency(concurrency, totalRequests) {
    const testTitles = ['Finland', 'Sweden', 'Norway', 'Denmark', 'Iceland', 'Germany', 'France', 'Spain', 'Italy', 'Portugal'];
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    let rateLimitCount = 0;

    // Process with worker pattern (same as bfs.js)
    let index = 0;
    const processNext = async () => {
        while (index < totalRequests) {
            const currentIndex = index++;
            const title = testTitles[currentIndex % testTitles.length];
            const status = await makeRequest(title);

            if (status === 200) {
                successCount++;
            } else if (status === 429) {
                rateLimitCount++;
            } else {
                errorCount++;
            }
        }
    };

    // Start workers
    const workers = Array(Math.min(concurrency, totalRequests))
        .fill(null)
        .map(() => processNext());

    await Promise.all(workers);

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = successCount / elapsed;

    return {
        concurrency,
        totalRequests,
        successCount,
        errorCount,
        rateLimitCount,
        elapsed,
        rate
    };
}

async function run() {
    await login();

    console.log('Testing different concurrency levels...');
    console.log('Each test makes 200 requests\n');
    console.log('Concurrency | Time (s) | Rate (req/s) | Success | Errors | 429s');
    console.log('-'.repeat(70));

    const concurrencyLevels = [1, 10, 20, 50, 100, 200];
    const requestsPerTest = 200;

    for (const concurrency of concurrencyLevels) {
        // Small delay between tests
        await new Promise(r => setTimeout(r, 1000));

        const result = await testConcurrency(concurrency, requestsPerTest);

        console.log(
            `${String(result.concurrency).padStart(11)} | ` +
            `${result.elapsed.toFixed(2).padStart(8)} | ` +
            `${result.rate.toFixed(1).padStart(12)} | ` +
            `${String(result.successCount).padStart(7)} | ` +
            `${String(result.errorCount).padStart(6)} | ` +
            `${result.rateLimitCount}`
        );

        if (result.rateLimitCount > 0) {
            console.log(`\n⚠️  Rate limits hit at concurrency ${concurrency}! Stopping tests.`);
            break;
        }
    }

    console.log('\nRecommendation: Use the highest concurrency that shows improvement without 429 errors.');
}

run();
