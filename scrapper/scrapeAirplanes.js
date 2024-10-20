import fs from 'fs';
import puppeteer from 'puppeteer';

const LOOPS = 25;
const BASE_URL = 'https://airport-data.com/aircraft/random_photos.html';

async function getAirplanes(page) {
    const airplanes = await page.$$eval('tr', els => els.map(el => {
        const url = el.querySelector('a').href;
        const make = el.querySelector('td:nth-child(2) > div.info > a:nth-last-child(2)')?.innerHTML;
        const model = el.querySelector('td:nth-child(2) > div.info > a:nth-last-child(1)')?.innerHTML;

        return {
            url: url,
            make: make,
            model: model,
            imageUrl: null
        };
    }));

    console.log(`Found ${airplanes.length} links`);
    airplanes.forEach(airplane => console.log(airplane.url));

    for (const airplane of airplanes) {
        await page.goto(airplane.url);

        const imageUrl = await page.$$eval('img', els => els.map(el => el.src).find(url => url.indexOf('image.airport-data.com') !== -1));
        airplane.imageUrl = imageUrl;

        delete airplane.url;

        console.log('Added Airplane:', airplane);
    }

    console.log('Writing airplanes to JSON file');

    await fs.promises.writeFile(`db/airplanes/airplanes-${Date.now()}.json`, JSON.stringify(airplanes));

    const files = fs.readdirSync('db/airplanes');
    files.pop(); // Remove the "index.json" element
    console.log('Updating index file');
    await fs.promises.writeFile(`db/airplanes/index.json`, JSON.stringify(files));
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });

    for (let i = 1; i <= LOOPS; i++) {
        const page = await browser.newPage();

        console.log(`Opening (${i}/${LOOPS}):`, BASE_URL);
        await page.goto(BASE_URL);

        await getAirplanes(page);
    }

    await browser.close();
})();
