import { useEffect, useState } from "react";
import { COLORS } from "./Home";
import PetsButton from "./PetsButton";
import { PET_DATA } from "../data/PetData";

interface FooterProps {
    selectedTab: number;
    interactionSelected: (id: string) => void;
}

enum Menu {
    MAIN, CHAT
}

const Footer: React.FC<FooterProps> = ({ selectedTab, interactionSelected }) => {
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
        {getMenu(menu, selectedTab, () => setMenu(Menu.CHAT), interactionSelected)}
    </div>;
};

function getMenu(menu: Menu, selectedTab: number, onChat: () => void, interactionSelected: (id: string) => void): JSX.Element {
    switch (menu) {
        case Menu.MAIN:
            return mainMenuUi(onChat, selectedTab, interactionSelected);
        case Menu.CHAT:
            return chatMenuUi(selectedTab, interactionSelected);
    }
}

function mainMenuUi(onChat: () => void, selectedTab: number, interactionSelected: (id: string) => void): JSX.Element {
    const interactions = PET_DATA[selectedTab].interactions;

    return <>
        <PetsButton text="Give Space" onClick={() => interactionSelected(interactions.space.id)} />
        <PetsButton text="Pet" onClick={() => interactionSelected(interactions.pet.id)} />
        <PetsButton text="Give Treat" onClick={() => interactionSelected(interactions.treat.id)} />
        <PetsButton text="Play" onClick={() => interactionSelected(interactions.play.id)} />
        <PetsButton text="Chat" onClick={onChat} columns={2} />
    </>;
}

function chatMenuUi(selectedTab: number, interactionSelected: (id: string) => void): JSX.Element {
    const chat = PET_DATA[selectedTab].interactions.chat;

    const items = Array.from(chat).map(([key, interaction]) => <PetsButton
        key={key}
        text={key}
        onClick={() => interactionSelected(interaction.id)}
    />);

    return <>{items}</>;
}

export default Footer;
