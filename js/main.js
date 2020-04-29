 'Use strict'

 async function init() {
     //Roep de gewenste functies aan bij het laden van de pagina
     const entryList = new Entrylist();
     await entryList.fetch();
     entryList.showElements();
 }

 class Entrylist {
     //Creeër een constructor om bepaalde data in op te slagen
     constructor() {
         this.resultElement = document.getElementById('results');
         this.genreTagElement = document.getElementById('genretags');
         this.doelgroepenTagElement = document.getElementById('doelgroepentags');
         this.entries = [];
         this.genres = [];
     }
     async fetch() {
         try {
             //Gebruik de async await syntax om de data met 'fetch' op te halen via de URL en om de JSON data hier uit te halen
             //Gebruik de try catch syntax om eventuele errors af te handelen
             const response = await fetch('/data/entries.json')
             const data = await response.json()
             this.entries = data.items.map(entry => {
                 return entry
             });
             this.getGenres();
         } catch (err) {
             console.log(err)
             throw new Error(`could not fetch data ${err}`);
         } finally {}
     }
     addEventListeners() {
         let tags = document.querySelectorAll('.tag');
         let selectedTags = document.querySelectorAll('.selected');
         let chosenTags = [];
         tags.forEach(evalTag => {
             evalTag.addEventListener('click', function (e) {
                 if (this.classList.contains('selected')) {
                     this.classList.remove('selected');
                     chosenTags.pop(this.classList[0])
                 } else {
                     this.classList.add('selected');
                     chosenTags.push(this.classList[0])
                 }
             })
         })
     }
     getGenres() {
         //Itereren over objecten, haal de beschikbaar genres op en push naar taglist genres
         this.entries.forEach(item => {
             if (item.genre != undefined) {
                 //Tolowercase en trim gebruikt om de genres die verkeerd geschreven zijn toch te kunnen 'reducen'
                 this.genres.push(item['genre'].toLowerCase().trim())
             }
         });
         this.sortGenres();
     }
     sortGenres() {
         //reduce de genres om de labels en aantallen te verkrijgen
         this.genres = this.genres.reduce(groupBy, {})

         function groupBy(acc, genre) {
             const count = acc[genre] || 0;
             return {
                 ...acc,
                 [genre]: count + 1
             }
         }
     }
     filterGenres() {
         //const hasGenre = entry => entry.genre >= 90
     }
     filterDoelgroepen() {
         this.entries.forEach(entry => {
             const isVolwassen = entry => entry.age >= 90
         })
     }
     showElements() {
         //Loop over de 'key' en 'value' pairs van de gesorteerde lijst
         Object.entries(this.genres).forEach(genre =>
             this.genreTagElement.insertAdjacentHTML('beforeend', `<li class='${genre[0]}} tag'>
             ${genre[0]}
                 <span class="amount">
                     ${genre[1]}
                 </span>
             </li>`)
         )
         this.doelgroepenTagElement.insertAdjacentHTML('beforeend', `
         <li class='volwassenen tag'>
            volwassenen
         </li>
         <li class='familie tag'>
            familie
         </li>
         `)
         this.entries.forEach(entry => {
             let videoImg = entry.thumbnail.url;
             this.resultElement.insertAdjacentHTML('beforeend', `<figure class=${entry.genre}>
             <img src=${videoImg}>
               <figcaption>
                   <h3>${entry.name}</3>
                   <p>${entry.excerpt}</p>
                   <p>${entry['video-length']}</p>
               </figcaption>
             </figure>`)
         })
         this.filterDoelgroepen()
         this.addEventListeners();
     }

 }

 class Genre {
     constructor(entry) {
         this.name = entry['genre'];
         this.id = entry['genre-v2'];
     }
     get htmlString() {
         return `beforeend`, `<li class='${this.id}} tag'>
        ${this.name}
            <span class="amount">
                ${this.name}
            </span>
        </li>`
     }
 }

 init();