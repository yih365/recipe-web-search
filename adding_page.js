// Be sure to name any p5.js functions/variables we use in the global.
// Add to this list as you consult the p5.js documentation for other functions.
/* global angleMode, DEGREES, arc, clear, createCanvas, colorMode, HSB, width, height, random, background, fill, color, random,LEFT,firebase,
          rect, ellipse, stroke, image, loadImage, collideCircleCircle, collideRectCircle, text, textAlign,CENTER,createInput,RIGHT, select,createElement,
          mouseX, mouseY, strokeWeight, line, mouseIsPressed, noFill, windowWidth, windowHeight, noStroke, Recipe, createButton,RECIPE_COLLECTION,
          keyCode, PI, circle, HALF_PI, UP_ARROW, QUARTER_PI, CHORD, createSelect, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, textSize, preload*/

// For canvas arrangement
let canvas;
let displaceX;
let displaceY;

// DOM and positioning
let titleText;
let titleSize;
let titleY;

let posY;
let posX;

let nameInput;

let mainIngredientY;
let ingredientInput;
let ingredientSubmit;

let optionalIngredientY;
let optionalInput;
let optionalSubmit;

let descBoxY;
let descBox;

let timeY;
let timeInput;

let addButtonY;
let addButton;

let backButton;

// store info
let name;
let mainIngredients = [];
let optionalIngredients = [];
let description;
let time;


// Code here runs only once.
function setup() {
  // set up canvas
  let thisWidth = Math.min(windowWidth, windowHeight);
  thisWidth = Math.max(thisWidth, 500);
  canvas = createCanvas(thisWidth, windowHeight);
  displaceX = Math.max(windowWidth/2 - width/2, 0);
  displaceY = Math.max(windowHeight/2 - height/2, 0);
  canvas.position(displaceX, displaceY);
  canvas.layer = 1;
  
  titleText = "Add Recipe";
  titleSize = 30;
  titleY = titleSize/2+20;
  
  posY = titleSize+20+50;
  posX = width * 1/5;
  
  // input for recipe name
  nameInput = createInput('');
  nameInput.position(posX + displaceX, posY);
  
  // back button
  backButton = createButton('Homepage');
  backButton.position(posX + displaceX, posY-50);
  backButton.mousePressed(navigateHome);
  
  // input box for main ingredients
  mainIngredientY = posY+50;
  ingredientInput = createInput('');
  ingredientInput.position(posX + displaceX, mainIngredientY);
  ingredientSubmit = createButton('add');
  ingredientSubmit.position(ingredientInput.x + ingredientInput.width, ingredientInput.y);
  ingredientSubmit.mousePressed(addMain);
  
  // input box for optional ingredients
  optionalIngredientY = mainIngredientY+ mainIngredients.length*40 +50;
  optionalInput = createInput('');
  optionalInput.position(posX + displaceX, optionalIngredientY);
  optionalSubmit = createButton('add');
  optionalSubmit.position(optionalInput.x + optionalInput.width, optionalInput.y);
  optionalSubmit.mousePressed(addOptional);
  
  // input box for description
  descBoxY = optionalIngredientY + optionalIngredients.length*40 + 50;
  descBox = createElement('textarea', '');
  descBox.size(width/2, height/3);
  descBox.position(width*1/5 + displaceX, descBoxY);
  
  // input box for time
  timeY = descBoxY + descBox.height + 50;
  timeInput = createInput('');
  timeInput.position(width*1/5 + displaceX, timeY);
  
  // button to submit recipe
  addButton = createButton('Submit');
  addButtonY = timeY + timeInput.height + 50;
  addButton.position(posX + displaceX, addButtonY);
  addButton.mousePressed(submitRecipe);
}

// Code here runs continuously.
function draw() {
  background(235, 228, 150);
  
  // title
  textSize(titleSize);
  textAlign(CENTER);
  text(titleText, width/2, titleY);
  
  // for smaller text
  textAlign(LEFT);
  textSize(15);
  
  text('Recipe Name:', posX, posY)
  nameInput.position(posX + displaceX, posY+15);
  
  backButton.position(posX + displaceX, posY-50);
  
  // main ingredients input and text
  text('Main Ingredients:', posX, posY + 50 + nameInput.height);
  mainIngredientY = posY + 50 + nameInput.height + 15;
  ingredientInput.position(posX + displaceX, mainIngredientY);
  ingredientSubmit.position(ingredientInput.x + ingredientInput.width, ingredientInput.y);
  for (let i = 0; i < mainIngredients.length; i ++) {
    let ingredient = mainIngredients[i];
    text(ingredient, posX, mainIngredientY+(i+1)*30+20);
  }
  
  // optional ingredients input and text
  text('Optional Ingredients:', posX, mainIngredientY + mainIngredients.length*30 + 65);
  optionalIngredientY = mainIngredientY+ mainIngredients.length*30 + 80;
  optionalInput.position(posX + displaceX, optionalIngredientY);
  optionalSubmit.position(optionalInput.x + optionalInput.width, optionalInput.y);
  for (let i = 0; i < optionalIngredients.length; i ++) {
    let ingredient = optionalIngredients[i];
    text(ingredient, posX, optionalIngredientY+(i+1)*30+20);
  }
  
  // input box for description
  descBoxY = optionalIngredientY + optionalIngredients.length*30 + 75;
  text('Description:', posX, descBoxY);
  descBox.size(width/2, height/3);
  descBox.position(posX + displaceX, descBoxY+15);
  
  // input box for time
  timeY = descBoxY + descBox.height + 45;
  text('Time (mins):', posX, timeY);
  timeInput.position(posX + displaceX, timeY+15);
  
  // button to submit recipe
  addButtonY = timeY + timeInput.height + 30;
  addButton.position(posX + displaceX, addButtonY);
}

function submitRecipe() {
  // adds recipe to database
  name = nameInput.value();
  nameInput.value('');
  
  description = descBox.value();
  descBox.value('');
  
  time = timeInput.value();
  timeInput.value('');
  
  let ingredientsString = mainIngredients.toString();
  let optionalsString = optionalIngredients.toString();
  
  mainIngredients = [];
  optionalIngredients = [];
  
  // access database
  firebase
  .firestore()
  .collection(RECIPE_COLLECTION)
  .add({
    name: name,
    mainIngredients: ingredientsString.toLowerCase(),
    optionalIngredients: optionalsString.toLowerCase(),
    description: description,
    time: time
  });
  
  alert('Recipe submitted. Thank you!');
}

function mouseWheel(event) {
  // moves page elements for mouse scroll movement
  
  let movement = -1 * event.delta;
  if (movement > 0 && titleY + movement > titleSize/2) {
    // scroll up
    titleY = titleSize/2+20;
    posY = titleSize+20+50;
    return;
  } else if (movement < 0 && addButtonY < height-addButton.height-50) {
    // scroll down
    return;
  }
  posY += movement;
  titleY += movement;
}

function addMain() {
  // add main ingredient to array
  let ingred = ingredientInput.value();
  mainIngredients.push(ingred);
  ingredientInput.value('');
}

function addOptional() {
  // add optional ingredient to array
  let ingred = optionalInput.value();
  optionalIngredients.push(ingred);
  optionalInput.value('');
}

function navigateHome() {
  open('index.html', '_self');
}