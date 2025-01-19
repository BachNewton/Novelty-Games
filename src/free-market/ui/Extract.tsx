import '../css/animated-border.css';
import '../css/animated-scale.css';
import '../css/grey-out.css';
import { useState } from "react";
import { RAW_MATERIALS } from "../data/Component";
import { ExtractionDetails, FreeMarketSave } from "../data/FreeMarketSave";
import HorizontalLine from "./HorizontalLine";
import { StorageKey, Storer } from "../../util/Storage";

interface ExtractProps {
    save: FreeMarketSave;
    storer: Storer<FreeMarketSave>;
}

const Extract: React.FC<ExtractProps> = ({ save, storer }) => {
    const [details, setDetails] = useState(save.extractionDetails);

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

    const onExtractClick = (index: number) => {
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

        return <div key={index} style={extractContainerStyle} className={animatedBorderClassName}>
            <div style={{ fontSize: '1.25em', flexGrow: 1 }}>{material.name}</div>
            <div style={extractIconStyle} className={animatedScaleClassName} onClick={() => onExtractClick(index)}>🏗️</div>
            <div style={{ width: '3.5em', textAlign: 'right' }}>x12,345</div>
        </div>;
    });

    return <div>
        <div style={headerStyle}>Extraction</div>
        <div style={{ textAlign: 'center' }}>Here you can spend real time to extract raw materials or labor for money.</div>
        <HorizontalLine />
        <div style={subheaderStyle}>Labor</div>
        <div style={extractContainerStyle} className={animatedBorderClassNameForLabor}>
            <div style={{ fontSize: '1.25em', flexGrow: 1 }}>💲Money</div>
            <div style={extractIconStyle} className={animatedScaleClassNameForLabor} onClick={() => onExtractClick(-1)}>💸</div>
            <div style={{ width: '3.5em', textAlign: 'right' }}>$12,345</div>
        </div>
        <HorizontalLine />
        <div style={subheaderStyle}>Raw Materials</div>
        {rawMaterialsUi}
    </div>;
};

export default Extract;
