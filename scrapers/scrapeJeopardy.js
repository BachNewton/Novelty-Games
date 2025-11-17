import * as cheerio from "cheerio";

(async () => {
    const response = await fetch('https://j-archive.com/showgame.php?game_id=9261');
    const html = await response.text();

    const $ = cheerio.load(html);

    const jeopardyRound = $("#jeopardy_round");
    const doubleJeopardyRound = $("#double_jeopardy_round");
    const finalJeopardyRound = $("#final_jeopardy_round");

    newFunction(jeopardyRound, $);
    newFunction(doubleJeopardyRound, $);
    newFunction(finalJeopardyRound, $);
})();

function newFunction(jeopardyRound, $) {
    const categoryElements = jeopardyRound.find(".category");

    const categories = categoryElements.map((_, elem) => {
        const categoryName = $(elem).find(".category_name").first().text().trim();
        const categoryComments = $(elem).find(".category_comments").first().text().trim();

        return { categoryName, categoryComments, clues: [] };
    }).toArray();

    const clueElements = jeopardyRound.find(".clue");

    clueElements.each((i, elem) => {
        const clueText = $(elem).find(".clue_text").first().text().trim();
        const correctResponse = $(elem).find(".correct_response").first().text().trim();

        const clue = { clueText, correctResponse };

        categories[i % categories.length].clues.push(clue);
    });

    console.log(categories);
}
