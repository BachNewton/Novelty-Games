import { Box, Position } from "../data/Data";

export function collision(pos: Position, box: Box): boolean {
    return pos.x >= box.pos.x && pos.x <= box.pos.x + box.width && pos.y >= box.pos.y && pos.y <= box.pos.y + box.height;
}
