document.getElementById("play-btn").addEventListener("click", startGame);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let level = 1;
const R = 0, L = 1, RSH = 2, LSH = 3, RS = 4, LS = 5; 
const D = 2, U = 3;
const FIRE = 0;
const HERO = 0, CRUSADER = 1, PIRATE = 2, KING = 3;
let bgSrc = "../images/background.png", bgImg = new Image(), bgReady = false;
bgImg.src = bgSrc; 
bgImg.onload = function(){
    bgReady=true;
}
let potionSrc = ["../images/potion.png"], potionImg = [], potionReady = [], potions = [];
let magicSrc = ["../images/fire.png"], magicImg = [], magicReady = [];
let characterSrc = [["../images/derecha.png", "../images/izquierda.png",
"../images/derecha-escudo.png", "../images/izquierda-escudo.png",
"../images/derecha-espada.png", "../images/izquierda-espada.png"], 
["../images/e1-derecha.png", "../images/e1-izquierda.png",
"../images/e1-derecha-escudo.png", "../images/e1-izquierda-escudo.png",
"../images/e1-derecha-espada.png", "../images/e1-izquierda-espada.png"], 
["../images/e2-derecha.png", "../images/e2-izquierda.png",
"../images/e2-derecha-escudo.png", "../images/e2-izquierda-escudo.png",
"../images/e2-derecha-espada.png", "../images/e2-izquierda-espada.png"],
["../images/e3-derecha.png", "../images/e3-izquierda.png", 
"../images/e3-derecha-escudo.png", "../images/e3-izquierda-escudo.png",
"../images/e3-derecha-espada.png", "../images/e3-izquierda-espada.png"]], characterReady = [];
let characterImg = [], heroReady = [];
for(let i = 0; i < characterSrc.length; i++){
    for(let j = 0; j < characterSrc[i].length; j++){
        characterImg.push([]);
        characterImg[i][j] = new Image();
        characterImg[i][j].src = characterSrc[i][j];
        characterReady.push([]);
        characterImg[i][j].onload = function(){
            characterReady[i][j] = true;
        }
    }
}

for(let i = 0; i < magicSrc.length; i++){
    magicImg.push(new Image());
    magicImg[i].src = magicSrc[i];
    magicImg[i].onload = function(){
        magicReady[i] = true;
    }
}

for(let i = 0; i < potionSrc.length; i++){
    potionImg.push(new Image());
    potionImg[i].src = potionSrc[i];
    potionImg[i].onload = function(){
        potionReady[i] = true;
    }
}


let isGameOver = false;
function gameOver(){
    isGameOver = true;
    ctx.fillStyle = "black";
    ctx.fillRect(100,100, 700, 300);
    ctx.fillStyle = "white";
    ctx.font = "80px Arial";
    ctx.fillText("Game over", 250, 270);
}

function win(){
    isGameOver = true;
    ctx.fillStyle = "green";
    ctx.fillRect(100,100, 700, 300);
    ctx.fillStyle = "white";
    ctx.font = "80px Arial";
    ctx.fillText("Ganaste", 250, 270);
}

function createAndRunEnemy(){
    if(level === 2){
        setTimeout(()=>{
            enemy[0] = new Enemy(PIRATE, L, canvas.width-70, FIRE, 120, 50, 130);
            enemy[0].run();
        }, 2000);
    }
    if(level === 3){
        setTimeout(()=>{
            enemy[0] = new Enemy(PIRATE, L, canvas.width-141, FIRE, 50, 50, 50);
            enemy[0].run();
            enemy[1] = new Enemy(KING, L, canvas.width-70, FIRE, 120, 70, 70);
            enemy[1].run();
        }, 2000);
    }
}

