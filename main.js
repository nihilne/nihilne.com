const POSTS_DIR = "./posts";

function parseTimestamp(name) {
    const [date, time] = name.replace(/Z\.txt$/, "").split("T");
    return new Date(`${date}T${time.replaceAll("-", ":")}Z`);
}

async function loadPosts() {
    const container = document.getElementById("posts");
    const names = await fetch(`${POSTS_DIR}/index.json`, { cache: "no-store" }).then((r) => r.json());
    
    const posts = await Promise.all(
        names.map(async (name) => ({
            name,
            text: await fetch(`${POSTS_DIR}/${name}`, { cache: "no-store" })
                .then((r) => (r.ok ? r.text() : null))
                .catch(() => null),
        }))
    );

    for (const { name, text } of posts) {
        if (!text?.trim()) continue;

        if (container.children.length) {
            const separator = document.createElement("div");
            separator.className = "separator";
            separator.setAttribute("aria-hidden", "true");
            container.append(separator);
        }

        const article = document.createElement("article");
        const time = document.createElement("time");
        const date = parseTimestamp(name);
        time.dateTime = date.toISOString();
        time.textContent = date.toISOString().slice(0, 16).replace("T", " ") + " UTC";

        const body = document.createElement("p");
        body.textContent = text.trim();

        article.append(time, body);
        container.append(article);
    }
}

function fillSeparators() {
    const separators = document.querySelectorAll(".separator");
    if (!separators.length) return;

    const sample = 100;
    separators[0].textContent = "-".repeat(sample);
    const dashWidth = separators[0].getBoundingClientRect().width / sample;

    const dashes = "-".repeat(Math.floor(document.documentElement.clientWidth / dashWidth));
    for (const separator of separators) separator.textContent = dashes;
}

async function init() {
    await loadPosts();
    await document.fonts.ready;
    fillSeparators();
    window.addEventListener("resize", fillSeparators);
}

init().catch((err) => console.error("Failed to load posts:", err));
