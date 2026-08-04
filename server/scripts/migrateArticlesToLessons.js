// Migrate the legacy Article collection into Lessons.
//
// Lessons replaced Articles: same authored content, plus category / ordering /
// duration. This script is idempotent — a lesson is only created when no
// lesson with the same title exists yet — and it never deletes anything, so
// the Article collection survives as a rollback path.
//
// Usage:
//   node scripts/migrateArticlesToLessons.js            # dry run, prints a plan
//   node scripts/migrateArticlesToLessons.js --apply    # writes the lessons
//
// Reads REACT_APP_DB, exactly like index.js. Unlike populateModels.js this
// NEVER drops the database.

require("dotenv").config();
const mongoose = require("mongoose");

require("../src/models/Article");
require("../src/models/Lesson");

const Article = mongoose.model("Article");
const Lesson = mongoose.model("Lesson");

const APPLY = process.argv.includes("--apply");
const DB = process.env.REACT_APP_DB || "mongodb://localhost/finberry";

// Keyword hints so migrated articles land in a sensible category instead of
// everything piling into "Basics". Order matters: first match wins.
const CATEGORY_HINTS = [
    ["Risk", /\brisk|volatil|stop.?loss|tolerance|hedge/i],
    ["Retirement", /\bretire|pension|rrsp|401k|tfsa\b/i],
    ["Crypto", /\bcrypto|bitcoin|ethereum|blockchain|token\b/i],
    ["Strategy", /\bdiversif|portfolio|strategy|allocat|rebalanc|long.?term|index fund/i],
    ["Markets", /\bmarket|bull|bear|sector|index|volatility|trend|chart\b/i],
];

function categoryFor(article) {
    const haystack = `${article.title} ${article.description}`;
    for (const [category, pattern] of CATEGORY_HINTS) {
        if (pattern.test(haystack)) return category;
    }
    return "Basics";
}

function estimateMinutes(content) {
    const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 180));
}

async function main() {
    await mongoose.connect(DB);
    console.log(`Connected to ${DB.replace(/\/\/.*@/, "//<credentials>@")}`);

    const articles = await Article.find().sort({ firstPosted: 1 });
    console.log(`Found ${articles.length} article(s).`);

    let created = 0;
    let skipped = 0;
    let order = 0;

    for (const article of articles) {
        const existing = await Lesson.findOne({ title: article.title }, { _id: 1 });
        if (existing) {
            console.log(`  skip   "${article.title}" — a lesson with this title already exists`);
            skipped += 1;
            continue;
        }

        const lesson = {
            title: article.title,
            description: article.description,
            content: article.content,
            category: categoryFor(article),
            pathKey: null,
            order: order++,
            estimatedMinutes: estimateMinutes(article.content),
            externalLink: article.externalLink || "N/A",
            author: article.author,
            published: true,
            firstPosted: article.firstPosted,
            dateLastUpdated: Date.now(),
        };

        console.log(
            `  create "${lesson.title}" → ${lesson.category}, ${lesson.estimatedMinutes} min`
        );

        if (APPLY) {
            await new Lesson(lesson).save();
        }
        created += 1;
    }

    console.log(
        APPLY
            ? `\nDone. Created ${created} lesson(s), skipped ${skipped}.`
            : `\nDry run. Would create ${created} lesson(s), skip ${skipped}. Re-run with --apply to write.`
    );

    await mongoose.disconnect();
}

main().catch(async (e) => {
    console.error("Migration failed:", e.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
