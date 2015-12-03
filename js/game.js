var gameProperties = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    maxGameSize: 800,
    scale: 0.9,
    minRoomSize: 3,
    maxRoomSize: 5,
    minNumRooms: 10,
};

var states = {
    game: "game",
};

var graphicAssets = {
    ship:{URL:'assets/ship2.png', name:'ship'},
    bullet:{URL:'assets/bullet.png', name:'bullet'},    
    
    asteroidLarge:{URL:'assets/asteroidLarge.png', name:'asteroidLarge'},
    asteroidMedium:{URL:'assets/asteroidMedium.png', name:'asteroidMedium'},
    asteroidSmall:{URL:'assets/asteroidSmall.png', name:'asteroidSmall'},

    floor:{URL:'assets/floor1.png', name:'floor'},

    fire1:{URL:'assets/particles/fire1.png', name:'fire1'},
    fire2:{URL:'assets/particles/fire2.png', name:'fire2'},
    fire3:{URL:'assets/particles/fire3.png', name:'fire3'},
    smoke:{URL:'assets/particles/smoke-puff.png', name:'smoke'},

};

var shipProperties = {
    startX: gameProperties.screenWidth * 0.5,
    startY: gameProperties.screenHeight * 0.5,
    acceleration: 50,
    drag: 2,
    maxVelocity: 190,

    angularAcceleration: 300,
    maxAngularVelocity: 350,
    angularDrag: 120,

    startHP: 1000,
    hp: 1000,
    damageMultiplier: 5,
};

var asteroidProperties = {
    startingAsteroids: 10,
    maxAsteroids: 20,
    incrementAsteroids: 2,
    
    asteroidLarge: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 20, nextSize: graphicAssets.asteroidMedium.name },
    asteroidMedium: { minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 50, nextSize: graphicAssets.asteroidSmall.name },
    asteroidSmall: { minVelocity: 50, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100 },
};

var fontAssets = {
    counterFontStyle:{font: '20px Arial', fill: '#FFFFFF', align: 'center'},
};

var gameState = function(game){
    this.ship;
    this.key_left;
    this.key_right;
    this.key_thrust;

    this.emit = true;
    this.emitter;

    this.asteroid = false;
    this.asteroidGroup;
    this.asteroidsCount = asteroidProperties.startingAsteroids;
};

