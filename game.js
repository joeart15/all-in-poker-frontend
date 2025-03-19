class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('playerVideo');
        this.score = 0;
        this.gameOver = false;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = 0.8;
        this.jumpForce = -15;
        this.ground = 300;
        this.player = {
            x: 100,
            y: this.ground,
            width: 40,
            height: 60,
            speed: 5
        };
        this.bullets = [];
        this.obstacles = [];
        this.obstacleSpeed = 5;
        this.lastObstacleSpawn = 0;
        this.obstacleSpawnInterval = 2000;

        this.setupEventListeners();
        this.setupVideo();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    async setupVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                } 
            });
            this.video.srcObject = stream;
        } catch (err) {
            console.error('Error accessing camera:', err);
            // Fallback to a placeholder if video is not available
            this.video.style.display = 'none';
        }
    }

    resizeCanvas() {
        const gameArea = this.canvas.parentElement;
        this.canvas.width = gameArea.offsetWidth;
        this.canvas.height = gameArea.offsetHeight;
        this.ground = this.canvas.height - 100; // Adjust ground position based on canvas height
        if (!this.gameOver) {
            this.player.y = this.ground;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (this.gameOver) {
                    this.restart();
                } else if (!this.isJumping) {
                    this.jump();
                }
            }
            if (e.code === 'KeyX' && !this.gameOver) {
                this.shoot();
            }
        });

        // Touch controls for mobile
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver) {
                this.restart();
            } else if (!this.isJumping) {
                this.jump();
            }
        });
    }

    jump() {
        this.isJumping = true;
        this.jumpVelocity = this.jumpForce;
    }

    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width,
            y: this.player.y + this.player.height / 2,
            width: 10,
            height: 5,
            speed: 10
        });
    }

    spawnObstacle() {
        const now = Date.now();
        if (now - this.lastObstacleSpawn > this.obstacleSpawnInterval) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.ground,
                width: 30,
                height: 40
            });
            this.lastObstacleSpawn = now;
        }
    }

    update() {
        if (this.gameOver) return;

        // Update player position
        if (this.isJumping) {
            this.player.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.player.y >= this.ground) {
                this.player.y = this.ground;
                this.isJumping = false;
            }
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.speed;
            return bullet.x < this.canvas.width;
        });

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.obstacleSpeed;
            return obstacle.x > -obstacle.width;
        });

        // Spawn new obstacles
        this.spawnObstacle();

        // Check collisions
        this.checkCollisions();

        // Update score
        this.score++;
    }

    checkCollisions() {
        // Check bullet-obstacle collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            this.obstacles.forEach((obstacle, obstacleIndex) => {
                if (this.isColliding(bullet, obstacle)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.obstacles.splice(obstacleIndex, 1);
                    this.score += 100;
                }
            });
        });

        // Check player-obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver = true;
                document.getElementById('gameOver').style.display = 'block';
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.ground, this.canvas.width, this.canvas.height - this.ground);

        // Draw player with college colors
        this.ctx.fillStyle = '#003366'; // College blue
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw bullets
        this.ctx.fillStyle = '#FFD700'; // College gold
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw obstacles
        this.ctx.fillStyle = '#CC0000'; // College red
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Update score display
        document.getElementById('scoreValue').textContent = Math.floor(this.score / 10);
    }

    restart() {
        this.score = 0;
        this.gameOver = false;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.player.y = this.ground;
        this.bullets = [];
        this.obstacles = [];
        this.lastObstacleSpawn = 0;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('finalScore').textContent = Math.floor(this.score / 10);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
const game = new Game();
game.gameLoop(); 