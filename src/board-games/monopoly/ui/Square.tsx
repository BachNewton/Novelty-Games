import React from "react";
import { Square as SquareData, Street } from "../data/Square";
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
    boardIndex: number;
    children: React.ReactNode;
}

const Square: React.FC<SquareProps> = ({ data, boardIndex, children }) => {
    return <div style={{
        border: '1px solid white',
        ...getGridPosition(boardIndex)
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            {iconUi(data, boardIndex)}

            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {children}
            </div>
        </div>
    </div>;
};

function iconUi(data: SquareData, boardIndex: number): React.ReactNode {
    const style: React.CSSProperties = {
        height: '100%',
        width: '100%',
        maxHeight: (window.innerHeight / 11) * 1,
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
            return streetUi(data, boardIndex);
    }
}

function streetUi(street: Street, boardIndex: number): React.ReactNode {
    return <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        ...getBorder(street, boardIndex)
    }} />;
}

function getBorder(street: Street, boardIndex: number): React.CSSProperties {
    const side = getSide(boardIndex);
    const border = `${STREET_COLOR_WIDTH}px solid ${street.color}`;

    switch (side) {
        case 'bottom':
            return { borderTop: border };
        case 'left':
            return { borderRight: border };
        case 'top':
            return { borderBottom: border };
        case 'right':
            return { borderLeft: border };
    }
}

function getSide(index: number): 'bottom' | 'left' | 'top' | 'right' {
    if (index >= 0 && index <= 10) return 'bottom';
    if (index >= 11 && index <= 19) return 'left';
    if (index >= 20 && index <= 30) return 'top';
    if (index >= 31 && index <= 39) return 'right';

    throw new Error('Invalid index');
}

function getGridPosition(index: number): React.CSSProperties {
    // Bottom Row (squares 0-10)
    if (index <= 10) {
        return { gridRow: 11, gridColumn: 11 - index };
    }

    // Left Column (squares 11-19)
    if (index <= 19) {
        return { gridRow: 21 - index, gridColumn: 1 };
    }

    // Top Row (squares 20-30)
    if (index <= 30) {
        return { gridRow: 1, gridColumn: index - 19 };
    }

    // Right Column (squares 31-39)
    if (index <= 39) {
        return { gridRow: index - 29, gridColumn: 11 };
    }

    throw new Error('Invalid index');
};

export default Square;
