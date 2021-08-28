class Recipe {
  constructor(name, mainIngredients, optionalIngredients, desc, time) {
    this.name = name;
    this.desc = desc;
    this.time = time;
    
    // split ingredients
    this.mainIngredients = this.splitIngredients(mainIngredients);
    this.optionalIngredients = this.splitIngredients(optionalIngredients);
  }
  
  splitIngredients(ingredientsStr) {
    // turns string of ingredients to array
    let ingredientsArray = [];
    let prevIndex = 0;
    for (let i = 0; i < ingredientsStr.length; i ++) {
      if (ingredientsStr[i] == ',') {
        while(prevIndex < ingredientsStr.length && ingredientsStr[prevIndex] == ' ') prevIndex ++;
        let end = i-1;
        while(end > prevIndex && end == ' ') end --;
        ingredientsArray.push(ingredientsStr.substring(prevIndex, end+1));
        prevIndex = i+1;
      }
    }
    while(prevIndex < ingredientsStr.length && ingredientsStr[prevIndex] == ' ') prevIndex ++;
    let end = ingredientsStr.length-1;
    while(end > prevIndex && end == ' ') end --;
    ingredientsArray.push(ingredientsStr.substring(prevIndex, end+1));
    
    return ingredientsArray;
  }
}
