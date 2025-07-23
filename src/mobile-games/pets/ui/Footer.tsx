import { useEffect, useState } from "react";
import Button from "../../../util/ui/Button";
import { COLORS } from "./Home";

const FOOTER_BUTTONS_SCALE = 1.4;
const FOOTER_BUTTONS_BORDER_RADIUS = 20;

interface FooterProps {
    selectedTab: number;
}

enum SubMenu {
    CHAT, GIVE_TREAT, PLAY, PET
}

const Footer: React.FC<FooterProps> = ({ selectedTab }) => {
    const [subMenu, setSubMenu] = useState<SubMenu | null>(null);

    useEffect(() => setSubMenu(null), [selectedTab]);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: `4px solid ${COLORS.primary}`,
        padding: '10px',
        backgroundColor: COLORS.surface,
        gap: '10px'
    }}>
        {menuUi(subMenu, updatedSubMenu => setSubMenu(updatedSubMenu))}
    </div>;
};

function menuUi(subMenu: SubMenu | null, setSubMenu: (subMenu: SubMenu) => void): JSX.Element {
    switch (subMenu) {
        case null:
            return mainMenuUi(setSubMenu);
        case SubMenu.CHAT:
            return chatSubMenuUi();
        case SubMenu.GIVE_TREAT:
            return giveTreatSubMenuUi();
        case SubMenu.PLAY:
            return playSubMenuUi();
        case SubMenu.PET:
            return petSubMenuUi();

    }
}

function mainMenuUi(setSubMenu: (subMenu: SubMenu) => void): JSX.Element {
    return <>
        {subMenuButton('Chat', () => setSubMenu(SubMenu.CHAT))}
        {subMenuButton('Give Treat', () => setSubMenu(SubMenu.GIVE_TREAT))}
        {subMenuButton('Play', () => setSubMenu(SubMenu.PLAY))}
        {subMenuButton('Pet', () => setSubMenu(SubMenu.PET))}
    </>;
}

function chatSubMenuUi(): JSX.Element {
    return <>
        {subMenuButton('Owner')}
        {subMenuButton('Silly')}
        {subMenuButton('Chat 3')}
        {subMenuButton('Chat 4')}
    </>;
}

function giveTreatSubMenuUi(): JSX.Element {
    return <>
        {subMenuButton('Treat 1')}
        {subMenuButton('Treat 2')}
        {subMenuButton('Treat 3')}
        {subMenuButton('Treat 4')}
    </>;
}

function playSubMenuUi(): JSX.Element {
    return <>
        {subMenuButton('Play 1')}
        {subMenuButton('Play 2')}
        {subMenuButton('Play 3')}
        {subMenuButton('Play 4')}
    </>;
}

function petSubMenuUi(): JSX.Element {
    return <>
        {subMenuButton('Pet 1')}
        {subMenuButton('Pet 2')}
        {subMenuButton('Pet 3')}
        {subMenuButton('Pet 4')}
    </>;
}

function subMenuButton(text: string, onClick?: () => void): JSX.Element {
    return <Button onClick={onClick} fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>{text}</Button>;
}

export default Footer;
