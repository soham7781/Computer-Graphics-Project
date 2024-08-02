let graveImg, underwaterImg, fishImg;
let foods = [];
let animals = [];
let dragConstant;

function preload() {
    graveImg = loadImage("grave.png");
    underwaterImg = loadImage("underwater.jpg");
    fishImg = loadImage("fish1.svg");
}

class Animal {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.ux = 0;
        this.vx = 0;
        this.alive = true;
        this.EnergyDensity = 100000;
        this.radius = radius;
        this.SearchForFoods();
    }

    GetEnergyConsumptionPerFrame() {
        let speed = this.GetSpeed();
        return this.GetMass() * speed * speed / 2;
    }

    GetMass() {
        return this.radius * this.radius * this.radius;
    }

    GetSpeed() {
        return 60 / this.radius;
    }

    Move() {
        this.vx = this.GetSpeed() * this.ux;
        this.vy = this.GetSpeed() * this.uy;
        let closerFood = foods[this.closerFoodIndex];
        if (closerFood) {
            let thisX_rFood = this.x - closerFood.x;
            let nextThisX_rFood = this.x + this.vx - closerFood.x;
            if (thisX_rFood * nextThisX_rFood < 0) {
                this.x = closerFood.x;
                this.y = closerFood.y;
            } else {
                this.x += this.vx;
                this.y += this.vy;
            }
            this.radius = Math.cbrt(this.GetMass() - this.GetEnergyConsumptionPerFrame() / this.EnergyDensity);
            if (this.radius < 5) {
                return false;
            }
        } else {
            this.ux = 0;
            this.uy = 0;
        }
        return true;
    }

    DetectColisionWithFood() {
        let closerFood = foods[this.closerFoodIndex];
        if (!closerFood) return;
        let dx = this.x - closerFood.x;
        let dy = this.y - closerFood.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + closerFood.radius) {
            this.Eat();
        }
    }

    Eat() {
        let closerFood = foods[this.closerFoodIndex];
        foods.splice(this.closerFoodIndex, 1);
        this.radius = Math.cbrt(this.GetMass() + closerFood.GetMass());
        forEvery(animals, (animal) => animal.SearchForFoods());
    }

    SearchForFoods() {
        this.closerFoodIndex = this.calculateCloserFoodIndex();
        this.UpdateVelocity();
    }

    UpdateVelocity() {
        let closerFood = foods[this.closerFoodIndex];
        if (!closerFood) {
            this.ux = 0;
            this.uy = 0;
            return;
        }
        let dx = closerFood.x - this.x;
        let dy = closerFood.y - this.y;
        let distanceSquared = dx * dx + dy * dy;
        let distance = Math.sqrt(distanceSquared);
        let factor = 1 / distance;
        this.ux = dx * factor;
        this.uy = dy * factor;
    }

    calculateCloserFoodIndex() {
        let closerFoodIndex, dx, dy, distanceSquared, minDistanceSquared;
        if (foods.length > 0)
            minDistanceSquared = Math.pow(this.x - foods[0].x, 2) + Math.pow(this.y - foods[0].y, 2);
        closerFoodIndex = 0;
        for (let i = 0; i < foods.length; i++) {
            dx = this.x - foods[i].x;
            dy = this.y - foods[i].y;
            distanceSquared = dx * dx + dy * dy;
            if (distanceSquared < minDistanceSquared) {
                minDistanceSquared = distanceSquared;
                closerFoodIndex = i;
            }
        }
        return closerFoodIndex;
    }

    Draw() {
        if (this.alive) {
            function flipConstant(ux) {
                return ux > 0 ? -1 : 1;
            }
            translate(this.x, this.y);
            let angle = Math.atan2(-this.uy, -this.ux);
            rotate(angle);
            scale(1, flipConstant(this.ux));
            imageMode(CENTER);
            image(fishImg, 0, 0, this.radius * 2, this.radius * 2);
            scale(1, flipConstant(this.ux));
            rotate(-angle);
            translate(-this.x, -this.y);
        } else {
            imageMode(CENTER);
            image(graveImg, this.x, this.y, this.radius * 4, this.radius * 4);
        }
    }
}

class Food {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    Draw() {
        fill(150, 150, 20);
        ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    }

    GetMass() {
        return this.radius * this.radius * this.radius;
    }
}

function generateRandomFood() {
    return new Food(random() * width, random() * height, random() * 14 + 4);
}

function generateRandomAnimal() {
    return new Animal(random() * width, random() * height, random() * 30 + 10);
}

function setup() {
    frameRate(180);
    pixelDensity(1);
    createCanvas(1400, 700);
    dragConstant = 1; //drag coeficient * gravity
    for (let i = 0; i < 20; i++) {
        foods.push(generateRandomFood());
    }
    for (let i = 0; i < 5; i++) {
        animals.push(generateRandomAnimal());
    }
    animate();
}

function forEvery(array, Function) {
    for (let i = 0; i < array.length; i++) {
        Function(array[i]);
    }
}

function animate() {
    imageMode(CORNER);
    image(underwaterImg, 0, 0, width, height);
    forEvery(foods, (food) => food.Draw());
    for (let i = 0; i < animals.length; i++) {
        if (animals[i].alive) {
            if (animals[i].Move()) {
                animals[i].DetectColisionWithFood();
            } else {
                console.log("Death");
                animals[i].alive = false;
            }
        }
        animals[i].Draw();
    }
    requestAnimationFrame(animate);
}

function mouseReleased() {
    foods.push(new Food(mouseX, mouseY, random() * 7 + 2));
    forEvery(animals, (animal) => animal.SearchForFoods());
}
