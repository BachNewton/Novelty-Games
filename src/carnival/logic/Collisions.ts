import { Box, Position } from "../data/Data";

export function collision(pos: Position, box: Box, scalar: number): boolean {
    return pos.x >= box.pos.x && pos.x <= box.pos.x + box.width * scalar && pos.y >= box.pos.y && pos.y <= box.pos.y + box.height * scalar;
}
