"use strict";
//const and global vars.
const FLAG = "🚩";
const MINE = "💣";
const EMPTY = " ";
var gBoard;
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLevel = {
  SIZE: 4,
  MINES: 2,
  LIVES:1
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
      LIVES: 1,
    };
    elBombs.innerText = gLevel.MINES;
    elLives.innerText = "❤️";
    initGame();
  } else if (text === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 12,
      LIVES: 3,
    };
    elLives.innerText = "❤️❤️❤️";
    elBombs.innerText = gLevel.MINES;
    initGame();
  } else if (text === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 30,
      LIVES: 3,
    };
    elLives.innerText = "❤️❤️❤️";
    elBombs.innerText = gLevel.MINES;
    initGame();
  }
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
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
  };
}

//Rander the Board:

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

//Set Negs:
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
  var randomLocations = randomMines(board).slice();
  for (var i = 0; i < level.MINES; i++) {
    var idx = getRandomInt(0, randomLocations.length);
    var currLocation = randomLocations[idx];
    board[currLocation.i][currLocation.j].isMine = true;
    randomLocations.splice(idx, 1);
  }
}

//Random Locations:
function randomMines(board) {
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
  var elLives = document.querySelector(".lives span");
  var currCell = gBoard[i][j];
  var value = EMPTY;
  if (currCell.isShown) return;
  if (currCell.isMarked) return;
  if (gGame.shownCount === 0 && gGame.isOn)
    gTimeInterval = setInterval(setTime, 100);
  if (currCell.minesAroundCount === 0 && !currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    expandShown(gBoard, elCell, i, j);
  }
  //update the dom:
  elCell.style.backgroundColor = "#e3d23f	";
  //update the modal:
  if (!currCell.isMine && currCell.minesAroundCount > 0) {
    currCell.isShown = true;
    value = currCell.minesAroundCount;
    gGame.shownCount++;
  } else if (currCell.isMine) {
    currCell.isShown = true;
    gGame.shownCount++;
    value = MINE;
    gLevel.LIVES--;
    if (gLevel.LIVES === 2) elLives.innerText = "❤️❤️";
    else if (gLevel.LIVES === 1) elLives.innerText = "❤️";
    else if (gLevel.LIVES === 0) elLives.innerText = "Last Try";
    else if (gLevel.LIVES < 0) {
      document.querySelector(".lives span").innerText ='END GAME';
      stopGame(gBoard);
    }
  }
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
    elCell.innerText = EMPTY;
  } else if (!currCell.isMarked) {
    currCell.isMarked = true;
    elCell.innerText = FLAG;
    gGame.markedCount++;
  }
  eve.preventDefault() === false;
  checkGameOver();
}

//Show if the cell is 0 see the other cell

function expandShown(board, elCell, rowIdx, collJdx) {
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
        elCell.style.backgroundColor = "#e3d23f	"; //update the dom
        value = currCell.minesAroundCount;
      }

      renderCell(i, j, value); //update the dom
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
    elSmiley.innerText = "😎";
    document.querySelector(".victory").style.display = "block";
  }
}

//Loose the game

function stopGame(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var currCell = board[i][j];
      if (currCell.isMine) {
        currCell.isShown = true;
        renderCell(i, j, MINE);
      }
    }
  }
  clearInterval(gTimeInterval);
  gGame.isOn = false;
  document.querySelector(".smiley").innerText = "😭";
}

//Restart the Game
function iconRest(elIcon) {
  clearInterval(gTimeInterval);
  elIcon.innerText = "🤪";
  setTimeout(function () {
    elIcon.innerText = "😃";
  }, 100);
  initGame();
}
