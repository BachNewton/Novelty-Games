import { ComponentQuantity } from "./Component";
import { Inventor } from "./Inventor";

export const SAVE_VERSION = 1;

export interface FreeMarketSave {
    version: number;
    inventor: Inventor;
    money: number;
    extractionDetails: ExtractionDetails | null;
    inentory: ComponentQuantity[];
}

export interface ExtractionDetails {
    startTime: number;
    id: string | null;
}
