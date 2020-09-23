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

function initGame() {
  gBoard = buildBoard(gLevel);
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
  gGame.isOn = true;
  createMines(gBoard, gLevel);//checking!
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
      else if (currCell.minesAroundCount > 0 && currCell.isShown)
        cell = currCell.minesAroundCount;
      htmlStr += `<td class="cell" id="${idName}" onclick="cellClicked(this,${i},${j})">${cell}</td>`;
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
  board[2][1].isMine = true;
  board[3][2].isMine = true;
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
  for (var i = 0; i < level.MINES; i++) {
    var currMineLocation = randomMines(board);
    if (currMineLocation.i !== currMineLocation.i && currMineLocation.j !== currMineLocation.j) {
      var currCell = currMineLocation;
      // console.log("this is:", currCell);
    }
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
  var randomCell = emptyCellRandom[getRandomInt(0, emptyCellRandom.length)];
  return randomCell;
}

function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  console.log("this:", "i:", i, "j:", j);
  var currCell = gBoard[i][j];
  //update the modal:
  currCell.isShown = true;
  //update the dom:
  if (!currCell.isMine && currCell.minesAroundCount > 0) {
    renderCell(i, j, currCell.minesAroundCount);
  } else if (currCell.isMine) renderCell(i, j, MINE);
}
