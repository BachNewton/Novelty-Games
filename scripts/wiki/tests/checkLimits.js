import 'dotenv/config';

const ACTION_API = 'https://en.wikipedia.org/w/api.php';

async function checkLimits() {
    const username = process.env.WIKI_BOT_USERNAME;
    const password = process.env.WIKI_BOT_PASSWORD;

    // Login first
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
    const cookies = [...tokenCookies, ...loginCookies].map(c => c.split(';')[0]).join('; ');

    // Now check rate limits and user rights
    const infoRes = await fetch(`${ACTION_API}?action=query&meta=userinfo&uiprop=rights|ratelimits&format=json`, {
        headers: { 'Cookie': cookies }
    });
    const info = await infoRes.json();

    console.log('User:', info.query.userinfo.name);
    console.log('\nRights:', info.query.userinfo.rights.join(', '));
    console.log('\nRate limits:');
    console.log(JSON.stringify(info.query.userinfo.ratelimits, null, 2));
}

checkLimits();
