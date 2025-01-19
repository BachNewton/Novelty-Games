import '../css/animated-border.css';
import '../css/animated-scale.css';
import '../css/grey-out.css';
import { useEffect, useState } from "react";
import { ComponentQuantity, RAW_MATERIALS } from "../data/Component";
import { ExtractionDetails, FreeMarketSave } from "../data/FreeMarketSave";
import HorizontalLine from "./HorizontalLine";
import { StorageKey, Storer } from "../../util/Storage";
import { format } from '../logic/NumberFormatter';

interface ExtractProps {
    save: FreeMarketSave;
    storer: Storer<FreeMarketSave>;
}

const Extract: React.FC<ExtractProps> = ({ save, storer }) => {
    const [time, setTime] = useState(new Date().getTime());
    const [details, setDetails] = useState(save.extractionDetails);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date().getTime());
        }, 1000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const extractContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        border: '2px solid white',
        padding: '10px',
        margin: '15px',
        borderRadius: '15px',
        backgroundImage: 'linear-gradient(125deg, grey 20%, #3498db 50%, grey 80%)'
    };

    const extractIconStyle: React.CSSProperties = {
        border: '2px solid white',
        borderRadius: '50%',
        fontSize: '1.3em',
        padding: '10px',
        marginRight: '15px',
        background: '#3498db',
        boxShadow: 'darkorange 0px 0px 5px 5px',
        cursor: 'pointer'
    };

    const headerStyle: React.CSSProperties = {
        fontWeight: 'bold',
        marginBottom: '5px',
        fontSize: '1.75em',
        textAlign: 'center'
    };

    const subheaderStyle: React.CSSProperties = {
        fontWeight: 'bold',
        marginBottom: '15px',
        fontSize: '1.3em',
        textAlign: 'center'
    };

    const onExtractClick = (index: number, id?: string) => {
        if (details !== null) {
            save.money += calculateExtractedMoney(details, time);

            const componentQuantity = save.inentory.find(componentQuantity => componentQuantity.componentId === id);

            if (componentQuantity !== undefined) {
                componentQuantity.quantity += calculateExtractedMaterial(details, time, index);
            }
        }

        const updatedDetials: ExtractionDetails | null = details?.index === index
            ? null
            : {
                startTime: new Date().getTime(),
                index: index
            };

        setDetails(updatedDetials);
        save.extractionDetails = updatedDetials;
        storer.save(StorageKey.FREE_MARKET, save);
    };

    const animatedBorderClassNameForLabor = details === null ? '' : details?.index === -1 ? 'animated-border' : 'grey-out';
    const animatedScaleClassNameForLabor = details?.index === -1 ? 'animated-scale' : '';

    const rawMaterialsUi = RAW_MATERIALS.map((material, index) => {
        const animatedBorderClassName = details === null ? '' : details?.index === index ? 'animated-border' : 'grey-out';
        const animatedScaleClassName = details?.index === index ? 'animated-scale' : '';
        const quantity = calculateExtractedMaterial(details, time, index);

        return <div key={index} style={extractContainerStyle} className={animatedBorderClassName}>
            <div style={{ fontSize: '1.25em', flexGrow: 1 }}>{material.name}</div>
            <div style={extractIconStyle} className={animatedScaleClassName} onClick={() => onExtractClick(index, material.id)}>🏗️</div>
            <div style={{ width: '3.5em', textAlign: 'right' }}>x{format(quantity)}</div>
        </div>;
    });

    const money = calculateExtractedMoney(details, time);

    return <div>
        <div style={headerStyle}>Extraction</div>
        <div style={{ fontSize: '0.8em' }}>
            Here you can spend real-time to labor for money or extract raw materials. Select an extraction icon to start extracting. When you're finished, select the icon again to collect the resources.
        </div>
        <HorizontalLine />
        <div style={subheaderStyle}>Labor</div>
        <div style={extractContainerStyle} className={animatedBorderClassNameForLabor}>
            <div style={{ fontSize: '1.25em', flexGrow: 1 }}>💲Money</div>
            <div style={extractIconStyle} className={animatedScaleClassNameForLabor} onClick={() => onExtractClick(-1)}>💸</div>
            <div style={{ width: '3.5em', textAlign: 'right' }}>${format(money)}</div>
        </div>
        <HorizontalLine />
        <div style={subheaderStyle}>Raw Materials</div>
        {rawMaterialsUi}
    </div>;
};

function calculateExtractedMoney(details: ExtractionDetails | null, time: number): number {
    if (details === null) return 0;
    if (details.index !== -1) return 0;

    const deltaTime = Math.max(time - details.startTime, 0);

    return 0.001 * deltaTime;
}

function calculateExtractedMaterial(details: ExtractionDetails | null, time: number, index: number): number {
    if (details === null) return 0;
    if (details.index !== index) return 0;

    const deltaTime = Math.max(time - details.startTime, 0);

    return 0.001 * deltaTime;
}

export default Extract;
