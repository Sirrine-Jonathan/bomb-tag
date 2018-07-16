var config = {
    type: Phaser.AUTO,
    parent: 'playarea',
    //width: 800,
   // height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('ship', 'assets/playerShip3_red.png');
}

function create() {
    let self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    this.socket.on('currentPlayers', function(players){
        Object.keys(players).forEach((id) => {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        })
    });

    this.socket.on('newPlayer', function(playerInfo){
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function(playerId){
        self.otherPlayers.getChildren().forEach(function (otherPlayer){
            if (playerId === otherPlayer.playerId){
                otherPlayer.destroy();
            }
        })
    })
}

function update() {

}

function addPlayer(self, playerInfo){
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);

    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }

    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo){
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'ship')
        .setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }
    otherPlayers.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}