import fs from 'fs';

const BASE_URL = 'https://fnzone.es/en/festival';
const SCRIPT_CONTENT_REGEX = /<script id=\"__NEXT_DATA__\".+>(.+)<\/script>/g;

(async () => {
    console.log('Opening:', BASE_URL);
    const response = await fetch(BASE_URL);
    console.log(response);
    const text = await response.text();

    const matches = text.matchAll(SCRIPT_CONTENT_REGEX);
    const json = matches.next().value[1];
    const object = JSON.parse(json);
    const songs = object.props.pageProps.data.map(song => {
        const guitarDifficulty = song.difficulties.gr !== undefined ? song.difficulties.gr : null;
        const proGuitarDifficulty = song.difficulties.pg !== undefined ? song.difficulties.pg : null;

        const bassDifficulty = song.difficulties.ba;
        const drumsDifficulty = song.difficulties.ds;
        const proBassDifficulty = song.difficulties.pb;
        const proDrumsDifficulty = song.difficulties.pd;
        const vocalsDifficulty = song.difficulties.vl;

        return {
            name: song.title,
            artist: song.artistName,
            albumArt: song.image,
            year: song.ry,
            length: song.dn,
            sampleMp3: song.previewUrl,
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
