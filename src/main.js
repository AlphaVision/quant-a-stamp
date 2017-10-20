'use strict';

//find canvas and load images, wait for last image to load
let canvas;

// create a new stage and point it at our canvas:
let stage;
let startPoints = { 'x': [ 4, 128, 240, 368, 482, 600, 718, 840, 980, 1100, 1210 ],
                    'y': [ -200, -210, -220, -230, -240, -350, -260, -270, -280, -290, -300, -310, -320, -330, -340, -350, -360, -370, -380 ]
                  };
let hStartPoints = startPoints.x.length;
let vStartPoints = startPoints.y.length;

let totalSmartContractsInCirculation = Math.floor(Math.random()*300);
let totalStartPoints = [];
let currentStartPoints = [];


let gameWidth;
let gameHeight;

let smartContractWidth = 217;
let smartContractHeight = 276;
let smartContractCenterPointX = Math.floor(smartContractWidth/2);
let smartContractCenterPointY = Math.floor(smartContractHeight/2);
let smartContractBgWidth = smartContractWidth + 4;
let smartContractBgHeight = smartContractHeight + 4;
let smartContractSlotSpacing = 5;
let smartContractSlotPadding = 8;
let smartContractLife = 1500;

let slotPoints = {
	'x': [10, 236, 462, 688, 914, 1140],
	'y': [78, 388]
}
let smartContractSlots = [];
let contractSlots = [];

let smartContractSpriteBackgrounds
let smartContractSpriteForegrounds;
let smartContractSpriteSheetBackgrounds;
let smartContractSpriteSheetForegrounds;
let queue;
let myCursor;
let smartContractsContainer;
let points = 0;
let fouls = 0;
let maxFouls = 10;
let gameFinished = false;
let dialogShadow = new createjs.Shadow("#000000", 10, 15, 60);
let logoStamp;
let scoreBoard;
let pointsText;
let failsText
let pointsLabel = "SECURED: ";
let failsLabel = "HACKED: ";
let contractSlot;


function prepareStage() {
  //find canvas and load images, wait for last image to load
  canvas = document.getElementById("quant-a-stamp");

  // create a new stage and point it at our canvas:
  stage = new createjs.Stage(canvas);

  gameWidth = stage.canvas.width;
  gameHeight = stage.canvas.height;

  smartContractsContainer = new createjs.Container();
  smartContractsContainer.set({
  	x: 0,
  	y: 0,
  	width: gameWidth,
  	height: gameHeight,
  	mouseEnabled: true,
  	mouseChildren: true,
  	cursor: 'none'
  });

  stage.addChild(smartContractsContainer);
}

