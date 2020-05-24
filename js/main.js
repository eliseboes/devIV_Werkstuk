'Use strict';
$(function () {
    let entries;
    let selectedGenres = [];
    let selectedDoelgroepen = [];

    //Roep de gewenste functies aan bij het laden van de pagina
    fetchData();
    $('#removefilters').hide();

    async function fetchData() {
        try {
            //Gebruik de async await syntax om de data met 'fetch' op te halen via de URL en om de JSON data hier uit te halen
            //Gebruik de try catch syntax om eventuele errors af te handelen
            const response = await fetch('../data/entries.json')
            const data = await response.json()
            //Sla entries op in globale variabele
            entries = data.items;
            //Voer de functies uit voor alle opgeslagen entries
            countGenres(entries);
            const cumulatedGenres = countGenres(entries);
            showTags(cumulatedGenres);
            showResults(entries);
            searchResults(entries);
        } catch (err) {
            console.log(err)
            throw new Error(`could not fetch data ${err}`);
        } finally {}
    }

    const showTags = sortedGenres => {
        //Haal HTML-elementen op
        const resultElement = document.getElementById('results');
        const genreTagElement = document.getElementById('genretags');
        const doelgroepenTagElement = document.getElementById('doelgroepentags');
        //Loop over de 'key' en 'value' pairs van de gesorteerde lijst
        //Insert HTML elementen met properties uit de entry objecten (geselecteerde genre/key en aantal/value)
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
    //Toon de gesorteerde entries
    const showResults = sortedEntries => {
        $('#results').empty();
        const resultElement = document.getElementById('results');
        sortedEntries.forEach(entry => {
            let videoImg = entry.thumbnail.url;
            resultElement.insertAdjacentHTML('beforeend', `<figure class=${entry['genre-v2']} ${entry.category}>
           <div class="img-wrapper"> <img src=${videoImg}><span class="age"></span>
           <span class="genre-disp">${entry['genre-v2']}</span></div>
              <figcaption>
                  <h3>${entry.name}</3>
                  <p class="description">${entry.excerpt}</p>
                  <p class="video-length">${entry['video-length']}</p>
              </figcaption>
            </figure>`)
        });

        //Het item wordt in array geplaatst of eruit gehaald
        //aan de hand van de status (geselecteerd of niet) en het type (doelgroep of genre)
        let updateTags = (state, classList) => {
            if (state == 'on' && classList[0] == 'doelgroep') {
                selectedDoelgroepen.push(classList[1])
            } else if (state == 'on' && classList[0] == 'genre') {
                selectedGenres.push(classList[1])
            } else if (state == 'off' && classList[0] == 'doelgroep') {
                selectedDoelgroepen.splice(selectedDoelgroepen.indexOf(classList[1]), 1)
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

            //Als eender welke lijst van filters niet leeg is, verschijnt de 'remove tags' link
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

    const filterDoelgroepen = () => {
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

        //Filter enkel doelgroepen of ook genres aan de hand van de lengte van de array 'selectedGenres'
        if (selectedGenres.length == 0) {
            showResults(sortedEntries);
        } else {
            filterGenres(sortedEntries);
        }

        const cumulatedGenres = countGenres(sortedEntries);
            //Nodige error handling wanneer de aantallen niet geüpdatet kunnen worden
        try{
            updateCount(cumulatedGenres)
        }
        catch(err){
            console.log(`Update count: ${err}`)
        };
    }

    //Filter de entries aan de hand van de geselecteerde genres
    const filterGenres = sortedEntries => {
        $('.figure').hide();
        const sortedByGenre = [];
        //Loop over alle entries en genres
        sortedEntries.forEach(entry => {
            selectedGenres.forEach(genre => {
                //Als het geselecteerde genre gelijk is aan de value genre-v2 van het entry object, sla deze dan op in de gesorteerde entry lijst
                if (entry['genre-v2'] == genre) {
                    sortedByGenre.push(entry);
                }
            });
        });
        showResults(sortedByGenre);
    }

    const countGenres = sortedEntries => {
        //Maak een array 'filteredEntries' aan en
        //Bewaar enkel het 'genre-v2' property van de entry objecten in deze array
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
        return reducedGenres;
    }

    const updateCount = (genres) => {
        //Reset waarde van aantal entries per genre
        $('.tag.genre .amount').text('0');
        //Verander de tekst in de tags van het vorige aantal naar het huidige aantal
        Object.entries(genres).forEach(genre => {
            $(`.tag.${genre[0]} .amount`).text(`${genre[1]}`);
        })
    }

   const removeFilters = () => {
        //Steek alle entries opnieuw in de gesorteerde entry lijst en maak de lijst van geselecteerde genres leeg
        selectedGenres = [];
        selectedDoelgroepen = [];
        $('.tag').removeClass('selected');
        //Calculeer het aantal resultaten opnieuw en toon deze + de entries
        try{
            countGenres(entries);
        }catch(err){
            console.log(`Update count: ${err}`)
        };
        showResults(entries);
    }

    const searchResults = entries => {
        //Wanneer de waarde in het searchveld verandert
        $('#searchvideos').unbind().on('keyup', function () {
            //Maak een nieuwe array voor de gefilterde entries aan
            const searchResults = [];
            const searchInput = $(this).val();
            //Vergelijk of de waarde in het invulveld gelijk is aan een waarde binnen de values van alle entry objecten
            entries.forEach(entry => {
                Object.values(entry).forEach(value => {
                    if (typeof (value) == 'string' && value.includes(searchInput)) {
                        searchResults.push(entry);
                    }
                })
            })
            //Toon de opnieuw gefilterde resultaten
            showResults(searchResults);
        });
    }
});