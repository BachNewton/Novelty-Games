import React from "react";
import { Square as SquareData } from "../data/Square";
import GoIcon from '../icon/go.svg';
import ChanceIcon from '../icon/chance.svg';
import RailroadIcon from '../icon/railroad.svg';
import CommunityChestIcon from '../icon/community-chest.svg';
import TaxIcon from '../icon/tax.svg';
import JailIcon from '../icon/jail.svg';
import FreeParkingIcon from '../icon/free-parking.svg';
import GoToJailIcon from '../icon/go-to-jail.svg';
import ElectricUtilityIcon from '../icon/electric-utility.svg';
import WaterUtilityIcon from '../icon/water-utility.svg';

const STREET_COLOR_WIDTH = 10;

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        height: '100%'
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
    const style: React.CSSProperties = {
        height: '100%',
        width: '100%',
        maxHeight: window.innerHeight / 11,
        maxWidth: window.innerWidth / 11
    };

    switch (data.type) {
        case 'go':
            return <img src={GoIcon} alt="Go" style={style} />;
        case 'chance':
            return <img src={ChanceIcon} alt="Chance" style={style} />;
        case 'railroad':
            return <img src={RailroadIcon} alt="Railroad" style={style} />;
        case 'community-chest':
            return <img src={CommunityChestIcon} alt="Community Chest" style={style} />;
        case 'tax':
            return <img src={TaxIcon} alt="Tax" style={style} />;
        case 'jail':
            return <img src={JailIcon} alt="Jail" style={style} />;
        case 'go-to-jail':
            return <img src={GoToJailIcon} alt="Go to Jail" style={style} />;
        case 'free-parking':
            return <img src={FreeParkingIcon} alt="Free Parking" style={style} />;
        case 'electric-utility':
            return <img src={ElectricUtilityIcon} alt="Electric Utility" style={style} />;
        case 'water-utility':
            return <img src={WaterUtilityIcon} alt="Water Utility" style={style} />;
        case 'street':
            return <div style={{ ...style, borderTop: '10px solid green', boxSizing: 'border-box' }}>Test</div>;
    }
}

export default Square;
