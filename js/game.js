"use strict";
console.log("game is on!");
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
};
var gTimeInterval = null;

function chooseLevel(elBtn) {
  var elBombs = document.querySelector(".bombs span");
  var text = elBtn.innerText;
  console.log(text);
  if (text === "Easy") {
    gLevel = {
      SIZE: 4,
      MINES: 2,
    };
    elBombs.innerText = gLevel.MINES;
    initGame();
  } else if (text === "Medium") {
    gLevel = {
      SIZE: 8,
      MINES: 12,
    };
    elBombs.innerText = gLevel.MINES;
    initGame();
  } else if (text === "Hard") {
    gLevel = {
      SIZE: 12,
      MINES: 30,
    };
    elBombs.innerText = gLevel.MINES;
    initGame();
  }
}

function initGame() {
  clearInterval(gTimeInterval)
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


function renderBoard(board) {
  var htmlStr = "<table><tbody>";
  for (var i = 0; i < board.length; i++) {
    htmlStr += "<tr>";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      var cell = EMPTY;
      var idName = "cell-" + i + "-" + j;
      if (currCell.isMine && currCell.isShown) cell = MINE;
      else if (currCell.minesAroundCount > 0 && currCell.isShown && !currCell.isMine){
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

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      currCell.minesAroundCount = countNegs(i, j);
    }
  }
}

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

function createMines(board, level) {
  var randomLocations = randomMines(board).slice();
  for (var i = 0; i < level.MINES; i++) {
    var idx = getRandomInt(0, randomLocations.length);
    var currLocation = randomLocations[idx];
    board[currLocation.i][currLocation.j].isMine = true;
    randomLocations.splice(idx, 1);
  }
}

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

function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  var currCell = gBoard[i][j];
  var value = EMPTY;
  if (currCell.isMarked) return;
  if(currCell.minesAroundCount === 0 && !currCell.isMine && !currCell.isShown) {
    expandShown(gBoard, elCell, i, j);
  }
  elCell.style.backgroundColor = "#e3d23f	";
  //update the modal:
  currCell.isShown = true;
  gGame.shownCount++;
  //update the dom:
  if (!currCell.isMine && currCell.minesAroundCount > 0) {
    value = currCell.minesAroundCount;
  } else if (currCell.isMine) value = MINE;
  renderCell(i, j, value);
  if(gGame.shownCount >= 1 && gGame.isOn) gTimeInterval = setInterval(setTime, 1000);
}

function cellMarked(elCell, i, j, eve) {
  if (!gGame.isOn) return;
  var currCell = gBoard[i][j];
  if (currCell.isShown) return;
  if (currCell.isMarked) {
    currCell.isMarked = false;
    gGame.markedCount--; //update the gGame marks
    elCell.innerText = EMPTY;
  } else {
    currCell.isMarked = true;
    gGame.markedCount++; //update the gGame marks
    elCell.innerText = FLAG;
  }
  eve.preventDefault() === false;
}

function expandShown(board, elCell, rowIdx, collJdx) {
  // if (gGame.shownCount > 0) return;
  var value = EMPTY;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = collJdx - 1; j <= collJdx + 1; j++) {
      if (j < 0 || j >= board[i].length) continue;
      if (i === rowIdx && j === collJdx) continue;
      var currCell = board[i][j];
      if (currCell.minesAroundCount === 0 && !currCell.isMine) {
        elCell.style.backgroundColor = "#e3d23f	"; //update the dom
        currCell.isShown = true; //update the modal
      } 
      else if (currCell.minesAroundCount > 0 && !currCell.isMine) {
        currCell.isShown = true; //update the modal
        elCell.style.backgroundColor = "#e3d23f	"; //update the dom
        value = currCell.minesAroundCount;
      }
      gGame.shownCount++ //update the gGame
      renderCell(i, j, value); //update the dom
    }
  }
}


function iconRest(elIcon){
  clearInterval(gTimeInterval)
  elIcon.innerText = '🤪';
  setTimeout(function(){elIcon.innerText ='😃'},100)
  initGame()

}

