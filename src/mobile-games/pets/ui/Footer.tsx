import { useEffect, useState } from "react";
import { COLORS } from "./Home";
import PetsButton from "./PetsButton";
import { PET_DATA } from "../data/PetData";
import { Interaction, Interactions } from "../data/Interaction";

interface FooterProps {
    selectedTab: number;
    interactionsEnabled: boolean;
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void;
}

enum Menu {
    MAIN, CHAT
}

const Footer: React.FC<FooterProps> = ({ selectedTab, interactionsEnabled, interactionSelected }) => {
    const [menu, setMenu] = useState<Menu>(Menu.MAIN);

    useEffect(() => setMenu(Menu.MAIN), [selectedTab]);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: `4px solid ${COLORS.primary}`,
        padding: '10px',
        backgroundColor: COLORS.surface,
        gap: '10px'
    }}>
        {getMenu(menu, selectedTab, interactionsEnabled, () => setMenu(Menu.CHAT), interactionSelected, () => setMenu(Menu.MAIN))}
    </div>;
};

function getMenu(
    menu: Menu,
    selectedTab: number,
    interactionsEnabled: boolean,
    onChat: () => void,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void,
    resetMenu: () => void
): JSX.Element {
    switch (menu) {
        case Menu.MAIN:
            return mainMenuUi(onChat, selectedTab, interactionsEnabled, interactionSelected);
        case Menu.CHAT:
            return chatMenuUi(selectedTab, interactionsEnabled, (type, interaction) => {
                interactionSelected(type, interaction);
                resetMenu();
            });
    }
}

function mainMenuUi(
    onChat: () => void,
    selectedTab: number,
    interactionsEnabled: boolean,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void
): JSX.Element {
    const interactions = PET_DATA[selectedTab].interactions;

    return <>
        <PetsButton isEnabled={interactionsEnabled} text="Give Space" onClick={() => interactionSelected('space', interactions.space)} />
        <PetsButton isEnabled={interactionsEnabled} text="Pet" onClick={() => interactionSelected('pet', interactions.pet)} />
        <PetsButton isEnabled={interactionsEnabled} text="Give Treat" onClick={() => interactionSelected('treat', interactions.treat)} />
        <PetsButton isEnabled={interactionsEnabled} text="Play" onClick={() => interactionSelected('play', interactions.play)} />
        <PetsButton isEnabled={interactionsEnabled} text="Chat" onClick={onChat} columns={2} />
    </>;
}

function chatMenuUi(
    selectedTab: number,
    interactionsEnabled: boolean,
    interactionSelected: (type: keyof Interactions, interaction: Interaction) => void
): JSX.Element {
    const chat = PET_DATA[selectedTab].interactions.chat;

    const items = Array.from(chat).map(([key, interaction]) => <PetsButton
        isEnabled={interactionsEnabled}
        key={key}
        text={key}
        onClick={() => interactionSelected('chat', interaction)}
    />);

    return <>{items}</>;
}

export default Footer;