class Character{
    constructor(type, direction, x, magic, life, magicka, stamina){
        this.type = type;
        this.img = characterImg[this.type][direction];
        this.life = life;
        this.initialLife = life;
        this.magicka = magicka;
        this.initialMagicka = magicka;
        this.stamina = stamina;
        this.initialStamina = stamina;
        this.width = 70;
        this.height = 100;
        this.direction = direction;
        this.magic = magic;
        this.swordAttack = false;
        this.shooting = false;
        this.shieldRaised = false; 
        this.jumping = false;
        this.magicObjArr = [];
        this._x = x;
        this._y = canvas.height - 100;
    }
    set x(num){
        if(num >= 0 && num <= 900-70){
            this._x = num;
        }
    }
    set y(num){
        if(num > 400){
            this._y = 400;
        }else{
            this._y = num;
        }
    }
    get x(){
        return this._x;
    }
    get y(){
        return this._y;
    }
    move(direction){
        if(direction === L || direction === R){
            this.direction = direction;
        }
            if(this.jumping){
                let i = 0;
                let intervalId = setInterval(() => {
                    if(direction === L && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(L) !== -1)){
                        this.x -= 20;
                    }else if(direction === R && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(R) !== -1)){
                        this.x += 20;
                    }
                    i++;
                    if(i === 7){
                        clearInterval(intervalId);
                    }
                }, 6);
            }else{
                if(direction === L && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(L) !== -1)){
                    this.x -= 6;
                }else if(direction === R && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(R) !== -1)){
                    this.x += 6;
                }
            }

            if(direction === D && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(D) !== -1)){
                this.y += 3;
            }else if(direction === U  && !(this.isCollidingWithAny().bool && this.isCollidingWithAny().directions.indexOf(U) !== -1)){
                this.y -= 3;
            }

            if(!this.shieldRaised){
                this.img = characterImg[this.type][this.direction];
            }else{
                if(this.direction === R){
                    this.img = characterImg[this.type][RSH];
                }else{
                    this.img = characterImg[this.type][LSH];
                }
            }
    }
    jump(){
        let intervalId;
        if(this._y === canvas.height-100 && !this.jumping){
            this.jumping = true;
            intervalId = setInterval(()=>{
                if(this._y > 205){
                    this.move(U)
                }
                if(this._y === 205){
                    clearInterval(intervalId);
                    intervalId = setInterval(() =>{
                        if(this._y < 400){
                            this.move(D);
                        }
                        if(this._y === 400){
                            clearInterval(intervalId);
                            this.jumping = false;
                        }
                    },7);
                }
            }, 7);
            
        }
        if(this.shieldRaised && this.type === HERO){
            if(this.direction === R){
                this.img = characterImg[HERO][RSH];
            }else{
                this.img = characterImg[HERO][LSH];
            }
        }
    }
    shoot(){
        if(this.magicka >= 50){
            this.lowerShield();
            this.shooting = true;
            this.magicka -= 50;
            this.shooting = true;
            this.magicObjArr.push(new Magic(magicImg[this.magic], this._x + 40, this.y+40));
            let direction = this.direction;
            let magicObj = this.magicObjArr[this.magicObjArr.length-1];
            let intervalId = setInterval(()=>{
                magicObj.move(direction);
                if(magicObj.x < 0-30 || magicObj.x >= canvas.width){
                    this.magicObjArr.unshift();
                    clearInterval(intervalId);
                    if(this.magicObjArr.length === 0){
                        this.shooting = false;
                    }
                }
            }, 10);
        }
    }
    raiseShield(){
        if(this.stamina >= 10){
            if(this.img === characterImg[this.type][R] || this.img === characterImg[this.type][RS]){
                this.img = characterImg[this.type][RSH];
            }
            if(this.img === characterImg[this.type][L] || this.img === characterImg[this.type][LS]){
                this.img = characterImg[this.type][LSH];
            }
            this.shieldRaised = true;
        }
    }
    lowerShield(){
        this.img = characterImg[this.type][this.direction];
        this.shieldRaised = false;
    }

    isCollidingWith(obj){
        let collision = {bool: false};

        let this_bottom = this.y + this.height, this_right = this.x + this.width;
        let obj_bottom = obj.y + obj.height, obj_right = obj.x + obj.width;

        if (this.x < obj_right &&
            this_right > obj.x &&
            this.y < obj_bottom &&
            this_bottom > obj.y) {
                collision.bool = true;

                if(obj.y <= this.y - (this.height/2)){
                    collision.direction = U;
                }else if(obj.y >= this.y + (this.height/2)){
                    collision.direction = D;
                }else if(this.x < obj.x){
                    collision.direction = R;
                }else if(this.x > obj.x){
                    collision.direction = L;
                }
              
         }
         return collision;

    }
    isCollidingWithAny(){
        let collision = {bool: false, directions: []};
        if(this.type === HERO){
            for(let e of enemy){
                if(this.isCollidingWith(e).bool){
                    collision.bool = true;
                    collision.directions.push(this.isCollidingWith(e).direction);
                }
            }

        }
        if(this.type === CRUSADER || this.type === PIRATE || this.type === KING){
            if(this.isCollidingWith(hero).bool){
                collision.bool = true;
                collision.directions.push(this.isCollidingWith(hero).direction);
            }
            let index = enemy.indexOf(this);
            if(this.isCollidingWith(enemy[(index+1)%enemy.length]).bool){
                collision.bool = true;
                collision.directions.push(this.isCollidingWith(enemy[(index+1)%enemy.length]).direction);
            }
        }
        return collision;

    }
    ready(){
        for(let el of characterReady[this.type]){
            if(el === false){
                return false;
            }
        }
        return true;
    }
}

