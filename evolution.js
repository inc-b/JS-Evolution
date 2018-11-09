// World variables
// var world_width = 16;
// var world_height = 16;
var pixel_size = 5;
var smooth_amount = 5; // how many times to run the smoothing algorithm
var expansion_amount = 4; // How many times the map is zoomed in
var expansion_rate = 2; // How much larger each pixel on the map is made
var water_percentage = 0.5;
var landColour = '#77aa33';
var waterColour = '#003377';
var worldMargin = 16;

// Arrays
var world_array = []; // This array contains each row of the world as a subarray
var animal_array = []; // This array holds a subarray for each animal with the following details: mySpecies, myXPos, myYPos, myHealth, myBreedStat, myMaxHealth, myMaxBreed, mySpeed, myStrength, myAge, myMaxAge, myForage
var holding_array = []; // Holds a copy of the world array while performing smoothing
var temp_array = [];
var yArray = [];

// Species data 
// Each species has the following attributes: name, colour, max health, speed, strength, breed rate, max age, forage rate
var raptor = {
	species:'raptor',
	colour:'#FF0000',
	maxHealth:100,
	speed:5,
	strength:5,
	maxBreed:3,
	maxAge:5000,
	forageRate:0.5
};
var cat = {
	species:'cat',
	colour:'#FFFF00',
	maxHealth:100,
	speed:5,
	strength:5,
	maxBreed:3,
	maxAge:5000,
	forageRate:0.5
};
var snail = {
	species:'snail',
	colour:'#00FF00',
	maxHealth:100,
	speed:5,
	strength:5,
	maxBreed:3,
	maxAge:5000,
	forageRate:0.5
};
var turtle = {
	species:'turtle',
	colour:'#FF00FF',
	maxHealth:100,
	speed:5,
	strength:5,
	maxBreed:3,
	maxAge:5000,
	forageRate:0.5
};
var spider = {
	species:'spider',
	colour:'#000000',
	maxHealth:100,
	speed:5,
	strength:5,
	maxBreed:3,
	maxAge:5000,
	forageRate:0.5
};

var animal_species = [raptor,cat,snail,turtle,spider];

// Variables
var animal_species_offset = 7; // How many attributes each species has
var species_count = animal_species.length; // How many species are there in the array?
var start_population = 100; // How many animals in each species when the simulation starts?
var animalAttributeCount = 9; // How many attributes each animal has stored in animal_array
var maxPopulation = 10000; // How many animals (all species) can this computer support?
var spawning = true; // Start the simulation by spawning new animals
var mutationRate = 0.95;
var mutationStrength = 5;
var renderLimit = 1;

// Canvas variables
var CANVAS_WIDTH = Math.floor(window.innerWidth * 0.8);
var CANVAS_HEIGHT = Math.floor(window.innerHeight * 0.8);
var world_width = Math.floor(CANVAS_WIDTH / (pixel_size * (expansion_amount + 1) * (expansion_rate + 1)));
var world_height = Math.floor(CANVAS_HEIGHT / (pixel_size * (expansion_amount + 1) * (expansion_rate + 1)));
var c = document.getElementById('canvas');
var ctx = c.getContext('2d');
c.style.width = CANVAS_WIDTH + 'px';
c.style.height = CANVAS_HEIGHT + 'px';
ctx.canvas.width = CANVAS_WIDTH;
ctx.canvas.height = CANVAS_HEIGHT;
var textSize = 10;

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

// Draw a border of water around the world to make it an island
var addBorder = function() {
	for (x = 0; x < world_width; x++) {
		world_array[x][0] = 'water';
		world_array[x][world_height - 1] = 'water';
	}
	
	for (y = 0; y < world_height; y++) {
		world_array[0][y] = 'water';
		world_array[world_width - 1][y] = 'water';
	}
};

// Expand each cell in the array to make a larger array
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
			} while (newAnimal != 'land')
				
			spawnAnimal(f,newX,newY);
			
		}
	}
	spawning = false;
};

