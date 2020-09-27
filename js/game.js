"use strict";
//const and global vars.
const FLAG = "🚩";
const MINE = "💣";
const EMPTY = " ";
const WINNER = "😎";
const NORMAL = "😃";
const RESTART = "🤪";
const LOSE = "😭";
const HEART = "💛";
const GAMEOVER = "❌";
const HINT = "💡";

var gActionsHistory = [];
var gBoard;
var gGame;
var gTimeInterval = null;
var gLevel = {
  //default mode!
  SIZE: 4,
  MINES: 2,
  LIVES: 2,
};

//Choose a Level:

function chooseLevel(elBtn) {
  var text = elBtn.innerText;
  if (text === "Easy") {
    gLevel = {
      SIZE: 4,
      MINES: 2,
      LIVES: 2,
    };
  } else if (text === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 12,
      LIVES: 3,
    };
  } else if (text === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 30,
      LIVES: 3,
    };
  }
  initGame();
  document.querySelector(".smiley").innerText = NORMAL; //RESET THE SMILEY
}

//Starting the Game:
function initGame() {
  clearInterval(gTimeInterval);
  gBoard = buildBoard(gLevel);
  createMines(gBoard, gLevel);
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
  gGame = {
    isOn: false,
    isHints: false,
    isFirstClick: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    safeClick: 3,
    Hints: 3,
  };
  gLevel.SIZE === 4 ? (gLevel.LIVES = 2) : (gLevel.LIVES = 3);
  gActionsHistory = [];
  countMarked();
  countSafeClick();
  countHint();
  updateHtmInnerText();
}

//Render the Board:

function renderBoard(board) {
  var htmlStr = "<table><tbody>";
  for (var i = 0; i < board.length; i++) {
    htmlStr += "<tr>";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      var cell = EMPTY;
      var idName = "cell-" + i + "-" + j;
      if (currCell.isMine && currCell.isShown) cell = MINE;
      else if (
        currCell.minesAroundCount > 0 &&
        currCell.isShown &&
        !currCell.isMine
      ) {
        cell = currCell.minesAroundCount;
      }
      htmlStr += `<td class="cell" id="${idName}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j},event)">${cell}</td>`;
    }
    htmlStr += "</tr>";
  }
  htmlStr += "</tbody></table>";
  var elContainerGame = document.querySelector(".game-container");
  elContainerGame.innerHTML = htmlStr;
}

//Build Board:

function buildBoard(level) {
  var board = [];
  for (var i = 0; i < level.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < level.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      board[i][j] = cell;
    }
  }
  return board;
}

//Set Mines Negs Count:

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      currCell.minesAroundCount = countNegs(i, j);
    }
  }
}

//Count The Negs
function countNegs(rowIdx, collJdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = collJdx - 1; j <= collJdx + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (i === rowIdx && j === collJdx) continue;
      if (gBoard[i][j].isMine) count++;
    }
  }
  return count;
}
//***  SAFE CLICK BONUS!!!!!!!!!! ***//
function showSafeLocation() {
  if (gGame.safeClick === 0) return;
  var randomLocations = randomEmptyLocations(gBoard).slice();
  for (var i = 0; i < gGame.safeClick; i++) {
    var idx = getRandomInt(0, randomLocations.length);
    var currLocation = randomLocations[idx];
    if (gBoard[currLocation.i][currLocation.j].isShown) continue;
    randomLocations.splice(idx, 1);
  }
  renderSafeClick(currLocation.i, currLocation.j);
  gGame.safeClick--;
  countSafeClick();
}

//**** SAFE CLICK BONUS END!!!!!!! ***//

//Crate Mines in Random Locations
function createMines(board, level) {
  var randomLocations = randomEmptyLocations(board).slice();
  for (var i = 0; i < level.MINES; i++) {
    var idx = getRandomInt(0, randomLocations.length);
    var currLocation = randomLocations[idx];
    board[currLocation.i][currLocation.j].isMine = true;
    randomLocations.splice(idx, 1);
  }
}

//Random Locations for mines in the board:
function randomEmptyLocations(board) {
  var emptyCellRandom = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (!currCell.isMine && !currCell.isShown) {
        emptyCellRandom.push({ i: i, j: j });
      }
    }
  }
  return emptyCellRandom;
}

