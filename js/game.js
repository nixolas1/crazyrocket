var gameProperties = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
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

    fire1:{URL:'assets/particles/fire1.png', name:'fire1'},
    fire2:{URL:'assets/particles/fire2.png', name:'fire2'},
    fire3:{URL:'assets/particles/fire3.png', name:'fire3'},
    smoke:{URL:'assets/particles/smoke-puff.png', name:'smoke'},

};

var shipProperties = {
    startX: gameProperties.screenWidth * 0.5,
    startY: gameProperties.screenHeight * 0.5,
    acceleration: 40,
    drag: 0,
    maxVelocity: 200,

    angularAcceleration: 150,
    maxAngularVelocity: 200,
    angularDrag: 50,
};

var asteroidProperties = {
    startingAsteroids: 10,
    maxAsteroids: 20,
    incrementAsteroids: 2,
    
    asteroidLarge: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 20, nextSize: graphicAssets.asteroidMedium.name },
    asteroidMedium: { minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 50, nextSize: graphicAssets.asteroidSmall.name },
    asteroidSmall: { minVelocity: 50, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100 },
};

var gameState = function(game){
    this.shipSprite;
    this.key_left;
    this.key_right;
    this.key_thrust;

    this.emit = true;
    this.emitter;

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

        game.load.image(graphicAssets.fire1, graphicAssets.fire1.URL);
        game.load.image(graphicAssets.fire2, graphicAssets.fire2.URL);
        game.load.image(graphicAssets.fire3, graphicAssets.fire3.URL);
        game.load.image(graphicAssets.smoke, graphicAssets.smoke.URL);
    },
    
    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();

        this.resetAsteroids();
    },

    update: function () {
        this.checkPlayerInput();
        //this.checkBoundaries(this.shipSprite);
        game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration);
        this.asteroidGroup.forEachExists(this.checkBoundaries, this);

        if(this.emit){
            var px = this.shipSprite.body.velocity.x * -1;
            var py = this.shipSprite.body.velocity.y * -1;
            this.emitter.minParticleSpeed.set(px/10, py/10);
            this.emitter.maxParticleSpeed.set(px, py);

            var rad = this.shipSprite.body.rotation*0.01745329252;
            var pos = this.shipSprite.body.height*0.6;
            this.emitter.emitX = this.shipSprite.x - Math.cos(rad)*pos;
            this.emitter.emitY = this.shipSprite.y - Math.sin(rad)*pos;
        }
    },

    initGraphics: function () {
        this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
        this.shipSprite.angle = -90;
        this.shipSprite.anchor.set(0.5, 0.5); 

        this.asteroidGroup = game.add.group();

        if(this.emit){
            this.emitter = game.add.emitter(game.world.centerX, game.world.centerY, 400);
            this.emitter.makeParticles( [ graphicAssets.fire1, graphicAssets.fire2, graphicAssets.fire3, graphicAssets.smoke ] );
            this.emitter.gravity = 0;
            this.emitter.setAlpha(0.8, 0, 3000);
            this.emitter.setScale(0.1, 0, 0.1, 0, 3000);
            this.emitter.start(false, 3000, 5);
        }
    },


    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);

        this.shipSprite.body.collideWorldBounds = true;
        this.shipSprite.body.bounce.set(0.5);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);
        this.shipSprite.body.maxAngular = shipProperties.maxAngularVelocity;
        this.shipSprite.body.angularDrag = shipProperties.angularDrag;

        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    },



    initKeyboard: function () {
        this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    },

    checkPlayerInput: function () {
        if (this.key_left.isDown) {
            this.shipSprite.body.angularAcceleration = -shipProperties.angularAcceleration;
        } else if (this.key_right.isDown) {
            this.shipSprite.body.angularAcceleration = shipProperties.angularAcceleration;
        } else {
            this.shipSprite.body.angularAcceleration = 0;
        }
        
        if (this.key_thrust.isDown) {
            //game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration);
        } else {
            //this.shipSprite.body.acceleration.set(0);
        }
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