"use strict";

//sets the game to load when the window loads
window.onload = function (){
    document.querySelector("#game").appendChild(app.view);
    resize();
}

//constants to allow for keyboard controls
const keyboard = Object.freeze({
    W: 87, 
    A: 65, 
    S: 83, 
    D: 68, 
    P: 80, 
    LEFT: 37, 
    UP: 38, 
    RIGHT: 39, 
    DOWN: 40
});

const keys = [];

//defining the app and adding a resize event
const app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio
});

window.addEventListener("resize", resize);

let sceneWidth = 800; 
let sceneHeight = 600;

let ticker = 0; 
let swordTicker = 0;
let fireTicker = 0;

//loading all the assets
PIXI.loader.add(["media/layers/country-platform-back.png", "media/layers/country-platform-forest.png", 
"media/layers/country-platform-tiles-example.png", "media/Dragon.png", 
"media/PNGs/Knight Red.png", "media/PNGs/Sword Steel.png", "media/FireBall/efecto_fuego_00008.png", "media/UI/Title.png", "media/UI/StartButton.png", "media/UI/RestartButton.png", "media/UI/Health.png", "media/UI/Score.png", "media/UI/Instructions.png", "media/treasures.png"]).on("progress", e=>{console.log(`progress=${e.progress}`)}).load(setup);

//defining variables to be used later
let stage;

let startScene, title, totalScore, treasure;
let instructionsScene, instructionsBox, gameScene, dragon, scoreLabel, lifeLabel, timeLabel, throwSound, wingSound, explosionSound, fireballSound, roarSound;
let goldDragonButton, redDragonButton, blueDragonButton, redTwoHeadDragonButton;
let gameOverScene;
let backGameBackgrounds = [3];
let midGameBackgrounds = [3];
let frontGameBackgrounds = [3];
let dragonTextures = [];
let redDragonTextures = [];
let goldDragonTextures = [];
let blueDragonTextures = [];
let redTwoHeadedDragonTextures = [];
let currentDragonTextureIndex; 
let knightTextures = [];
let wingsGoingDown;

let fireballs = [];
let knights = [];

let score = 0;
let life = 200; 
let time;
let paused = true;

let startButton;
let restartButton;

