const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const URL = 'https://fnzone.es/en/festival';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(URL);

    const html = await page.content();

    const songAndArtistRegex = /<strong>(.+?)<\/strong><span>(.+?)<\/span>/g;
    const songAndArtistMatches = html.matchAll(songAndArtistRegex);
    const json = Array.from(songAndArtistMatches).map(match => {
        return {
            song: match[1],
            artist: match[2]
        };
    });

    await fs.promises.writeFile('db/fortniteFestivalSongs.json', JSON.stringify(json));

    await browser.close();
})();
