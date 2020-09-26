"use strict";

function renderCell(locationI, locationJ, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.innerText = value;
}


function renderCells(locationI, locationJ, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.innerText = value;
  elCell.classList.add('shown');
}

function renderCellShow(locationI, locationJ) {
  // Select the elCell after the first click and change the bg-color in html
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.classList.add('shown');
}

//Timer:
function setTime() {
  var minutesLabel = document.getElementById("minutes");
  var secondsLabel = document.getElementById("seconds");
  ++gGame.secsPassed;
  secondsLabel.innerHTML = strTime(gGame.secsPassed % 60);
  minutesLabel.innerHTML = strTime(parseInt(gGame.secsPassed / 60));
}
function strTime(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
