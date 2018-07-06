class User {

	constructor(id, username, canvas){
		this.id = id;
		this.name = username;
		this.color = User.getRandomColor();
		this.it = false;
		this.speed = 2;
		this.size = 10;
		this.pos = {'x': canvas.width / 2,
					'y': canvas.height /2 };
		this.startPos = this.pos;
		this.canvas = {
			"width": canvas.width,
			"height": canvas.height
		};
		this.tagging = false;
	}

    static getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

}