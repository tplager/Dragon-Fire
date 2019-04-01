class Dragon extends PIXI.Sprite {
    constructor(x=0, y=0){
        super(PIXI.loader.resources["media/Dragon.png"].texture);
        this.anchor.set(.5, .5);
        this.x = x; 
        this.y = y; 
        this.scale.x = 1.25;
        this.scale.y = 1.25; 

        this.speed = 400;

        this.direction = 0;

        this.dx = 0;
        this.dy = 0;

        this.update = function(dt){
            let prevX = this.x; 

            if (dragon.x >= sceneWidth){
                dragon.x = sceneWidth - 30;
            }
            else if (dragon.x <= 0){
                dragon.x = 30;
            }
            else if (dragon.y <= 0){
                dragon.y = 30;
            }
            else if (dragon.y >= sceneHeight-150){
                dragon.y = sceneHeight-150;
            }

            this.x += this.dx * dt;
            this.y += this.dy * dt;

            if (this.x < prevX){
                this.direction = 1; 
            }
            else{
                this.direction = 0; 
            }

            if (this.direction == 1){
                this.scale.x = -1; 
            }
            else {
                this.scale.x = 1;
            }
        }
    }
}

class Background extends PIXI.Sprite {
    constructor(x = sceneWidth/2, y = sceneHeight/2, texture = PIXI.loader.resources["media/layers/country-platform-back.png"].texture){
        super(texture);
        this.anchor.set(0.5,0.5);
        this.x = x; 
        this.y = y;
        this.height = sceneHeight; 
        this.width = sceneWidth;
    }
}

class Knight extends PIXI.Sprite {
    constructor(x=0, texture = PIXI.loader.resources["media/PNGs/Knight Red.png"].texture){
        super(texture);
        this.anchor.set(0.5,0.5);
        this.x = x; 
        this.y = sceneHeight * 25/32;
        this.sword = new Sword(x);
        this.direction = Math.round(Math.random());
        this.thrownSwords = [];
        this.swordTicker = Math.round(Math.random() * 60);

        this.tintCounter = 0; 

        this.health = 100;

        this.isAlive = true;
        
        if (this.direction == 0){
            this.scale.x = -1;
            this.sword.scale.x = -1;
            this.sword.x += 5;
        }

        this.getSword = function() {
            return this.sword; 
        }
        this.getDirection = function() {
            return this.direction;
        }

        this.takeDamage = function(damage) {
            this.tint = 0xFF0000;
            this.tintCounter = 20; 
            this.health -= damage; 

            if (this.health == 0){
                gameScene.removeChild(this);
                this.isAlive = false;
                gameScene.removeChild(this.sword);
                for(let t of this.thrownSwords){
                    gameScene.removeChild(t);
                }
                this.thrownSwords = [];
            }
        }

        this.update = function() {
            if (this.tintCounter != -1){
                this.tintCounter--;
            }
            
            if(this.tintCounter == 0){
                this.tint = 0xFFFFFF;
            }

            if (this.direction == 0){
                this.x-=2;
                this.sword.x-=2;
            }
            else {
                this.x++;
                this.sword.x++;
            }
    
            if (this.x <= 0){
                this.direction = 1;
                this.scale.x = 1;
                this.sword.scale.x = 1;
            }
            else if (this.x >= sceneWidth){
                this.direction = 0;
                this.scale.x = -1;
                this.sword.scale.x = -1;
            }
    
            this.swordTicker++;
    
            if (this.swordTicker >= 80){
                throwSound.play();
                
                let yChange = (dragon.y - this.y)/100;
                let xChange = (dragon.x - this.x)/100;
                let newSword = new ThrownSword(this.x, yChange, xChange);
                this.thrownSwords.push(newSword);
                gameScene.addChild(newSword);
        
                this.swordTicker = 0;
            }
    
            for (let j = 0; j < this.thrownSwords.length; j++){
                this.thrownSwords[j].update();
            }
        }
    }
}

class Sword extends PIXI.Sprite {
    constructor(x=0, texture = PIXI.loader.resources["media/PNGs/Sword Steel.png"].texture){
        super(texture);
        this.anchor.set(0.5,0.5);
        this.x = x; 
        this.y = sceneHeight * 51/64;
    }
}

class ThrownSword extends Sword {
    constructor(x, yChange, xChange){
        super(x);
        this.yChange = yChange; 
        this.xChange = xChange;
        this.rotation = Math.random() * 360;

        this.isAlive = true;

        this.update = function() {
            this.rotation += 0.5;
            this.y += yChange; 
            this.x += xChange;

            if (this.y <= 0 || this.x >= sceneWidth || this.x <= 0){
                gameScene.removeChild(this);
            }
        }
    }
}

class FireBall extends PIXI.Sprite {
    constructor(x, y, targetX, targetY, texture = PIXI.loader.resources["media/FireBall/efecto_fuego_00008.png"].texture){
        super(texture);
        this.anchor.set(0.5,0.5);
        this.x = x; 
        this.y = y; 
        this.targetX = targetX; 
        this.targetY = targetY;
        this.scale.x = 0.2;
        this.scale.y = 0.2;

        this.speed = 6; 

        if (targetX < x){
            this.scale.x *= -1; 
        }

        this.isAlive = true;

        this.xChange = (targetX - x)/100; 
        this.yChange = (targetY - y)/100;

        this.direction = new Vector(this.xChange, this.yChange);
        this.direction.normalize();

        this.rotation = Math.atan(this.yChange/this.xChange);

        this.update = function() {
            this.y += this.direction.y * this.speed; 
            this.x += this.direction.x * this.speed;

            if (this.y >= sceneHeight-110 || this.x >= sceneWidth || this.x <= 0){
                gameScene.removeChild(this);
            }
        }
    }
}

class Vector {
    constructor(x,y){
        this.x = x; 
        this.y = y; 

        this.mag = Math.sqrt(this.x * this.x + this.y * this.y);

        this.normalize = function() {
            this.x /= this.mag; 
            this.y /= this.mag; 
        }
    }
}