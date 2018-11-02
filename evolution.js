// World variables
var world_width = 16;
var world_height = 16;
var pixel_size = 1;
var smooth_amount = 5; // how many times to run the smoothing algorithm
var expansion_amount = 4; // How many times the map is zoomed in
var expansion_rate = 2; // How much larger each pixel on the map is made
var water_percentage = 0.5;
var landColour = "#77aa33";
var waterColour = "#003377";
var worldMargin = 16;

// Arrays
var world_array = []; // This array contains each row of the world as a subarray
var animal_array = []; // This array holds a subarray for each animal with the following details: mySpecies, myXPos, myYPos, myHealth, myBreedStat, myMaxHealth, myMaxBreed, mySpeed, myStrength
var holding_array = []; // Holds a copy of the world array while performing smoothing
var temp_array = [];
var yArray = [];

// Animal variables
var animal_species = ["raptor","#FF0000",5,5,5,10,"cat","#FFFF00",3,8,3,7,"snail","#00FF00",1,1,1,1,"turtle","#FF00FF",10,1,1,15,"spider","#000000",1,1,10,10]; 
//  each species has the following attributes: name, colour, max health, speed, strength, breed rate
var animal_species_offset = 6;
var species_count = animal_species.length / animal_species_offset;
var start_population = 100;
var hive_size = worldMargin / 2;
var animalAttributeCount = 9; // How many attributes each animal has stored in animal_array

// Define canvas variables
var CANVAS_WIDTH = Math.floor(window.innerHeight * .8);
var CANVAS_HEIGHT = Math.floor(window.innerHeight * .5);
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.style.width = CANVAS_WIDTH + "px";
c.style.height = CANVAS_HEIGHT + "px";
ctx.canvas.width = CANVAS_WIDTH;
ctx.canvas.height = CANVAS_HEIGHT;


var testColour ="#FF0000" ;
var clearScreen = function() {
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
};

// Create world
var createWorld = function() {
	fillArray();
	for (w = 0; w < smooth_amount; w++) {
			smoothArray();
	}
	
	addBorder();
		
	for (z = 0; z < expansion_amount; z++) {
		expandArray();
		smoothArray();
	}
};

var addBorder = function() {
	for (x = 0; x < world_width; x++) {
		world_array[x][0] = "water";
		world_array[x][world_height - 1] = "water";
	}
	
	for (y = 0; y < world_height; y++) {
		world_array[0][y] = "water";
		world_array[world_width - 1][y] = "water";
	}
};

var expandArray = function () {
	temp_array = [];
	for (x = 0; x < world_width; x++) {
		yArray = [];
		for (y = 0; y < world_height; y++) {
			var holder = world_array[x][y];
			for (q = 0; q < expansion_rate; q++) {
				var yPosition = y * expansion_rate + q;
				yArray[yPosition] = holder;
			}			
		}

		for (qq = 0; qq < expansion_rate; qq++) {
			var xPosition = x * expansion_rate + qq;
			temp_array[xPosition] = yArray;
		}		
	}
	world_array = temp_array;
	holding_array = world_array;
	world_height = world_height * expansion_rate;
	world_width = world_width * expansion_rate;
};

// Populate world
var populateWorld = function() {
	for (f = 0; f < species_count; f++) {
		for (g = 0; g < start_population; g++) {
			
			var newX = Math.floor(Math.random() * (world_width - (worldMargin * 2)) + worldMargin);
			var	newY = Math.floor(Math.random() * (world_height - (worldMargin * 2)) + worldMargin);
			var newAnimal = world_array[newX][newY];
			
			do {
				newX = Math.floor(Math.random() * world_width);
				newY = Math.floor(Math.random() * world_height);
				newAnimal = world_array[newX][newY];
			} while (newAnimal != "land")
				
			spawnAnimal(f,newX,newY);
			
		}
	}
};

var spawnAnimal = function (speciesNumber, xPos,yPos) {
	world_array[xPos][yPos] = animal_species[speciesNumber * animal_species_offset];
	
	var newAnimal = {
		mySpecies:speciesNumber,
		xPosition:xPos,
		yPosition:yPos,
		myHealth:animal_species[speciesNumber * animal_species_offset + 2],
		myBreedStat:0,
		myMaxHealth:animal_species[speciesNumber * animal_species_offset + 2],
		myMaxBreed:animal_species[speciesNumber * animal_species_offset + 5],
		mySpeed:animal_species[speciesNumber * animal_species_offset + 3],
		myStrength:animal_species[speciesNumber * animal_species_offset + 4]
	};
	
	animal_array.push(newAnimal);
};

var killAnimal = function (arrayPos) {
	animal_array.splice(arrayPos, animalAttributeCount);
};

