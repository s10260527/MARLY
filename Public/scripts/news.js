let apiKey = "b53b24382d214710b4df45c63e7138c9"; // Corrected API key format
const container = document.querySelector(".container"); // Corrected selector
const optionsContainer = document.querySelector(".options-container"); // Corrected selector
const country = "sg"; // Fetch news for Singapore
const topic = "sustainability"; // Fetch only sustainability news
console.log("hello")
let requestURL;

const generateUI = (articles) => { // Corrected parameter name
    container.innerHTML = ""; // Clear previous news
    for (let item of articles) {
        let card = document.createElement("div");
        card.classList.add("news-card");
        console.log(item.urlToImage);

        card.innerHTML = `
  <div class="news-image-container">
    <img src="${item.urlToImage || '../images/error page.gif'}"  />
  </div>
  <div class="news-content">
    <div class="news-title">${item.title}</div>
    <div class="news-description">${item.description || item.content || ''}</div>
    <a href="${item.url}" target="_blank" class="view-button">Read More</a>
  </div>
`;


        container.appendChild(card);
    }
};

// News API call
const getNews = async () => {
    try {
        let response = await fetch(requestURL);
        if (!response.ok) {
            alert("Data unavailable at the moment. Please try again later");
            return;
        }
        let data = await response.json();
        generateUI(data.articles); // Corrected spelling to 'articles'
    } catch (error) {
        console.error("Error fetching news:", error);
    }
};

const selectCategory = (e, category) => {
    let options = document.querySelectorAll(".option");
    options.forEach((element) => {
        element.classList.remove("active");
    });
    requestURL = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`;
    e.target.classList.add(".active");
    getNews()
};

//choose options
const createOptions = () => {
    for(let i of options) {
        optionsContainer.innerHTML+= `<button
        class="options ${i=="general" ? "active" : ""}"
        onclick="selectCategory(event,'${i}')">${i}</button>`;
    }
}

const init = () => {
    optionsContainer.innerHTML = "";
    getNews();
    // Add function to create options if needed
};

window.onload = () => {
    requestURL = `https://newsapi.org/v2/everything?q=${topic}&apiKey=${apiKey}`;
    init();
};