//a function to setup the initial values for the start screen
//and to initialize the different scenes
function setup() {
    window.onkeyup = (e) => {
        keys[e.keyCode] = false;
        e.preventDefault();
    };

    window.onkeydown = keyCheck;

    stage = app.stage;

    startScene = new PIXI.Container();
    startScene.visible = true;
    stage.addChild(startScene);

    instructionsScene = new PIXI.Container();
    instructionsScene.visible = false;
    stage.addChild(instructionsScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false; 
    stage.addChild(gameOverScene);

    //loads the different dragon textures
    redDragonTextures = loadDragonSpriteSheet("media/flying_dragon-red.png");
    blueDragonTextures = loadDragonSpriteSheet("media/flying_twin_headed_dragon-blue.png")
    goldDragonTextures = loadDragonSpriteSheet("media/flying_dragon-gold.png")
    redTwoHeadedDragonTextures = loadDragonSpriteSheet("media/flying_twin_headed_dragon-red.png");
    
    knightTextures = loadKnightSpriteSheet();
    readDragonTexture();

    dragon = new Dragon(sceneWidth/2, sceneHeight * 1/2, redDragonTextures[0]);
    dragon.texture = dragonTextures[0];
    currentDragonTextureIndex = 0;

    throwSound = new Howl({
        src: ['media/sounds/Woosh-Mark_DiAngelo-4778593.wav']
    })

    roarSound = new Howl({
        src: ['media/sounds/European_Dragon_Roaring_and_breathe_fire-daniel-simon.wav']
    })

    fireballSound = new Howl({
        src: ['media/sounds/Fireball+3.wav'],
        volume: 0.3
    })

    explosionSound = new Howl({
        src: ['media/sounds/Blast-SoundBible.com-2068539061.wav'],
        volume: 0.3
    })

    wingSound = new Howl({
        src: ['media/sounds/Wings Flapping-SoundBible.com-889456791.wav']
    })

    app.ticker.add(gameLoop);

    start();
}

//loads the start scene
function start() {
    //Creating Backgrounds
    backGameBackgrounds[1] = new Background();
    backGameBackgrounds[0] = new Background(-sceneWidth/2, sceneHeight/2);
    backGameBackgrounds[2] = new Background(sceneWidth * 3/2, sceneHeight/2);
    startScene.addChild(backGameBackgrounds[1]);
    startScene.addChild(backGameBackgrounds[0]);
    startScene.addChild(backGameBackgrounds[2]);

    midGameBackgrounds[1] = new Background(sceneWidth/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-forest.png"].texture);
    midGameBackgrounds[0] = new Background(-sceneWidth/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-forest.png"].texture);
    midGameBackgrounds[2] = new Background(sceneWidth * 3/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-forest.png"].texture);
    startScene.addChild(midGameBackgrounds[1]);
    startScene.addChild(midGameBackgrounds[0]);
    startScene.addChild(midGameBackgrounds[2]);

    frontGameBackgrounds[1] = new Background(sceneWidth/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-tiles-example.png"].texture);
    frontGameBackgrounds[0] = new Background(-sceneWidth/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-tiles-example.png"].texture);
    frontGameBackgrounds[2] = new Background(sceneWidth * 3/2, sceneHeight/2, PIXI.loader.resources["media/layers/country-platform-tiles-example.png"].texture);
    startScene.addChild(frontGameBackgrounds[1]);
    startScene.addChild(frontGameBackgrounds[0]);
    startScene.addChild(frontGameBackgrounds[2]);

    //adding the dragon and title
    startScene.addChild(dragon);

    title = new PIXI.Sprite(PIXI.loader.resources["media/UI/Title.png"].texture);
    title.anchor.set(0.5, 0.5);
    title.x = sceneWidth/2; 
    title.y = sceneHeight/4;
    startScene.addChild(title);

    //adding the start button
    startButton = new PIXI.Sprite(PIXI.loader.resources["media/UI/StartButton.png"].texture);
    startButton.anchor.set(0.5, 0.5);
    startButton.scale.x = 1.5; 
    startButton.scale.y = 1.5; 
    startButton.x = sceneWidth/2; 
    startButton.y = sceneHeight * 0.75;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", loadInstructions); 
    startButton.on('pointerover', e => e.target.alpha = 0.7); 
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    startScene.addChild(startButton);

    resize();

    wingsGoingDown = true;
}

//sets up the instructions screen
function loadInstructions() {
    startScene.visible = false; 
    instructionsScene.visible = true;
    gameScene.visible = false;
    gameOverScene.visible = false;

    //adds the backgrounds to the instructions scene
    instructionsScene.addChild(backGameBackgrounds[1]);
    instructionsScene.addChild(backGameBackgrounds[0]);
    instructionsScene.addChild(backGameBackgrounds[2]);

    instructionsScene.addChild(midGameBackgrounds[1]);
    instructionsScene.addChild(midGameBackgrounds[0]);
    instructionsScene.addChild(midGameBackgrounds[2]);

    instructionsScene.addChild(frontGameBackgrounds[1]);
    instructionsScene.addChild(frontGameBackgrounds[0]);
    instructionsScene.addChild(frontGameBackgrounds[2]);

    //creates the instructions box
    instructionsBox = new PIXI.Sprite(PIXI.loader.resources["media/UI/Instructions.png"].texture);
    instructionsBox.anchor.set(0.5,0.5);
    instructionsBox.x = sceneWidth/2; 
    instructionsBox.y = sceneHeight * 11/32; 
    instructionsScene.addChild(instructionsBox);

    //creates the buttons to set dragon textures
    goldDragonButton = new PIXI.Sprite(goldDragonTextures[0]);
    goldDragonButton.x = sceneWidth/32;
    goldDragonButton.y = sceneHeight/3;
    goldDragonButton.interactive = true;
    goldDragonButton.buttonMode = true;
    goldDragonButton.on("pointerup", setDragonTexture); 
    goldDragonButton.on('pointerover', e => e.target.alpha = 0.7); 
    goldDragonButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    instructionsScene.addChild(goldDragonButton);

    blueDragonButton = new PIXI.Sprite(blueDragonTextures[0]);
    blueDragonButton.x = sceneWidth/32;
    blueDragonButton.y = sceneHeight * 2/3;
    blueDragonButton.interactive = true;
    blueDragonButton.buttonMode = true;
    blueDragonButton.on("pointerup", setDragonTexture); 
    blueDragonButton.on('pointerover', e => e.target.alpha = 0.7); 
    blueDragonButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    instructionsScene.addChild(blueDragonButton);

    redDragonButton = new PIXI.Sprite(redDragonTextures[0]);
    redDragonButton.scale.x = -1;
    redDragonButton.x = sceneWidth * 31/32;
    redDragonButton.y = sceneHeight/3;
    redDragonButton.interactive = true;
    redDragonButton.buttonMode = true;
    redDragonButton.on("pointerup", setDragonTexture); 
    redDragonButton.on('pointerover', e => e.target.alpha = 0.7); 
    redDragonButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    instructionsScene.addChild(redDragonButton);

    redTwoHeadDragonButton = new PIXI.Sprite(redTwoHeadedDragonTextures[0]);
    redTwoHeadDragonButton.scale.x = -1;
    redTwoHeadDragonButton.x = sceneWidth * 31/32;
    redTwoHeadDragonButton.y = sceneHeight * 2/3;
    redTwoHeadDragonButton.interactive = true;
    redTwoHeadDragonButton.buttonMode = true;
    redTwoHeadDragonButton.on("pointerup", setDragonTexture); 
    redTwoHeadDragonButton.on('pointerover', e => e.target.alpha = 0.7); 
    redTwoHeadDragonButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    instructionsScene.addChild(redTwoHeadDragonButton);

    //resets the startButton's action and adds it to the scene
    startButton.on("pointerup", startGame); 
    instructionsScene.addChild(startButton);
}

//sets up the game scene
function startGame() {
    //reads the current dragon textures from local storage
    readDragonTexture();

    startScene.visible = false;
    instructionsScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    window.onmousedown = shootFire;

    time = 60; 
    score = 0; 
    life = 200; 

    //setting Backgrounds
    gameScene.addChild(backGameBackgrounds[1]);
    gameScene.addChild(backGameBackgrounds[0]);
    gameScene.addChild(backGameBackgrounds[2]);

    gameScene.addChild(midGameBackgrounds[1]);
    gameScene.addChild(midGameBackgrounds[0]);
    gameScene.addChild(midGameBackgrounds[2]);

    gameScene.addChild(frontGameBackgrounds[1]);
    gameScene.addChild(frontGameBackgrounds[0]);
    gameScene.addChild(frontGameBackgrounds[2]);

    //creating labels and titles
    let scoreTitle = new PIXI.Sprite(PIXI.loader.resources["media/UI/Score.png"].texture);
    scoreTitle.anchor.set(0.5, 0.5);
    scoreTitle.x = 60; 
    scoreTitle.y = 20; 
    gameScene.addChild(scoreTitle);

    let healthTitle = new PIXI.Sprite(PIXI.loader.resources["media/UI/Health.png"].texture);
    healthTitle.anchor.set(0.5, 0.5);
    healthTitle.x = 70; 
    healthTitle.y = 80; 
    gameScene.addChild(healthTitle);

    let textStyle = new PIXI.TextStyle({
        fill: 0x891616,
        fontSize: 40,
        fontFamily: "Charmonman", 
        stroke: 0x891616, 
        strokeThickness: 2
    });

    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 120; 
    scoreLabel.y = -10; 
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 140; 
    lifeLabel.y = 55; 
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    timeLabel = new PIXI.Text();
    timeLabel.style = textStyle; 
    timeLabel.x = sceneWidth-120;
    timeLabel.y = -10;
    timeLabel.text = time;
    gameScene.addChild(timeLabel);

    //adds knights and dragon to scene
    gameScene.addChild(dragon);

    for (let i = 0; i < 3; i++){
        knights[i] = new Knight(Math.random() * sceneWidth, knightTextures[i]);
        gameScene.addChild(knights[i]);
        gameScene.addChild(knights[i].getSword());
    }

    paused = false;
}

//a function to allow for the game window to be responsive
function resize() {
    const parent = app.view.parentNode;
    
    sceneWidth = parent.clientWidth; 
    sceneHeight = parent.clientHeight;

    if (typeof backGameBackgrounds[0].width == "undefined"){
        return;
    }

    //resizes the background images
    for (let i = 0; i < 3; i++){
        backGameBackgrounds[i].width = sceneWidth;
        backGameBackgrounds[i].height = sceneHeight;

        midGameBackgrounds[i].width = sceneWidth; 
        midGameBackgrounds[i].height = sceneHeight;

        frontGameBackgrounds[i].width = sceneWidth;
        frontGameBackgrounds[i].height = sceneHeight;
    }

    backGameBackgrounds[1].x = sceneWidth/2;
    midGameBackgrounds[1].x = sceneWidth/2;
    frontGameBackgrounds[1].x = sceneWidth/2;

    backGameBackgrounds[0].x = -sceneWidth/2;
    midGameBackgrounds[0].x = -sceneWidth/2;
    frontGameBackgrounds[0].x = -sceneWidth/2;

    backGameBackgrounds[2].x = sceneWidth * 3/2; 
    midGameBackgrounds[2].x = sceneWidth * 3/2; 
    frontGameBackgrounds[2].x = sceneWidth * 3/2;

    //moves objects specific to each scene when resizing
    if (startScene.visible){
        title.x = sceneWidth/2;
        dragon.x = sceneWidth/2;
        startButton.x = sceneWidth/2;
    }
    else if (instructionsScene.visible){
        instructionsBox.x = sceneWidth/2;
        goldDragonButton.x = sceneWidth/32;
        blueDragonButton.x = sceneWidth/32;
        redDragonButton.x = sceneWidth * 31/32; 
        redTwoHeadDragonButton.x = sceneWidth * 31/32;
        startButton.x = sceneWidth/2;
    }
    else if (gameScene.visible){
        timeLabel.x = sceneWidth - 120;
    }
    else if (gameOverScene.visible){
        totalScore.x = sceneWidth/2; 
        treasure.x = sceneWidth/2;
        restartButton.x = sceneWidth/2;
    }
    
    app.renderer.resize(parent.clientWidth, parent.clientHeight);
}

//a function for things that need to run every frame
function gameLoop() {
    ticker++;

    if (ticker >= 20){        
        if (wingsGoingDown){
            currentDragonTextureIndex++;

            dragon.texture = dragonTextures[currentDragonTextureIndex];

            if (currentDragonTextureIndex == 2){

                if (!paused){
                    wingSound.play();
                }

                wingsGoingDown = false;
            }
        }
        else {
            currentDragonTextureIndex--;

            dragon.texture = dragonTextures[currentDragonTextureIndex];

            if (currentDragonTextureIndex == 0){
                wingsGoingDown = true;
            }
        }

        ticker = 0;
    }

    //if paused don't run the rest of the method
    if (paused) {return;}
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt = 1/12;

    fireTicker++;
    
    time -= dt;
    time = time.toFixed(2);
    timeLabel.text = time;

    //checking for controls
    if(keys[keyboard.D]){
        dragon.dx = dragon.speed;
    }else if(keys[keyboard.A]) {
        dragon.dx = -dragon.speed;
    }else{
        dragon.dx = 0;
    }
    
    if(keys[keyboard.S]){
        dragon.dy = dragon.speed;
    }else if(keys[keyboard.W]) {
        dragon.dy = -dragon.speed;
    }else{
        dragon.dy = 0;
    }
    
    //move the dragon
    dragon.update(dt);

    for (let i = 0; i < 3; i++){
        backGameBackgrounds[i].x --;
        midGameBackgrounds[i].x -= 0.5;
        frontGameBackgrounds[i].x -= 1.5;

        if (backGameBackgrounds[i].x < -sceneWidth/2){
            backGameBackgrounds[i].x = sceneWidth * 3/2;
        }

        if (midGameBackgrounds[i].x < -sceneWidth/2){
            midGameBackgrounds[i].x = sceneWidth * 3/2;
        }

        if (frontGameBackgrounds[i].x < -sceneWidth/2){
            frontGameBackgrounds[i].x = sceneWidth * 3/2;
        }
    }

    //updating knights and fireballs
    for (let i = 0; i < knights.length; i++){
        knights[i].update();
    }

    for (let i = 0; i < fireballs.length; i++){
        fireballs[i].update();
    }

    //checking for collisions
    for (let k of knights) {
        for (let f of fireballs){
            if (rectsIntersect(k,f)){
                gameScene.removeChild(f);
                explosionSound.play();
                k.takeDamage(20);
                increaseScoreBy(10);
                f.isAlive = false;
            }
        }
    }

    for (let k of knights) {
        for (let t of k.thrownSwords){
            if (rectsIntersect(t, dragon)){
                decreaseLifeBy(10);
                gameScene.removeChild(t);
                t.isAlive = false;
            }
        }
    }

    knights = knights.filter(k=>k.isAlive);
    fireballs = fireballs.filter(f=>f.isAlive);
    for (let k of knights){
        k.thrownSwords = k.thrownSwords.filter(t=>t.isAlive);
    }

    spawnKnights();

    if (time < 0){
        endGame();
    }
}

//end the game
function endGame(){
    //change visible scenes
    startScene.visible = false;
    instructionsScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = true;

    paused = true;

    //add backgrounds to gameOver scene
    gameOverScene.addChild(backGameBackgrounds[1]);
    gameOverScene.addChild(backGameBackgrounds[0]);
    gameOverScene.addChild(backGameBackgrounds[2]);

    gameOverScene.addChild(midGameBackgrounds[1]);
    gameOverScene.addChild(midGameBackgrounds[0]);
    gameOverScene.addChild(midGameBackgrounds[2]);

    gameOverScene.addChild(frontGameBackgrounds[1]);
    gameOverScene.addChild(frontGameBackgrounds[0]);
    gameOverScene.addChild(frontGameBackgrounds[2]);

    //create the treasure object
    treasure = new PIXI.Sprite(PIXI.loader.resources["media/treasures.png"].texture);
    treasure.anchor.set(0.5, 1);
    treasure.x = sceneWidth/2; 
    treasure.y = sceneHeight * 15/16;
    gameOverScene.addChild(treasure);

    //create the total score label
    let textStyle = new PIXI.TextStyle({
        fill: 0x891616,
        fontSize: 80,
        fontFamily: "Charmonman", 
        stroke: 0x891616, 
        strokeThickness: 2
    });

    let total = score + life; 
    totalScore = new PIXI.Text();
    totalScore.anchor.set(0.5,0.5);
    totalScore.style = textStyle;
    totalScore.x = sceneWidth/2; 
    totalScore.y = sceneHeight/3; 
    totalScore.text = "Total Score : \n      " + total;
    gameOverScene.addChild(totalScore);

    //adding the restart button
    restartButton = new PIXI.Sprite(PIXI.loader.resources["media/UI/RestartButton.png"].texture);
    restartButton.anchor.set(0.5, 0.5);
    restartButton.scale.x = 1.5; 
    restartButton.scale.y = 1.5; 
    restartButton.x = sceneWidth/2; 
    restartButton.y = sceneHeight * 3/4;
    restartButton.interactive = true;
    restartButton.buttonMode = true;
    restartButton.on("pointerup", loadInstructions); 
    restartButton.on('pointerover', e => e.target.alpha = 0.7); 
    restartButton.on('pointerout', e => e.currentTarget.alpha = 1.0)
    gameOverScene.addChild(restartButton);

    roarSound.play();
}

//loads a dragon spritesheet
function loadDragonSpriteSheet(imageFilePath) {
    let spriteSheet = PIXI.BaseTexture.fromImage(imageFilePath);
    let width = 144;
    let height = 95;
    let numFrames = 3;
    let textures = [];

    for (let i = 0; i < numFrames; i++){
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 130, width, height));
        textures.push(frame);
    }

    return textures;
}

//loads the knight spritesheet
function loadKnightSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.fromImage("media/knightSpriteSheet.png");
    let width = 60;
    let height = 112;
    let numFrames = 3; 
    let textures = [];
    
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i, 0, width, height));
        textures.push(frame);
    }
    return textures;
}