//Cell Clicked:
function cellClicked(elCell, i, j) {
  var currCell = gBoard[i][j];
  var value = EMPTY;
  if (currCell.isShown) return;
  if (currCell.isMarked) return;
  if (gGame.shownCount === 0 && !gGame.isOn && gGame.isFirstClick) {
    gGame.isOn = true;
    gTimeInterval = setInterval(setTime, 100);
    if (currCell.isMine) {
      firstClick(gBoard, i, j);
    }
    gGame.isFirstClick = false;
  }
  if (!gGame.isOn) return;
  if (gGame.isHints) hints(gBoard, i, j);
  if (currCell.minesAroundCount === 0 && !currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    expandShown(gBoard, i, j);
  }
  elCell.classList.add("shown"); //update the dom:
  elCell.classList.remove("back-empty");
  if (!currCell.isMine && currCell.minesAroundCount > 0) {
    currCell.isShown = true;
    value = currCell.minesAroundCount;
    gGame.shownCount++;
  } else if (currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    value = MINE;
    //Update the Lives dom and modal and check loosing!! :
    gLevel.LIVES--;
    lives(i, j, elCell, currCell);
  }
  //update the dom
  if (!currCell.isMine) actionsHistory(i, j, "cell");
  renderCell(i, j, value);
  checkGameOver();
}

function cellMarked(elCell, i, j, eve) {
  var currCell = gBoard[i][j];
  if (currCell.isShown) return;
  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--;
    countMarked();
    gActionsHistory.pop();
    elCell.innerText = EMPTY;
  } else if (!currCell.isMarked) {
    currCell.isMarked = true;
    elCell.innerText = FLAG;
    gGame.markedCount++;
    countMarked();
    actionsHistory(i, j, "Marked");
  }
  eve.preventDefault() === false;
  checkGameOver();
}

//Show if the cell is 0 see the others cells around
function expandShown(board, rowIdx, collJdx) {
  var value = EMPTY;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = collJdx - 1; j <= collJdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === collJdx) continue;
      var currCell = board[i][j];
      if (currCell.isShown || currCell.isMine || currCell.isMarked) continue;
      gGame.shownCount++; //update the gGame
      currCell.isShown = true; //update the modal
      if (currCell.minesAroundCount > 0) {
        value = currCell.minesAroundCount;
      }
      actionsHistory(i, j, "cell");
      document.getElementById(`cell-${i}-${j}`).classList.remove("back-empty");
      document
        .getElementById(`cell-${rowIdx}-${collJdx}`)
        .classList.remove("back-empty");
      renderCells(i, j, value); //update the dom
    }
  }
}

//Check victory
function checkGameOver() {
  var elSmiley = document.querySelector(".smiley");
  var sizeBoardWin = Math.pow(gLevel.SIZE, 2);
  sizeBoardWin = sizeBoardWin - gLevel.MINES;
  if (gGame.markedCount === gLevel.MINES && sizeBoardWin === gGame.shownCount) {
    gGame.isOn = false;
    clearInterval(gTimeInterval);
    elSmiley.innerText = WINNER;
    document.querySelector(".victory").style.display = "block";
  }
}

//Loose the game and lives
function lives(i, j, elCell, currCell) {
  var elLives = document.querySelector(".lives span");
  if (gLevel.LIVES === 2) {
    elLives.innerText = HEART + HEART;
    setTimeout(function () {
      renderCell(i, j, EMPTY);
      elCell.classList.remove("shown");
      currCell.isShown = false;
      gGame.shownCount--;
    }, 1000);
  } else if (gLevel.LIVES === 1) {
    elLives.innerText = HEART;
    setTimeout(function () {
      renderCell(i, j, EMPTY);
      elCell.classList.remove("shown");
      currCell.isShown = false;
      gGame.shownCount--;
    }, 1000);
  } else if (gLevel.LIVES <= 0) {
    elLives.innerText = GAMEOVER;
    stopGame(gBoard);
  }
}

function stopGame(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var currCell = board[i][j];
      if (currCell.isMine) {
        currCell.isShown = true;
        renderCells(i, j, MINE);
        document.getElementById(`cell-${i}-${j}`).classList.add("bomb");
      }
    }
  }
  clearInterval(gTimeInterval);
  gGame.isOn = false;
  document.querySelector(".smiley").innerText = LOSE; //change the smiley icon
}

