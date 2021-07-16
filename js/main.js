let apiKey = process.env.API_KEY;
let resultDiv = document.getElementById("resultId");
let paginationDiv = document.getElementById("paginationId");
let pageIndex = 0;
let minPageIndex = 0;
let maxPageIndex = 0;

const previousPage = () => {

    if (minPageIndex <= pageIndex - 1) {
        pageIndex--;
    }

}

const nextPage = () => {

    if (pageIndex + 1 < maxPageIndex) {
        pageIndex++;
    }

}


const doRequest = async () => {

    resultDiv.textContent = "";

    let ingredientInput = document.getElementById("ingredientInputId");
    ingredients = ingredientInput.value.split(",");
    for (let ingred of ingredients) {
        ingred = ingred.trim();
    }


    //get diet
    let diets = document.getElementsByName("diet");
    let dietList = "";
    for (let diet of diets) {
        if (diet.checked) {
            dietList += diet.value + ",";
        }
    }

    //get min max calories
    let minCalorie = document.getElementById("minCalorieId").value;
    let maxCalorie = document.getElementById("maxCalorieId").value;

    //get data results
    let baseUrl = "https://api.spoonacular.com/recipes/complexSearch?apiKey=" + apiKey;
    let response;
    if (minCalorie !== "" && maxCalorie !== "") {
        response = await fetch(baseUrl + "&includeIngredients=" + encodeURIComponent(ingredients.join(",")) + "&diet=" + encodeURIComponent(dietList) + "&minCalories=" + encodeURIComponent(minCalorie) + "&maxCalories=" + encodeURIComponent(maxCalorie));
    } else if (minCalorie === "" && maxCalorie === "") {
        response = await fetch(baseUrl + "&includeIngredients=" + encodeURIComponent(ingredients.join(",")) + "&diet=" + encodeURIComponent(dietList));
    } else if (minCalorie !== "" && maxCalorie === "") {
        response = await fetch(baseUrl + "&includeIngredients=" + encodeURIComponent(ingredients.join(",")) + "&diet=" + encodeURIComponent(dietList) + "&minCalories=" + encodeURIComponent(minCalorie));
    } else {
        response = await fetch(baseUrl + "&includeIngredients=" + encodeURIComponent(ingredients.join(",")) + "&diet=" + encodeURIComponent(dietList) + "&maxCalories=" + encodeURIComponent(maxCalorie));
    }

    let recipes= await fetch(response.url);
    let reply = await recipes.json()
        .then((data) => {
            if (data.results.length === 0) {
                resultDiv.textContent = "Sorry, no result found!";
            } else {
                renderPage(data.results);
            }
        })
        .catch(err => {
            resultDiv.textContent = err.message === "Cannot read property 'length' of undefined" ? "Your daily points limit of 150 has been reached. Please upgrade your plan to continue using the API.": err.message;
        });


}

