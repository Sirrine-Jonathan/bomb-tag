window.onload = function() {
    // game setup
    const frameRate = 60;
    let canvas = document.querySelector("#playarea");
    let ctx = canvas.getContext('2d');

    let loopHandle;

    function draw(timestamp) {
        setTimeout(function () {
            for (u in usersOnline) {
                usersOnline[u].draw(ctx);
            }
            loopHandle = window.requestAnimationFrame(draw);
        }, 1000 / frameRate);
    };
    //draw();
};