class User {
    constructor(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight){
        this.xView = xView || 0;
        this.yView = yView || 0;
        this.xDeadZone = 0;
        this.yDeadZone = 0;
        this.wView = canvasWidth;
        this.hView = canvasHeight;
        this.axis = "both";
        this.followed = null;
        //this.viewportRect =

    }
}