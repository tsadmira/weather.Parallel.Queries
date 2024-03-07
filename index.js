const elements = {
    form : document.querySelector('.js-search'),
    containerForm : document.querySelector('.js-form-container'),
    list : document.querySelector('.js-list'),
    button : document.querySelector('.js-add'),
}
elements.button.addEventListener('click', hadlerClick);
elements.form.addEventListener('submit', hadlerSubmit);

function hadlerClick() { 
    elements.containerForm.insertAdjacentHTML('beforeend', '<input type="text" class="input-country" name="country" />')
}
async function hadlerSubmit(evt) {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget).getAll('country');
    const countries = formData.map(country => country.trim()).filter(country => country).filter((item,i,arr) => arr.indexOf(item) === i)
    try {
        const capital = await serviceCountry(countries);
        const weather = await serviceWeather(capital)

        elements.list.innerHTML = createdMarkup(weather)
    }
    catch (err) {
        console.log(err);
    }
    finally {
        elements.containerForm.innerHTML = '<input type="text" class="input-country" name="country" />'
    }
}
async function serviceCountry(countries) { 
    const BASE_URL = 'https://restcountries.com/v3.1/name/';
    const responses = countries.map(async country => {
        const response = await fetch(`${BASE_URL}${country}`);
        if (!response.ok) {
            return Promise.reject(response.statusText);
        }

        return response.json()
    })
    const data = await Promise.allSettled(responses);
    return data
        .filter(({ status }) => status === 'fulfilled')
        .map(({value}) => value[0].capital[0])
    
}
async function serviceWeather(capital) {
    const BASE_URL = 'http://api.weatherapi.com/v1/';
    const END_POINT = 'current.json';
    const API_KEY = '24d0d47e36e14b9b9f9124454242102';

    const responses = capital.map(async capital => { 
        const params = new URLSearchParams({
            key: API_KEY,
            q: capital,
            lang: 'uk',
        })
        const resp = await fetch(`${BASE_URL}${END_POINT}?${params}`)
        if (!resp.ok) {
            return Promise.reject(resp.statusText);
        }

        return resp.json()
    })
    const data = await Promise.allSettled(responses);
    console.log(data);
    return data
        .filter(({ status }) => status === 'fulfilled')
        .map(({
            value: {
                current: {
                    condition: { text, icon },
                    temp_c },
                location: { name, country } } }) => {
            return {text, icon, temp_c, name, country}
        })
}

function createdMarkup(arr) {
    return arr.map(({ country, icon, name, temp_c, text }) => `
        <li class="list-elements">
            <img src="${icon}" alt="${text}">
            <h2>${country}</h2>
            <h2>${name}</h2>
            <p>${text}</p>
            <p>${temp_c} °C</p>
        </li>`
    ).join('')
}