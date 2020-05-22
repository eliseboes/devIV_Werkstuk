'Use strict';
$(function () {
    let entries;
    let selectedGenres = [];
    let selectedDoelgroepen = [];
    let genres = [];

    //Roep de gewenste functies aan bij het laden van de pagina
    fetchData();
    $('#removefilters').hide();

    async function fetchData() {
        try {
            //Gebruik de async await syntax om de data met 'fetch' op te halen via de URL en om de JSON data hier uit te halen
            //Gebruik de try catch syntax om eventuele errors af te handelen
            const response = await fetch('data/entries.json')
            const data = await response.json()
            //Sla entries op in globale variabele
            entries = data.items;
            countGenres(entries);
            showTags(genres);
            showResults(entries);
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
        //Insert HTML elementen met properties uit de entry objecten (geselecteerde genre en aantal)
        Object.entries(sortedGenres).forEach(genre =>
            genreTagElement.insertAdjacentHTML('beforeend', `<li class='genre ${genre[0]} tag'>
            ${genre[0]}
                <span class="amount">
                    ${genre[1]}
                </span>
            </li>`)
        )
        doelgroepenTagElement.insertAdjacentHTML('beforeend', `
        <li class='doelgroep volwassenen tag'>
           volwassenen
        </li>
        <li class='doelgroep iedereen tag'>
           familie
        </li>
        `)
    }
    let showResults = sortedEntries => {
        $('#results').empty();
        let resultElement = document.getElementById('results');
        sortedEntries.forEach(entry => {
            selectedGenres.forEach(genre => {
                if (entry['genre-v2'] == genre) {
                    let videoImg = entry.thumbnail.url;
                    resultElement.insertAdjacentHTML('beforeend', `<figure class=${entry['genre-v2']}>
            <img src=${videoImg}>
              <figcaption>
                  <h3>${entry.name}</3>
                  <p>${entry.excerpt}</p>
                  <p>${entry['video-length']}</p>
              </figcaption>
            </figure>`)
                }
            });
        });
        let updateTags = (state, classList) => {
            if (state == 'on' && classList[0] == 'doelgroep') {
                selectedDoelgroepen.push(classList[1])
            } else if (state == 'on' && classList[0] == 'genre') {
                selectedGenres.push(classList[1])
            } else if (state == 'off' && classList[0] == 'doelgroep') {
                selectedDoelgroepen.splice(selectedGenres.indexOf(classList[1]), 1)
            } else {
                selectedGenres.splice(selectedGenres.indexOf(classList[1]), 1);
            }
        }

        $('.tag').unbind().click(function () {
            //Check of de tag al geselecteerd is
            if (this.classList.contains('selected')) {
                //Is geselecteerd, de 'selected' class wordt verwijderd en de array van geselecteerd tags wordt geupdatet
                updateTags('off', this.classList);
            } else {
                //Is niet geselecteerd, de 'selected' class wordt toegevoegd en de array van geselecteerd tags wordt geupdatet
                updateTags('on', this.classList);
            }
            $(this).toggleClass('selected');

            if (selectedGenres != [] || selectedDoelgroepen != []) {
                $('#removefilters').show();
            }

            //Update de resulten en tags wanneer een tag geselecteerd of gedeselecteerd wordt
            filterDoelgroepen();
        })

        $('#removefilters').click(function () {
            removeFilters();
            $(this).hide();
        })
    }
    
    let filterDoelgroepen = () => {
        let sortedEntries = [];
        //Maak de nodige filterfuncties aan 
        const getFamily = entries => (
            entries.filter(entry => entry.category == 'familie')
        )
        const getAdult = entries => (
            entries.filter(entry => entry.category == 'volwassenen')
        )
        //Check of de lijst geselecteerde doelgroepen de nodige tag bevat en filter de resultaten
        if (selectedDoelgroepen.length == 1 && selectedDoelgroepen.includes('iedereen')) {
            sortedEntries = getFamily(entries);
        } else if (selectedDoelgroepen.length == 1 && selectedDoelgroepen.includes('volwassenen')) {
            sortedEntries = getAdult(entries);
        } else {
            //Bij geen of beide doelgroepen geselecteerd: Steek alle entries opnieuw in de lijst van gesorteerde entries
            sortedEntries = entries;
        }
        showResults(sortedEntries);
        countGenres(sortedEntries);
    }

    let countGenres = sortedEntries => {
        const filteredEntries = sortedEntries.map(entry => {
            return entry['genre-v2']
        })

        //Reduce door te controleren hoeveel keer een genre voorkomt in de array van gesorteerde genres
        const reducedGenres = filteredEntries.reduce(groupBy, {})
        function groupBy(acc, genre) {
            const count = acc[genre] || 0;
            return {
                ...acc,
                [genre]: count + 1
            }
        }
        genres = reducedGenres;
        updateCount();
    }

    let updateCount = () => {
        //Verander de tekst in de tags van het vorige aantal naar het huidige aantal
        Object.entries(genres).forEach(genre => {
            $(`.tag.${genre[0]} .amount`).text(`${genre[1]}`);
        })
    }

    let removeFilters = () => {
        //Steek alle entries opnieuw in de gesorteerde entry lijst en maak de lijst van geselecteerde genres leeg
        selectedGenres = [];
        selectedDoelgroepen = [];
        $('.tag').removeClass('selected');
        //Calculeer het aantal resultaten opnieuw en toon deze + de entries
        countGenres(entries);
        showResults(entries);
    }
});