class Enemy extends Character{
    attack(){
        if(!this.swordAttack && this.stamina >= 20){
            this.lowerShield();
            this.stamina -= 20;
            if(this.direction === R){
                this.img = characterImg[this.type][RS];
            }else{
                this.img = characterImg[this.type][LS];
            }
            this.swordAttack = true;

            setTimeout(()=>{
                if(this.direction === R){
                    this.img = characterImg[this.type][R]
                }else{
                    this.img = characterImg[this.type][L];
                }
                this.swordAttack = false;
            }, 200);
            if(hero.shieldRaised){
                hero.life -= 3;
                hero.stamina -= 10;
            }else{
                hero.life -= 10;
            }
        }
    }
    follow(distance){
        if(distance > 0 && distance >= hero.width){
            this.move(L);
        }
        if(distance < 0 && distance <= -(this.width)){
            this.move(R);
        }
    }
    run(){
        let intervalId = setInterval(() => {
            let distance;
            distance = this._x - hero.x;
            if(Math.random() <= 0.7){
                this.follow(distance);
                this.raiseShield();
            }else{
                this.shoot();
            }

            if(this.isCollidingWith(hero).bool && (this.direction === this.isCollidingWith(hero).direction || this.isCollidingWith(hero).direction === U)){
                this.attack();
            }

        }, 40);
        let intervalId3 = setInterval(() => {
            if(this.shooting){
                for(let i = 0; i < this.magicObjArr.length; i++){
                    if(this.magicObjArr[i].isCollidingWith(hero).bool){
                        hero.life -= 10;
                        this.magicObjArr.splice(i, 1);
                    }
                }
            }
        }, 10);
        let intervalId2 = setInterval(()=>{
            if(this.stamina < 10){
                this.lowerShield();
            }
            if(this.magicka < this.initialMagicka){
                this.magicka++;
            }
            if(this.stamina < this.initialStamina){
                this.stamina++;
            }
            if(this.life <= 0){
                if(level === 3 && enemy.length === 1){
                    win();
                    setTimeout(()=>{clearInterval(intervalId2);}, 2000)
                }else{
                    enemy.splice(enemy.indexOf(this),1);
                    potions.push(new Potion(potionImg[0], this.x+this.width/2, canvas.height-30));
                    if(enemy.length === 0){
                        level++;
                        createAndRunEnemy();
                    }
                    clearInterval(intervalId2);
                    
                }
                clearInterval(intervalId);
                clearInterval(intervalId3);
            }
        },100);
    }
}

class Hero extends Character{
    attack(){
        if(!this.swordAttack && this.stamina >= 20){
            this.stamina -= 20;
            if(this.direction === R){
                this.img = characterImg[HERO][RS];
            }else{
                this.img = characterImg[HERO][LS];
            }
            this.swordAttack = true;

            setTimeout(()=>{
                if(this.direction === R){
                    this.img = characterImg[HERO][R]
                }else{
                    this.img = characterImg[HERO][L];
                }
                this.swordAttack = false;
            }, 200);

            for(let e of enemy){
                if(this.isCollidingWith(e).bool && this.direction === this.isCollidingWith(e).direction){
                    if(e.shieldRaised){
                        e.life -= 5;
                        e.stamina -= 10;
                    }else{
                        e.life -= 10;
                    }
                }
            }
            
        }
    }
    run(){
        let intervalId = setInterval(()=>{
            if(this.life <= 0){
                gameOver();
            }
            if(this.stamina < 10){
                this.lowerShield();
            }
            if(this.life < this.initialLife){
                this.life += 1.5;
            }
            if(this.magicka < this.initialMagicka){
                this.magicka += 2;
            }
            if(this.stamina < this.initialStamina){
                this.stamina += 5;
            }
        }, 550);
        let intervalId2 = setInterval(() => {
            if(this.shooting){
                for(let e of enemy){
                    for(let i = 0; i < this.magicObjArr.length; i++){
                        if(this.magicObjArr[i].isCollidingWith(e).bool){
                                e.life -= 10;
                                this.magicObjArr.splice(i, 1);
                        }
                    }
                }
            }
            for(let i = 0; i < potions.length; i++){
                if(this.isCollidingWith(potions[i]).bool){
                    console.log("hola");
                    this.life += 50;
                    potions.splice(i, 1);
                }
            }
        }, 10);
    }
}

