import { useEffect, useState } from "react";
import { COLORS } from "./Home";
import PetsButton from "./PetsButton";
import { PET_DATA } from "../data/PetData";

interface FooterProps {
    selectedTab: number;
}

enum Menu {
    MAIN, CHAT
}

const Footer: React.FC<FooterProps> = ({ selectedTab }) => {
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
        {getMenu(menu, selectedTab, () => setMenu(Menu.CHAT))}
    </div>;
};

function getMenu(menu: Menu, selectedTab: number, onChat: () => void): JSX.Element {
    switch (menu) {
        case Menu.MAIN:
            return mainMenuUi(onChat);
        case Menu.CHAT:
            return chatMenuUi(selectedTab);
    }
}

function mainMenuUi(onChat: () => void): JSX.Element {
    return <>
        <PetsButton text="Give Space" onClick={() => { }} />
        <PetsButton text="Pet" onClick={() => { }} />
        <PetsButton text="Give Treat" onClick={() => { }} />
        <PetsButton text="Play" onClick={() => { }} />
        <PetsButton text="Chat" onClick={onChat} columns={2} />
    </>;
}

function chatMenuUi(selectedTab: number): JSX.Element {
    const chat = PET_DATA[selectedTab].interactions.chat;

    const items = Array.from(chat.keys()).map(key => <PetsButton
        key={key}
        text={key}
        onClick={() => { }}
    />);

    return <>{items}</>;
}

export default Footer;
