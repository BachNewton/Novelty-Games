const COLOR_PALETTE = [
    0x4ECDC4, // Teal
    0xFF6B6B, // Coral
    0x45B7D1, // Sky Blue
    0x96CEB4, // Sage
    0xFECE00, // Yellow
    0xFF6F61, // Orange Red
    0x6B5B95, // Purple
    0x88D8B0, // Mint
    0xF7DC6F, // Light Yellow
    0xBB8FCE, // Lavender
    0x58D68D, // Green
    0xF1948A, // Pink
    0x5DADE2, // Light Blue
    0xF5B041, // Orange
    0xAED6F1, // Pale Blue
    0xD7BDE2, // Light Purple
];

export interface CategoryTracker {
    registerArticle: (title: string, categories: string[]) => void;
    getOptimalCategory: (title: string) => string | null;
    getCategoryColor: (category: string | null) => number;
    getArticleColor: (title: string) => number;
    getTotalCategories: () => number;
    getCategoryStats: () => Map<string, number>;
}

export function createCategoryTracker(): CategoryTracker {
    const articleCategories = new Map<string, string[]>();
    const categoryArticles = new Map<string, Set<string>>();
    const categoryColorIndex = new Map<string, number>();
    let nextColorIndex = 0;

    function assignColorToCategory(category: string): number {
        if (!categoryColorIndex.has(category)) {
            categoryColorIndex.set(category, nextColorIndex);
            nextColorIndex = (nextColorIndex + 1) % COLOR_PALETTE.length;
        }
        return categoryColorIndex.get(category)!;
    }

    return {
        registerArticle: (title, categories) => {
            if (articleCategories.has(title)) return;

            articleCategories.set(title, categories);

            for (const category of categories) {
                if (!categoryArticles.has(category)) {
                    categoryArticles.set(category, new Set());
                }
                categoryArticles.get(category)!.add(title);
            }
        },

        getOptimalCategory: (title) => {
            const categories = articleCategories.get(title);
            if (!categories || categories.length === 0) return null;

            let bestCategory = categories[0];
            let bestCount = 0;

            for (const category of categories) {
                const count = categoryArticles.get(category)?.size ?? 0;
                if (count > bestCount) {
                    bestCount = count;
                    bestCategory = category;
                }
            }

            return bestCategory;
        },

        getCategoryColor: (category) => {
            if (!category) return 0x888888;
            const colorIndex = assignColorToCategory(category);
            return COLOR_PALETTE[colorIndex];
        },

        getArticleColor: (title) => {
            const categories = articleCategories.get(title);
            if (!categories || categories.length === 0) return 0x888888;

            let bestCategory = categories[0];
            let bestCount = 0;

            for (const category of categories) {
                const count = categoryArticles.get(category)?.size ?? 0;
                if (count > bestCount) {
                    bestCount = count;
                    bestCategory = category;
                }
            }

            const colorIndex = assignColorToCategory(bestCategory);
            return COLOR_PALETTE[colorIndex];
        },

        getTotalCategories: () => categoryArticles.size,

        getCategoryStats: () => {
            const stats = new Map<string, number>();
            for (const [category, articles] of categoryArticles) {
                stats.set(category, articles.size);
            }
            return stats;
        }
    };
}
