function formatTime(ms) {
    if (ms < 1000) return '< 1s';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

export function createProgressTracker() {
    let startTime = null;

    return {
        start() {
            startTime = Date.now();
        },

        render(processed, total, depth, maxDepth, currentTitle) {
            const termWidth = process.stdout.columns || 80;

            const percent = total > 0 ? processed / total : 0;
            const percentStr = (percent * 100).toFixed(1).padStart(5);

            let eta = '--';
            if (startTime && processed > 0) {
                const elapsed = Date.now() - startTime;
                const rate = processed / elapsed;
                const remaining = total - processed;
                const etaMs = remaining / rate;
                eta = formatTime(etaMs);
            }

            // Fixed stats section
            const stats = `${percentStr}% | ${processed.toLocaleString()}/${total.toLocaleString()} | D${depth}/${maxDepth} | ETA: ${eta}`;

            // Bar takes 30% of width, minimum 10
            const barWidth = Math.max(10, Math.floor(termWidth * 0.3));
            const filled = Math.round(barWidth * percent);
            const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

            // Build without title first to see remaining space
            const prefix = `[${bar}] ${stats} | `;
            const remainingSpace = termWidth - prefix.length - 1;

            // Truncate title to fit
            const title = remainingSpace > 3
                ? (currentTitle.length > remainingSpace ? currentTitle.slice(0, remainingSpace - 1) + '…' : currentTitle)
                : '';

            process.stdout.write(`\x1b[2K\r${prefix}${title}`);
        }
    };
}
