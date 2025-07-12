export interface ParserProgress {
    current: number;
    total: number;
}

export interface ParserProgressTracker {
    makeProgress: () => void;
    complete: () => void;
}

export function createParserProgressTracker(
    total: number,
    onParserProgress: (progress: ParserProgress | null) => void
): ParserProgressTracker {
    let current = 0;

    onParserProgress({
        total: total,
        current: current
    });

    return {
        makeProgress: () => {
            onParserProgress({
                total: total,
                current: ++current
            });
        },
        complete: () => onParserProgress(null)
    };
}
