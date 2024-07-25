import fs from 'fs';
import puppeteer from 'puppeteer';

const BASE_URL = 'https://fnzone.es/en/festival';
const SONG_SELECTOR = '.c-dhzjXW.c-dhzjXW-ibfIEdm-css > a';
const YEAR_AND_LENGTH_REGEX = /<strong>(\d+?)(?:<!-- -->)? · (?:<!-- -->)?(.+?)<\/strong>/g;

function getMatch(html, regex) {
    return Array.from(html.matchAll(regex))[0];
}

async function getSampleMp3(page) {
    try {
        return await page.$eval('source', el => el.src);
    } catch (error) {
        return null;
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Opening:', BASE_URL);
    await page.goto(BASE_URL);

    const songs = await page.$$eval(SONG_SELECTOR, els => els.map(el => {
        const url = el.href;
        const backgroundImage = window.getComputedStyle(el.firstElementChild).getPropertyValue('background-image');
        const albumArt = backgroundImage.match(/"(.+?)"/g)[0];

        const name = el.firstElementChild.firstElementChild.firstElementChild.textContent;
        const artist = el.firstElementChild.firstElementChild.lastElementChild.textContent;

        return {
            url: url,
            name: name,
            artist: artist,
            albumArt: albumArt,
            year: null,
            length: null,
            sampleMp3: null
        };
    }));

    console.log(`Found ${songs.length} links`);
    songs.forEach(song => console.log(song.url));

    for (const song of songs) {
        console.log('Opening:', song.url);
        await page.goto(song.url);

        const sampleMp3 = await getSampleMp3(page);

        const songHtml = await page.content();
        const yearAndLengthMatch = getMatch(songHtml, YEAR_AND_LENGTH_REGEX);
        const year = yearAndLengthMatch[1];
        const length = yearAndLengthMatch[2];

        song.year = year;
        song.length = length;
        song.sampleMp3 = sampleMp3;

        delete song.url;

        console.log('Added Song:', song);
    }

    console.log('Writing songs to JSON file');

    await fs.promises.writeFile('db/fortniteFestivalSongs.json', JSON.stringify(songs));

    await browser.close();
})();
