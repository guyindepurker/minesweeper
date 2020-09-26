"use strict";
//const and global vars.
const FLAG = "🚩";
const MINE = "💣";
const EMPTY = " ";
const WIENER = "😎";
const NORMAL = "😃";
const RESTART = "🤪";
const LOSE = "😭";
const HEART = "💛";
const GAMEOVER = "❌";

var gBoard;
var gGame = {
  isOn: false,
  isFirstClick: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLevel = {
  SIZE: 4,
  MINES: 2,
  LIVES: 2,
};
var gTimeInterval = null;

//Choose a Level:

function chooseLevel(elBtn) {
  var elBombs = document.querySelector(".bombs span");
  var elLives = document.querySelector(".lives span");
  var text = elBtn.innerText;
  if (text === "Easy") {
    gLevel = {
      SIZE: 4,
      MINES: 2,
      LIVES: 2,
    };
    initGame();
  } else if (text === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 12,
      LIVES: 3,
    };
    initGame();
  } else if (text === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 30,
      LIVES: 3,
    };

    initGame();
  }
  var harts;
  var numBomb;
  switch (gLevel.MINES) {
    case 2:
      harts = HEART + HEART;
      numBomb = 2;
      break;
    case 12:
      harts = HEART + HEART + HEART;
      numBomb = 12;
      break;
    case 30:
      harts = HEART + HEART + HEART;
      numBomb = 30;
      break;
  }
  elLives.innerText = harts;
  elBombs.innerText = numBomb;
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
    isOn: true,
    isFirstClick: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
  };
  countMarked();
  document.querySelector(".victory").style.display = "none";
  resetTimerHtml();
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
      if (!currCell.isMine) {
        emptyCellRandom.push({ i: i, j: j });
      }
    }
  }
  return emptyCellRandom;
}

//Cell Clicked:
function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  var currCell = gBoard[i][j];
  var value = EMPTY;
  if (currCell.isShown) return;
  if (currCell.isMarked) return;
  if (gGame.shownCount === 0 && gGame.isOn && gGame.isFirstClick) {
    gTimeInterval = setInterval(setTime, 100);
    if (currCell.isMine) {
      firstClick(gBoard, i, j);
    }
    gGame.isFirstClick = false;
  }
  if (currCell.minesAroundCount === 0 && !currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    expandShown(gBoard, i, j);
  }
  elCell.classList.add("shown"); //update the dom:
  if (!currCell.isMine && currCell.minesAroundCount > 0) {
    currCell.isShown = true;
    value = currCell.minesAroundCount;
    gGame.shownCount++;
  } else if (currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    value = MINE;
    //Update the Lives dom and modal!! :
    gLevel.LIVES--;
    lives(i, j, elCell, currCell);
  }
  //update the dom
  renderCell(i, j, value);
  checkGameOver();
}

function cellMarked(elCell, i, j, eve) {
  if (!gGame.isOn) return;
  var currCell = gBoard[i][j];
  if (currCell.isShown) return;
  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--;
    countMarked();
    elCell.innerText = EMPTY;
  } else if (!currCell.isMarked) {
    currCell.isMarked = true;
    elCell.innerText = FLAG;
    gGame.markedCount++;
    countMarked();
  }
  eve.preventDefault() === false;
  checkGameOver();
}

//Show if the cell is 0 see the other cells around

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
    elSmiley.innerText = WIENER;
    document.querySelector(".victory").style.display = "block";
  }
}

//Loose the game
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
      }
    }
  }
  clearInterval(gTimeInterval);
  gGame.isOn = false;
  document.querySelector(".smiley").innerText = LOSE; //change the smiley icon
}

function countMarked() {
  var elMark = document.querySelector(".marked span");
  elMark.innerText = gGame.markedCount;
}
function resetTimerHtml() {
  var minutesLabel = document.getElementById("minutes");
  var secondsLabel = document.getElementById("seconds");
  secondsLabel.innerHTML = "00";
  minutesLabel.innerHTML = "00";
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

//Restart the Game
function iconRest(elIcon) {
  var harts;
  switch (gLevel.SIZE) {
    case 4:
      harts = HEART + HEART;
      break;
    default:
      harts = HEART + HEART + HEART;
      break;
  }
  document.querySelector(".lives span").innerText = harts;
  clearInterval(gTimeInterval);
  elIcon.innerText = RESTART;
  setTimeout(function () {
    elIcon.innerText = NORMAL;
  }, 100);
  initGame();
}
