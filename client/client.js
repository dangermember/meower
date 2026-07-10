const form = document.querySelector("form");
const loadingElement = document.querySelector(".loading");
const meowsContainerElement = document.querySelector(".meows-container");
const meowsloadingElement = document.querySelector(".meowsloading");
const meowsElement = document.querySelector(".meows");
const loadMoreElement = document.querySelector(".loadMore");
const loadCountElement = document.querySelector("#loadcount");
const totalCountElement = document.querySelector("#totalcount");
const API_URL = "http://localhost:5000/meows";
const limit = 5;
let page = 1;
let loading = false;
let finished = false;

meowsContainerElement.addEventListener('scroll', () => {
    const rect = loadMoreElement.getBoundingClientRect();
    console.log(rect.top, window.innerHeight, loading, finished);
    if (rect.top < window.innerHeight && !loading && !finished) {
        page++;
        ListAllMeows();
    }
});
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formdata = new FormData(form);
    const name = formdata.get("name");
    const content = formdata.get("content");
    const meow = {
        name,
        content
    }
    loadingElement.style.display = "block";
    form.style.display = "none";
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(meow),
        headers: {
            'content-type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            switch (response.status) {
                case 422:
                    response.json().then((data) => {
                        alert(data.message);
                    });
                    break;
                case 429:
                    alert("Please wait a while before sending another meow");
                    break;
                default:
                    alert("Something went wrong");
            }
        }
        else {
            return response.json();
        }
    }).then((data) => {
        form.reset();
        loadingElement.style.display = "none";
        form.style.display = "block";
        ListAllMeows(true);
    }).catch((error) => {
        alert("Something went wrong! please try again!");
    }).finally(() => {
        loadingElement.style.display = "none";
        form.style.display = "block";
    });
});

function ListAllMeows(reset = false) {
    meowsloadingElement.style.display = "block";
    loadMoreElement.style.display = "none";
    loading = true;
    if (reset) {
        meowsElement.innerHTML = "";
        page = 1;
        finished = false;
    }
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    fetch(API_URL + `?page=${page}&limit=${limit}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            data.mews.reverse().forEach((meow) => {
                const meowDiv = document.createElement("div");
                meowDiv.classList.add("meow");
                const header = document.createElement("h3");
                header.textContent = meow.name;
                const content = document.createElement("p");
                content.textContent = meow.content;
                const timestamp = document.createElement("span");
                timestamp.classList.add("muted");
                timestamp.textContent = new Intl.DateTimeFormat('en-US', options).format(new Date(meow.created));

                meowDiv.appendChild(header);
                meowDiv.appendChild(content);
                meowDiv.appendChild(timestamp);
                meowsElement.appendChild(meowDiv);
            });
            finished = data.meta.has_more === false;
            loadCountElement.textContent = meowsElement.children.length;
            totalCountElement.textContent = data.meta.total;
        }).catch((error) => {
            alert("Something went wrong! please refresh the page!");
        }).finally(() => {
            meowsloadingElement.style.display = "none";
            !finished && (loadMoreElement.style.display = "block");
            loading = false;
        });
}