// Fill the world array with random noise marking water and land 
var fillArray = function() { 
	for (x = 0; x < world_width; x++) {
		yArray = [];
		for (y = 0; y < world_height; y++) {
			var randomiser = Math.random();
			if (randomiser > water_percentage) {
				yArray[y] = 'land';
			} else {
				yArray[y] = 'water';
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

			if (world_array[x][y] == 'water' && neighbours > 4) {
				holding_array[x][y] = 'water';
			}  else if (world_array[x][y] == 'land' && neighbours > 5){
				holding_array[x][y]='water';
			} else {
				holding_array[x][y]='land';
			}
		}
	}
	
	for (y = 0; y < world_height; y++) {
		for (x = 0; x < world_width; x++) {
			world_array[x][y] = holding_array[x][y];
		}
	}
};

// count neighbours of an array cell (used in smoothing the world array)
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

// Check neighbouring cells (used in smoothing array)
var checkNeighbour2d = function (checkX, checkY, xOffset,yOffset) {
	var returnValue = 0;
	var checkingX = checkX + xOffset;
	var checkingY = checkY + yOffset;
	
	if (checkingX < 0 || checkingX > world_width - 1) {
		returnValue = 1;
	} else if (checkingY < 0 || checkingY > world_height - 1) {
		returnValue = 1;
	} else if (world_array[checkingX][checkingY] != 'land') {
		returnValue = 1;
	}
	
	return returnValue;
};

// Spawn a new animal based on a parent and location
var spawnAnimal = function (parentNumber, xPos,yPos) {
	if (animal_array.length > maxPopulation) {
		// Don't add too many animals - if we go over the max population then don't add more
		return;
	} else if (spawning) {
		// If we're still spawning then add the starting population
		// Insert the new animal into the world
		world_array[xPos][yPos] = animal_array.length + 1;
		// Set the template for the new animal
		var incomingAnimal = animal_species[parentNumber];
		// Setup the new animal
		var newAnimal = {
			mySpecies:parentNumber,
			xPosition:xPos,
			yPosition:yPos,
			myHealth:incomingAnimal.maxHealth,
			myBreedStat:0,
			myMaxHealth:incomingAnimal.maxHealth,
			myMaxBreed:incomingAnimal.maxBreed,
			mySpeed:incomingAnimal.speed,
			myStrength:incomingAnimal.speed,
			myAge:0,
			myMaxAge:incomingAnimal.maxAge,
			myForageRate:incomingAnimal.forageRate
		};
		// Insert the new animal into the array of animals
		animal_array.push(newAnimal);
	} else {
		// Create a new animal based on it's parent
		// Insert the new animal into the world
		world_array[xPos][yPos] = animal_array.length + 1;
		// Find the new animal's parent
		var myParent = animal_array[parentNumber];
		// Set the new animal's attributes based on its parent
		var newAnimal = {
			mySpecies:myParent.mySpecies,
			xPosition:xPos,
			yPosition:yPos,
			myHealth:myParent.myMaxHealth,
			myBreedStat:0,
			myMaxHealth:myParent.myMaxHealth,
			myMaxBreed:myParent.myMaxBreed,
			mySpeed:myParent.mySpeed,
			myStrength:myParent.myStrength,
			myAge:0,
			myMaxAge:myParent.myMaxAge,
			myForage:myParent.myForageRate
		};
		// Mutate the new animal
		// Check if we will mutate the animal
		var toMutate = Math.random();
		// If we're mutating then do the following:
		if (toMutate < mutationRate) {
			// Check if we increase or decrease the stat to be mutated
			var mutateDirection = 1;
			if (Math.random() < 0.5) {
				mutateDirection = -1;
			}
			
			// ****
			// Doesn't seem to be a way to algorithmically select and edit a value in an object, so stats to be mutated are manually added and counted in this one bit of code!
			// ****
			var statToMutate = Math.floor(Math.random() * 6); // Select a stat to edit
			switch(statToMutate) {
				case 0:
					// Max Health
					newAnimal.myMaxHealth + mutationStrength * mutateDirection;
					break;
				case 1:
					// Breeding rate
					newAnimal.myMaxBreed + mutationStrength * mutateDirection;
					break;
				case 2:
					// Speed
					newAnimal.mySpeed + mutationStrength * mutateDirection;
					break;
				case 3:
					// Strength
					newAnimal.myStrength + mutationStrength * mutateDirection;
					break;
				case 4:
					// Max age
					newAnimal.myMaxAge + mutationStrength * mutateDirection * 10; // Max age is an order of magnitude larger than other stats and needs to change faster as a result
					break;
				case 5:
					// Forage rate
					newAnimal.myForageRate + mutationStrength * mutateDirection / 10; // Forage rate is an order of magnitude smaller than other stats and needs to change slower as a result
					break;
			}
		}
		// Insert the new animal into the array of animals
		animal_array.push(newAnimal);
	}
};

// the main brain for every animal
var runAI = function () {
	// Loop through each animal
	for (animalAIloop = 0; animalAIloop < animal_array.length; animalAIloop++) {
		// Keep track of which animal we're looking at in this iteration and note some info about it
		var currentAnimal = animal_array[animalAIloop];
		var mySpecies = animal_species[currentAnimal.mySpecies * animal_species_offset];
		
		// Take the animal out of the world
		world_array[currentAnimal.xPosition][currentAnimal.yPosition] = 'land';
		
		// Get older
		currentAnimal.myAge++;
		if (currentAnimal.myAge > currentAnimal.myMaxAge) {
			//I'm too old so I die
			animal_array.splice(animalAIloop,1);
			continue;
		}
			
		// Forage for food
		var foragingChance = Math.random();
		if (foragingChance < currentAnimal.myForageRate) {
			// I found food, so I gain some health
			currentAnimal.myHealth++;
		} else {
			// I found nothing, so I starve a little
			currentAnimal.myHealth--;
		}
		
		// If I'm too sick I die
		if (currentAnimal.myHealth < 1) {
			animal_array.splice(animalAIloop,1);
			continue;
		}
		
		// Decide which way the animal will move
		var xDirection = Math.floor(Math.random() * 3) - 1;
		var yDirection = Math.floor(Math.random() * 3) - 1;
		
		// Check the new position in case something else is already there
		var newXPos = currentAnimal.xPosition + xDirection;
		var newYPos = currentAnimal.yPosition + yDirection;
		var checkLocation = world_array[newXPos][newYPos];
		if (checkLocation != 'land') {
			// If I'm not moving on to land, then I can't move
			newXPos = newXPos - xDirection;
			newYPos = newYPos - yDirection;
			// What's here that's blocking me?
			if (checkLocation == 'water') {
				// There's water here, I can drink and heal (but not move)
				// currentAnimal.myHealth++;
			} else {
				// It's not land, it's not water, it's probably another animal so let's breed or battle
				var otherAnimal = animal_array[checkLocation];
				if (otherAnimal != undefined) {

					if (otherAnimal.mySpecies == currentAnimal.mySpecies) {
						// We're the same species, my breeding chance increases
						currentAnimal.myBreedStat++;
					} else {
						// this is a different species, let's battle
						var myPower = currentAnimal.mySpeed * currentAnimal.myStrength * currentAnimal.myHealth;
						var enemyPower = otherAnimal.mySpeed * otherAnimal.myStrength * otherAnimal.myHealth;
						if (myPower < enemyPower) {
							// I lose. My health goes down
							currentAnimal.myHealth--;					
						} else if (myPower > enemyPower) {
							// I win! My enemy's health goes down
							otherAnimal.myHealth--;
						}
					}
				}
			}
		} else {	
			// There's free land here, what can I do with it?
			if (currentAnimal.myBreedStat > currentAnimal.myMaxBreed) {
				// If I'm ready to breed, then make a baby in my current spot before moving and reset my breeding potential
				spawnAnimal(animalAIloop,currentAnimal.xPosition,currentAnimal.yPosition);
				currentAnimal.myBreedStat = 0;
			} else {
				// There's free land, I'm not ready to breed, nothing else to do yet
			}
			
			if (currentAnimal.myHealth > currentAnimal.myMaxHealth) {
				// Don't let my health get higher than my max health
				currentAnimal.myHealth = currentAnimal.myMaxHealth;
			}
			
			// Move into my new position
			world_array[newXPos][newYPos] = animalAIloop;
			// Set my position values
			currentAnimal.yPosition = newYPos;
			currentAnimal.xPosition = newXPos;
		}
	}
}

// Render all the visuals
var render = function() {
	// Clear screen
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	
	// Draw the map
	for (y = 0; y < world_height; y++) {
		for (x = 0; x < world_width; x++) {
			var checkPoint = world_array[x][y];
			if (checkPoint == 'water') {
				pointColour = waterColour;
			} else {
				pointColour = landColour;
			}
			
			ctx.fillStyle = pointColour;
			ctx.fillRect(x * pixel_size,y * pixel_size,pixel_size,pixel_size );
		} 
	}

	// Draw animals
	for (animalCheck = 0; animalCheck < animal_array.length / renderLimit; animalCheck++) {
		var thisAnimal = animal_array[animalCheck * renderLimit];
		ctx.fillStyle = animal_species[thisAnimal.mySpecies].colour;	
		ctx.fillRect(thisAnimal.xPosition * pixel_size,thisAnimal.yPosition * pixel_size,pixel_size, pixel_size);
	}
	
	/*
	// Render text
	ctx.fillStyle = 'black';
	ctx.fillText('Species', (world_width + worldMargin) * pixel_size, worldMargin * pixel_size);
	ctx.fillText('Pop', (world_width + worldMargin * 4) * pixel_size, (worldMargin * pixel_size));
	ctx.fillText('Age', (world_width + worldMargin * 6) * pixel_size, (worldMargin * pixel_size));
	ctx.fillText('Health', (world_width + worldMargin * 8) * pixel_size, (worldMargin * pixel_size));
	ctx.fillText('Str', (world_width + worldMargin * 10) * pixel_size, (worldMargin * pixel_size));
	ctx.fillText('Spd', (world_width + worldMargin * 12) * pixel_size, (worldMargin * pixel_size));
	ctx.fillText('Breed', (world_width + worldMargin * 14) * pixel_size, (worldMargin * pixel_size));
	// Calculate the info for the current species
	for (animal_text = 0; animal_text < (animal_species.length); animal_text++) {
		var currentSpecies = animal_species[animal_text];
		var currentSpeciesCount = 0;
		var speciesAge = 0;
		var speciesHealth = 0;
		var speciesStrength = 0;
		var speciesSpeed = 0;
		var speciesBreed = 0;
		// run the the array of animals to check the data
		for (checkingAnimals = 0; checkingAnimals < animal_array.length; checkingAnimals++) {
			var thisAnimal = animal_array[checkingAnimals];
			if (thisAnimal.mySpecies == animal_text) {
				currentSpeciesCount++;
				speciesAge = speciesAge + thisAnimal.myAge;
				speciesHealth = speciesHealth + thisAnimal.myHealth;
				speciesStrength = speciesStrength + thisAnimal.myStrength;
				speciesSpeed = speciesSpeed + thisAnimal.mySpeed;
				speciesBreed = speciesBreed + thisAnimal.myMaxBreed;
			}
		}
		// Average the values
		speciesAge = Math.floor(speciesAge / currentSpeciesCount);
		speciesHealth = Math.floor(speciesHealth / currentSpeciesCount);
		speciesStrength = Math.floor(speciesStrength / currentSpeciesCount);
		speciesSpeed = Math.floor(speciesSpeed / currentSpeciesCount);
		speciesBreed = Math.floor(speciesBreed / currentSpeciesCount);
		// Display the data
		ctx.fillText(currentSpecies.species + ': ', (world_width + worldMargin) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(currentSpeciesCount, (world_width + worldMargin * 4) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(speciesAge, (world_width + worldMargin * 6) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(speciesHealth, (world_width + worldMargin * 8) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(speciesStrength, (world_width + worldMargin * 10) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(speciesSpeed, (world_width + worldMargin * 12) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
		ctx.fillText(speciesBreed, (world_width + worldMargin * 14) * pixel_size, (worldMargin + worldMargin) * pixel_size + (textSize * animal_text) * pixel_size);
	}
	*/
};

// Start the world up
var start = function () {
	createWorld();
	populateWorld();
	render();
	update();
	setInterval(function() {update()},1);
};

// Run this over and over
var update = function () {
	runAI();
	render();
};

// listen for input
var buttonPress = function(e) {
	
};

// Start the simluation
var simReady = false; // Sim is not ready
var makeReady = function(){simReady = true}; // Flag the sim  as ready when this function is run
window.onload = makeReady(); // Run the make ready function when the page loads
if (simReady)
{
	// Start it up
	document.addEventListener('mouseup', buttonPress, false);
	start();
};
