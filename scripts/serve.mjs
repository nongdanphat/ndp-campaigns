import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("dist");
const port = Number(process.env.PORT || 8000);

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    values[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim();
  }
  return values;
}

const env = readEnvFile(path.resolve(".env"));
const apiRewriteTarget = (
  env.API_REWRITE_TARGET ||
  env.API_BASE_URL ||
  "https://dev-api.ndphat.com"
).replace(/\/$/, "");

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".csv": "text/csv; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath) {
  res.writeHead(200, {
    "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("..")) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (pathname === "/v1" || pathname.startsWith("/v1/")) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const upstream = await fetch(`${apiRewriteTarget}${pathname}${url.search}`, {
        method: req.method,
        headers: {
          accept: req.headers.accept || "application/json",
          ...(req.headers["content-type"]
            ? { "content-type": req.headers["content-type"] }
            : {}),
        },
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const payload = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      });
      res.end(payload);
    } catch (error) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end(error instanceof Error ? error.message : "Bad gateway");
    }
    return;
  }

  const filePath = path.join(root, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  const directoryIndex = path.join(filePath, "index.html");
  if (
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isDirectory() &&
    fs.existsSync(directoryIndex)
  ) {
    sendFile(res, directoryIndex);
    return;
  }

  sendFile(res, path.join(root, "index.html"));
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Cổng ${port} đang được dùng. Tắt tiến trình cũ rồi chạy lại pnpm serve, hoặc mở http://localhost:${port}/nong-nghiep-ben-vung nếu server đã chạy.`
    );
    process.exit(1);
  }
  throw error;
});

server.listen(port, () => {
  console.log(`http://localhost:${port}/nong-nghiep-ben-vung`);
  console.log(`API /v1 -> ${apiRewriteTarget}`);
});
