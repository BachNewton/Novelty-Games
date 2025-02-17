import { FunctionController, GUI, NumberController, StringController } from 'three/examples/jsm/libs/lil-gui.module.min';
import { createLevelFile, Level, LevelMetadata, loadLevelFile } from './Level';
import EmptyLevel from '../levels/empty_level.json';
import Level1 from '../levels/level1.json';
import Level2 from '../levels/level2.json';
import Level3 from '../levels/level3.json';
import Level4 from '../levels/level4.json';
import Level5 from '../levels/level5.json';
import Level6 from '../levels/level6.json';
import LevelRainbowRush from '../levels/rainbowRush.json';
import LevelSlalmon from '../levels/slalom.json';
import LevelLoopingCoaster from '../levels/loopingCoaster.json';
import LevelPlinko from '../levels/plinko.json';
import LevelSpider from '../levels/spider.json';
import LevelCollectathon from '../levels/collectathon.json';
import LevelCastle from '../levels/castle.json';
import { DEFAULT_COLOR, DEFAULT_MATERIAL, Editor } from './Editor';
import { GameMaterial, gameMaterialToString, stringToGameMaterial } from './GameMaterial';
import { createStorer, StorageKey, Storer } from '../../../../util/Storage';

interface MarbleWorldGui {
    getLevelMetadata(): LevelMetadata;
    toggleEditorSpace(): void;
    quicksave(): void;
    autosave(): void;
}

interface MarbleWorldGuiCallbacks {
    onResetPlayer: () => void,
    onLoadLevel: (level: Level) => void,
    onEnterEditMode: () => void,
    onEnterPlayMode: () => void,
    updateToddlerCompanion: (enabled: boolean) => void
}

interface MarbleWorldGuiCreator {
    create(
        editor: Editor,
        callbacks: MarbleWorldGuiCallbacks
    ): MarbleWorldGui;
}

export const marbleWorldGuiCreator: MarbleWorldGuiCreator = {
    create: (editor, callbacks) => createMarbleWorldGui(editor, callbacks)
};

