const gameArea = document.getElementById("gameArea");

let score = 0;
let level = 1;
let lives = 3;
let lastLifeScore = 1000;
const LIFE_SCORE_INCREMENT = 1000;
const MAX_LIVES = 5;

const HIGH_SCORES_KEY = 'asteroidHighScores';
let highScores = [];

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

const levelElement = document.getElementById("level");

function loadHighScores() {
   const savedScores = localStorage.getItem(HIGH_SCORES_KEY);
   if (savedScores) {
       highScores = JSON.parse(savedScores);
   }
}

function saveHighScore(score, playerName) {
   highScores.push({ score, playerName });
   highScores.sort((a, b) => b.score - a.score);
   highScores = highScores.slice(0, 5);
   localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
}

function showHighScores() {
   let scoreText = "TOP 5 SCORURI:\n\n";
   highScores.forEach((entry, index) => {
       scoreText += `${index + 1}. ${entry.playerName}: ${entry.score}\n`;
   });
   alert(scoreText);
}

function checkHighScore(score) {
   return highScores.length < 5 || score > highScores[highScores.length - 1].score;
}
function updateScore(points) {
    score += points;
    scoreElement.textContent = `Scor: ${score}`;
    
    if(score >= lastLifeScore && lives < MAX_LIVES) {
        lives++;
        updateLives();
        alert("Ai primit o viață bonus!");
        lastLifeScore += LIFE_SCORE_INCREMENT;
    }
    
    if(score > level * 1000) {
        updateLevel();
    }
 }
 
 function updateLives() {
    livesElement.textContent = `Vieti: ${lives}`;
 }
 
 function updateLevel() {
    level++;
    levelElement.textContent = `Nivel: ${level}`;
    createNewAsteroids(2);
 }
 
 function resetShipPosition() {
    ship.x = 400;
    ship.y = 300;
    ship.rotation = 0;
    ship.makeInvincible();
 }
 
 function createNewAsteroids(count) {
    for(let i = 0; i < count; i++) {
        asteroids.push(new Asteroid());
    }
 }
 
 class Ship {
    constructor() {
        this.x = 400;
        this.y = 300;
        this.rotation = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.element = this.create();
    }
 
    create() {
        const ship = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        ship.setAttribute("points", "0,-10 5,10 -5,10");
        ship.setAttribute("fill", "white");
        gameArea.appendChild(ship);
        return ship;
    }
 
    update() {
        this.element.setAttribute("transform", 
            `translate(${this.x},${this.y}) rotate(${this.rotation})`);
            
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.element.setAttribute("fill", "white");
            }
        }
    }
 
    makeInvincible() {
        this.invincible = true;
        this.invincibleTimer = 120;
        this.element.setAttribute("fill", "gray");
    }
 
    fireMissile() {
        if(missiles.length < 3) {
            missiles.push(new Missile(this.x, this.y, this.rotation));
        }
    }
 }
class Asteroid {
    constructor() {
        if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? 0 : 800;
            this.y = Math.random() * 600;
        } else {
            this.x = Math.random() * 800;
            this.y = Math.random() < 0.5 ? 0 : 600;
        }
 
        this.hitPoints = Math.floor(Math.random() * (4 + Math.floor(level/2))) + 1;
        this.size = 20 + (this.hitPoints * 5);
        this.speedX = (Math.random() - 0.5) * (2 + level * 0.5);
        this.speedY = (Math.random() - 0.5) * (2 + level * 0.5);
        this.element = this.create();
    }
 
    create() {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", this.size);
        circle.setAttribute("fill", `rgb(${255 - this.hitPoints * 50}, ${255 - this.hitPoints * 50}, 255)`);
       
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", this.size * 0.8);
        text.textContent = this.hitPoints;
 
        group.appendChild(circle);
        group.appendChild(text);
        gameArea.appendChild(group);
        return group;
    }
 
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
 
        if(this.x < -this.size) this.x = 800 + this.size;
        if(this.x > 800 + this.size) this.x = -this.size;
        if(this.y < -this.size) this.y = 600 + this.size;
        if(this.y > 600 + this.size) this.y = -this.size;
 
        this.element.setAttribute("transform", `translate(${this.x},${this.y})`);
    }
 }
 
 class Missile {
    constructor(x, y, rotation) {
        this.x = x;
        this.y = y;
        this.speed = 7;
        const angle = rotation * Math.PI / 180;
        this.speedX = Math.sin(angle) * this.speed;
        this.speedY = -Math.cos(angle) * this.speed;
        this.element = this.create();
    }
 
    create() {
        const missile = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        missile.setAttribute("r", 2);
        missile.setAttribute("fill", "red");
        gameArea.appendChild(missile);
        return missile;
    }
 
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.element.setAttribute("transform", `translate(${this.x},${this.y})`);
    }
 
    remove() {
        gameArea.removeChild(this.element);
    }
 }
