class User {

	constructor(id, username, canvas, color){
		this.id = id;
		this.name = username;
		this.color = color;
		this.colorStore = color;
		this.it = false;
		this.speed = 2;
		this.size = 10;
		this.canvas = {
			"width": canvas.width,
			"height": canvas.height
		}
		this.time = User.startTime;
		this.initPos();
		User.cornerCount++;
	}

    initPos() {
        let corner = User.cornerCount % 4;
        let pos = { 'x': 0, 'y': 0 };
        switch(corner) {
			case 0:
                pos = {
                    'x': 0 + this.size,
                    'y': 0 + this.size
                };
                break;
            case 1:
                pos = {
                    'x': this.canvas.width - this.size,
                    'y': 0 + this.size
                };
                break;

            case 2:
                pos = {
                    'x': this.canvas.width - this.size,
                    'y': this.canvas.height - this.size
                };
                break;

            case 3:
                pos = {
                    'x': 0 + this.size,
                    'y': this.canvas.height - this.size
                };
                break;
            default:
                pos = {
                    'x': this.canvas.width / 2,
                    'y': this.canvas.height / 2
                };
        }

        this.startPos = { 'x': pos.x, 'y': pos.y };
        this.pos = { 'x': pos.x, 'y': pos.y };
    }

    getPosString(){
		return "(" + this.pos.x + ", " + this.pos.y + ")";
	}

    getStartPosString(){
        return "(" + this.startPos.x + ", " + this.startPos.y + ")";
    }

    toggleTag(){
		if (this.it){
			this.it = false;
			this.color = this.colorStore;
			this.speed = 2;
		} else {
			this.it = true;
			this.color = "#ff0000";
			if (this.time <= 50)
			    this.speed = 3;
		}
	}

}
User.cornerCount = 0;
User.startTime = 120; //seconds

module.exports = User;