class Magic{
    constructor(img, x, y){
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
    }

    move(direction){
        if(direction === L){
            this.x -= 6;
        }else{
            this.x += 6;
        }
    }
    isCollidingWith(obj){
        let collision = {bool: false};
        let distance = this.x - obj.x;
        if(distance >= 0){
            collision.direction = L;
        }else{
            collision.direction = R;
        }
        if (this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.height + this.y > obj.y) {
                collision.bool = true;
         }
         return collision;

    }
    ready(){
        for(let el of magicReady){
            if(el === false){
                return false;
            }
        }
        return true;
    }
}

class Potion{
    constructor(img, x, y){
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
    }
    ready(){
        for(let el of potionReady){
            if(el === false){
                return false;
            }
        }
        return true;
    }
}

addEventListener("keydown", (event) =>{
    switch(event.keyCode){
        case 38:
        case 32:
            if(!hero.jumping){
                hero.jump();
            }
            break;
        case 37:
            hero.move(L);
            break;
        case 39:
            hero.move(R);
            break;
        case 65:
            hero.raiseShield();
            break;
        case 83:
            hero.attack();
            break;
        case 68:
            if(!hero.swordAttack && !hero.shieldRaised){
                hero.shoot();
            }
            break;
        
    }

});

addEventListener("keyup", (event) =>{
    switch(event.keyCode){
        case 65:
            hero.lowerShield();
            break;
    }
});

hero = new Hero(HERO, R, canvas.width/2 - 100, FIRE, 150, 100, 100);
hero.run();


function render(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    if(bgReady){
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }
    if(hero.ready()){
        if(hero.img === characterImg[HERO][RS]){
            hero.width = 90;
            hero.height = 100;
            ctx.drawImage(hero.img, hero.x, hero.y, hero.width, hero.height);
        }else if(hero.img === characterImg[HERO][LS]){
            hero.width = 90;
            hero.height = 100;
            ctx.drawImage(hero.img, hero.x-20, hero.y, hero.width, hero.height);
        }else{
            hero.width = 70;
            hero.height = 100;
            ctx.drawImage(hero.img, hero.x, hero.y, hero.width, hero.height);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(10,10, hero.life*2, 20);
        ctx.fillStyle = "blue";
        ctx.fillRect(10,35, hero.magicka*3, 20);
        ctx.fillStyle = "green";
        ctx.fillRect(10,60, hero.stamina*3, 20);
    }

    if(hero.magicObjArr.length > 0){
        for(let magicObj of hero.magicObjArr){
            if(magicObj.ready()){
                ctx.drawImage(magicObj.img, magicObj.x, magicObj.y, magicObj.width, magicObj.height);
            }
        }
    }

    for(let i = 0; i < enemy.length; i++){
        if(enemy[i].ready()){
            if(enemy[i].img === characterImg[enemy[i].type][RS]){
                enemy[i].width = 90;
                enemy[i].height = 100;
                ctx.drawImage(enemy[i].img, enemy[i].x, enemy[i].y, enemy[i].width, enemy[i].height);
            }else if(enemy[i].img === characterImg[enemy[i].type][LS]){
                enemy[i].width = 90;
                enemy[i].height = 100;
                ctx.drawImage(enemy[i].img, enemy[i].x-20, enemy[i].y, enemy[i].width, enemy[i].height);
            }else{
                enemy[i].width = 70;
                enemy[i].height = 100;
                ctx.drawImage(enemy[i].img, enemy[i].x, enemy[i].y, enemy[i].width, enemy[i].height);
            }
            if(enemy[i].magicObjArr.length > 0){
                for(let magicObj of enemy[i].magicObjArr){
                    if(magicObj.ready()){
                        ctx.drawImage(magicObj.img, magicObj.x, magicObj.y, magicObj.width, magicObj.height);
                    }
                }
            }
            ctx.fillStyle = "red";
            ctx.fillRect(canvas.width - 310 ,10+25*i, enemy[i].life*(300/enemy[i].initialLife), 20);
        }
    }

    for(let i= 0; i < potions.length; i++){
        if(potions[i].ready()){
            ctx.drawImage(potions[i].img, potions[i].x, potions[i].y, potions[i].width, potions[i].height);
        }
    }
}

let enemy = [];
let runEnemy = true;
function startGame(){
    if(runEnemy){
        enemy.push(new Enemy(CRUSADER, L, canvas.width-70, FIRE, 100, 100, 100))
        setTimeout(()=>{
            enemy[0].run();
        }, 1000);
        runEnemy = false;
    }
    render();
    if(!isGameOver){
        requestAnimationFrame(startGame);
    }
}