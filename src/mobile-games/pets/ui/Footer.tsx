import { useEffect, useRef, useState } from "react";
import { COLORS } from "./Home";
import PetsButton from "./PetsButton";
import { PET_DATA } from "../data/PetData";
import { Interaction, Interactions } from "../data/Interaction";
import { INTERACTION_PER_CYCLE } from "../logic/DataManager";

interface FooterProps {
    selectedTab: number;
    interactionsEnabled: boolean;
    interactionsThisCycle: number;
    isDiscovered: boolean;
    hasLoaded: boolean;
    distance: number | null;
    seenInteractions: Set<string>;
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void;
}

enum Menu {
    MAIN, CHAT
}

const Footer: React.FC<FooterProps> = ({ selectedTab, interactionsEnabled, interactionsThisCycle, isDiscovered, hasLoaded, distance, seenInteractions, interactionSelected }) => {
    const previousHasLoaded = useRef(hasLoaded);
    const [menu, setMenu] = useState<Menu>(Menu.MAIN);
    const [showComeBackLaterMessage, setShowComeBackLaterMessage] = useState(false);

    const hasReachedInteractionThreshold = interactionsThisCycle >= INTERACTION_PER_CYCLE;

    useEffect(() => {
        // On the first load
        if (previousHasLoaded.current !== hasLoaded) {
            setShowComeBackLaterMessage(hasReachedInteractionThreshold);
        }

        previousHasLoaded.current = hasLoaded;
    }, [hasLoaded]);

    useEffect(() => {
        setMenu(Menu.MAIN);

        setShowComeBackLaterMessage(hasReachedInteractionThreshold);
    }, [selectedTab]);

    const footerContent = distance === null || isDiscovered
        ? showComeBackLaterMessage
            ? comeBackLaterUi()
            : getMenu(menu, selectedTab, interactionsEnabled, seenInteractions, () => setMenu(Menu.CHAT), interactionSelected, () => setMenu(Menu.MAIN))
        : distanceUi(distance);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(3, minmax(2em, auto))',
        borderTop: `4px solid ${COLORS.secondary}`,
        padding: '10px',
        backgroundColor: COLORS.surface,
        gap: '10px'
    }}>
        {footerContent}
    </div>;
};

function comeBackLaterUi(): JSX.Element {
    return <div style={{
        gridArea: 'span 3 / span 2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }}>
        <div>You've seen me recently,</div>
        <div>check back in after I've had a nap</div>
    </div>;
}

function distanceUi(distance: number): JSX.Element {
    return <>
        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.5em' }}>Distance</div>
        <div style={{ gridArea: 'span 2 / span 2', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', fontSize: '2.25em' }}>{formatDistance(distance)}</div>
    </>;
}

function formatDistance(distance: number): string {
    if (distance < 1) return (distance * 1000).toFixed(0) + ' m';
    return distance.toFixed(3) + ' km';
}

function getMenu(
    menu: Menu,
    selectedTab: number,
    interactionsEnabled: boolean,
    seenInteractions: Set<string>,
    onChat: () => void,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void,
    resetMenu: () => void
): JSX.Element {
    switch (menu) {
        case Menu.MAIN:
            return mainMenuUi(onChat, selectedTab, interactionsEnabled, seenInteractions, interactionSelected);
        case Menu.CHAT:
            return chatMenuUi(selectedTab, interactionsEnabled, seenInteractions, (type, interaction) => {
                interactionSelected(type, interaction);

                // We have the option to reset the menu, but for now staying on the disabled chat menu is fine.
                // resetMenu();
            });
    }
}

function mainMenuUi(
    onChat: () => void,
    selectedTab: number,
    interactionsEnabled: boolean,
    seenInteractions: Set<string>,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void
): JSX.Element {
    const interactions = PET_DATA[selectedTab].interactions;

    const interactionsUi = ([
        ['Give Space', 'space', interactions.space],
        ['Pet', 'pet', interactions.pet],
        ['Give Treat', 'treat', interactions.treat],
        ['Play', 'play', interactions.play]
    ] as [string, keyof Interactions, Interaction][]).map(([text, key, interaction], index) => <PetsButton
        key={index}
        interactionSeen={seenInteractions.has(interaction.id)}
        isEnabled={interactionsEnabled}
        text={text}
        onClick={() => interactionSelected(key, interaction)}
    />);

    return <>
        {interactionsUi}

        <PetsButton
            interactionSeen={areAllChatInteractionsSeen(interactions.chat, seenInteractions)}
            isEnabled={interactionsEnabled}
            text="Chat"
            onClick={onChat}
            columns={2}
        />
    </>;
}

function chatMenuUi(
    selectedTab: number,
    interactionsEnabled: boolean,
    seenInteractions: Set<string>,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void
): JSX.Element {
    const chat = PET_DATA[selectedTab].interactions.chat;

    const items = Array.from(chat).map(([key, interaction]) => <PetsButton
        interactionSeen={seenInteractions.has(interaction.id)}
        isEnabled={interactionsEnabled}
        key={key}
        text={key}
        onClick={() => interactionSelected('chat', interaction)}
    />);

    return <>{items}</>;
}

function areAllChatInteractionsSeen(chat: Map<string, Interaction>, seenInteractions: Set<string>): boolean {
    for (const [, { id }] of chat) {
        if (!seenInteractions.has(id)) return false;
    }

    return true;
}

export default Footer;
