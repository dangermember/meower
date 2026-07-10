const form = document.querySelector("form");
const loadingElemnt = document.querySelector(".loading");
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
});