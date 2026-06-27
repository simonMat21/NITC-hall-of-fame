import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PROJECTS_FILE = path.join(ROOT, "projects.json");
const OUTPUT_FILE = path.join(ROOT, "public", "data", "projects-data.json");
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

function stripMarkdown(markdown) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractReadmeMetadata(markdown, fallbackTitle, fallbackDescription) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const titleMatch = normalized.match(/^#\s+(.+)$/m);
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  let description = "";

  for (const block of blocks) {
    if (block.startsWith("# ")) continue;
    if (block.startsWith("## ")) break;
    if (block.startsWith("```")) continue;

    description = stripMarkdown(block);
    if (description) break;
  }

  return {
    title: titleMatch ? titleMatch[1].trim() : fallbackTitle,
    description: description || fallbackDescription || fallbackTitle,
  };
}

function githubHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "NITC-Hall-of-Fame",
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubGet(endpoint, token) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: githubHeaders(token),
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${endpoint} failed with ${res.status}: ${body}`);
  }

  return res.json();
}

async function githubGetFileContent(owner, repo, filePath, token) {
  const file = await githubGet(
    `/repos/${owner}/${repo}/contents/${filePath}`,
    token,
  );

  if (!file?.content) return null;

  return Buffer.from(file.content, file.encoding || "base64").toString("utf8");
}

function rawUrl(owner, repo, branch, filePath) {
  const encodedPath = filePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`;
}

async function loadProjectsFile() {
  const raw = await fs.readFile(PROJECTS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed))
    throw new Error("projects.json must contain an array");
  return parsed;
}

function parseRepositoryUrl(repoUrl) {
  const match = repoUrl.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i,
  );
  if (!match) return null;
  return {
    owner: decodeURIComponent(match[1]),
    repo: decodeURIComponent(match[2]),
  };
}

