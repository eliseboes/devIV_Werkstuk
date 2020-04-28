"use strict";

//Utils functions
function convertedTimeline(timeline){
  let convertedTimeline = {};
  convertedTimeline.label = Object.keys(timeline);
  convertedTimeline.data = Object.keys(timeline);
  return convertedTimeline;
}

function mergeLocationsToCountries(locations) {
  const countries = locations.reduce((acc, location) => {
    const found = acc.find(a => a.country_code === location.country_code);

    if (!found) {
      acc.push({
        country: location.country,
        country_code: location.country_code,
        confirmed: location.latest.confirmed,
        deaths: location.latest.deaths
      });
    } else {
      found.confirmed += location.latest.confirmed;
      found.deaths += location.latest.deaths;
    }

    return acc;
  }, []);

  return countries
}

function sortCountriesBy(param) {
  return function (a, b) {
    return b[param] - a[param];
  }
}

function showError(errMsg){
  const error = this.document.getElementById('error');
  error.innerHTML = `<p>${errMsg}</p>`;
  error.classList.add('error');
}


let chart;
//Init functie, deze wordt uitgevoerd wanneer de pagina wordt geladen
async function init() {
  const countryList = new CountryList();
  await countryList.fetch();
  countryList.filter();
  countryList.render();
  chart = new CustomChart('chart-confirmed');
}

class CountryList {
  constructor() {
    this.htmlElement = document.getElementById('countries');
    this.countries = [];
  }
  addEventListeners() {
    //Voeg voor elke 'checkbox'-input een evenlistener toe.
    //Op basis van de value van de checkbox ga je een functie uitvoeren op de instantie 'chart' van de klasse CustomChart
    //Deze heeft 2 functies 'addData' en 'removeData'
    let inputs = document.getElementsByName('countryCheckbox');
    inputs.forEach(input => {
      input.addEventListener('change', function (e) {
        console.log(e.target.checked);
        if(e.target.checked){
          chart.addData({});
        }else{
          chart.removeData({});
        }
      })
    })
  }

  async fetch() {
    try {
      //Haal de data op via: https://coronavirus-tracker-api.herokuapp.com/v2/locations
      //Gebruik de async await syntax om de data met 'fetch' op te halen via de URL en om de JSON data hier uit te halen
      //Gebruik de try catch syntax om eventuele errors af te handelen
      const response = await fetch('https://coronavirus-tracker-api.herokuapp.com/v2/locations')
      const data = await response.json()
      //Maak gebruik van de Utils functie om de data zo te organiseren dat er 1 object per land is
     // const countries = mergeLocationsToCountries(data.locations);
      //Maak nu voor elk object in 'countries' een instantie van de klasse 'Country' aan.
      //Bewaar deze instanties in de array 'this.countries'
      this.countries = data.locations.map(country => {
        return new Country(country)
      });
    } catch (err) {
      console.log(err)
      throw new Error(`could not fetch API ${err}`);
      showError(err.message);
    } finally {
    }
  }
  filter() {
    this.countries.sort(sortCountriesBy('confirmed'));
    //Zorg er nu voor dat enkel de 20 landen met de meeste besmettingen worden getoond.
    this.countries = this.countries.slice(0, 10);

    this.countries.filter(function(item){
      return item.type == "ar";         
  });
  }
  render() {
    //Haal de htmlStrings op voor alle Country's in this.countries
    //Injecteer deze in de html door gebruik te maken van this.htmlElement 
    //https://www.w3schools.com/jsref/prop_html_innerhtml.asp
    this.countries.forEach(country =>{
      let container = document.getElementById('countries');
      container.insertAdjacentHTML("afterend", country.htmlString);
    })   
    this.addEventListeners();
  }
}

class Country {
  constructor(country) {
    this.name = country.country;
    this.country_code = country.country_code;
    this.confirmed = country.latest.confirmed;
    this.deaths = country.latest.deaths;
    this.active = false;
  }
  get htmlString() {
    return `
    <li><span>${this.country_code}</span><span class="span-country">${this.name}</span><span>${this.confirmed}</span><span>${this.deaths}</span><span><input type="checkbox" name="countryCheckbox" value="${this.country_code}"></span>
    `
  }
}

class CustomChart {
  constructor(elementId) {
    this.canvas = document.getElementById(elementId);
    this.context = this.canvas.getContext('2d');
    this.createChart();
  }
  createChart() {
    this.chart = new Chart(this.context, {
      type: 'line',
      // The data for our dataset
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45]
        }]
      },
      // Configuration options go here
      options: {}
    });
  }
  async fetchData(id){
    try{
      const response = await fetch(`https://coronavirus-tracker-api.herokuapp.com/v2/locations/${id}`);
      const data = await response.json();
      return json.location;
    }catch(err){
      throw new Error('error');
      showError(err.message)
    }
  }
  async addData(d) {
    const detailedData = await fetchData(4);
    const timeline = convertedTimeline(timeline.confirmed.timeline);
    console.log('Added data', timeline)
  }
  removeData(d) {
    console.log('Removed data', d)
  }
}

init();


//Make list with sort (top & search)

//Create graph object

//On click get data & add data