//First Click:
function firstClick(board, rowIdx, collJdx) {
  var currCell = board[rowIdx][collJdx];
  var newRandomPos = randomEmptyLocations(board);
  var newPosMine = newRandomPos[getRandomInt(0, newRandomPos.length)];
  var newRow = newPosMine.i;
  var newColl = newPosMine.j;
  currCell.isMine = false;
  board[newRow][newColl].isMine = true;
  setMinesNegsCount(board);
  renderBoard(board);
  renderCellShow(rowIdx, collJdx);
}

//*  BONUS UNDO!    *//
function actionsHistory(i, j, type) {
  gActionsHistory.push({ i: i, j: j, type: type });
}

function undo() {
  if (gGame.shownCount === 0 || !gGame.isOn) return;
  var lastAction = gActionsHistory.pop();
  if (lastAction.type === "cell") {
    gBoard[lastAction.i][lastAction.j].isShown = false;
    gGame.shownCount--;
  } else if (lastAction.type === "Marked") {
    gBoard[lastAction.i][lastAction.j].isMarked = false;
    gGame.markedCount--;
  }
  renderCell(lastAction.i, lastAction.j, EMPTY);
  document
    .getElementById(`cell-${lastAction.i}-${lastAction.j}`)
    .classList.add("back-empty");
}

//* END BONUS UNDO!  *//

//**********/ HINTS BONUS ******//
function hints(board, rowIdx, collJdx) {
  expandShown(board, rowIdx, collJdx);
  setTimeout(function () {
    expandHide(board, rowIdx, collJdx);
    gGame.isHints = false;
    countHint();
  }, 1000);
  
}
function hintBtn() {
  if (gGame.Hints === 0) return;
  gGame.isHints = true;
  gGame.Hints--;
  countHint();
  if (gGame.Hints === 0) gGame.isHints = false;
}
//Hide the open cells function:
function expandHide(board, rowIdx, collJdx) {
  var value = EMPTY;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = collJdx - 1; j <= collJdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === collJdx) continue;
      var currCell = board[i][j];
      gGame.shownCount--; //update the gGame
      currCell.isShown = false;
      board[rowIdx][collJdx].isShown = false;
      gActionsHistory.pop();
      document.getElementById(`cell-${i}-${j}`).classList.add("back-empty");
      document.getElementById(`cell-${rowIdx}-${collJdx}`).classList.add("back-empty");
      renderCell(i, j, value); //update the dom
      renderCell(rowIdx, collJdx, value); //update the current cell user press to show the other cell
    }
  }
}
//********* END HINTS BONUS ********//


//Restart the Game
function iconRest(elIcon) {
  updateHtmInnerText();
  clearInterval(gTimeInterval);
  elIcon.innerText = RESTART;
  setTimeout(function () {
    elIcon.innerText = NORMAL;
  }, 100);
  initGame();
}

//update innerHtml functions!:
function updateHtmInnerText() {
  var elBombs = document.querySelector(".bombs span");
  var elLives = document.querySelector(".lives span");
  var harts;
  var numBombs;
  switch (gLevel.MINES) {
    case 2:
      harts = HEART + HEART;
      numBombs = 2;
      break;
    case 12:
      harts = HEART + HEART + HEART;
      numBombs = 12;
      break;
    case 30:
      harts = HEART + HEART + HEART;
      numBombs = 30;
      break;
  }
  elLives.innerText = harts;
  elBombs.innerText = numBombs;
  document.querySelector(".victory").style.display = "none";
  resetTimerHtml();
  countHint();
}
function countHint() {
  var elHint = document.querySelector(".hints span");
  var elBtn = document.querySelector(".hints");
  elHint.innerText = gGame.Hints + " " + HINT;
  if (gGame.isHints && gGame.Hints !== 0) {
    elBtn.classList.add("hint-show");
  } else {
    elBtn.classList.remove("hint-show");
  }
}

function countMarked() {
  var elMark = document.querySelector(".marked span");
  elMark.innerText = gGame.markedCount;
}
function countSafeClick() {
  var elSafeClick = document.querySelector(".safe-click span");
  elSafeClick.innerText = gGame.safeClick;
}

function resetTimerHtml() {
  var minutesLabel = document.getElementById("minutes");
  var secondsLabel = document.getElementById("seconds");
  secondsLabel.innerHTML = "00";
  minutesLabel.innerHTML = "00";
}