gameState.prototype = {
    
    preload: function () {
        game.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
        game.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
        game.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidSmall.URL);
        
        game.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL);
        game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL);

        game.load.image(graphicAssets.floor.name, graphicAssets.floor.URL);

        game.load.image(graphicAssets.fire1.name, graphicAssets.fire1.URL);
        game.load.image(graphicAssets.fire2.name, graphicAssets.fire2.URL);
        game.load.image(graphicAssets.fire3.name, graphicAssets.fire3.URL);
        game.load.image(graphicAssets.smoke.name, graphicAssets.smoke.URL);
    },
    
    create: function () {
        game.world.setBounds(0, 0, gameProperties.maxGameSize, gameProperties.maxGameSize);
        this.map = new Map("", "floor", gameProperties.minRoomSize, gameProperties.maxRoomSize, gameProperties.minNumRooms);

        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();

        if(this.asteroid)
            this.resetAsteroids();
    },

    update: function () {
        this.checkPlayerInput();
        //this.checkBoundaries(this.ship);
        game.physics.arcade.collide(this.ship, this.map.walls, this.collided, null, this);
        //game.physics.arcade.overlap(this.ship, this.map.walls, this.collided, null, this);
        
        game.physics.arcade.accelerationFromRotation(this.ship.rotation, shipProperties.acceleration, this.ship.body.acceleration);
        
        if(this.asteroid)
            this.asteroidGroup.forEachExists(this.checkBoundaries, this);

        if(this.emit){

            var rad = this.ship.body.rotation*0.01745329252;
            var pos = this.ship.body.height*0.8;
            var dirx = Math.cos(rad)*pos;
            var diry = Math.sin(rad)*pos
            var px = this.ship.body.velocity.x * -1 - dirx*shipProperties.acceleration*0.5;
            var py = this.ship.body.velocity.y * -1 - diry*shipProperties.acceleration*0.5;
            this.emitter.minParticleSpeed.set(px/10, py/10);
            this.emitter.maxParticleSpeed.set(px, py);

            this.emitter.emitX = this.ship.x - dirx;
            this.emitter.emitY = this.ship.y - diry;
        }

        this.ship_lives.setText("HP: " + Math.round(shipProperties.hp));
    },

    initGraphics: function () {
        this.ship = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
        this.ship.angle = -90;
        this.ship.scale.setTo(gameProperties.scale, gameProperties.scale);
        this.ship.anchor.set(0.5, 0.5); 
        gameProperties.hp = gameProperties.startHP;

        this.asteroidGroup = game.add.group();

        if(this.emit){
            this.emitter = game.add.emitter(game.world.centerX, game.world.centerY, 100);
            this.emitter.makeParticles( [ graphicAssets.fire1.name, graphicAssets.fire2.name, graphicAssets.fire3.name, graphicAssets.smoke.name ] );
            this.emitter.gravity = 0;
            this.emitter.setAlpha(1, 0, 1000);
            this.emitter.setScale(0.1, 0, 0.1, 0, 1000);
            this.emitter.start(false, 1000, 5);
        }

        game.camera.follow(this.ship);

        this.ship_lives = game.add.text(20, 10, "HP: "+shipProperties.hp, fontAssets.counterFontStyle);
        this.ship_lives.fixedToCamera = true;
    },


    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.physics.enable(this.ship, Phaser.Physics.ARCADE);

        this.ship.body.collideWorldBounds = true;
        this.ship.body.bounce.set(0.5);
        this.ship.body.drag.set(shipProperties.drag);
        this.ship.body.maxVelocity.set(shipProperties.maxVelocity);
        this.ship.body.maxAngular = shipProperties.maxAngularVelocity;
        this.ship.body.angularDrag = shipProperties.angularDrag;

        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    },



    initKeyboard: function () {
        this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_brake = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    },

    checkPlayerInput: function () {
        if (this.key_left.isDown) {
            this.ship.body.angularAcceleration = -shipProperties.angularAcceleration;
        } else if (this.key_right.isDown) {
            this.ship.body.angularAcceleration = shipProperties.angularAcceleration;
        } else {
            this.ship.body.angularAcceleration = 0;
        }
        
        if (this.key_brake.isDown) {
            this.ship.body.acceleration.set(0);
        } else {
            //this.ship.body.acceleration.set(0);
        }
    },

    resetShip: function () {
        this.ship.x = shipProperties.startX;
        this.ship.y = shipProperties.startY;
        this.ship.angle = -90;
        this.ship.body.angularVelocity = 0;
        this.ship.body.velocity.set(0);
        this.ship.body.acceleration.set(0);
        shipProperties.hp = shipProperties.startHP;
    },

    collided: function(target, wall){
        //todo: calc direction of collision: less dmg if hits bottom end, 
        //todo: use acceleration of collision impact instead of speed
        shipProperties.hp -= target.body.speed * shipProperties.damageMultiplier;
        if(shipProperties.hp <= 0){
            this.resetShip();
            console.log("deaded");
            return false;
        }
        return true;
    },

    checkBoundaries: function (sprite) {
        if (sprite.x < 0) {
            sprite.x = game.width;
        } else if (sprite.x > game.width) {
            sprite.x = 0;
        } 
 
        if (sprite.y < 0) {
            sprite.y = game.height;
        } else if (sprite.y > game.height) {
            sprite.y = 0;
        }
    },

    createAsteroid: function (x, y, size) {
        var asteroid = this.asteroidGroup.create(x, y, size);
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);
 
        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);
 
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
    },

    resetAsteroids: function () {
        for (var i=0; i < this.asteroidsCount; i++ ) {
            var side = Math.round(Math.random());
            var x;
            var y;
            
            if (side) {
                x = Math.round(Math.random()) * gameProperties.screenWidth;
                y = Math.random() * gameProperties.screenHeight;
            } else {
                x = Math.random() * gameProperties.screenWidth;
                y = Math.round(Math.random()) * gameProperties.screenHeight;
            }
            
            asteroids = [graphicAssets.asteroidLarge.name, graphicAssets.asteroidMedium.name, graphicAssets.asteroidSmall.name]
            this.createAsteroid(x, y, asteroids[Math.round(Math.random()) * 2]);
        }
    },

};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.game, gameState);
game.state.start(states.game);