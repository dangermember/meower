const form = document.querySelector("form");
const loadingElemnt = document.querySelector(".loading");
const meowsElemnt = document.querySelector(".meows");
const API_URL = "http://localhost:5000/meows";
loadingElemnt.style.display = "none";
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formdata = new FormData(form);
    const name = formdata.get("name");
    const content = formdata.get("content");
    const meow = {
        name,
        content
    }
    loadingElemnt.style.display = "";
    form.style.display = "none";
    console.log(meow);
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(meow),
        headers: {
            'content-type': 'application/json'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        form.reset();
        loadingElemnt.style.display = "none";
        form.style.display = "";
        ListAllMeows();
    });
});

function ListAllMeows() {
    loadingElemnt.style.display = "";
    meowsElemnt.style.display = "none";
    meowsElemnt.innerHTML = "";
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
                meowsElemnt.appendChild(meowDiv);
            });
        });
    loadingElemnt.style.display = "none";
    meowsElemnt.style.display = "";

}

ListAllMeows();