const renderPage = async (data) => {

    let pageSizeComboBox = document.getElementById("pageSizeId");
    let pageSize = pageSizeComboBox.value;

    let startIndex = pageIndex * pageSize;
    maxPageIndex = data.length / pageSize;

    // create item list (list the content of each row)
    let rows = displayedRecipes(data, startIndex, pageSize, pageIndex);

    //------------------------------------------------------------------------------

    //write the content of the webpage
    resultDiv.innerHTML = "";

    //create table
    let v_table = document.createElement("table");
    resultDiv.appendChild(v_table);


    //create tr - header row
    let v_tr = document.createElement("tr");
    v_table.appendChild(v_tr);


    //headers
    //id header
    let id_th = document.createElement("th");
    v_tr.appendChild(id_th);
    id_th.textContent = "id";


    //title header
    let title_th = document.createElement("th");
    v_tr.appendChild(title_th);
    title_th.textContent = "Title";

    //Picture header
    let pic_th = document.createElement("th");
    v_tr.appendChild(pic_th);
    pic_th.textContent = "Picture";

    //Info header
    let link_th = document.createElement("th");
    v_tr.appendChild(link_th);
    link_th.textContent = "Info";

    //Video header
    let video_th = document.createElement("th");
    v_tr.appendChild(video_th);
    video_th.textContent = "Video";

    ///////////////////////////////////////////////////////
    //display data in each column
    for (let index = startIndex; index < startIndex + pageSize; index++) {
        let recipe = data[index];

        if (recipe === undefined) {
            break;
        }

        let recipe_row = document.createElement("tr");
        v_table.appendChild(recipe_row);

        //add id
        let recipe_id = document.createElement("td");
        recipe_row.appendChild(recipe_id);
        recipe_id.textContent = recipe.id;

        ///////////////////////////////////////////////////////
        //add title
        let recipe_title = document.createElement("td");
        recipe_row.appendChild(recipe_title);
        recipe_title.textContent = recipe.title;


        ///////////////////////////////////////////////////////
        //add Picture
        let recipe_img = document.createElement("td");
        recipe_row.appendChild(recipe_img);
        let picture = document.createElement("img");
        recipe_img.appendChild(picture);
        picture.src = recipe.image;
        picture.alt = recipe.title + " picture not given";

        ///////////////////////////////////////////////////////

        //add info list
        let recipe_info = document.createElement("td");
        recipe_row.appendChild(recipe_info);
        //ingredient list
        let recipe_ingredList = document.createElement("div");
        recipe_info.appendChild(recipe_ingredList)
        let ingredient_ul = document.createElement("ul");
        recipe_ingredList.appendChild(ingredient_ul);

        let ingredients = await getRecipeByID(recipe.id);

        for (let ingredient of ingredients) {
            let ingredient_li = document.createElement("li");
            ingredient_li.textContent = ingredient;
            ingredient_ul.appendChild(ingredient_li);
        }

        ///////////////////////////////////////////////////////

        //add video
        let recipeToWatch = document.createElement("td");
        recipe_row.appendChild(recipeToWatch);
        let buttonVideo = document.createElement("input");
        buttonVideo.type = "button";
        buttonVideo.value = "Watch";
        recipeToWatch.appendChild(buttonVideo);
        buttonVideo.onclick = () => {
            getRecipeVideoByTitle(recipe.title)
        };

    }

    paginationDiv.innerHTML = "";

    //Previous button
    let prevButton = document.createElement("button");
    prevButton.textContent = "<<";
    prevButton.onclick = () => {
        previousPage();
        renderPage(data);
    };
    paginationDiv.appendChild(prevButton);


    //Page X out of Y
    let currentPage = document.createElement("div");
    currentPage.textContent = "Page " + eval(pageIndex + 1) + " out of " + maxPageIndex;
    paginationDiv.appendChild(currentPage);

    //Next button
    let nextButton = document.createElement("button");
    nextButton.textContent = ">>";
    nextButton.onclick = () => {
        nextPage();
        renderPage(data);
    };
    paginationDiv.appendChild(nextButton);


}



// list the content of each row
const displayedRecipes = (data, startIndex, pageSize, pageIndex) => {

    rows = [];
    let i = 0;
    for (let index = startIndex; index < startIndex + pageSize; index++) {
        let recipe = data[index];
        if (recipe === undefined) {
            break;
        }

        rows[i] = { id: recipe.id, title: recipe.title, picture: recipe.image };
        i++;
    }
    return rows;

}

//get product info from id
const getRecipeByID = async (v_id) => {
    let url = "https://api.spoonacular.com/recipes/" + v_id + "/ingredientWidget.json?apiKey=" + apiKey;
    let responseInfo = await fetch(url);
    let jsonInfo = await responseInfo.json();
    let jsonIngredients = jsonInfo.ingredients;
    let ingredientNames = [];
    for (let i = 0; i < jsonIngredients.length; i++) {
        ingredientNames[i] = jsonIngredients[i].name;
    }
    return ingredientNames;
}

//search videos for recipe in a new window
const getRecipeVideoByTitle = async (v_title) => {
    let url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(v_title);
    window.open(url);
}