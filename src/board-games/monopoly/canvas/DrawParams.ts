import { MonopolyIcons } from "../data/MonopolyIcons";
import { MonopolyState } from "../data/MonopolyState";
import { Rect } from "./Rect";

export interface DrawParams {
    ctx: CanvasRenderingContext2D;
    view: Rect;
    state: MonopolyState;
    icons: MonopolyIcons;
    clickableRects: ClickableRects;
}

export interface ClickableRects {
    yes?: Rect;
    no?: Rect;
}
