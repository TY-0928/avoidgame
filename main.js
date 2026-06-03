const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); 

// パラメータの定義
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 10;
const ENEMY_SIZE = 40;


const keys = {};
const enemies = [];
let gameRunning = true;
let score = 0;
let enemySpawnInterval = 500;
let enemyBaseSpeed = 1;

let highScore = Number(localStorage.getItem("highScore") || 0);

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// プレイヤーオブジェクト
const player = {
    x :canvas.width/2 - PLAYER_SIZE / 2,
    y :canvas.height/2- PLAYER_SIZE / 2,
    size: PLAYER_SIZE
};

// 押している間true
document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
    if(event.key.toLowerCase() === "r" && !gameRunning){
        restartGame();
    }
});
// 話すとfalse
document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

function updatePlayer(){
    if(keys["arrowleft"] || keys["a"]) player.x -= PLAYER_SPEED;
    if(keys["arrowright"] || keys["d"]) player.x += PLAYER_SPEED;
    if(keys["arrowup"] || keys["w"]) player.y -= PLAYER_SPEED;
    if(keys["arrowdown"] || keys["s"]) player.y += PLAYER_SPEED;

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function createEnemy(){
    if(!gameRunning){
        return;
    }
    let enemySpawnX = Math.random() * (canvas.width - ENEMY_SIZE);
    let enemySpeed = Math.floor(Math.random() * enemyBaseSpeed);
    if(enemySpeed < 1){
        enemySpeed = 1;
    }
    enemies.push({
        x: enemySpawnX,
        y: 0,
        size: ENEMY_SIZE,
        speed: enemySpeed
    });

    setTimeout(createEnemy, enemySpawnInterval);
}

function updateEnemies(){
    // 後ろから回すことで処理前の要素のインデックスがずれない
    for(let i = enemies.length -1; i >= 0; i--){
        enemies[i].y += enemies[i].speed;

        if(checkCollision(player, enemies[i])){
            gameOver();
        }

        if(enemies[i].y > canvas.height){
            enemies.splice(i, 1);
        }
    }
}

function checkCollision(player,enemy){
    return !(
        //　以下のいずれかの条件を満たせば衝突無し
        player.x + player.size <= enemy.x || // playerの右端とenemyの左端の判定
        player.x >= enemy.x + enemy.size  || // playerの左端とenemyの右端の判定
        player.y + player.size <= enemy.y || // playerの下端とenemyの上端の判定
        player.y >= enemy.y + enemy.size     // playerの上端とenemyの下端の判定
    );
}

function updateScore(){
    if(!gameRunning){
        return;
    }

    score++;

    if(score % 10 === 0){
        enemyBaseSpeed++;
        if(enemySpawnInterval > 100){
            enemySpawnInterval -= 100;
        }
    }

    setTimeout(updateScore, 1000);
}

function draw(){
    // 移動前の全オブジェクトを削除
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 移動後のオブジェクトを描画
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    ctx.fillStyle = "red";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width/2 - 50, 30);

    ctx.fillStyle = "yellow";
    ctx.fillText("High Score: " + highScore, canvas.width/2 - 60, 60);

    if (!gameRunning){
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 120, canvas.height/2);

        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", canvas.width/2 -100, canvas.height/2 + 40);
    }
}

function gameLoop(){
    if (gameRunning){
        updatePlayer();
        updateEnemies();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver(){
    gameRunning = false;

    if(score > highScore){
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
}

function restartGame() {
    enemies.length = 0;
    score = 0;
    enemyBaseSpeed = 5;
    enemySpawnInterval = 1000;
    player.x = canvas.width/2 - PLAYER_SIZE/2;
    player.y = canvas.height - 60;
    gameRunning = true;
    createEnemy();
    updateScore();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //player.x = Math.min(player.x, canvas.width - player.size);
    //player.y = Math.min(player.y, canvas.height - player.size);
}

createEnemy();
updateScore();
gameLoop();