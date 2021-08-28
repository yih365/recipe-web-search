// Be sure to name any p5.js functions/variables we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global angleMode, DEGREES, arc, clear, createCanvas, colorMode, HSB, width, height, random, background, fill, color, random,firebase, LEFT, push, pop
          rect, ellipse, stroke, image, loadImage, collideCircleCircle, collideRectCircle, text, textAlign,CENTER,createInput,RIGHT,square, 
          mouseX, mouseY, strokeWeight, line, mouseIsPressed, noFill, windowWidth, windowHeight, noStroke, Recipe, createButton,RECIPE_COLLECTION,
          keyCode, PI, circle, HALF_PI, UP_ARROW, QUARTER_PI, CHORD, createSelect, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, textSize, preload*/

// For canvas arrangement
let canvas;
let displaceX;
let displaceY;

// variables
let titleText;
let titleSize;

let posY;
let normalTextSize;

let searchInput;
let searchSubmit;
let searchSelect;

let addButton;

let randomButton;

let squareSize;
let buttons = [];

let openedRecipe;
let loaded;
let chosen;

let titleY;
let recipeY;
let recipeX;
let recipeEndY;

// storage
let recipesMap;
let ingredientsMap;
let searchMap;
let chosenRecipes;
let selectedRecipe;


// Code here runs only once.
function setup() {
  // set up canvas
  let thisWidth = Math.min(windowWidth, windowHeight);
  thisWidth = Math.max(thisWidth, 600);
  canvas = createCanvas(thisWidth, windowHeight);
  displaceX = Math.max(windowWidth/2 - width/2, 0);
  displaceY = Math.max(windowHeight/2 - height/2, 0);
  canvas.position(displaceX, displaceY);
  
  titleText = "Recipe Library";
  titleSize = 30;
  normalTextSize = 17;
  
  posY = titleSize+20+50;
  searchInput = createInput('');
  searchInput.position(width * 1/4 + displaceX - searchInput.width/2, posY);
  searchSubmit = createButton('Browse');
  searchSubmit.position(width * 3/4 + displaceX, posY);
  searchSubmit.mousePressed(search);
  
  searchSelect = createSelect();
  searchSelect.position(width * 1/2 + displaceX, posY);
  searchSelect.option('Recipe');
  searchSelect.option('Ingredients');
  searchSelect.selected('');
  
  addButton = createButton('Click to Add a Recipe');
  addButton.position(width + displaceX - addButton.width-50, posY-50);
  addButton.mousePressed(addPage);
  
  randomButton = createButton('Random Recipes');
  randomButton.position(displaceX + 50, posY-50);
  randomButton.mousePressed(setRandomRecipes);
  
  // variables for displaying 
  recipeX = width/5;
  recipeY = height/4;
  recipeEndY = 0;
  titleY = titleSize/2+20;
  
  // add recipes to hashmaps
  recipesMap = new Map();
  ingredientsMap = new Map();
  searchMap = new Map();
  
  loaded = false;
  chosen = false;
  chosenRecipes = [];
  
  // Listen to updates to the texts collection.
  firebase
    .firestore()
    .collection(RECIPE_COLLECTION)
    .onSnapshot(querySnapshot => {
      for (let recipeDoc of querySnapshot.docs) {
        let recipeData = recipeDoc.data();
        if (!recipesMap.has(recipeData.name.toLowerCase())) {
          // add to recipes Map
          let thisRecipe = new Recipe(recipeData.name, recipeData.mainIngredients, recipeData.optionalIngredients, recipeData.description, recipeData.time);
          recipesMap.set(recipeData.name.toLowerCase(), thisRecipe);
          
          // add into ingredients Map
          for (let ingredient of thisRecipe.mainIngredients) {
            if (ingredientsMap.has(ingredient)) {
              let llist = ingredientsMap.get(ingredient);
              llist.push(thisRecipe);
              ingredientsMap.set(ingredient, llist);
            } else {
              // add ingredient and recipe to map
              ingredientsMap.set(ingredient, [thisRecipe]);
            }
          }
        }
      }
    loaded = true;
    });
  
  // add buttons for choosing recipes
  let posX = displaceX + squareSize/2;
  for (let i = 0; i < 3; i ++) {
    buttons[i] = createButton('Choose');
    buttons[i].position(posX - buttons[i].width/2, posY + height/4 + squareSize/2 + 15);
    buttons[i].mousePressed(() => {openRecipe(i);});
    posX += squareSize;
  }
}

