import { mkdirSync, readdirSync, writeFileSync, watch } from "fs";
import { join } from "path";
import { emitKeypressEvents } from "readline";

const POSTS_DIR = join(import.meta.dirname, "posts");
const POST_NAME = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z\.txt$/;

function buildIndex() {
    const posts = readdirSync(POSTS_DIR)
        .filter((name) => POST_NAME.test(name))
        .sort()
        .reverse();

    writeFileSync(join(POSTS_DIR, "index.json"), JSON.stringify(posts, null, 4) + "\n");
    console.log(`Indexed ${posts.length} post(s)\n`);
}

function createPost() {
    const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-") + "Z";
    const name = `${stamp}.txt`;
    try {
        writeFileSync(join(POSTS_DIR, name), "", { flag: "wx" });
        console.log(`Created posts/${name}`);
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
        console.log(`posts/${name} already exists, wait a second and try again\n`);
    }
}

mkdirSync(POSTS_DIR, { recursive: true });
buildIndex();

let pending;
watch(POSTS_DIR, (_event, name) => {
    if (name === "index.json") return;
    clearTimeout(pending);
    pending = setTimeout(buildIndex, 100);
});

emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.on("keypress", (_str, key) => {
    if (key?.name === "return") createPost();
    if (key?.ctrl && key.name === "c") process.exit();
});

console.log("Enter to create new post, Ctrl+C to quit.\n");