function prepareGame() {
  let data;
  totalStartPoints = generateStartPoints().map(e => e);

  // contract slots
  contractSlot = new createjs.Container();
  contractSlot.set({
  	width: smartContractBgWidth,
  	height: smartContractBgHeight,
  	x: 0,
  	y: 0
  });

  /*let contractSlotBg = new createjs.Bitmap(queue.getResult("contractSlot"));
  contractSlotBg.set({
  	width: smartContractBgWidth,
  	height: smartContractBgHeight,
  	x: 0,
  	y: 0
  });

  contractSlot.addChild(contractSlotBg);*/

	for (let yPos of slotPoints.y) {
		for (let xPos of slotPoints.x) {
	  	let slot = contractSlot.clone(true);
	  	slot.set({
	  		x: xPos,
	  		y: yPos,
	  		alpha: 0,
	  		name: `${xPos}x${yPos}`,
	  		isFree: true
	  	});
	  	contractSlots.push(slot);
	  	smartContractsContainer.addChild(slot);
	  }
  }

  contractSlots = shuffleArray(contractSlots);

  stage.update();

  // create sprite sheets
  data = {
      images: [queue.getResult("smartContractSpriteSheetBackgrounds")],
      frames: {width: 217, height:276}
  };
  smartContractSpriteSheetBackgrounds = new createjs.SpriteSheet(data);

  data.images = [queue.getResult("smartContractSpriteSheetForegrounds")];
  smartContractSpriteSheetForegrounds = new createjs.SpriteSheet(data);

  smartContractSpriteBackgrounds = new createjs.Sprite(smartContractSpriteSheetBackgrounds);
  smartContractSpriteForegrounds = new createjs.Sprite(smartContractSpriteSheetForegrounds);

  smartContractSpriteBackgrounds.name = 'backgrounds';
	smartContractSpriteForegrounds.name = 'foregrounds';

  logoStamp = new createjs.Bitmap(queue.getResult("stamp"));
  logoStamp.set({
    width: 70,
    height: 70,
    x: 160,
    y: 220,
    regX: 35,
    regY: 35,
    alpha: 0,
    name: 'stamp',
    scaleX: 2,
    scaleY: 2
  });

	myCursor = new createjs.Bitmap(queue.getResult("crosshair"));
	myCursor.name = "crosshair";
	myCursor.set({regX: 22, regY: 22, width: 44, height: 44});
	myCursor.mouseEnabled = false;
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

function createSmartContract(x,y) {
  let sc = new createjs.Container();
  sc.set({
  	x: x,
  	y: y,
  	width: smartContractWidth,
  	height: smartContractHeight
  });
  sc.regX = smartContractCenterPointX;
  sc.regY = smartContractCenterPointY;

  let backgrounds = smartContractSpriteBackgrounds.clone();
  let foregrounds = smartContractSpriteForegrounds.clone();

  backgrounds.gotoAndStop(0);
  foregrounds.gotoAndStop(0);

  let degrees = Math.floor(Math.random() * 45) + (Math.random() > 0.5 ? 0 : 315);
  let ls = logoStamp.clone();
  ls.rotation = degrees;

  sc.addChild(backgrounds, foregrounds, ls);

  return sc;
}

function stagePoint() {
	// x and y should always put the element with padding so when scaled it does not go out of the canvas
  let x = Math.floor(Math.random() * (gameWidth - smartContractWidth*2)) + smartContractWidth;
  let y = Math.floor(Math.random() * (gameHeight - smartContractHeight*2)) + smartContractHeight;
  return {x,y};
}

function useCustomCursor(isCustom) {
	if(isCustom) {
		// this property delegates to the css-style, so it might not work in all (older) browsers
		stage.cursor = 'none';
		smartContractsContainer.cursor = 'none';
		stage.addChild(myCursor);
	} else {
		stage.cursor = 'default';
		smartContractsContainer.cursor = 'default';
		stage.removeChild(myCursor);
	}

}

function startGame() {
	stage.enableMouseOver();
	useCustomCursor(true);
	for(let i = 0; i < contractSlots.length; i++) {
		createjs.Tween.get(contractSlots[i], { loop: false })
		.to({alpha: 1}, 300*i, createjs.Ease.quadOut(2))
	}
  createjs.Ticker.addEventListener("tick", gameTick);
}

function getStartPoint() {
	let point = totalStartPoints[Math.floor(Math.random() * totalStartPoints.length)];
	while(checkStartPointAvailability(point) === false) {
		point = totalStartPoints[Math.floor(Math.random() * totalStartPoints.length)];
	}
	return point;
}

function getContractSlot() {
	let randomIndex = Math.floor(Math.random() * contractSlots.length);
	let slot = contractSlots[randomIndex];

	return slot;
}

function checkStartPointAvailability(p) {
	// need to define how this will work
	return true;
	let available = false;
	for(let point in currentStartPoints) {
		if(p.x + smartContractWidth < point.x && p.y + smartContractHeight < point.y) {
			currentStartPoints.push(point);
			available = true;
		}
	}
	return available;
}

function gameTick(event) {
	myCursor.x = stage.mouseX;
	myCursor.y = stage.mouseY;

  // Actions carried out each tick (aka frame)
  if (!event.paused) {
    // Actions carried out when the Ticker is not paused.
    let randomTick = Math.ceil(Math.random() * 30) + 5;
    if(createjs.Ticker.getTicks() % randomTick === 0) {
      // let point = getStartPoint();
      let slot = getContractSlot();

      if(!slot.isFree) {
      	return;
      }

      slot.isFree = false;

      let smartContract = createSmartContract(smartContractCenterPointX+2, smartContractCenterPointY+2);
      smartContract.scaleX = 0;
      smartContract.scaleY = 0;
      smartContract.approved = false;
      smartContract.failed = false;

      slot.addChild(smartContract);

      smartContract.on('click', smartContractClicked);


      createjs.Tween.get(smartContract, { loop: false })
      .to({ scaleX: 1, scaleY: 1 }, smartContractLife, createjs.Ease.backOut())
      .call(function() {
        this.failed = true;
      	this.off('click', smartContractClicked);
      	if(!this.approved) {
	      	this.getChildByName('backgrounds').gotoAndStop(2);
  				this.getChildByName('foregrounds').gotoAndStop(2);
      		scorePoint(this.approved);
      	}
      }, this)
      .wait(300)
      .to({ alpha: 0}, 200, createjs.Ease.quadOut(2))
      .call(function() {
      	slot.removeChild(this);
      	slot.isFree = true;
      }, this);
    }
  }
}

function smartContractClicked() {
	this.off('click', smartContractClicked);
	if(!this.approved && !this.failed) {
		this.approved = true;
		scorePoint(this.approved);
    this.getChildByName('backgrounds').gotoAndStop(1);
    this.getChildByName('foregrounds').gotoAndStop(1);
    createjs.Tween.get(this.getChildByName('stamp'), { loop: false })
    .to({scaleX: 1, scaleY: 1, alpha: 1}, 250, createjs.Ease.backOut())
	}
}

function scorePoint(isGood) {
	if(gameFinished) {
		return;
	}

	if(isGood) {
		points++;
	} else {
		fouls++;
	}

	if(fouls >= maxFouls) {
		fouls == maxFouls;
		stopGame();
	}
  updateScoreBoard();
}

function addScoreBoard() {
  let scoreBoard = new createjs.Container();

  scoreBoard.set({
    x: gameWidth - 370,
    y: 0,
    width: 370,
    height: 40
  });

  let graphics = new createjs.Graphics();

  // start a new path. Graphics.beginCmd is a reusable BeginPath instance:
  graphics.append(createjs.Graphics.beginCmd);

  // we need to define the path before applying the fill:
  let rect = new createjs.Graphics.Rect(0,0,scoreBoard.width, scoreBoard.height);
  graphics.append(rect);
  // fill the path we just defined:
  let fill = new createjs.Graphics.Fill('black');
  graphics.append(fill);

  let scoreBoardBg = new createjs.Shape(graphics);
  scoreBoardBg.alpha = 0.25;


  pointsText = new createjs.Text(pointsLabel + "0", "24px Arial", "#21ad82");
  pointsText.x = 20;
  pointsText.y = 30;
  pointsText.textBaseline = "alphabetic";

  failsText = new createjs.Text(failsLabel + "0", "24px Arial", "#ad2121");
  failsText.x = 210;
  failsText.y = 30;
  failsText.textBaseline = "alphabetic";

  scoreBoard.addChild(scoreBoardBg, pointsText, failsText);
  stage.addChild(scoreBoard);
}

function updateScoreBoard() {
  pointsText.text = pointsLabel + points;
  failsText.text = failsLabel + fouls;
}

function stopGame() {
	gameFinished = true;
	smartContractsContainer.mouseEnabled = false;
	createjs.Ticker.removeEventListener("tick", gameTick);
	useCustomCursor(false);
	createjs.Ticker.addEventListener("tick", finishTick);
	createjs.Tween.get(smartContractsContainer, { loop: false })
  .to({ alpha: 0}, 600, createjs.Ease.backOut())
  .call(function() {
  	stage.removeChild(smartContractsContainer);
		showFinishDialog();
  })
}

function finishTick() {

}



// ----------------------------------------------------------- WELCOME DIALOG
function showWelcomeDialog() {
  let welcomeDialog = new createjs.Container();
  welcomeDialog.width = gameWidth/2;
  welcomeDialog.height = gameHeight/2;
  welcomeDialog.regX = gameWidth/4;
  welcomeDialog.regY = gameHeight/4;
  welcomeDialog.x = gameWidth/2;
  welcomeDialog.y = gameHeight/2;


  // ----------------------------------------------------------- WELCOME DIALOG BACKGROUNDS
  let graphics = new createjs.Graphics();

  // start a new path. Graphics.beginCmd is a reusable BeginPath instance:
  graphics.append(createjs.Graphics.beginCmd);

  // we need to define the path before applying the fill:
  let rect = new createjs.Graphics.Rect(0,0,welcomeDialog.width, welcomeDialog.height);
  graphics.append(rect);
  // fill the path we just defined:
  let fill = new createjs.Graphics.Fill();
  fill.linearGradient(["#000", "#FFF"], [0, 1], 0, 0, 0, 750);
  graphics.append(fill);



  let shape = new createjs.Shape(graphics);
  shape.set({x: 0, y:0, width: welcomeDialog.width, height: welcomeDialog.height, alpha: 0.7});

  welcomeDialog.addChild(shape);

  // ----------------------------------------------------------- QUANTSTAMP LOGO
  let logo = new createjs.Bitmap("img/logo_white.png");
  logo.setTransform(262,30,0.4,0.4);
  welcomeDialog.addChild(logo);

  // ----------------------------------------------------------- GAME INFO

  let text = new createjs.Text("Sign the smart contracts before the hackers get to 10 of them", "20px Arial", "#ffffff");
  text.x = 70;
  text.y = 240;
  text.textBaseline = "alphabetic";
  welcomeDialog.addChild(text);

  // ----------------------------------------------------------- BUTTON

  let startButton = new createjs.Container;

  graphics = new createjs.Graphics();
  graphics.append(createjs.Graphics.beginCmd);
  //let rect = new createjs.Graphics.Rect(0,0,welcomeDialog.width/10, welcomeDialog.height/10);
  let rect2 = new createjs.Graphics.RoundRect(0,0,welcomeDialog.width/4, welcomeDialog.height/6, 5, 5, 5, 5);
  graphics.append(rect2);
  // fill the path we just defined:
  let fill2 = new createjs.Graphics.Fill("rgba(0, 122, 255, 0.72)");
  graphics.append(fill2);
  let stroke2 = new createjs.Graphics.Stroke("white");
  graphics.append(stroke2);
  let strokeStyle2 = new createjs.Graphics.StrokeStyle(4);
  graphics.append(strokeStyle2);
  let shape2 = new createjs.Shape(graphics);
  shape2.set({width: welcomeDialog.width/4, height: welcomeDialog.height/6})

  startButton.addChild(shape2);
  startButton.set({x: welcomeDialog.width/2 - welcomeDialog.width/8, y: welcomeDialog.height - welcomeDialog.height/6 - 40, width: welcomeDialog.width/4, height: welcomeDialog.height/6})

  // ----------------------------------------------------------- BUTTON TEXT
  let text2 = new createjs.Text("LET'S STAMP", "24px Arial", "#ffffff");
  text2.x = 10;
  text2.y = 40;
  text2.textBaseline = "alphabetic";
  startButton.addChild(text2);
  startButton.cursor = 'pointer';

  startButton.on('click', function() {
    stage.removeChild(welcomeDialog);
    startGame();
    addScoreBoard();
  });

  welcomeDialog.addChild(startButton);
  welcomeDialog.shadow = dialogShadow;

  stage.addChild(welcomeDialog);
}

// ----------------------------------------------------------- FINISH DIALOG
function showFinishDialog() {
  let finishDialog = new createjs.Container();
  finishDialog.width = gameWidth/2;
  finishDialog.height = gameHeight/2;
  finishDialog.regX = gameWidth/4;
  finishDialog.regY = gameHeight/4;
  finishDialog.x = gameWidth/2;
  finishDialog.y = gameHeight/2;


  // ----------------------------------------------------------- FINISH DIALOG BACKGROUNDS
  let graphics = new createjs.Graphics();

  // start a new path. Graphics.beginCmd is a reusable BeginPath instance:
  graphics.append(createjs.Graphics.beginCmd);

  // we need to define the path before applying the fill:
  let rect = new createjs.Graphics.Rect(0,0,finishDialog.width, finishDialog.height);
  graphics.append(rect);
  // fill the path we just defined:
  let fill = new createjs.Graphics.Fill();
  fill.linearGradient(["#000", "#FFF"], [0, 1], 0, 0, 0, 750);
  graphics.append(fill);



  let shape = new createjs.Shape(graphics);
  shape.set({x: 0, y:0, width: finishDialog.width, height: finishDialog.height, alpha: 0.7});

  finishDialog.addChild(shape);

  // ----------------------------------------------------------- QUANTSTAMP LOGO
  let logo = new createjs.Bitmap("img/logo_white.png");
  logo.setTransform(262,30,0.4,0.4);
  finishDialog.addChild(logo);

  // ----------------------------------------------------------- SCORE

  let line1 = 'CONGRATULATIONS!';
  let line2 = `You secured ${points} smart contracts with Quantstamp.`;
  let line3 = 'Thanks to you the blockchain is now a more secure place!';

  if(points === 0) {
  	line1 = 'BETTER LUCK NEXT TIME!';
  	line3 = 'You could not make the blockchain a more secure place!';
  }


  let scoreText = new createjs.Text(line1, "36px Arial", "#ffffff");
  scoreText.x = (points > 0) ? 155 : 110;
  scoreText.y = 250;
  scoreText.textBaseline = "alphabetic";
  finishDialog.addChild(scoreText);

  let scoreText2 = new createjs.Text(line2, "20px Arial", "#ffffff");
  scoreText2.x = 110;
  scoreText2.y = 288;
  scoreText2.textBaseline = "alphabetic";
  finishDialog.addChild(scoreText2);

  let scoreText3 = new createjs.Text(line3, "20px Arial", "#ffffff");
  scoreText3.x = (points > 0) ? 75 : 85;
  scoreText3.y = 320;
  scoreText3.textBaseline = "alphabetic";
  finishDialog.addChild(scoreText3);

  // ----------------------------------------------------------- FINISH MESSAGE

  let text = new createjs.Text("Check out the awesome Quantstamp project at ", "20px Arial", "#ffffff");
  text.x = 50;
  text.y = 350;
  text.textBaseline = "alphabetic";
  finishDialog.addChild(text);

  let text2 = new createjs.Text("quantstamp.com", "20px Arial", "#00ffae");
  text2.x = 475;
  text2.y = 350;
  text2.textBaseline = "alphabetic";
  text2.cursor = 'pointer';

 	text2.on('click', function() {
		window.open('https://quantstamp.com')
  });


  finishDialog.addChild(text, text2);

  finishDialog.shadow = dialogShadow;
  stage.addChild(finishDialog);
	stage.update();
}


function loadAssets() {
	let assetLoader = new Promise((resolve, reject) => {
		queue = new createjs.LoadQueue();

		queue.on("complete", resolve);
		queue.loadManifest([
			{id: "smartContractSpriteSheetBackgrounds", src:"img/smartContract-bgs.png"},
			{id: "smartContractSpriteSheetForegrounds", src:"img/smartContract-fgs.png"},
			{id: "crosshair", src:"img/crosshair.png"},
      {id: "stamp", src:"img/logo_stamp.png"},
      //{id: "contractSlot", src: "img/slot_bg.png"}
		]);
	});

	return assetLoader;
}

function shuffleArray(array) {
  let i = 0;
  let j = 0;
  let temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array;
}


window.addEventListener('load', function(event) {
  prepareStage();
  createjs.Ticker.framerate = 30;
  createjs.Ticker.addEventListener("tick", stage);

  loadAssets()
  .then(() => {
	  prepareGame();
    showWelcomeDialog();
  });
});
