'Use strict'
$(function () {
    let entries;
    let sortedEntries;
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
            sortedEntries = entries;
            countGenres();
            showTags(genres);
            showResults();
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

    let showResults = () => {
        $('#results').empty();
        let resultElement = document.getElementById('results');
        //TODO EFFICIËNTER SCHRIJVEN
        sortedEntries.forEach(entry => {
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
        });
        //TO DO/ EFFICIËNTER SCHRIJVEN
        //ALS KLIK OP DOELGROEPTAG OF GENRETAG ZELFDE FUNCTIE OPROEPEN?
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
                this.classList.remove('selected');
                updateTags('off', this.classList);
            } else {
                //Is niet geselecteerd, de 'selected' class wordt toegevoegd en de array van geselecteerd tags wordt geupdatet
                this.classList.add('selected');
                updateTags('on', this.classList);
            }

            if (selectedGenres != [] || selectedDoelgroepen != []) {
                $('#removefilters').show();
            }

            //Update de resulten en tags wanneer een tag geselecteerd of gedeselecteerd wordt
            filterDoelgroepen();
            showResults();
            countGenres();
        })

        $('#removefilters').click(function () {
            removeFilters();
            $(this).hide();
        })
    }
    
    let filterDoelgroepen = () => {
        //Maak de nodige filterfuncties aan 
        const isFamily = entry => entry['age'] != undefined && entry['age'].replace('+', '') < 12;
        const getFamily = entries => (
            entries.filter(isFamily)
        )
        const isAdult = entry => entry['age'] == undefined || entry['age'].replace('+', '') >= 12;
        const getAdult = entries => (
            entries.filter(isAdult)
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
        showResults();
    }

    let countGenres = () => {
        //Filter de entries, haal de gesorteerde genres op en map de resultaten naar een nieuwe array
        const filteredEntries = sortedEntries.filter(
            entry => entry.genre != undefined
        );
        const correctedFilteredEntries = filteredEntries.map(entry => {
            return entry.genre.toLowerCase().trim()
        })

        //Reduce door te controleren hoeveel keer een genre voorkomt in de array van gesorteerde genres
        const reducedGenres = correctedFilteredEntries.reduce(groupBy, {})
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
        Object.entries(genres).forEach(genre => {
            $(`.tag.${genre[0]} .amount`).text(`${genre[1]}`);
        })
    }

    //Zet alle genres om naar kleine letters en trim de whitespace om ze te kunnen reducen
    let wordToLowercase = (word) => {
        return word.toLowerCase().trim();
    }

    let removeFilters = () => {
        //Steek alle entries opnieuw in de gesorteerde entry lijst en maak de lijst van geselecteerde genres leeg
        sortedEntries = entries;
        selectedGenres = [];
        selectedDoelgroepen = [];
        $('.tag').removeClass('selected');
        //Calculeer het aantal resultaten opnieuw en toon deze + de entries
        countGenres();
        showResults();
    }
});