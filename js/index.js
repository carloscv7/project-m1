document.getElementById("play-btn").addEventListener("click", startGame);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const R = 0, L = 1, RSH = 2, LSH = 3, RS = 4, LS = 5; 
const FIRE = 0;
const HERO = 0, CRUSADER = 1, PIRATE = 2;
let bgSrc = "../images/background.png", bgImg = new Image(), bgReady = false;
bgImg.src = bgSrc; 
bgImg.onload = function(){
    bgReady=true;
}
let magicSrc = ["../images/fire.png"], magicImg = [], magicReady = [];
let characterSrc = [["../images/derecha.png", "../images/izquierda.png",
"../images/derecha-escudo.png", "../images/izquierda-escudo.png",
"../images/derecha-espada.png", "../images/izquierda-espada.png"], 
["../images/e1-derecha.png", "../images/e1-izquierda.png",
"../images/e1-derecha-escudo.png", "../images/e1-izquierda-escudo.png",
"../images/e1-derecha-espada.png", "../images/e1-izquierda-espada.png"], 
["../images/e2-derecha.png", "../images/e2-izquierda.png",
"../images/e2-derecha-escudo.png", "../images/e2-izquierda-escudo.png",
"../images/e2-derecha-espada.png", "../images/e2-izquierda-espada.png"]], characterReady = [];
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



function gameOver(){

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
    get x(){
        return this._x;
    }
    get y(){
        return this._y;
    }
    move(direction){
        this.direction = direction;
            if(this.jumping){
                let i = 0;
                let intervalId = setInterval(() => {
                    if(direction === L){
                        this.x -= 20;
                    }else{
                        this.x += 20;
                    }
                    i++;
                    if(i === 7){
                        clearInterval(intervalId);
                    }
                }, 6);
            }else{
                if(direction === L){
                    this.x -= 6;
                }else{
                    this.x += 6;
                }
            }

            if(!this.shieldRaised){
                this.img = characterImg[this.type][direction];
            }else{
                if(direction === R){
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
                if(this._y > 250){
                    this._y -= 3;
                }
                if(this._y === 250){
                    clearInterval(intervalId);
                    intervalId = setInterval(() =>{
                        if(this._y < 400){
                            this._y += 3;
                        }
                        if(this._y === 400){
                            clearInterval(intervalId);
                            this.jumping = false;
                        }
                    },7);
                }
            }, 7);

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
        let intervalId2 = setInterval(()=>{
            if(this.stamina <= 10){
                this.lowerShield();
            }
            if(this.magicka < this.initialMagicka){
                this.magicka++;
            }
            if(this.stamina < this.initialStamina){
                this.stamina++;
            }
            if(this.life <= 0){
                clearInterval(intervalId2);
            }
        },100);
        let intervalId = setInterval(() => {
            let distance;
            distance = this._x - hero.x;
            if(Math.random() <= 0.7){
                this.follow(distance);
                this.raiseShield();
            }else{
                this.shoot();
            }

            if(this.isCollidingWith(hero).bool && this.direction === this.isCollidingWith(hero).direction){
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

            if(this.isCollidingWith(enemy[0]).bool && this.direction === this.isCollidingWith(enemy[0]).direction){
                if(enemy[0].shieldRaised){
                    enemy[0].life -= 5;
                    enemy[0].stamina -= 10;
                }else{
                    enemy[0].life -= 10;
                }
            }
            
        }
    }
    run(){
        let intervalId = setInterval(()=>{
            if(this.life <= 0){
                gameOver();
            }
            if(this.stamina <= 10){
                this.lowerShield();
            }
            if(this.life < this.initialLife){
                this.life += 0.5;
            }
            if(this.magicka < this.initialMagicka){
                this.magicka += 2;
            }
            if(this.stamina < this.initialStamina){
                this.stamina += 3;
            }
        }, 550);
        let intervalId2 = setInterval(() => {
            if(this.shooting){
                for(let i = 0; i < this.magicObjArr.length; i++){
                    if(this.magicObjArr[i].isCollidingWith(enemy[0]).bool){
                        enemy[0].life -= 10;
                        this.magicObjArr.splice(i, 1);
                    }
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
let enemy = [new Enemy(CRUSADER, L, canvas.width-70, FIRE, 100, 100, 100), new Character(PIRATE, L, canvas.width-70, FIRE, 100, 150, 70)];
setTimeout(()=>{
    enemy[0].run();
}, 2000);
setTimeout(()=>{
    //enemy[1].run();
}, 2000);



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

    if(enemy[0].ready()){
        if(enemy[0].img === characterImg[CRUSADER][RS]){
            enemy[0].width = 90;
            enemy[0].height = 100;
            ctx.drawImage(enemy[0].img, enemy[0].x, enemy[0].y, enemy[0].width, enemy[0].height);
        }else if(enemy[0].img === characterImg[CRUSADER][LS]){
            enemy[0].width = 90;
            enemy[0].height = 100;
            ctx.drawImage(enemy[0].img, enemy[0].x-20, enemy[0].y, enemy[0].width, enemy[0].height);
        }else{
            enemy[0].width = 70;
            enemy[0].height = 100;
            ctx.drawImage(enemy[0].img, enemy[0].x, enemy[0].y, enemy[0].width, enemy[0].height);
        }
        if(enemy[0].magicObjArr.length > 0){
            for(let magicObj of enemy[0].magicObjArr){
                if(magicObj.ready()){
                    ctx.drawImage(magicObj.img, magicObj.x, magicObj.y, magicObj.width, magicObj.height);
                }
            }
        }
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width - 310 ,10, enemy[0].life*3, 20);
    }
}

function startGame(){
    render();
    requestAnimationFrame(startGame);
}