import fs from 'fs';
import puppeteer from 'puppeteer';

function getMatch(html, regex) {
    return Array.from(html.matchAll(regex))[0];
}

async function getSong(songHtml) {
    const songNameRegex = /<h1 class="c-ewDgRt c-ewDgRt-ikEhgBV-css">(.+?)<\/h1>/g;
    const artistRegex = /<strong class="c-ewDgRt c-ewDgRt-KoHnu-variant-tertiary c-ewDgRt-ihgsrmT-css">(.+?)<\/strong>/g;
    const yearAndLengthRegex = /<strong class="c-ewDgRt c-ewDgRt-bAMqTJ-variant-quaternary c-ewDgRt-iGSDkZ-css">(.+?)(?:<!-- -->)? · (?:<!-- -->)?(.+?)<\/strong>/g;
    const sampleMp3Regex = /<source src="(.+?)" type="audio\/mp3">/g;
    const albumArtSelector = '#__next > div.c-cTzty.c-cTzty-ieGPAZP-css > div.c-cTzty.c-cTzty-ijfAQdd-css img';

    const songName = getMatch(songHtml, songNameRegex)[1];
    console.log('Song name:', songName);
    const artist = getMatch(songHtml, artistRegex)[1];
    console.log('Artist:', artist);
    const yearAndLengthMatch = getMatch(songHtml, yearAndLengthRegex);
    const year = yearAndLengthMatch[1];
    console.log('Year:', year);
    const length = yearAndLengthMatch[2];
    console.log('Length:', length);
    const sampleMp3Match = getMatch(songHtml, sampleMp3Regex);
    const sampleMp3 = sampleMp3Match === undefined ? null : sampleMp3Match[1];
    console.log('Sample MP3:', sampleMp3);
    const albumArt = await page.$eval(albumArtSelector, el => el.getAttribute('src'));
    console.log('Album Art:', albumArt);

    return {
        name: songName,
        artist: artist,
        year: year,
        length: length,
        sampleMp3: sampleMp3,
        albumArt: albumArt
    };
}

(async () => {
    const BASE_URL = 'https://fnzone.es/en/festival';
    const SONG_URL = 'https://fnzone.es/en/festival/';

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Opening:', BASE_URL);
    await page.goto(BASE_URL);

    const html = await page.content();

    const songLinksRegex = /<a href="\/en\/festival\/(.+?)">/g;

    const songs = [];

    const songLinksMatches = Array.from(html.matchAll(songLinksRegex));

    console.log(`Found ${songLinksMatches.length} links`);
    songLinksMatches.forEach(match => console.log(SONG_URL + match[1]));

    for (const match of songLinksMatches) {
        const songLink = match[1];

        const url = SONG_URL + songLink;
        console.log('Opening:', url);
        await page.goto(url);
        const songHtml = await page.content();

        const song = await getSong(songHtml);

        songs.push(song);
    }

    await fs.promises.writeFile('db/fortniteFestivalSongs.json', JSON.stringify(songs));

    await browser.close();
})();
