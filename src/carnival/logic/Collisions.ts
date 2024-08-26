import { Box, Position } from "../data/Data";

export function collision(pos: Position, box: Box, usePrevious: boolean = false): boolean {
    const x = usePrevious ? box.previousPos.x : box.pos.x;
    const y = usePrevious ? box.previousPos.y : box.pos.y;
    return pos.x >= x && pos.x <= x + box.width && pos.y >= y && pos.y <= y + box.height;
}
