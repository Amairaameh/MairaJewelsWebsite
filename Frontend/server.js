import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

app.get("/product.html", (req, res) => {
    res.sendFile(path.join(distPath, "product.html"));
});

app.get("/cart.html", (req, res) => {
    res.sendFile(path.join(distPath, "cart.html"));
});

app.get("/checkout.html", (req, res) => {
    res.sendFile(path.join(distPath, "checkout.html"));
});

app.get("/contact.html", (req, res) => {
    res.sendFile(path.join(distPath, "contact.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(distPath, "login.html"));
});

app.get("/collections.html", (req, res) => {
    res.sendFile(path.join(distPath, "collections.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Maira Jewels Frontend running on port ${PORT}`);
});