function createMarbleWorldGui(editor: Editor, callbacks: MarbleWorldGuiCallbacks): MarbleWorldGui {
    const levelStorer = createStorer<Level>();

    const transformSpaceControllers = createTransformSpaceControllers();
    const levelMetadataControllers = createLevelMetadataControllers();
    const loadControllers = createLoadControllers();
    const levelMetadata = createLevelMetadata();

    const onResetPlayer = callbacks.onResetPlayer;
    const onLoadLevel = (level: Level) => {
        levelMetadataControllers.name?.setValue(level.metadata['Level Name']);
        levelMetadataControllers.bronzeTime?.setValue(level.metadata['Bronze Time']);
        levelMetadataControllers.silverTime?.setValue(level.metadata['Silver Time']);
        levelMetadataControllers.goldTime?.setValue(level.metadata['Gold Time']);
        levelMetadataControllers.diamondTime?.setValue(level.metadata['Diamond Time']);

        callbacks.onLoadLevel(level);
    };
    const onEnterEditMode = callbacks.onEnterEditMode;
    const onEnterPlayMode = callbacks.onEnterPlayMode;
    const updateToddlerCompanion = callbacks.updateToddlerCompanion;

    const guiPlayMode = new GUI({ title: 'Play Mode' });
    const guiEditMode = new GUI({ title: 'Edit Mode' }).hide();

    guiPlayMode.add({ "'Tab' Reset": onResetPlayer }, "'Tab' Reset");
    const guiPlayModeLevelsFolder = guiPlayMode.addFolder('Levels');

    const levels: Array<[string, Level]> = [
        ['Level 1', Level1],
        ['Level 2', Level2],
        ['Level 3', Level3],
        ['Level 4', Level4],
        ['Level 5', Level5],
        ['Level 6', Level6],
        ['Rainbow Rush', LevelRainbowRush],
        ['Slalom Madness', LevelSlalmon],
        ['Looping Coaster 1', LevelLoopingCoaster],
        ['Plinko', LevelPlinko],
        ['Jumping Spider', LevelSpider],
        ['Collectathon', LevelCollectathon],
        ['Storm the Castle', LevelCastle]
    ];

    levels.forEach(([name, level]) => guiPlayModeLevelsFolder.add({ [name]: () => onLoadLevel(level) }, name));

    const guiPlayModeOnlineFolder = guiPlayMode.addFolder('Online').close();
    guiPlayModeOnlineFolder.add({ 'Toddler Companion App': false }, 'Toddler Companion App').onChange(updateToddlerCompanion);
    const guiPlayModeEditorFolder = guiPlayMode.addFolder('Editor');
    guiPlayModeEditorFolder.add({
        'Enter Level Editor': () => {
            guiPlayMode.hide();
            guiEditMode.show();

            onEnterEditMode();
        }
    }, 'Enter Level Editor');
    // const guiPlayModeExperimentalFolder = guiPlayMode.addFolder('Experimental');
    // guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'jumpHeight', 0, 10);
    // guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'slipperiness', 0, 1).onChange(slipperiness => slipperyContactMaterial.friction = 1 - slipperiness);
    // guiPlayModeExperimentalFolder.add(temporaryExperimentalProperties, 'bounciness', 0, 2).onChange(bounciness => bouncyContactMaterial.restitution = bounciness);
    // guiPlayModeExperimentalFolder.close();

    const guiEditModeCreateFolder = guiEditMode.addFolder('Create');
    guiEditModeCreateFolder.add({ 'Add Box': editor.addBox }, 'Add Box');
    guiEditModeCreateFolder.addColor({ 'Color': DEFAULT_COLOR }, 'Color').onChange(color => editor.changeColor(color));
    guiEditModeCreateFolder.add(
        { 'Material': gameMaterialToString(DEFAULT_MATERIAL) },
        'Material',
        [gameMaterialToString(GameMaterial.NORMAL), gameMaterialToString(GameMaterial.SLIPPERY), gameMaterialToString(GameMaterial.BOUNCY)]
    ).onChange(material => editor.changeMaterial(stringToGameMaterial(material)));
    guiEditModeCreateFolder.add({ 'Add Collectible': editor.addCollectible }, 'Add Collectible');
    guiEditModeCreateFolder.add({ "'Backspace' Delete": editor.delete }, "'Backspace' Delete");
    guiEditModeCreateFolder.add({ "'C' Clone": editor.clone }, "'C' Clone");
    const guiEditModeControlsFolder = guiEditMode.addFolder('Controls');
    guiEditModeControlsFolder.add({ "'Q' Translate": editor.changeToTranslateMode }, "'Q' Translate");
    guiEditModeControlsFolder.add({ "'E' Rotate": editor.changeToRotateMode }, "'E' Rotate");
    guiEditModeControlsFolder.add({ "'R' Scale": editor.changeToScaleMode }, "'R' Scale");
    guiEditModeControlsFolder.add({ "'X' Recenter": editor.recenter }, "'X' Recenter");
    transformSpaceControllers.local = guiEditModeControlsFolder.add({ "'F' Switch to Local Space": () => toggleEditorSpace(editor, transformSpaceControllers) }, "'F' Switch to Local Space");
    transformSpaceControllers.world = guiEditModeControlsFolder.add({ "'F' Switch to World Space": () => toggleEditorSpace(editor, transformSpaceControllers) }, "'F' Switch to World Space").hide();
    const guiEditMetadataFolder = guiEditMode.addFolder('Metadata');
    levelMetadataControllers.name = guiEditMetadataFolder.add(levelMetadata, 'Level Name');
    levelMetadataControllers.bronzeTime = guiEditMetadataFolder.add(levelMetadata, 'Bronze Time', 0, undefined, undefined);
    levelMetadataControllers.silverTime = guiEditMetadataFolder.add(levelMetadata, 'Silver Time', 0, undefined, undefined);
    levelMetadataControllers.goldTime = guiEditMetadataFolder.add(levelMetadata, 'Gold Time', 0, undefined, undefined);
    levelMetadataControllers.diamondTime = guiEditMetadataFolder.add(levelMetadata, 'Diamond Time', 0, undefined, undefined);
    const guiEditModeFileFolder = guiEditMode.addFolder('File');
    guiEditModeFileFolder.add({
        'Save to File': () => {
            const level = editor.save(levelMetadata);
            console.log('Saved Level:', level);
            createLevelFile(level);
        }
    }, 'Save to File');
    guiEditModeFileFolder.add({ "'Tab' Quicksave": () => quicksave(editor, levelMetadata, levelStorer, loadControllers) }, "'Tab' Quicksave");
    guiEditModeFileFolder.add({ 'Load from File': () => loadLevelFile().then(level => onLoadLevel(level)) }, 'Load from File');
    loadControllers.quicksave = guiEditModeFileFolder.add({
        'Load Quicksave': () => {
            if (!window.confirm('Are you sure you want to load the quicksave?\nThis will erase all your progress!')) return;

            levelStorer.load(StorageKey.MARBLE_QUICK_SAVE).then(level => {
                onLoadLevel(level);
            }).catch(() => {
                window.alert('There is nothing quicksaved.');
            });
        }
    }, 'Load Quicksave');
    loadControllers.autosave = guiEditModeFileFolder.add({
        'Load Autosave': () => {
            levelStorer.load(StorageKey.MARBLE_AUTO_SAVE).then(level => {
                onLoadLevel(level);
            }).catch(() => {
                window.alert('There is nothing autosaved.');
            });
        }
    }, 'Load Autosave');
    guiEditModeFileFolder.add({
        'Load Empty Level': () => {
            if (!window.confirm('Are you sure you want to load an empty level?\nThis will erase all your progress!')) return;

            onLoadLevel(EmptyLevel)
        }
    }, 'Load Empty Level');
    const guiEditModePlayerFolder = guiEditMode.addFolder('Player');
    guiEditModePlayerFolder.add({
        'Enter Play Mode': () => {
            guiPlayMode.show();
            guiEditMode.hide();

            onEnterPlayMode();
        }
    }, 'Enter Play Mode');

    return {
        getLevelMetadata: () => levelMetadata,
        toggleEditorSpace: () => toggleEditorSpace(editor, transformSpaceControllers),
        quicksave: () => quicksave(editor, levelMetadata, levelStorer, loadControllers),
        autosave: () => autosave(editor, levelMetadata, levelStorer, loadControllers)
    };
}

