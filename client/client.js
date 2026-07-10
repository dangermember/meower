const form = document.querySelector("form");
const loadingElement = document.querySelector(".loading");
const meowsContainerElement = document.querySelector(".meows-container");
const meowsloadingElement = document.querySelector(".meowsloading");
const meowsElement = document.querySelector(".meows");
const loadMoreElement = document.querySelector(".loadMore");
const loadcountContainerElement = document.querySelector(".loadcountContainer");
const loadCountElement = document.querySelector("#loadcount");
const totalCountElement = document.querySelector("#totalcount");
const API_URL = "http://localhost:5000/meows";
const limit = 5;
let page = 1;
let loading = false;
let finished = false;

meowsContainerElement.addEventListener("scroll", () => {
    const threshold = 100;
    if (
        meowsContainerElement.scrollTop +
        meowsContainerElement.clientHeight >=
        meowsContainerElement.scrollHeight - threshold &&
        !loading &&
        !finished
    ) {
        page++;
        ListAllMeows();
    }
});
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formdata = new FormData(form);
    const name = formdata.get("name");
    const content = formdata.get("content");
    let errorMessage;
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
                        showError(data.message);
                    });
                    return;
                case 429:
                    errorMessage = "Please wait a while before sending another meow";
                    break;
                default:
                    errorMessage = "Something went wrong";
            }
        }
        else {
            return response.json();
        }
    }).then((data) => {
        form.reset();
        form.style.display = "block";
        ListAllMeows(true);
    }).catch((error) => {
        errorMessage = "Something went wrong! please refresh the page!";
    }).finally(() => {
        showError(errorMessage);
    });
});
function showError(message) {
    loadingElement.style.display = "none";
    form.style.display = "block";
    if (message) {
        const errorElement = document.createElement("div");
        errorElement.classList.add("error");
        errorElement.textContent = message;
        form.before(errorElement);
        setTimeout(() => {
            errorElement.remove();
        }
            , 5000);
    }
}
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
            if (!response.ok) {
                throw new Error("Failed to fetch meows");
            }
            else {
                return response.json();
            }
        })
        .then((data) => {
            data.mews.forEach((meow) => {
                const date = new Intl.DateTimeFormat('en-US', options).format(new Date(meow.created));
                const meowDiv = document.createElement("div");
                meowDiv.classList.add("meow");
                const content = document.createElement("p");
                content.classList.add("bold", "x-larger");
                content.textContent = meow.content;
                const timestamp = document.createElement("span");
                timestamp.classList.add("smaller");
                timestamp.textContent = `Posted by ${meow.name} on ${date}`;

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
            loadcountContainerElement.style.display = "block";
            meowsloadingElement.style.display = "none";
            !finished && (loadMoreElement.style.display = "block");
            loading = false;
        });
}

ListAllMeows(true);