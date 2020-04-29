//'Use strict'
let entries;
let selectedDoelgroep;
//let selectedGenres = ["comedy", "dans", "theater", "muziektheater", "multidisciplinair", "circus", "opera", "concert", "figurentheater"];
let selectedGenres = []

//Roep de gewenste functies aan bij het laden van de pagina
fetchData();

async function fetchData() {
    try {
        //Gebruik de async await syntax om de data met 'fetch' op te halen via de URL en om de JSON data hier uit te halen
        //Gebruik de try catch syntax om eventuele errors af te handelen
        const response = await fetch('/data/entries.json')
        const data = await response.json()
        //Sla entries op in globale variabele
        entries = data.items;
        getGenres();
    } catch (err) {
        console.log(err)
        throw new Error(`could not fetch data ${err}`);
    } finally {}
}

let showTags = sortedGenres => {
    //Haal HTML-elementen op
    const resultElement = document.getElementById('results');
    const genreTagElement = document.getElementById('genretags');
    const doelgroepenTagElement = document.getElementById('doelgroepentags');
    //Loop over de 'key' en 'value' pairs van de gesorteerde lijst
    //Insert HTML elementen met properties uit de entry objecten
    Object.entries(sortedGenres).forEach(genre =>
        genreTagElement.insertAdjacentHTML('beforeend', `<li class='${genre[0]} tag'>
            ${genre[0]}
                <span class="amount">
                    ${genre[1]}
                </span>
            </li>`)
    )
    doelgroepenTagElement.insertAdjacentHTML('beforeend', `
        <li class='volwassenen tag'>
           volwassenen
        </li>
        <li class='familie tag'>
           familie
        </li>
        `)
}

let showResults = () => {
    $('#results').empty();
    let resultElement = document.getElementById('results');
    entries.forEach(entry => {
        selectedGenres.forEach(genre => {
            if (entry.genre != undefined && entry.genre.toLowerCase().trim() == genre) {
                let videoImg = entry.thumbnail.url;
                resultElement.insertAdjacentHTML('beforeend', `<figure class=${entry.genre}>
            <img src=${videoImg}>
              <figcaption>
                  <h3>${entry.name}</3>
                  <p>${entry.excerpt}</p>
                  <p>${entry['video-length']}</p>
              </figcaption>
            </figure>`)
            }
        });
    })

    let updateTags = (state, classList) => {
        if (state == 'on') {
            selectedGenres.push(classList);
        } else {
            selectedGenres.splice(selectedGenres.indexOf(classList), 1)
        }
        console.log(selectedGenres)
    }

    $('.tag').click(function () {
        //Check of de tag al geselecteerd is
        if (this.classList.contains('selected')) {
            //Is geselecteerd, de 'selected' class wordt verwijderd en de array van geselecteerd tags wordt geupdatet
            this.classList.remove('selected');
            updateTags('off', this.classList[0]);
        } else {
            //Is niet geselecteerd, de 'selected' class wordt toegevoegd en de array van geselecteerd tags wordt geupdatet
            this.classList.add('selected');
            updateTags('on', this.classList[0])
        }
        //Update de resulten en tags wanneer een tag geselecteerd of gedeselecteerd wordt
        showResults();
        showTags();
    })
}

let getGenres = () => {
    let genres = [];
    //Itereren over objecten, haal de beschikbaar genres op en push naar taglist genres
    entries.forEach(item => {
        if (item.genre != undefined) {
            //Tolowercase en trim gebruikt om de genres die verkeerd geschreven zijn toch te kunnen 'reducen'
            genres.push(item['genre'].toLowerCase().trim())
        }
    });
    sortGenres(genres);
}

sortGenres = genres => {
    //reduce de genres om de labels en aantallen te verkrijgen
    let sortedGenres = genres;
    sortedGenres = sortedGenres.reduce(groupBy, {})

    function groupBy(acc, genre) {
        const count = acc[genre] || 0;
        return {
            ...acc,
            [genre]: count + 1
        }
    }
    showTags(sortedGenres);
    showResults();
}

// function filterDoelgroepen() {
//     const isFamily = entry => entry['age'] != undefined && entry.age.trim() < 12;
//     const getFamily = entries => (
//         entries.filter(isFamily)
//     )
//     console.log(getFamily(this.entries))
//     //this.showElements();
// }

// // function filterGenres(genre) {
// //     const hasTheater = entry => entry['genre'] != undefined && entry['genre'].toLowerCase().trim() == genre
// //     const getTheater = entries => (
// //         entries.filter(hasTheater)
// //     )
// //     entryList.entries = getTheater(entryList.entries);
// //     console.log(entryList.entries)
// // }