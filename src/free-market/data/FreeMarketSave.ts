import { ComponentQuantity } from "./Component";
import { Inventor } from "./Inventor";

export interface FreeMarketSave {
    inventor: Inventor;
    money: number;
    extractionDetails: ExtractionDetails | null;
    inentory: ComponentQuantity[];
}

export interface ExtractionDetails {
    startTime: number;
    index: number;
}
