Map = function(floor, wall, min_room_size, max_room_size, max_room_number) {
    
    this.floors = game.add.group();
    this.floor_image = floor;
    
    this.walls = game.add.group();
    this.walls.enableBody = true;
    //this.walls.scale.setTo(2,2)
    this.wall_image = wall;

    this.room_min_size = min_room_size;
    this.room_max_size = max_room_size;
    this.max_rooms = max_room_number;
    
    this.lastRoomCenter = {x:0, y:0};
    this.num_rooms = 0;
    this.num_tiles = 0;   
    
    this.makeMap();
}
Map.prototype.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
Map.prototype.Room = function(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;

    var center_x = (this.x1 + this.x2) / 2;
    var center_y = (this.y1 + this.y2) / 2;
    this.center_coords = {x: center_x, y: center_y};    
}
Map.prototype.createFloor = function(x, y) {
    fl = this.floors.create(x, y, this.floor_image);
    fl.scale.setTo(2,2);
    game.physics.arcade.enable(fl);
    game.physics.arcade.overlap(fl, this.walls, function(floor, wall) {
        wall.destroy();
    });    
}
Map.prototype.createRoom = function(x1, x2, y1, y2) {
    for (var x = x1; x<x2; x+=32) {
        for (var y = y1; y<y2; y+=32) {
            this.createFloor(x, y);
        }
    }    
}
Map.prototype.createHTunnel = function(x1, x2, y) {
    var min = Math.min(x1, x2);
    var max = Math.max(x1, x2);
    for (var x = min; x<max+16; x+=16) {
        this.createFloor(x, y);
    }    
}
Map.prototype.createVTunnel = function(y1, y2, x) {
    var min = Math.min(y1, y2);
    var max = Math.max(y1, y2);
    for (var y = min; y<max+16; y+=16) {
        this.createFloor(x, y);
    }    
}
Map.prototype.makeMap = function() {
    for (var y=0; y<game.world.height; y+= 32) {
        for (var x=0; x<game.world.width; x+=32) {
            var wall = this.walls.create(x, y, this.wall_image);
            wall.body.immovable = true;
        }
    }

    for (var r=0; r<this.max_rooms; r++) {
        var w = this.getRandom(this.room_min_size, this.room_max_size) * 32;
        var h = this.getRandom(this.room_min_size, this.room_max_size) * 32;

        x = this.getRandom(1, ((game.world.width) / 32) - (w/32 + 1)) * 32;
        y = this.getRandom(1, ((game.world.height) / 32) - (w/32 + 1)) * 32;

        this.createRoom(x, x+w, y, y+h);

        if (this.num_rooms == 0) {                
            //playState.player.x = x + (w/2);
            //playState.player.y = y + (h/2);
        } else {
            var new_x = game.math.snapToFloor(x + (w/2), 16);
            var new_y = game.math.snapToFloor(y + (h/2), 16);

            var prev_x = game.math.snapToFloor(this.lastRoomCoords.x, 16);
            var prev_y = game.math.snapToFloor(this.lastRoomCoords.y, 16);

            this.createHTunnel(prev_x, new_x, prev_y, prev_y);
            this.createVTunnel(prev_y, new_y, new_x);
        }

        this.lastRoomCoords = { x: x + (w/2), y: y + (h/2) };
        this.num_rooms++;
    }
}