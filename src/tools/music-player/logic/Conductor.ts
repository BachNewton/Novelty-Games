import { TrackIds } from "../data/MusicPlayerIndex";
import { AudioBuffers } from "./SongParser";

export enum State { Playing, Paused }

type GainNodes = { [Id in keyof TrackIds]: GainNode };

type SourceNodes = { [Id in keyof TrackIds]: AudioBufferSourceNode };

export interface Conductor {
    state: State;
    duration: number;
    currentTime: number;
    updateTime: (time: number) => void;
    togglePlay: () => void;
    toggleMute: (id: keyof TrackIds) => void;
    solo: (id: keyof TrackIds) => void;
    all: () => void;
    isMuted: (id: keyof TrackIds) => boolean;
    isAvailable: (id: keyof TrackIds) => boolean;
    stop: () => void;
}

export function createConductor(audioContext: AudioContext, audioBuffers: AudioBuffers): Conductor {
    let state: State = State.Paused;
    let startTime = 0;
    let offset = 0;

    const gainNodes: GainNodes = {
        guitar: audioContext.createGain(),
        bass: audioContext.createGain(),
        vocals: audioContext.createGain(),
        backing: audioContext.createGain(),
        drums: audioContext.createGain(),
        drums1: audioContext.createGain(),
        drums2: audioContext.createGain(),
        drums3: audioContext.createGain(),
        keys: audioContext.createGain(),
    };

    let sourceNodes = createSourceNodes(audioContext, audioBuffers, gainNodes);

    const duration = Object.values(sourceNodes).reduce((max, node) => {
        if (node === null || node.buffer === null) return max;

        return Math.max(max, node.buffer.duration);
    }, 0);

    return {
        get state() { return state; },
        duration: duration,
        get currentTime() {
            switch (state) {
                case State.Playing:
                    return offset + (audioContext.currentTime - startTime);
                case State.Paused:
                    return offset;
            }
        },
        updateTime: (time: number) => {
            stop(sourceNodes);

            offset = time;
            sourceNodes = createSourceNodes(audioContext, audioBuffers, gainNodes);

            if (state === State.Playing) {
                startTime = audioContext.currentTime;
                play(sourceNodes, offset);
            }
        },
        togglePlay: () => {
            if (state === State.Playing) {
                offset += audioContext.currentTime - startTime;
                state = State.Paused;
                stop(sourceNodes);
            } else if (state === State.Paused) {
                state = State.Playing;
                startTime = audioContext.currentTime;
                sourceNodes = createSourceNodes(audioContext, audioBuffers, gainNodes);
                play(sourceNodes, offset);
            }
        },
        toggleMute: (id: keyof TrackIds) => {
            const gain = gainNodes[id].gain;

            gain.value = gain.value === 0 ? 1 : 0;
        },
        solo: (soloId: keyof TrackIds) => {
            Object.entries(gainNodes).forEach(([key, node]) => {
                const id = key as keyof TrackIds;

                node.gain.value = soloId === id ? 1 : 0;
            });
        },
        all: () => {
            Object.values(gainNodes).forEach(node => {
                node.gain.value = 1;
            });
        },
        isMuted: (id) => gainNodes[id].gain.value === 0,
        isAvailable: (id) => audioBuffers[id] !== null,
        stop: () => {
            stop(sourceNodes);
            state = State.Paused;
        }
    };
}

function createSourceNode(audioContext: AudioContext, audioBuffer: AudioBuffer | null, gainNode: GainNode): AudioBufferSourceNode {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return source;
}

function createSourceNodes(audioContext: AudioContext, audioBuffers: AudioBuffers, gainNodes: GainNodes): SourceNodes {
    return {
        guitar: createSourceNode(audioContext, audioBuffers.guitar, gainNodes.guitar),
        bass: createSourceNode(audioContext, audioBuffers.bass, gainNodes.bass),
        vocals: createSourceNode(audioContext, audioBuffers.vocals, gainNodes.vocals),
        backing: createSourceNode(audioContext, audioBuffers.backing, gainNodes.backing),
        drums: createSourceNode(audioContext, audioBuffers.drums, gainNodes.drums),
        drums1: createSourceNode(audioContext, audioBuffers.drums1, gainNodes.drums1),
        drums2: createSourceNode(audioContext, audioBuffers.drums2, gainNodes.drums2),
        drums3: createSourceNode(audioContext, audioBuffers.drums3, gainNodes.drums3),
        keys: createSourceNode(audioContext, audioBuffers.keys, gainNodes.keys)
    };
}

function play(sourceNodes: SourceNodes, time: number) {
    Object.values(sourceNodes).forEach(node => {
        node.start(0, time);
    });
}

function stop(sourceNodes: SourceNodes) {
    Object.values(sourceNodes).forEach(node => {
        node.stop();
        node.disconnect();
    });
}
