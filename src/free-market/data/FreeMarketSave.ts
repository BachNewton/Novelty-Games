import { Inventor } from "./Inventor";

export interface FreeMarketSave {
    inventor: Inventor;
    money: number;
    extractionDetails: ExtractionDetails | null;
}

export interface ExtractionDetails {
    startTime: number;
    index: number;
}
