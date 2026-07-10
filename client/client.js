export const API_URL = 'http://localhost:5000/meows';
export const PAGE_LIMIT = 5;

export const DATE_FORMAT_OPTIONS = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
};

export function formatMeowDate(date, options = DATE_FORMAT_OPTIONS) {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

export function createMeowElement(meow, options = DATE_FORMAT_OPTIONS) {
    const date = formatMeowDate(meow.created, options);
    const meowDiv = document.createElement('div');
    meowDiv.classList.add('meow');

    const content = document.createElement('p');
    content.classList.add('bold', 'x-larger');
    content.textContent = meow.content;

    const timestamp = document.createElement('span');
    timestamp.classList.add('smaller');
    timestamp.textContent = `Posted by ${meow.name} on ${date}`;

    meowDiv.appendChild(content);
    meowDiv.appendChild(timestamp);
    return meowDiv;
}

export function showError(message, { loadingElement, form }) {
    loadingElement.style.display = 'none';
    form.style.display = 'block';
    if (message) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error');
        errorElement.textContent = message;
        form.before(errorElement);
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
        return errorElement;
    }
}

export function setupClient(root = document, apiUrl = API_URL) {
    const form = root.querySelector('form');
    const loadingElement = root.querySelector('.loading');
    const meowsContainerElement = root.querySelector('.meows-container');
    const meowsloadingElement = root.querySelector('.meowsloading');
    const meowsElement = root.querySelector('.meows');
    const loadMoreElement = root.querySelector('.loadMore');
    const loadcountContainerElement = root.querySelector('.loadcountContainer');
    const loadCountElement = root.querySelector('#loadcount');
    const totalCountElement = root.querySelector('#totalcount');
    let page = 1;
    let loading = false;
    let finished = false;

    function ListAllMeows(reset = false) {
        meowsloadingElement && (meowsloadingElement.style.display = 'block');
        loadMoreElement && (loadMoreElement.style.display = 'none');
        loading = true;
        if (reset) {
            meowsElement && (meowsElement.innerHTML = '');
            page = 1;
            finished = false;
        }

        fetch(`${apiUrl}?page=${page}&limit=${PAGE_LIMIT}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch meows');
                }
                return response.json();
            })
            .then((data) => {
                data.mews.forEach((meow) => {
                    meowsElement.appendChild(createMeowElement(meow));
                });
                finished = data.meta.has_more === false;
                loadCountElement.textContent = meowsElement.children.length;
                totalCountElement.textContent = data.meta.total;
            }).catch(() => {
                alert('Something went wrong! please refresh the page!');
            }).finally(() => {
                loadcountContainerElement && (loadcountContainerElement.style.display = 'block');
                meowsloadingElement && (meowsloadingElement.style.display = 'none');
                if (!finished && loadMoreElement) {
                    loadMoreElement.style.display = 'block';
                }
                loading = false;
            });
    }

    meowsContainerElement?.addEventListener('scroll', () => {
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

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formdata = new FormData(form);
        const name = formdata.get('name');
        const content = formdata.get('content');
        let errorMessage;
        const meow = { name, content };

        loadingElement.style.display = 'block';
        form.style.display = 'none';

        fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(meow),
            headers: {
                'content-type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                switch (response.status) {
                    case 422:
                        return response.json().then((data) => {
                            showError(data.message, { loadingElement, form });
                        });
                    case 429:
                        errorMessage = 'Please wait a while before sending another meow';
                        break;
                    default:
                        errorMessage = 'Something went wrong';
                }
                return;
            }
            return response.json();
        }).then((data) => {
            if (data) {
                form.reset();
                form.style.display = 'block';
                ListAllMeows(true);
            }
        }).catch(() => {
            errorMessage = 'Something went wrong! please refresh the page!';
        }).finally(() => {
            showError(errorMessage, { loadingElement, form });
        });
    });

    ListAllMeows(true);

    return { ListAllMeows };
}

setupClient();