function parseAuthorUrl(authorUrl) {
  const match = authorUrl.match(/^https?:\/\/github\.com\/([^/]+)\/?$/i);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function normalizeWebsiteUrl(website) {
  const value = String(website ?? "").trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function createPlaceholderSvg(label) {
  const safeLabel = String(label).replace(/[<>]/g, "").slice(0, 48);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0d0d0d"/>
          <stop offset="100%" stop-color="#1a1a1a"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="675" fill="url(#g)"/>

      <!-- Subtle accent circles -->
      <circle cx="1100" cy="80" r="180" fill="#ffffff" fill-opacity=".025"/>
      <circle cx="100" cy="600" r="220" fill="#ffffff" fill-opacity=".018"/>

      <!-- Horizontal rule -->
      <line x1="80" y1="337" x2="1120" y2="337" stroke="#ffffff" stroke-opacity=".07" stroke-width="1"/>

      <!-- GitHub logo (left) -->
      <g transform="translate(80, 290)">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
          fill="#ffffff"
          fill-opacity=".55"
          transform="scale(2.2)"
        />
      </g>

      <!-- Project name (right-aligned) -->
      <text
        x="1120"
        y="348"
        text-anchor="end"
        fill="#ffffff"
        fill-opacity=".9"
        font-family="ui-monospace, Menlo, monospace"
        font-size="52"
        font-weight="700"
        letter-spacing="-1"
      >${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function dirExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

async function fetchProject(entry, index, token) {
  const submittedTitle = String(entry.title ?? "").trim();
  const repoUrl = String(entry.project ?? "").trim();
  const authorUrls = entry.authors ?? (entry.author ? [entry.author] : []);
  const website = normalizeWebsiteUrl(entry.website);
  const submissionDescription = String(entry.description ?? "").trim();
  const repository = parseRepositoryUrl(repoUrl);
  const authorLogins = authorUrls.map(parseAuthorUrl).filter(Boolean);

  if (!repository || authorLogins.length === 0 || !submissionDescription) {
    console.warn(`[fetch-data] Skipping invalid entry at index ${index + 1}`);
    return null;
  }

  let repoData = null;
  try {
    repoData = await githubGet(
      `/repos/${repository.owner}/${repository.repo}`,
      token,
    );
  } catch (err) {
    console.warn(
      `[fetch-data] Failed to fetch repository metadata for ${repository.owner}/${repository.repo}: ${err.message}`,
    );
    return null;
  }

  if (!repoData) {
    console.warn(
      `[fetch-data] Repository not found: ${repository.owner}/${repository.repo}`,
    );
    return null;
  }

  const defaultBranch = repoData.default_branch || "main";
  const fallbackDescription = repoData.description || "";

  // Local assets directory (public/projects/<slug>/)
  const projectSlug = slugify(
    submittedTitle || repoData.name || repository.repo,
  );
  const localAssetsDir = path.join(ROOT, "public", "projects", projectSlug);
  const hasLocalAssets = await dirExists(localAssetsDir);

  // README: check local readme.md first, then fall back to GitHub API
  let readmeMarkdown = "";
  let readmeTitle = repoData.name || repository.repo;
  let readmeDescription = fallbackDescription;

  if (hasLocalAssets) {
    try {
      readmeMarkdown = await fs.readFile(
        path.join(localAssetsDir, "readme.md"),
        "utf8",
      );
    } catch {
      // local readme.md not found, fall through to GitHub API
    }
  }

  if (!readmeMarkdown) {
    try {
      const hofContents = await githubGet(
        `/repos/${repository.owner}/${repository.repo}/contents/hof`,
        token,
      );

      if (hofContents) {
        readmeMarkdown =
          (await githubGetFileContent(
            repository.owner,
            repository.repo,
            "hof/readme.md",
            token,
          )) ||
          (await githubGetFileContent(
            repository.owner,
            repository.repo,
            "hof/README.md",
            token,
          ));
      }

      if (!readmeMarkdown) {
        const readme = await githubGet(
          `/repos/${repository.owner}/${repository.repo}/readme`,
          token,
        );

        if (readme?.content) {
          readmeMarkdown = Buffer.from(
            readme.content,
            readme.encoding || "base64",
          ).toString("utf8");
        }
      }
    } catch (err) {
      console.warn(
        `[fetch-data] Failed to fetch README for ${repository.owner}/${repository.repo}: ${err.message}`,
      );
    }
  }

  if (readmeMarkdown) {
    const metadata = extractReadmeMetadata(
      readmeMarkdown,
      repoData.name || repository.repo,
      fallbackDescription,
    );
    readmeTitle = metadata.title;
    readmeDescription = metadata.description;
  } else {
    console.warn(
      `[fetch-data] README missing for ${repository.owner}/${repository.repo}`,
    );
  }

  // images: check local public/projects/<slug>/ first,
  // then fall back to hof/ in the user's repo, then images/
  let images = [];

  if (hasLocalAssets) {
    try {
      const entries = await fs.readdir(localAssetsDir, { withFileTypes: true });
      const files = entries
        .filter(
          (e) =>
            e.isFile() &&
            IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase()),
        )
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));

      const thumbnailFiles = files.filter((f) => f.startsWith("thumbnail."));
      const otherImageFiles = files.filter(
        (f) =>
          !f.startsWith("thumbnail.") && f !== "readme.md" && f !== "README.md",
      );

      images = [...thumbnailFiles, ...otherImageFiles].map(
        (f) => `/projects/${projectSlug}/${f}`,
      );
    } catch (err) {
      console.warn(
        `[fetch-data] Failed to list local images for ${repository.owner}/${repository.repo}: ${err.message}`,
      );
    }
  }

  if (images.length === 0) {
    try {
      const collectImages = (contents, basePath) => {
        if (!Array.isArray(contents)) return [];

        const thumbnailFiles = contents
          .filter(
            (item) =>
              item?.type === "file" &&
              item.name.startsWith("thumbnail.") &&
              IMAGE_EXTENSIONS.has(path.extname(item.name).toLowerCase()),
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        const otherImageFiles = contents
          .filter(
            (item) =>
              item?.type === "file" &&
              item.name !== "readme.md" &&
              item.name !== "README.md" &&
              !item.name.startsWith("thumbnail.") &&
              IMAGE_EXTENSIONS.has(path.extname(item.name).toLowerCase()),
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        return [...thumbnailFiles, ...otherImageFiles].map((file) => {
          const filePath = basePath ? `${basePath}/${file.name}` : file.path;
          return rawUrl(
            repository.owner,
            repository.repo,
            defaultBranch,
            filePath,
          );
        });
      };

      const hofContentsForImages = await githubGet(
        `/repos/${repository.owner}/${repository.repo}/contents/hof`,
        token,
      );

      images = collectImages(hofContentsForImages, "hof");

      if (images.length === 0) {
        const legacyContents = await githubGet(
          `/repos/${repository.owner}/${repository.repo}/contents/images`,
          token,
        );
        images = collectImages(legacyContents, "images");
      }
    } catch (err) {
      console.warn(
        `[fetch-data] Failed to list images for ${repository.owner}/${repository.repo}: ${err.message}`,
      );
    }
  }

  if (images.length === 0)
    console.warn(
      `[fetch-data] No images found for ${repository.owner}/${repository.repo}`,
    );

  // authors
  const authors = [];
  for (const login of authorLogins) {
    let userData = null;
    try {
      userData = await githubGet(`/users/${login}`, token);
    } catch (err) {
      console.warn(
        `[fetch-data] Failed to fetch author profile for ${login}: ${err.message}`,
      );
    }
    const fallbackAvatar = `https://avatars.githubusercontent.com/${login}`;
    authors.push({
      login,
      name: userData?.name || repoData.owner?.login || login,
      avatarUrl: userData?.avatar_url || fallbackAvatar,
      profileUrl: userData?.html_url || `https://github.com/${login}`,
      bio: userData?.bio || null,
    });
  }

  const thumbnail =
    images[0] || createPlaceholderSvg(repoData.name || repository.repo);

  return {
    repoUrl,
    title: submittedTitle || readmeTitle,
    description: submissionDescription,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    language: repoData.language || "",
    topics: Array.isArray(repoData.topics) ? repoData.topics : [],
    license: repoData.license?.spdx_id || null,
    lastUpdated: repoData.pushed_at || new Date().toISOString(),
    screenshots: images,
    thumbnail,
    website,
    authors,
    submissionOrder: index + 1,
    readmeMarkdown,
    readmeTitle,
    readmeDescription,
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || "";
  const entries = await loadProjectsFile();
  const resolved = [];

  for (const [index, entry] of entries.entries()) {
    const project = await fetchProject(entry, index, token);
    if (project) resolved.push(project);
  }

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(resolved, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `Wrote ${resolved.length} projects to ${path.relative(ROOT, OUTPUT_FILE)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

// test 1
