import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAllData, saveAllData } from "./src/api/dataApi.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "dist");
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const getRequestBody = (req) => new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => {
        resolve(body);
    });
});
const sendJson = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
};
const setCorsHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
};
const serveStaticFile = (req, res, parsedUrl) => {
    let pathname = parsedUrl.pathname;
    if (pathname === "/") {
        pathname = "/index.html";
    }
    const filePath = path.join(distDir, decodeURIComponent(pathname));
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    fs.stat(filePath, (err, stats) => {
        if (!err && stats && stats.isFile()) {
            res.statusCode = 200;
            res.setHeader("Content-Type", contentType);
            const stream = fs.createReadStream(filePath);
            stream.on("error", () => {
                res.statusCode = 500;
                res.end("Internal Server Error");
            });
            stream.pipe(res);
            return;
        }
        const indexPath = path.join(distDir, "index.html");
        fs.stat(indexPath, (indexErr, indexStats) => {
            if (!indexErr && indexStats && indexStats.isFile()) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                fs.createReadStream(indexPath).pipe(res);
            }
            else {
                res.statusCode = 404;
                res.end("Not Found");
            }
        });
    });
};
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host}`);
    if (parsedUrl.pathname === "/api/data") {
        setCorsHeaders(res);
        if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
        }
        if (req.method === "GET") {
            try {
                const data = await getAllData();
                sendJson(res, 200, data);
                return;
            }
            catch (error) {
                console.error("[ERROR] GET /api/data 失败:", error.message);
                sendJson(res, 500, {
                    error: "INTERNAL_SERVER_ERROR",
                    message: "服务器内部错误",
                    details: error.message,
                });
                return;
            }
        }
        if (req.method === "POST") {
            try {
                const raw = await getRequestBody(req);
                console.log("[INFO] POST /api/data 收到请求，原始数据长度:", raw.length);
                let retries = 0;
                let ok = false;
                let lastError = null;
                while (retries < MAX_RETRIES && !ok) {
                    try {
                        const parsed = raw ? JSON.parse(raw) : {};
                        console.log("[INFO] POST /api/data 解析后的数据结构:", {
                            projectsCount: Array.isArray(parsed.projects)
                                ? parsed.projects.length
                                : "N/A",
                            tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : "N/A",
                            taskTypesCount: Array.isArray(parsed.taskTypes)
                                ? parsed.taskTypes.length
                                : "N/A",
                            hasData: !!parsed,
                        });
                        const result = await saveAllData(parsed);
                        console.log("[INFO] POST /api/data 数据保存成功");
                        sendJson(res, 200, result);
                        ok = true;
                    }
                    catch (error) {
                        console.error("[ERROR] POST /api/data 保存失败:", error.message);
                        lastError = error;
                        retries++;
                        if (retries < MAX_RETRIES) {
                            console.log(`[INFO] POST /api/data 保存失败，重试: ${retries}/${MAX_RETRIES}`);
                            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                        }
                    }
                }
                if (!ok) {
                    console.error("[ERROR] POST /api/data 数据保存最终失败，错误:", lastError?.message);
                    sendJson(res, 500, {
                        error: "WRITE_FAILED",
                        message: "数据保存失败，请稍后重试",
                        details: lastError?.message,
                    });
                }
                return;
            }
            catch (error) {
                console.error("[ERROR] POST /api/data JSON 解析失败:", error.message);
                sendJson(res, 400, {
                    error: "BAD_REQUEST",
                    message: "请求数据格式错误",
                    details: error.message,
                });
                return;
            }
        }
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
    }
    serveStaticFile(req, res, parsedUrl);
});
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
