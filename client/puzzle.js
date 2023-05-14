const scoreSpan = document.querySelector("#score");
const difficultySpan = document.querySelector("#difficulty");
const puzzleImage = document.querySelector("#puzzleImage");
const puzzleAnswer = document.querySelector("#puzzleAnswer");
const puzzleSubmit = document.querySelector("#puzzleSubmit");

let score = 0;
let failures = 0;
let difficulty = 100;

puzzleSubmit.addEventListener("click", () => {
    let answer = puzzleAnswer.value;
    let image = puzzleImage.src.split("/").at(-1);
    
    fetch("/puzzle/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: image,
            answer: answer
        })
    }).then(async res => {
        if (!res.ok) {
            fetchPuzzle();
            return;
        }

        let result = await res.text();

        if (result == "Correct") {
            scoreSpan.innerHTML = (++score).toString();
        } else {
            failures++;
            
            let failureIcon = document.querySelector("#fail" + failures);
            failureIcon.src = "/assets/failed.svg";

            difficulty = Math.max(difficulty - 100, 100);

            if (failures == 3) {
                alert("You failed :( You got a score of " + score);

                failures = 0;
                for (let failureImage of document.querySelectorAll("#failures img")) {
                    failureImage.src = "assets/empty.png";
                }

                score = 0;
                scoreSpan.innerHTML = "0";

                difficulty = 100;
            }
        }

        puzzleAnswer.value = "";
        fetchPuzzle();
    });
});

// get first puzzle
function fetchPuzzle() {
    fetch("/puzzle/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            difficulty
        })
    }).then(async res => {
        let puzzle = await res.json();

        puzzleImage.src = "/assets/puzzles/" + puzzle.image;
        difficulty = puzzle.difficulty;
        difficultySpan.innerHTML = "Difficulty: " + puzzle.difficulty.toString() + " Elo";
    });
}

fetchPuzzle();