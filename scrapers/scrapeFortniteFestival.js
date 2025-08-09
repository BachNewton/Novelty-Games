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
        const bassDifficulty = song.difficulties.ba !== undefined ? song.difficulties.ba : 0;
        const drumsDifficulty = song.difficulties.ds !== undefined ? song.difficulties.ds : 0;
        const guitarDifficulty = song.difficulties.gr !== undefined ? song.difficulties.gr : 0;
        const proBassDifficulty = song.difficulties.pb !== undefined ? song.difficulties.pb : 0;
        const proDrumsDifficulty = song.difficulties.pd !== undefined ? song.difficulties.pd : 0;
        const proGuitarDifficulty = song.difficulties.pg !== undefined ? song.difficulties.pg : 0;
        const vocalsDifficulty = song.difficulties.vl !== undefined ? song.difficulties.vl : 0;

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
