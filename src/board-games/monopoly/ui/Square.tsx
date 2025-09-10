import React from "react";
import { Square as SquareData } from "../data/Square";
import GoIcon from '../icon/go.png';
import ChanceIcon from '../icon/chance.png';
import RailroadIcon from '../icon/railroad.png';
import CommunityChestIcon from '../icon/community-chest.png';
import TaxIcon from '../icon/tax.png';
import JailIcon from '../icon/jail.png';
import FreeParkingIcon from '../icon/free-parking.png';
import GoToJailIcon from '../icon/go-to-jail.png';
import ElectricUtilityIcon from '../icon/electric-utility.png';
import WaterUtilityIcon from '../icon/water-utility.png';

const STREET_COLOR_WIDTH = 10;

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        ...getBorder(data)
    }}>
        {getContent(data)}
    </div>;
};

function getBorder(data: SquareData): React.CSSProperties {
    if (data.type !== 'street') return {};

    const border = `${STREET_COLOR_WIDTH}px solid ${data.color}`;

    // switch (data.side) {
    //     case Side.BOTTOM:
    //         return { borderTop: border };
    //     case Side.LEFT:
    //         return { borderRight: border };
    //     case Side.TOP:
    //         return { borderBottom: border };
    //     case Side.RIGHT:
    //         return { borderLeft: border };
    // }

    return {};
}

function getContent(data: SquareData): React.ReactNode {
    switch (data.type) {
        case 'go':
            return <img src={GoIcon} alt="Go" style={{ width: '75%', height: '75%' }} />;
        case 'chance':
            return <img src={ChanceIcon} alt="Chance" style={{ width: '75%', height: '75%' }} />;
        case 'railroad':
            return <img src={RailroadIcon} alt="Railroad" style={{ width: '75%', height: '75%' }} />;
        case 'community-chest':
            return <img src={CommunityChestIcon} alt="Community Chest" style={{ width: '75%', height: '75%' }} />;
        case 'tax':
            return <img src={TaxIcon} alt="Tax" style={{ width: '75%', height: '75%' }} />;
        case 'jail':
            return <img src={JailIcon} alt="Jail" style={{ width: '75%', height: '75%' }} />;
        case 'go-to-jail':
            return <img src={GoToJailIcon} alt="Go to Jail" style={{ width: '75%', height: '75%' }} />;
        case 'free-parking':
            return <img src={FreeParkingIcon} alt="Free Parking" style={{ width: '75%', height: '75%' }} />;
        case 'electric-utility':
            return <img src={ElectricUtilityIcon} alt="Electric Utility" style={{ width: '75%', height: '75%' }} />;
        case 'water-utility':
            return <img src={WaterUtilityIcon} alt="Water Utility" style={{ width: '75%', height: '75%' }} />;
    }
}

export default Square;
