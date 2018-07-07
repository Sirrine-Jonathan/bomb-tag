class User {

    constructor(id, username, canvas){
        this.id = id;
        this.name = username;
        this.color = User.getRandomColor();
        this.canvas = {
            "width": canvas.width,
            "height": canvas.height
        };
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