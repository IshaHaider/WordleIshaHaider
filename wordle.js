
//window.alert("You must complete the word first");

var height = 4 // number of guesses 
var width = 4; // length of word
var row = 0; // current attempt #
var column = 0; // current letter of attempt
var gameOver = false;

window.onload = async () => {
    const startOverBtn = document.getElementById("restart");
    startOverBtn.disabled = true;
    startOverBtn.innerText = "Loading...";
    const res = await fetch("https://api.masoudkf.com/v1/wordle", {
      headers: {
        "x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",
      },
    });
    startOverBtn.disabled = false;
    startOverBtn.innerText = "Start Over";

    let wordDict = await res.json();
    let { dictionary } = wordDict;
    console.log(wordDict);
    let words = [];
    let hints = [];
    // Loop through each key in the dictionary
    for (let key of Object.keys(dictionary)) {
      let value = dictionary[key];
      // Check if the value has a "word" property
      if (value.hasOwnProperty("word")) {
        words.push(value.word);
      }
      // Check if the value has a "hint" property
      if (value.hasOwnProperty("hint")) {
        hints.push(value.hint);
      }
    }

    // Generate a random index
    let randomIndex = Math.floor(Math.random() * words.length);
    // Get the word and hint at the random index
    var word = words[randomIndex].toUpperCase();
    var hint = hints[randomIndex];
    console.log(word);
    console.log(hint);

    // if user clicks on dark mode button
    const darkButton = document.getElementById('dark');
    darkButton.addEventListener('click', toggleDarkMode);

    // if user clicks on hint button
    const hintButton = document.getElementById('hint');
    hintButton.addEventListener('click', toggleHint);

    // if user clicks on instruction button
    const instructionButton = document.getElementById('instruction');
    instructionButton.addEventListener('click', toggleInstruction);

    // if user clicks on start over button
    const restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', toggleRestart);

    // create the game board
    for (let r = 0; r < height; r++)
    for (let c =0; c < width; c++){
        let tile = document.createElement("span");
        //creates an id element for each tile in the format: 0-0 for row 0, column 0
        tile.id = r.toString() + "-" + c.toString(); 
        tile.classList.add("tile");
        tile.innerText = "";

        // adds the following lines after the div with id="grid": 
        // <span id="0-0" class="tile"></span> ... upto
        // <span id="3-3" class="tile"></span>
        document.getElementById("grid").appendChild(tile);
    }  
    keyPress();

    function keyPress() {
        let prevTile = null;
        document.getElementById('0-0').style.border = '2px solid gray';
    
        // Listen for Key Press
        document.addEventListener("keyup", (e) => {
            if (gameOver) return;
            //alert(e.code);
    
            if ("KeyA" <= e.code && e.code <= "KeyZ") {
                if (column < width) {
                    if (prevTile) prevTile.style.border = ""; // Remove border from previous tile
                    let currentTile = document.getElementById(row.toString() + '-' + column.toString()); 
                    if (currentTile.innerText == "") { // if the current tile is empty 
                        currentTile.innerText = e.code[3]; // fill the current tile with the letter entered
                        currentTile.style.border = "2px solid gray"; // add border to current tile
                        prevTile = currentTile; // update prevTile
                        column++;
                    }
                }
            }   
            else if (e.code == "Backspace") {
                if (0 < column && column <= width) { // if the user's column is between 1 and the width
                    column--;
                }
                let currentTile = document.getElementById(row.toString() + '-' + column.toString()); 
                currentTile.innerText = "";
                if (prevTile) prevTile.style.border = ""; // Remove border from previous tile
                prevTile = currentTile; // update prevTile
            }
            else if (e.code == "Enter") {
                if (column < width) { // if the user entered a word shorter than 4 letters
                    window.alert("You must complete the word first");
                    return;
                }
                update();
                row++; // start new row
                column = 0; // start at beginning of new row
                if (prevTile) prevTile.style.border = ""; // Remove border from previous tile
                prevTile = null; // reset prevTile
            }
            // if user has reached max # of attempts without guessing word
            if (!gameOver && row == height) {
                gameOver = true;
                document.getElementById("message-lose").style.display = "block";
                document.getElementById("message-lose").style.backgroundColor = "red";
                document.getElementById("message-lose").innerHTML = "You missed the word " + "<b>"+word+"</b>" + " and lost!"; // once all attempts are used up, reveal the answer
            }
        });
    }
    
    function update(){
        let correct = 0;
        let letterCount = {}; // BOOT -> {B:1, O:2, T: 1}
        // fills the letterCount map with the letters and # of occurrences
        for (let i = 0; i < word.length; i++) {
            letter = word[i];
            if (letterCount[letter]) { // if the letter is in the map
                letterCount[letter] ++;
            }
            else {letterCount[letter] = 1;}
        }

        // first iteration, check all correct letters
        for (let c = 0; c < width; c++){
            let currentTile = document.getElementById(row.toString() + '-' + c.toString()); 
            let letter = currentTile.innerText;

            // is it in the correct position?
            if (word[c] == letter){
                currentTile.classList.add("correct") // this will style the tile as a letter in correct position
                correct++;
                letterCount[letter]--;
            }
            // if user guesses correct word
            if (correct == width) {
                gameOver = true;
                if (document.body.classList.contains("dark")) {
                    document.getElementById("message-win").style.backgroundColor = "white";
                    document.getElementById("message-win").style.color = "black";
                } 
                document.getElementById("grid").style.display = "none";
                document.getElementById("congrats").style.display = "block";
                document.getElementById("message-win").style.display = "block";
                document.getElementById("message-win").style.backgroundColor = "#F8F8F8";
                document.getElementById("message-win").innerHTML = "You guessed the word " + "<b>"+word+"</b>" + " correctly!"; 
            }
        }

        // second iteration, mark which ones are present but in wrong position
        for (let c = 0; c < width; c++){
            let currentTile = document.getElementById(row.toString() + '-' + c.toString()); 
            let letter = currentTile.innerText;

            if (!currentTile.classList.contains("correct")){ //if the letter has not yet been declared as correct 
                // is it used in the word?
                if (word.includes(letter) && letterCount[letter] > 0){
                    currentTile.classList.add("present"); // this will style the tile as a correct letter
                    letterCount[letter]--;
                }
                // if letter is not in word
                else {
                    currentTile.classList.add("absent"); // this will style the tile as an absent letter
                }
            }
        }
    }

    let darkModeOn = false;
    function toggleDarkMode() {
        darkModeOn = !darkModeOn;

        const body = document.querySelector('body');
        const tiles = document.getElementsByClassName('tile');
        const side = document.getElementsByClassName('side');
        const footer = document.getElementById('footer');
        const correcto = document.getElementsByClassName('correct');
        const presento = document.getElementsByClassName('present');
        const absento = document.getElementsByClassName('absent');

        // if dark mode is on, do the first option, if it is not on, do second option
        body.style.background = darkModeOn ? "#1B1B1B" : "white";
        body.style.color = darkModeOn ? "white" : "black";
        footer.style.background = darkModeOn ? "#1B1B1B" : "white";
        footer.style.color = darkModeOn ? "white" : "black";

        for (var i = 0; i < tiles.length; i++) {
            tiles[i].style.color = darkModeOn ? "white": "black"; // <-- change text color of each tile
        }
        for (var i = 0; i < side.length; i++) {
            side[i].style.color = darkModeOn ? "white" : "black"; // <-- change text color of each tile
        }
        for (var i = 0; i < correcto.length; i++) {
            correcto[i].style.color = darkModeOn ? "white" :"white"; }
        for (var i = 0; i < presento.length; i++) {
            presento[i].style.color = darkModeOn ? "white" :"white"; }
        for (var i = 0; i < absento.length; i++) {
            absento[i].style.color = darkModeOn ? "white" :"white"; }

    }
    
    function toggleHint(){
        document.getElementById("message-hint").style.display = "block";
        document.getElementById("message-hint").style.backgroundColor = "#FAF3EB";
        document.getElementById("message-hint").innerHTML = "<i>Hint:</i> " + hint; 
        if (document.body.classList.contains("dark")) {
            document.getElementById("message-hint").style.color = "black";
        }
    }

    let instructionVisible = false;
    function toggleInstruction(){
        instructionVisible = !instructionVisible;
        const instructionButton = document.getElementById('instruction');
        const instructionsMessage = document.getElementById('instructions-message');

        instructionButton.addEventListener('click', () => {
        instructionsMessage.classList.toggle('instructSection', instructionVisible);
        });
        document.getElementById("instructions-message").style.display = instructionVisible ? "block" : "none";
        const gridClass = document.getElementsByClassName("gridSection")
        for (var i = 0; i < gridClass.length; i++) {
            gridClass[i].style.width = instructionVisible ? "50%": "100%"; // <-- change text color of each tile
        }
    }

    function toggleRestart(){
        column = 0;
        row = 0;
        // Generate a random index
        randomIndex = Math.floor(Math.random() * words.length);
        // Get the word and hint at the random index
        word = words[randomIndex].toUpperCase();
        hint = hints[randomIndex];
        console.log(word);
        console.log(hint);

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let tile = document.getElementById(i.toString() + '-' + j.toString());
                tile.innerText = "";
                tile.classList.remove("correct");
                tile.classList.remove("present");
                tile.classList.remove("absent");
                tile.style.border = "";
            }
        }

        if (gameOver == true){gameOver = false;}
        document.getElementById("grid").style.display = "flex";
        document.getElementById("congrats").style.display = "none";
        document.getElementById("message-win").style.display = "none";
        document.getElementById("message-hint").style.display = "none";
        document.getElementById("message-lose").style.display = "none";

    }
};