var runAI = function () {
	for (animalAIloop = 0; animalAIloop < animal_array.length; animalAIloop++) {
		var currentAnimal = animal_array[animalAIloop];
		var xDirection = Math.floor(Math.random() * 3) - 1;
		var yDirection = Math.floor(Math.random() * 3) - 1;

		var newXPos = currentAnimal.xPosition + xDirection;
		var newYPos = currentAnimal.yPosition + yDirection;
		var checkLocation = world_array[newXPos][newYPos];
		var mySpecies = animal_species[currentAnimal.mySpecies * animal_species_offset];
		if (checkLocation != "land") {
			if (checkLocation == mySpecies) {
				currentAnimal.myBreedStat++;
			} else {
				
			}
		} else {			
			if (currentAnimal.myBreedStat > currentAnimal.myMaxBreed) {
				spawnAnimal(currentAnimal.mySpecies,currentAnimal.xPosition,currentAnimal.yPosition);
				currentAnimal.myBreedStat = 0;
			} else {
				world_array[currentAnimal.xPosition][currentAnimal.yPosition] = "land";
			}			
			world_array[newXPos][newYPos] = animal_species[currentAnimal.mySpecies * animal_species_offset];
			currentAnimal.yPosition = newYPos;
			currentAnimal.xPosition = newXPos;
		}
	}
}
// Run the following animal AI for each animal alive
// var animalCount = animal_array.length / 5;
// for (int i; i<animalCount; i++) {
// Try to move in a random direction
// If there's something there, what is it?
// If it's water, then increase my health stat
// If it's a friend, then increase my breed stat
// If it's a foe, then decrease my health stat
// else move to that spot
// Check my health
// If it's too low then I die
// If it's above the maximum allowed then increase my breed stat and reduce my health stat a few notches
// Check my breed stat
// If it's above the breed threshold, then reduce my breed stat to 0 and:
// Check the directions around me:
// If one of those directions is empty then spawn a new animal with my stats mutated


// Fill the world array with random noise marking water and land 
var fillArray = function() { 
	for (x = 0; x < world_width; x++) {
		yArray = [];
		for (y = 0; y < world_height; y++) {
			var randomiser = Math.random();
			if (randomiser > water_percentage) {
				yArray[y] = "land";
			} else {
				yArray[y] = "water";
			} 
		}
		world_array[x] = yArray;
		holding_array[x] = yArray;
	}
};

// Smooth out the noise in the world array 
var smoothArray = function () {
	holding_array = world_array;
	for (y = 0; y < world_height; y++) {
		for (x = 0; x < world_width; x++) {
			var neighbours = countNeighbours(x,y);

			if (world_array[x][y] == "water" && neighbours > 4) {
				holding_array[x][y] = "water";
			}  else if (world_array[x][y] == "land" && neighbours > 5){
				holding_array[x][y]="water";
			} else {
				holding_array[x][y]="land";
			}
		}
	}
	
	for (y = 0; y < world_height; y++) {
		for (x = 0; x < world_width; x++) {
			world_array[x][y] = holding_array[x][y];
		}
	}
};

var countNeighbours = function(x,y) {

	var neighbourCount = 0;
	
	for (j = -1; j < 2; j++) {
		for (k = -1; k < 2; k++) {
			var checking = checkNeighbour2d(x,y,j,k);
			if (checking == 1) {
				neighbourCount++;
			}
		}
	}
	return neighbourCount;
};

var checkNeighbour2d = function (checkX, checkY, xOffset,yOffset) {
	var returnValue = 0;
	var checkingX = checkX + xOffset;
	var checkingY = checkY + yOffset;
	
	if (checkingX < 0 || checkingX > world_width - 1) {
		returnValue = 1;
	} else if (checkingY < 0 || checkingY > world_height - 1) {
		returnValue = 1;
	} else if (world_array[checkingX][checkingY] != "land") {
		returnValue = 1;
	}
	
	return returnValue;
};

var render = function() {
	clearScreen();
	for (y = 0; y < world_height; y++) {
		for (x = 0; x < world_width; x++) {
			var checkPoint = world_array[x][y];
			if (checkPoint == "water") {
				pointColour = waterColour;
			} else {
				pointColour = landColour;
			}
			
			ctx.fillStyle = pointColour;
			ctx.fillRect(x * pixel_size,y * pixel_size,pixel_size,pixel_size );
		} 
	}
	
	for (animalCheck = 0; animalCheck < animal_array.length; animalCheck++) {
		var thisAnimal = animal_array[animalCheck];
		ctx.fillStyle = animal_species[thisAnimal.mySpecies * animal_species_offset + 1];	
		ctx.fillRect(thisAnimal.xPosition,thisAnimal.yPosition,pixel_size, pixel_size);
	}
};

var start = function () {
	createWorld();
	populateWorld();
	render();
	setInterval(function() {update()},1);
};

var update = function () {
	runAI();
	render();
};

var buttonPress = function(e) {
	
};

// Start the game
var gameReady = false; //Game is not ready
var makeReady = function(){gameReady = true}; //Flag the game as ready when this function is run
window.onload = makeReady(); //Run the make ready function when the page loads
if (gameReady)
{
	console.log("start");
	// Start it up
	document.addEventListener("mouseup", buttonPress, false);
	start();
};
