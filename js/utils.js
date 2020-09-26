"use strict";

function renderCell(locationI, locationJ, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.innerText = value;
}


function renderCells(locationI, locationJ, value) {
  // Select the elCells and set the value and change the bgc of all the cells!
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.innerText = value;
  elCell.classList.add('shown');
}

function renderCellShow(locationI, locationJ) {
  // Select the elCell of the first click if its mine after it replace a place change the bg-color in html of the current cell with the new value.
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.classList.add('shown');
}

function renderSafeClick(locationI, locationJ) {
  // Select the elCell after the user click on safe click and show him 
  var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
  elCell.classList.add('safeClick');
  setTimeout(function(){elCell.classList.remove('safeClick');},1000)
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