interface TransformSpaceControllers {
    local: FunctionController<{ "'F' Switch to Local Space": () => void }, "'F' Switch to Local Space"> | null;
    world: FunctionController<{ "'F' Switch to World Space": () => void }, "'F' Switch to World Space"> | null;
}

interface LevelMetadataControllers {
    name: StringController<LevelMetadata, 'Level Name'> | null;
    bronzeTime: NumberController<LevelMetadata, 'Bronze Time'> | null;
    silverTime: NumberController<LevelMetadata, 'Silver Time'> | null;
    goldTime: NumberController<LevelMetadata, 'Gold Time'> | null;
    diamondTime: NumberController<LevelMetadata, 'Diamond Time'> | null;
}

interface LoadControllers {
    quicksave: FunctionController<{ 'Load Quicksave': () => void; }, 'Load Quicksave'> | null;
    autosave: FunctionController<{ 'Load Autosave': () => void; }, 'Load Autosave'> | null;
}

function quicksave(
    editor: Editor,
    levelMetadata: LevelMetadata,
    levelStorer: Storer<Level>,
    loadControllers: LoadControllers
) {
    console.log('Creating quicksave');
    const level = editor.save(levelMetadata);
    levelStorer.save(StorageKey.MARBLE_QUICK_SAVE, level);
    console.log('Quicksaved Level:', level);

    loadControllers.quicksave?.name(`Load Quicksave - ${new Date().toLocaleTimeString()}`);
}

function autosave(
    editor: Editor,
    levelMetadata: LevelMetadata,
    levelStorer: Storer<Level>,
    loadControllers: LoadControllers
) {
    console.log('Creating autosave');
    const level = editor.save(levelMetadata);
    levelStorer.save(StorageKey.MARBLE_AUTO_SAVE, level);
    console.log('Autosaved level:', level);

    loadControllers.autosave?.name(`Load Autosave - ${new Date().toLocaleTimeString()}`);
}

function createLoadControllers(): LoadControllers {
    return { quicksave: null, autosave: null };
}

function createTransformSpaceControllers(): TransformSpaceControllers {
    return { local: null, world: null };
}

function createLevelMetadataControllers(): LevelMetadataControllers {
    return { name: null, bronzeTime: null, silverTime: null, goldTime: null, diamondTime: null };
}

function createLevelMetadata(): LevelMetadata {
    return {
        'Level Name': 'level',
        'Bronze Time': -1,
        'Silver Time': -1,
        'Gold Time': -1,
        'Diamond Time': -1
    };
}

function toggleEditorSpace(editor: Editor, transformSpaceControllers: TransformSpaceControllers) {
    editor.toggleSpace();

    if (transformSpaceControllers?.local?._hidden) {
        transformSpaceControllers.world?.hide();
        transformSpaceControllers.local?.show();
    } else if (transformSpaceControllers?.world?._hidden) {
        transformSpaceControllers.local?.hide();
        transformSpaceControllers.world?.show();
    }
}
