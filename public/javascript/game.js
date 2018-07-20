let game = new Phaser.Game(800, 500, Phaser.AUTO, 'playarea', {
    preload: preload,
    create: create,
    update: update
});

function preload() {
    game.load.image('background', 'assets/swirl_pattern.png');
    game.load.image('ship', 'assets/playerShip3_red.png');
}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0, 0, 1920, 1920, 'background');
    game.world.setBounds(0,0, 1920, 1920);
    otherPlayers = game.add.group();

    game.socket = io();
    game.socket.on('connect', console.log("connected"));
    game.socket.on('currentPlayers', (players) => {
        console.log("Players: ");
        Object.keys(players).forEach((p) => {
           console.log(players[p].name);
            newPlayer = game.add.sprite(10, 10, 'ship');
        });
    });

    game.socket.on('add')
}

function update() {

}

function render() {

}
