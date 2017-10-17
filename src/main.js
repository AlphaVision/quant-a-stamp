'use strict';

//find canvas and load images, wait for last image to load
var canvas;

// create a new stage and point it at our canvas:
let stage;
let startPoints = { 'x': [ 4, 128, 240, 368, 482, 600, 718, 840, 980, 1100, 1210 ],
                    'y': [ -200, -210, -220, -230, -240, -350, -260, -270, -280, -290, -300, -310, -320, -330, -340, -350, -360, -370, -380 ]
                  };
let hStartPoints = startPoints.x.length;
let vStartPoints = startPoints.y.length;

let totalSmartContractsInCirculation = Math.floor(Math.random()*300);
let totalStartPoints = [];

let gameWidth;
let gameHeight;

let smartContractWidth = 108;
let smartContractHeight = 192;

function createSmartContract(x,y) {
  let graphics = new createjs.Graphics();
  var shape = new createjs.Shape(graphics);

  // start a new path. Graphics.beginCmd is a reusable BeginPath instance:
  graphics.append(createjs.Graphics.beginCmd);
  // we need to define the path before applying the fill:
  var rect = new createjs.Graphics.Rect( x, y, smartContractWidth, smartContractHeight );
  graphics.append(rect);
  // fill the path we just defined:
  var stroke = new createjs.Graphics.Stroke("black");
  graphics.append(stroke);

  shape.regX = 50;
  shape.regY = 50;

  return shape;
}

function prepareStage() {
  //find canvas and load images, wait for last image to load
  canvas = document.getElementById("quant-a-stamp");

  // create a new stage and point it at our canvas:
  stage = new createjs.Stage(canvas);

  gameWidth = stage.canvas.width;
  gameHeight = stage.canvas.height;
}

function prepareGame() {
  totalStartPoints = generateStartPoints().map(e => e);
  console.log(totalStartPoints);
}

function generateStartPoints() {
  let tempIndex = 0;
  let startPointsList = [];
  while(tempIndex < totalSmartContractsInCirculation) {
    startPointsList.push(stagePoint());
    tempIndex++;
  }
  return startPointsList;
}

function stagePoint() {
  let x = Math.floor(Math.random() * (gameWidth - smartContractWidth));
  let y = Math.floor(Math.random() * (gameHeight - smartContractHeight));
  return {x,y};
}

function startGame() {
  createjs.Ticker.addEventListener("tick", handleTick);
}

function handleTick(event) {
  // Actions carried out each tick (aka frame)
  if (!event.paused) {
    // Actions carried out when the Ticker is not paused.
    let randomTick = Math.ceil(Math.random() * 25) + 5;
    if(createjs.Ticker.getTicks() % randomTick === 0) {
      let point = totalStartPoints[Math.floor(Math.random() * totalStartPoints.length)];
      let smartContract = createSmartContract(point.x, point.y);
      smartContract.regX = 50;
      smartContract.regY = 50;
      smartContract.scaleX = 0;
      smartContract.scaleY = 0;

      stage.addChild(smartContract);

      createjs.Tween.get(smartContract, { loop: false })
      .to({ scaleX: 1, scaleY: 1 }, 1000, createjs.Ease.backOut())
      .to({ alpha: 0}, 100, createjs.Ease.quadOut(2));
    }
  }
}

function generateContracts() {

  let point = stagePoint();
  let smartContract = createSmartContract(point.x, point.y);

  stage.addChild(smartContract);
  stage.update();
}


window.addEventListener('load', function(event) {
  prepareStage();
  createjs.Ticker.framerate = 30;
  createjs.Ticker.addEventListener("tick", stage);

  prepareGame();
  //generateContracts();
  startGame();
});