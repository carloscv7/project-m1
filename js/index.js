document.getElementById("play-btn").addEventListener("click", startGame);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const R = 0, L = 1, RSH = 2, LSH = 3, RS = 4, LS = 5; 
const FIRE = 0;
const CRUSADER = 0, PIRATE = 1;
let bgSrc = "../images/background.png", bgImg = new Image(), bgReady = false;
bgImg.src = bgSrc; 
bgImg.onload = function(){
    bgReady=true;
}
let src = ["../images/derecha.png", "../images/izquierda.png",
"../images/derecha-escudo.png", "../images/izquierda-escudo.png",
"../images/derecha-espada.png", "../images/izquierda-espada.png"]
let magicSrc = ["../images/fire.png"], magicImg = [], magicReady = [];
let enemySrc = [["../images/e1-derecha.png", "../images/e1-izquierda.png",
"../images/e1-derecha-escudo.png", "../images/e1-izquierda-escudo.png",
"../images/e1-derecha-espada.png", "../images/e1-izquierda-espada.png"], 
["../images/e2-derecha.png", "../images/e2-izquierda.png",
"../images/e2-derecha-escudo.png", "../images/e2-izquierda-escudo.png",
"../images/e2-derecha-espada.png", "../images/e2-izquierda-espada.png"]], enemyImg = [], enemyReady = [];
let heroImg = [], heroReady = [];
for(let i = 0; i < src.length; i++){
    heroImg.push(new Image());
    heroImg[i].src = src[i];
    heroReady[i] = false;
    heroImg[i].onload = function(){
        heroReady[i] = true;
    }
}

for(let i = 0; i < magicSrc.length; i++){
    magicImg.push(new Image());
    magicImg[i].src = magicSrc[i];
    magicImg[i].onload = function(){
        magicReady[i] = true;
    }
}

for(let i = 0; i < enemySrc.length; i++){
    for(let j = 0; j < enemySrc[i].length; j++){
        enemyImg.push([]);
        enemyImg[i][j] = new Image();
        enemyImg[i][j].src = enemySrc[i][j];
        enemyReady.push([]);
        enemyImg[i][j].onload = function(){
            enemyReady[i][j] = true;
        }
    }
}

function gameOver(){

}

function isColliding(obj1, obj2){

}

class Character{
    constructor(type, direction, magic, magicka, stamina, x, life){
        this.life = life;
        this.type = type;
        this.width = 70;
        this.height = 100;
        this.img = enemyImg[this.type][direction];
        this.direction = direction;
        this.magic = magic;
        this.magicka = magicka;
        this.stamina = stamina;
        this.swordAttack = false;
        this.shieldRaised = false; 
        this.magicObjArr = [];
        this.jumping = false;
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
                this.img = enemyImg[this.type][direction];
            }else{
                if(direction === R){
                    this.img = enemyImg[this.type][RSH];
                }else{
                    this.img = enemyImg[this.type][LSH];
                }
            }
    }
    jump(){
        let intervalId;
        if(this._y === canvas.height-100){
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
    attack(){
        if(!this.swordAttack && this.stamina >= 20){
            this.stamina -= 20;
            if(this.direction === R){
                this.img = enemyImg[this.type][RS];
            }else{
                this.img = enemyImg[this.type][LS];
            }
            this.swordAttack = true;

            setTimeout(()=>{
                if(this.direction === R){
                    this.img = enemyImg[this.type][R]
                }else{
                    this.img = enemyImg[this.type][L];
                }
                this.swordAttack = false;
            }, 200);
            if(heroObj.shieldRaised){
                heroObj.life -= 3;
            }else{
                heroObj.life -= 10;
            }
        }
    }
    shoot(){
        if(this.magicka >= 50){
            this.lowerShield();
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
                }
            }, 10);
        }
    }
    raiseShield(){
        if(this.img === enemyImg[this.type][R] || this.img === enemyImg[this.type][RS]){
            this.img = enemyImg[this.type][RSH];
        }
        if(this.img === enemyImg[this.type][L] || this.img === enemyImg[this.type][LS]){
            this.img = enemyImg[this.type][LSH];
        }
        this.shieldRaised = true;
    }
    lowerShield(){
        this.img = enemyImg[this.type][this.direction];
        this.shieldRaised = false;
    }
    follow(distance){
        if(distance > 0 && distance >= heroObj.width){
            this.move(L);
        }
        if(distance < 0 && distance <= -(this.width)){
            this.move(R);
        }
    }
    run(){
        let intervalId2 = setInterval(()=>{
            if(this.magicka < 100){
                this.magicka++;
                this.stamina++;
            }
            if(this.life <= 0){
                clearInterval(intervalId2);
            }
        },100);
        let intervalId = setInterval(() => {
            let distance;
            distance = this._x - heroObj.x;
            if(Math.random() <= 0.7){
                this.follow(distance);
                this.raiseShield();
            }else{
                this.shoot();
            }

            if(this.isCollidingWith(heroObj).bool){
                this.attack();
            }

        }, 40);
        
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
        for(let el of enemyReady[this.type]){
            if(el === false){
                return false;
            }
        }
        return true;
    }
}

