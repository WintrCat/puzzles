const express = require("express");
const path = require("path");
const fs = require("fs");

let server = express();
server.use(express.json());
server.use("/assets", express.static("assets"));
server.use("/client", express.static("client"));

server.get("/", (req, res) => {
    res.sendFile(path.resolve("client/index.html"));
});

// API RUBBISH

/**
 * @type {any[]}
 */
let puzzles = JSON.parse(fs.readFileSync("server/puzzles.json", "utf-8"));
server.post("/puzzle/get", (req, res) => {
    let validPuzzles = [];
    let reach = 100;
    while (validPuzzles.length == 0) {
        validPuzzles = puzzles.filter(puz => {
            return puz.difficulty > req.body.difficulty && puz.difficulty <= (req.body.difficulty + reach);
        });
        reach += 50;
        if (reach >= 2000) break;
    }

    let puzzle;

    if (validPuzzles.length > 0) {
        puzzle = Object.assign({}, validPuzzles[Math.floor(Math.random() * validPuzzles.length)]);
        puzzle.answer = undefined;
    } else {
        puzzle = Object.assign({}, puzzles[Math.floor(Math.random() * puzzles.length)]);
        puzzle.answer = undefined;
    }

    res.send(puzzle);
});

server.post("/puzzle/verify", (req, res) => {
    let image = req.body.image;
    let answer = req.body.answer;

    let puzzle = puzzles.find(puz => puz.image == image);
    if (!puzzle) {
        res.status(400);
        res.send("Puzzle doesn't exist");
        return;
    }

    res.send((
        answer == puzzle.answer || answer == puzzle.answer + ".0"
    ) ? "Correct" : "Incorrect");
});

// LISTEN TO ME SPONGEBOB
server.listen(8080, () => {
    console.log("Server running.");
});