// Code here runs continuously.
function draw() {
  background(200);
  
  // add random recipes on browse
  if (loaded && !chosen) {
    openedRecipe = false;
    chosenRecipes = randomRecipes();
    squareSize = Math.floor(width/3);
    chosen = true;
  }

  // title
  textSize(titleSize);
  textAlign(CENTER);
  text(titleText, width/2, titleY);

  // Search-bar text
  textAlign(RIGHT);
  textSize(normalTextSize);
  text("Search By", width/2-5, posY+15);
  
  // buttons for searching
  searchInput.position(width * 1/4 + displaceX - searchInput.width/2, posY);
  searchSubmit.position(width * 3/4 + displaceX, posY);
  searchSelect.position(width * 1/2 + displaceX, posY);
  addButton.position(width + displaceX - addButton.width-50, posY-50);
  randomButton.position(displaceX + 50, posY-50);
  
  if (!openedRecipe) {
    // position buttons and boxes for recipe selection
    let posX = displaceX + squareSize/2;
    let x = 0;
    let y = posY + height/4;
    for (let i = 0; i < 3; i ++) {
      square(x, y, squareSize);
      x += squareSize + 1;
      buttons[i].position(posX - buttons[i].width/2, posY + height/4 + squareSize/2 + 15);
      posX += squareSize;
    }
    
    // display recipes
    x = 0;
    for (let recipe of chosenRecipes) {
      displayRecipe(x, y, recipe);
      x += squareSize + 1;
    }
  } else {
    console.log('opened');
    // certain recipe opened
    displayEntireRecipe(selectedRecipe);
    
    // move away buttons for recipe selection
    let posX = displaceX + squareSize/2;
    for (let i = 0; i < 3; i ++) {
      buttons[i].position(posX - buttons[i].width/2, -100);
      posX += squareSize;
    }
  }
}

function search() {
  // function searches for requested recipe by name or ingredients
  
  // prevent scroll
  recipeEndY = 0;
  
  let searchText = searchInput.value();
  searchText = searchText.toLowerCase();
  searchInput.value('');
  
  let searchBy = searchSelect.value();
  
  // search for item
  if (searchBy == 'Ingredients') {
    // store ingredients in a list
    let ingredientsArray = [];
    let prevIndex = 0;
    for (let i = 0; i < searchText.length; i ++) {
      if (searchText[i] == ',') {
        while(prevIndex < searchText.length && searchText[prevIndex] == ' ') prevIndex ++;
        let end = i-1;
        while(end > prevIndex && end == ' ') end --;
        ingredientsArray.push(searchText.substring(prevIndex, end+1));
        prevIndex = i+1;
      }
    }
    while (prevIndex < searchText.length && searchText[prevIndex] == ' ') prevIndex++;
    let end = searchText.length-1;
    while(end > prevIndex && end == ' ') end --;
    if (prevIndex < searchText.length && end > prevIndex + 1) {
      ingredientsArray.push(searchText.substring(prevIndex, end+1));
    }
    
    // find and save best matching recipes
    chosenRecipes = searchByIngredients(ingredientsArray);
    let i = 0;
    while (i < 3 && i < chosenRecipes.length) {
      chosenRecipes[i] = chosenRecipes[i].recipe;
      i++;
    }
    openedRecipe = false;
  } else {
    // default to search by Recipe name
    searchByName(searchText);
  }
}