function checkCollision(miss, asteroid) {
    const dx = miss.x - asteroid.x;
    const dy = miss.y - asteroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size;
 }
 
 function checkShipCollision(ship, asteroid) {
    const dx = ship.x - asteroid.x;
    const dy = ship.y - asteroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < asteroid.size + 10;
 }
 
 function checkAsteroidCollision(asteroid1, asteroid2) {
    const dx = asteroid1.x - asteroid2.x;
    const dy = asteroid1.y - asteroid2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (asteroid1.size + asteroid2.size);
 }
 
 function handleAsteroidCollision(asteroid1, asteroid2) {
    let tempSpeedX = asteroid1.speedX;
    let tempSpeedY = asteroid1.speedY;
    
    asteroid1.speedX = asteroid2.speedX;
    asteroid1.speedY = asteroid2.speedY;
    
    asteroid2.speedX = tempSpeedX;
    asteroid2.speedY = tempSpeedY;
 }
 
 let asteroids = [];
 let missiles = [];
 
 function createInitialAsteroid() {
    for(let i = 0; i < 5; i++) {
        asteroids.push(new Asteroid());
    }
 }
 
 let ship = new Ship();
 loadHighScores();
function gameLoop() {
    ship.update();
    
    let shipCollision = false;
    asteroids.forEach(asteroid => {
        asteroid.update();
        if (checkShipCollision(ship, asteroid) && !ship.invincible) {
            shipCollision = true;
        }
    });
 
    for(let i = 0; i < asteroids.length; i++) {
        for(let j = i + 1; j < asteroids.length; j++) {
            if(checkAsteroidCollision(asteroids[i], asteroids[j])) {
                handleAsteroidCollision(asteroids[i], asteroids[j]);
            }
        }
    }
 
    if (shipCollision) {
        lives--;
        updateLives();
        
        if (lives <= 0) {
            if (checkHighScore(score)) {
                const playerName = prompt("Felicitări! Ai obținut un scor mare!\nIntroduceti numele:");
                if (playerName) {
                    saveHighScore(score, playerName);
                }
            }
            showHighScores();
            
            lives = 3;
            score = 0;
            lastLifeScore = 1000;
            level = 1;
            updateLives();
            updateScore(0);
            levelElement.textContent = `Nivel: ${level}`;
            resetShipPosition();
            
            asteroids.forEach(asteroid => {
                gameArea.removeChild(asteroid.element);
            });
            asteroids = [];
            createInitialAsteroid();
        } else {
            resetShipPosition();
        }
    }
   
    let asteroidsToRemove = [];
 
    missiles = missiles.filter(missile => {
        missile.update();
        
        if(missile.x < 0 || missile.x > 800 || missile.y < 0 || missile.y > 600) {   
            missile.remove();
            return false;
        }
 
        let missileHit = false;
        asteroids.forEach(asteroid => {
            if(checkCollision(missile, asteroid)) {
                asteroid.hitPoints--;
 
                const circle = asteroid.element.firstChild;
                circle.setAttribute("fill", 
                    `rgb(${255 - asteroid.hitPoints * 50}, ${255 - asteroid.hitPoints * 50}, 255)`);
                asteroid.element.lastChild.textContent = asteroid.hitPoints;
 
                if(asteroid.hitPoints <= 0) {
                    asteroidsToRemove.push(asteroid);
                }
                missileHit = true;
            }
        });
 
        if(missileHit) {
            missile.remove();
            return false;
        }
        return true;
    });
 
    asteroidsToRemove.forEach(asteroid => {
        const pointsValue = asteroid.size * 10;
        updateScore(pointsValue);
 
        gameArea.removeChild(asteroid.element);
        const index = asteroids.indexOf(asteroid);
        if(index > -1) {
            asteroids.splice(index, 1);
        }
        asteroids.push(new Asteroid());
    });
    
    requestAnimationFrame(gameLoop);
 }
 
 updateLives();
 createInitialAsteroid();
 
 gameLoop();
 
 document.addEventListener("keydown", (event) => {
    const speed = 5;
    switch(event.key) {
        case "ArrowLeft":
            ship.x = Math.max(0, ship.x - speed);
            break;
        case "ArrowRight":
            ship.x = Math.min(800, ship.x + speed);
            break;
        case "ArrowUp":
            ship.y = Math.max(0, ship.y - speed);
            break;
        case "ArrowDown":
            ship.y = Math.min(600, ship.y + speed);
            break;
        case 'z':
            ship.rotation -= 15;
            break;
        case 'c':
            ship.rotation += 15;
            break;
        case 'x':
            ship.fireMissile();
            break;
    }
 });
 