//checks for other keys being pressed
function keyCheck(e) {
    if (gameScene.visible){
        dragon.dx = 0; 
        dragon.dy = 0;
    
        keys[e.keyCode] = true;
    
        var char = String.fromCharCode(e.keyCode);
        if (char == "p" || char == "P"){
            paused = !paused;
        }
    }
}

//a function to allow the dragon to shoot fire
function shootFire(e) {

    if(fireTicker >= 30){
        fireballSound.play();

        let fireX = dragon.x; 

        if (dragon.direction == 0){
            fireX += 70; 
        }
        else {
            fireX -= 70; 
        }
        let newFire = new FireBall(fireX, dragon.y+45, e.x, e.y);
        
        fireballs.push(newFire);
        gameScene.addChild(newFire);
        
        fireTicker = 0;
    }
}

//increases the score by a given value
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = score;
}

//decreases life by a given value
function decreaseLifeBy(value) {
    life -= value;
    //life = parseInt(life);
    lifeLabel.text = life;
}

//sets the dragon texture in local storage to a value
function setDragonTexture(){
    if (this.texture == goldDragonTextures[0]){
        localStorage.setItem("tlp6760-dragonTexture", "gold");
    }
    else if (this.texture == blueDragonTextures[0]){
        localStorage.setItem("tlp6760-dragonTexture", "blue");
    }
    else if (this.texture == redTwoHeadedDragonTextures[0]){
        localStorage.setItem("tlp6760-dragonTexture", "red2Head");
    }else{
        localStorage.setItem("tlp6760-dragonTexture", "red");
    }

    readDragonTexture();
}

//reads the dragon texture from local storage
function readDragonTexture(){
    let dragonTexture = localStorage.getItem("tlp6760-dragonTexture");
    if (dragonTexture == "gold"){
        dragonTextures = goldDragonTextures;
    }
    else if (dragonTexture == "blue"){
        dragonTextures = blueDragonTextures;
    }
    else if (dragonTexture == "red2Head"){
        dragonTextures = redTwoHeadedDragonTextures;
    } else {
        dragonTextures = redDragonTextures;
    }
}

//spawn knights when the number of knights is too low
function spawnKnights() {
    if (knights.length < 2){
        let newKnight = new Knight(Math.random() * sceneWidth, knightTextures[0]);
        knights.push(newKnight);
        gameScene.addChild(newKnight);
    }
}