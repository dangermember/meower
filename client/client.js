const form = document.querySelector("form");
const loadingElemnt = document.querySelector(".loading");
const API_URL = "http://localhost:5000/meows";
loadingElemnt.style.display = "none";
form.addEventListener("submit",(event)=>{
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
    fetch(API_URL,{
        method:"POST",
        body: JSON.stringify(meow),
        headers:{
            'content-type': 'application/json'
        }
    })
});