const form = document.querySelector("form");
const loadingElement = document.querySelector(".loading");
const meowsElement = document.querySelector(".meows");
const API_URL = "http://localhost:5000/meows";
loadingElement.style.display = "none";
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formdata = new FormData(form);
    const name = formdata.get("name");
    const content = formdata.get("content");
    const meow = {
        name,
        content
    }
    loadingElement.style.display = "";
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
        form.style.display = "";
        ListAllMeows();
    }).catch((error) => {
        alert("Something went wrong! please try again!");
    }).finally(() => {
        loadingElement.style.display = "none";
        form.style.display = "";
    });
});

function ListAllMeows() {
    loadingElement.style.display = "";
    meowsElement.style.display = "none";
    meowsElement.innerHTML = "";
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    fetch(API_URL)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            data.reverse().map((meow) => {
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
        }).catch((error) => {
            alert("Something went wrong! please refresh the page!");
        }).finally(() => {
            loadingElement.style.display = "none";
            meowsElement.style.display = "";
        });
}

ListAllMeows();