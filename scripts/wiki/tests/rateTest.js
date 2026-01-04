import 'dotenv/config';

const ACTION_API = 'https://en.wikipedia.org/w/api.php';

let cookies = '';

async function login() {
    const username = process.env.WIKI_BOT_USERNAME;
    const password = process.env.WIKI_BOT_PASSWORD;

    if (!username || !password) {
        console.log('No bot credentials - testing without auth');
        return false;
    }

    const tokenRes = await fetch(`${ACTION_API}?action=query&meta=tokens&type=login&format=json`);
    const tokenCookies = tokenRes.headers.getSetCookie();
    const tokenData = await tokenRes.json();
    const loginToken = tokenData.query.tokens.logintoken;

    const loginRes = await fetch(ACTION_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': tokenCookies.map(c => c.split(';')[0]).join('; ')
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
    console.log('Login failed');
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

    const headers = cookies ? { 'Cookie': cookies } : {};
    const res = await fetch(`${ACTION_API}?${params}`, { headers });
    return res.status;
}

async function runTest() {
    await login();

    const testTitles = ['Finland', 'Sweden', 'Norway', 'Denmark', 'Iceland'];
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    let rateLimitHit = false;

    console.log('Testing Action API rate limit...');
    console.log('Making requests as fast as possible...\n');

    // Make 500 requests (cycling through test titles)
    for (let i = 0; i < 500; i++) {
        const title = testTitles[i % testTitles.length];
        const status = await makeRequest(title);

        if (status === 200) {
            successCount++;
        } else if (status === 429) {
            rateLimitHit = true;
            console.log(`\n⚠️  Rate limit hit after ${successCount} requests!`);
            break;
        } else {
            errorCount++;
            console.log(`Request ${i + 1}: HTTP ${status}`);
        }

        // Progress every 50 requests
        if ((i + 1) % 50 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = successCount / elapsed;
            process.stdout.write(`\r${successCount} requests in ${elapsed.toFixed(1)}s (${rate.toFixed(1)} req/s)`);
        }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = successCount / elapsed;

    console.log(`\n\n=== Results ===`);
    console.log(`Successful requests: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Time: ${elapsed.toFixed(1)}s`);
    console.log(`Rate: ${rate.toFixed(1)} requests/second`);
    console.log(`Rate limit hit: ${rateLimitHit ? 'YES' : 'NO'}`);

    if (!rateLimitHit) {
        console.log(`\nProjected hourly capacity: ~${Math.floor(rate * 3600)} requests/hour`);
    }
}

runTest();