class Magic{
    constructor(img, x, y){
        this.img = img;
        this.x = x;
        this.y = y;
    }

    move(direction){
        if(direction === L){
            this.x -= 6;
        }else{
            this.x += 6;
        }
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

let heroObj = {
    img: heroImg[R],
    life: 150,
    magicka: 100,
    stamina: 100,
    direction: R,
    width: undefined,
    height: undefined,
    shieldRaised: false,
    swordAttack: false,
    shooting: false,
    magic: FIRE,
    magicObjArr: [],
    _x: canvas.width/2 - 50,
    _y: canvas.height - 100,
    jumping: false,
    set x(num){
        if(num >= 0 && num <= 900-70){
            this._x = num;
        }
    },
    get x(){
        return this._x;
    },
    get y(){
        return this._y;
    },
    move: function(direction){
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
                this.img = heroImg[direction];
            }else{
                if(direction === R){
                    this.img = heroImg[RSH];
                }else{
                    this.img = heroImg[LSH];
                }
            }
    },
    jump: function(){
        this.jumping = true;
        let intervalId;
        if(this._y === canvas.height-100){
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
    },
    attack: function(){
        if(!this.swordAttack && this.stamina >= 20){
            this.stamina -= 20;
            if(this.direction === R){
                this.img = heroImg[RS];
            }else{
                this.img = heroImg[LS];
            }
            this.swordAttack = true;

            setTimeout(()=>{
                if(this.direction === R){
                    this.img = heroImg[R]
                }else{
                    this.img = heroImg[L];
                }
                this.swordAttack = false;
            }, 200);

            if(isCollidingWith(enemy[0]).bool){
                if(enemy[0].shieldRaised){
                    enemy[0].life-= 5;
                }else{
                    enemy[0].life -= 10;
                }
            }
            
        }
    },
    shoot: function(){
        if(this.magicka >= 40){
            this.magicka -= 40;
            if(this.magic === FIRE){
                this.shooting = true;
                this.magicObjArr.push(new Magic(magicImg[FIRE], this._x + 40, this.y+40));
                let direction = this.direction;
                let magicObj = this.magicObjArr[this.magicObjArr.length-1];
                let intervalId = setInterval(()=>{
                    magicObj.move(direction);
                    if(magicObj.x < 0-30 || magicObj.x >= canvas.width){
                        this.magicObjArr.unshift();
                        clearInterval(intervalId);
                    }
                }, 10);
            }
        }
    },
    raiseShield: function(){
        if(this.img === heroImg[R] || this.img === heroImg[RS]){
            this.img = heroImg[RSH];
        }
        if(this.img === heroImg[L] || this.img === heroImg[LS]){
            this.img = heroImg[LSH];
        }
        this.shieldRaised = true;
    },
    lowerShield: function(){
        if(this.direction === R){
            this.img = heroImg[R];
        }else{
            this.img = heroImg[L];
        }
        this.shieldRaised = false;
    },
    run: function(){
        let intervalId = setInterval(()=>{
            if(this.life <= 0){
                gameOver();
            }
            if(this.life < 150){
                this.life += 1;
            }
            if(this.magicka < 100){
                this.magicka += 2;
            }
            if(this.stamina < 100){
                this.stamina += 2;
            }
        }, 550);
    },
    isCollidingWith: function(obj){
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

    },
    ready: function(){
        for(let el of heroReady){
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
            if(!heroObj.jumping){
                heroObj.jump();
            }
            break;
        case 37:
            heroObj.move(L);
            break;
        case 39:
            heroObj.move(R);
            break;
        case 65:
            heroObj.raiseShield();
            break;
        case 83:
            heroObj.attack();
            break;
        case 68:
            if(!heroObj.swordAttack && !heroObj.shieldRaised){
                heroObj.shoot();
            }
            break;
        
    }

});

addEventListener("keyup", (event) =>{
    switch(event.keyCode){
        case 65:
            heroObj.lowerShield();
            break;
    }
});

heroObj.run();
let enemy = [new Character(CRUSADER, L, FIRE, 100, 100, canvas.width-70, 100), new Character(PIRATE, L, FIRE, 150, 70, canvas.width-10, 100)];
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
    if(heroObj.ready()){
        if(heroObj.img === heroImg[RS]){
            heroObj.width = 90;
            heroObj.height = 100;
            ctx.drawImage(heroObj.img, heroObj.x, heroObj.y, heroObj.width, heroObj.height);
        }else if(heroObj.img === heroImg[LS]){
            heroObj.width = 90;
            heroObj.height = 100;
            ctx.drawImage(heroObj.img, heroObj.x-20, heroObj.y, heroObj.width, heroObj.height);
        }else{
            heroObj.width = 70;
            heroObj.height = 100;
            ctx.drawImage(heroObj.img, heroObj.x, heroObj.y, heroObj.width, heroObj.height);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(10,10, heroObj.life*2, 20);
        ctx.fillStyle = "blue";
        ctx.fillRect(10,35, heroObj.magicka*3, 20);
        ctx.fillStyle = "green";
        ctx.fillRect(10,60, heroObj.stamina*3, 20);
    }

    if(heroObj.magicObjArr.length > 0){
        for(let magicObj of heroObj.magicObjArr){
            if(magicObj.ready()){
                ctx.drawImage(magicObj.img, magicObj.x, magicObj.y, 30, 30);
            }
        }
    }

    if(enemy[0].ready()){
        if(enemy[0].img === enemyImg[CRUSADER][RS]){
            enemy[0].width = 90;
            enemy[0].height = 100;
            ctx.drawImage(enemy[0].img, enemy[0].x, enemy[0].y, enemy[0].width, enemy[0].height);
        }else if(enemy[0].img === enemyImg[CRUSADER][LS]){
            enemy[0].width = 90;
            enemy[0].height = 100;
            ctx.drawImage(enemy[0].img, enemy[0].x-20, enemy[0].y, enemy[0].width, enemy[0].height);
        }else{
            enemy[0].width = 70;
            enemy[0].height = 100;
            console.log(enemy[0].x)
            ctx.drawImage(enemy[0].img, enemy[0].x, enemy[0].y, enemy[0].width, enemy[0].height);
        }
        if(enemy[0].magicObjArr.length > 0){
            for(let magicObj of enemy[0].magicObjArr){
                if(magicObj.ready()){
                    ctx.drawImage(magicObj.img, magicObj.x, magicObj.y, 30, 30);
                }
            }
        }
    }
}

function startGame(){
    render();
    requestAnimationFrame(startGame);
}