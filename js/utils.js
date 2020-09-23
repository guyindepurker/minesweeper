'use strict';
console.log('utils!');


function renderCell(locationI,locationJ, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`#cell-${locationI}-${locationJ}`);
    elCell.innerText = value;
  }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }