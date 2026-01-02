import fs from 'fs';

const BASE_URL = 'https://fnzone.es/en/festival';
const SCRIPT_CONTENT_REGEX = /<script id=\"__NEXT_DATA__\".+>(.+)<\/script>/g;
const BUILD_ID_REGEX = /(?<=static\/)[^/]+(?=\/_buildManifest\.js)/;

(async () => {
    console.log('Opening:', BASE_URL);
    const response = await fetch(BASE_URL);
    const text = await response.text();
    console.log('Fetched festival page');

    const buildId = text.match(BUILD_ID_REGEX)[0];

    const matches = text.matchAll(SCRIPT_CONTENT_REGEX);
    const json = matches.next().value[1];
    const object = JSON.parse(json);

    const ids = object.props.pageProps.pageData.map(song => song.sn);
    console.log('Song IDs:', ids);

    const songDataNetworkCalls = ids.map(id => {
        return async () => {
            const response = await fetch(`https://fnzone.es/_next/data/${buildId}/en/festival/${id}.json`);
            const text = await response.text();
            const object = JSON.parse(text);
            const songData = object.pageProps.songData;
            return songData;
        };
    });

    const songData = await Promise.all(songDataNetworkCalls.map(call => call()));
    console.log('Song Data:', songData);

    const songs = songData.map(song => {
        console.log('Processing song:', song.tt, 'by', song.an);

        const guitarDifficulty = song.in.gr;
        const proGuitarDifficulty = song.in.pg;
        const bassDifficulty = song.in.ba;
        const drumsDifficulty = song.in.ds;
        const proBassDifficulty = song.in.pb;
        const proDrumsDifficulty = song.in.pd;
        const vocalsDifficulty = song.in.vl;

        return {
            name: song.tt,
            artist: song.an,
            albumArt: song.au,
            year: song.ry,
            length: song.dn,
            sampleMp3: null,
            difficulties: {
                bass: bassDifficulty,
                drums: drumsDifficulty,
                guitar: guitarDifficulty,
                proBass: proBassDifficulty,
                proDrums: proDrumsDifficulty,
                proGuitar: proGuitarDifficulty,
                vocals: vocalsDifficulty
            }
        };
    });

    console.log('Songs:', songs);

    console.log('Writing songs to JSON file');
    await fs.promises.writeFile('db/fortniteFestivalSongs.json', JSON.stringify(songs));
})();