function searchByIngredients(ingredients) {
  // find closest matching recipes with these ingredients
  searchMap.clear();
  for (let ingredient of ingredients) {
    console.log(ingredient);
    if (!ingredientsMap.has(ingredient)) continue;
    for (let recipe of ingredientsMap.get(ingredient)) {
      if (searchMap.has(recipe)) {
        let num = searchMap.get(recipe);
        searchMap.set(recipe, num+1);
      } else {
        // add recipe to searchMap
        searchMap.set(recipe, 1);
      }
    }
  }
  
  if (searchMap.size == 0) {
    alert('Sorry no recipes with these ingredient(s)');
    return [];
  }
  
  // sort hashmap into list of top choices
  let sortedRecipes = [];
  for (let key of searchMap.keys()) {
    sortedRecipes.push({
      recipe: key,
      num: searchMap.get(key)
    });
  }
  
  sortedRecipes.sort((a, b) => (a.num > b.num ? -1 : 1));
  
  return sortedRecipes;
}

function searchByName(name) {
  // find recipe with this name
  if (recipesMap.has(name)) {
    titleY = titleSize/2+20;
    posY = titleSize+20+50;
    recipeY = height/4;
    selectedRecipe = recipesMap.get(name);
    openedRecipe = true;
  } else {
    // recipe doesn't exist
    alert('Could not find recipe by this name.');
  }
}

function displayEntireRecipe(recipe) {
  let spaceBetween = 30;
  let newRecipeY = recipeY;
  
  // fully display entire recipe
  textAlign(LEFT);
  textSize(normalTextSize);
  text(`Name: ${recipe.name}`, recipeX, recipeY);
  
  newRecipeY = normalTextSize + spaceBetween + recipeY;
  text('Main Ingredients: ', recipeX, newRecipeY);
  for (let ingredient of recipe.mainIngredients) {
    newRecipeY += normalTextSize;
    text(ingredient, recipeX, newRecipeY);
  }
  
  newRecipeY += normalTextSize + spaceBetween;
  text('Optional Ingredients: ', recipeX, newRecipeY);
  for (let ingredient of recipe.optionalIngredients) {
    newRecipeY += normalTextSize;
    text(ingredient, recipeX, newRecipeY);
  }
  
  newRecipeY += normalTextSize + spaceBetween;
  text(`Description: ${recipe.desc}`, recipeX, newRecipeY, width-2*recipeX);
  
  let count = (recipe.desc.match(/\n/g) || []).length;
  newRecipeY += normalTextSize + spaceBetween + recipe.desc.length*normalTextSize/50 + normalTextSize*count;
  text(`Time (mins): ${recipe.time}`, recipeX, newRecipeY);
  
  recipeEndY = newRecipeY+normalTextSize;
}

function displayRecipe(x, y, recipe) {
  // display selection text for recipe
  textAlign(LEFT);
  text(`Recipe Name: ${recipe.name}`, x+10, y+10, squareSize-20, squareSize/2-20);
}

function openRecipe(i) {
  // open (i+1)th recipe
  titleY = titleSize/2+20;
  posY = titleSize+20+50;
  recipeY = height/4;
  selectedRecipe = chosenRecipes[i];
  openedRecipe = true;
}

function randomRecipes() {
  // returns three random recipes
  // or less if less than three are available
  let listRecipes = [];
  let indexs = [];
  while (listRecipes.length != recipesMap.size && listRecipes.length < 3) {
    let index = Math.floor(Math.random() * recipesMap.size);
    if (indexs.includes(index)) continue;
    indexs.push(index);
    let cntr = 0;
    for (let key of recipesMap.keys()) {
      if (cntr++ === index) {
        listRecipes.push(recipesMap.get(key));
        break;
      }
    }
  }
  return listRecipes;
}

function setRandomRecipes() {
  // sets page to recipe selection with random recipes
  openedRecipe = false;
  chosenRecipes = randomRecipes();
  titleY = titleSize/2+20;
  posY = titleSize+20+50;
  recipeY = height/4;
  recipeEndY = 0;
}

function mouseWheel(event) {
  // allow page scrolling
  let movement = -1 * event.delta;
  console.log('scrolled');
  if (movement > 0 && titleY + movement > titleSize/2) {
    // scroll up
    titleY = titleSize/2+20;
    posY = titleSize+20+50;
    recipeY = height/4;
    console.log('here');
    return;
  } else if (movement < 0 && recipeEndY < height-normalTextSize-50) {
    // scroll down
    return;
  }
  posY += movement;
  titleY += movement;
  recipeY += movement;
}

function addPage() {
  open('adding_recipe.html', '_self');
}