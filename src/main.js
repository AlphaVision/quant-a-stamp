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
let smartContractLife = 1500;

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

  // create sprite sheets
  data = {
      images: ["img/smartContract-bgs.png"],
      frames: {width: 217, height:276}
  };
  smartContractSpriteSheetBackgrounds = new createjs.SpriteSheet(data);

  data.images = ["img/smartContract-fgs.png"];
  smartContractSpriteSheetForegrounds = new createjs.SpriteSheet(data);

  smartContractSpriteBackgrounds = new createjs.Sprite(smartContractSpriteSheetBackgrounds);
  smartContractSpriteForegrounds = new createjs.Sprite(smartContractSpriteSheetForegrounds);

  smartContractSpriteBackgrounds.name = 'backgrounds';
	smartContractSpriteForegrounds.name = 'foregrounds';

	myCursor = new createjs.Bitmap("img/crosshair.png");
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
  sc.regX = Math.floor(smartContractWidth/2);
  sc.regY = Math.floor(smartContractHeight/2);

  let backgrounds = smartContractSpriteBackgrounds.clone();
  let foregrounds = smartContractSpriteForegrounds.clone();

  backgrounds.gotoAndStop(0);
  foregrounds.gotoAndStop(0);

  sc.addChild(backgrounds, foregrounds);

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
  createjs.Ticker.addEventListener("tick", gameTick);
}

function getStartPoint() {
	let point = totalStartPoints[Math.floor(Math.random() * totalStartPoints.length)];
	while(checkStartPointAvailability(point) === false) {
		console.log('startPoint not available')
		point = totalStartPoints[Math.floor(Math.random() * totalStartPoints.length)];
	}
	return point;
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
    let randomTick = Math.ceil(Math.random() * 35) + 15;
    if(createjs.Ticker.getTicks() % randomTick === 0) {
      let point = getStartPoint();
      let smartContract = createSmartContract(point.x, point.y);
      smartContract.scaleX = 0;
      smartContract.scaleY = 0;
      smartContract.approved = false;

      smartContractsContainer.addChild(smartContract);

      smartContract.on('click', smartContractClicked);


      createjs.Tween.get(smartContract, { loop: false })
      .to({ scaleX: 1, scaleY: 1 }, smartContractLife, createjs.Ease.backOut())
      .call(function() {
      	smartContract.off('click');
      	if(!this.approved) {
	      	this.getChildByName('backgrounds').gotoAndStop(2);
  				this.getChildByName('foregrounds').gotoAndStop(2);
      		scorePoint(this.approved);
      	}
      }, this)
      .wait(300)
      .to({ alpha: 0}, 200, createjs.Ease.quadOut(2))
      .call(function() {
      	smartContractsContainer.removeChild(this);
      }, this);
    }
  }
}

function smartContractClicked() {
	this.off('click');
	if(!this.approved) {
		this.approved = true;
		this.getChildByName('backgrounds').gotoAndStop(1);
		this.getChildByName('foregrounds').gotoAndStop(1);
		scorePoint(this.approved);
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

	console.log("points: " + points, "fouls: " + fouls);
	if(fouls >= maxFouls) {
		fouls == maxFouls;
		stopGame();
	}
}

function stopGame() {
	gameFinished = true;
	smartContractsContainer.mouseEnabled = false;
	createjs.Tween.get(smartContractsContainer, { loop: false })
  .to({ alpha: 0}, 200, createjs.Ease.backOut())
  .call(function() {
  	stage.removeChild(smartContractsContainer);
  })
	createjs.Ticker.removeEventListener("tick", gameTick);
	useCustomCursor(false);
	createjs.Ticker.addEventListener("tick", finishTick);
	showFinishDialog();
}

function finishTick() {

}

function loadAssets() {
	let assetLoader = new Promise((resolve, reject) => {
		queue = new createjs.LoadQueue();

		queue.on("complete", resolve);
		queue.loadManifest([
			{id: "smartContractSpriteSheetBackgrounds", src:"img/smartContract-bgs.png"},
			{id: "smartContractSpriteSheetForegrounds", src:"img/smartContract-bgs.png"},
			{id: "crosshair", src:"img/crosshair.png"}
		]);
	});

	return assetLoader;
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

  let text = new createjs.Text("Sign the smart contracts before the hackers get to them", "20px Arial", "#ffffff");
  text.x = 110;
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
  let line2 = `You secured ${points} smart contracts with Quantstamp`;
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
