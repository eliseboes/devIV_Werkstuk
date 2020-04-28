 'Use strict'

 async function init() {
    const entryList = new Entrylist();
    await entryList.fetch();
    entryList.getGenres();
    entryList.sortGenres();
    entryList.showGenres();
    entryList.showEntries();
 }

 class Entrylist {
     //Creeër een constrcutor om bepaalde data in op te slagen
     constructor() {
         this.resultElement = document.getElementById('results');
         this.genreTagElement = document.getElementById('genretags');
         this.doelgroepenTagElement = document.getElementById('doelgroepentags');
         this.entries = [];
         this.genres = [];
         this.doelgroepen = [];
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
         } catch (err) {
             console.log(err)
             throw new Error(`could not fetch data ${err}`);
         } finally {}
     }
     getGenres() {
         //Itereren over objecten, haal de beschikbaar genres op en push naar taglist genres
         this.entries.forEach(item => {
            if(item.genre != undefined){
                //Tolowercase en trim gebruikt om de genres die verkeerd geschreven zijn toch te kunnen 'reducen'
                this.genres.push(item['genre'].toLowerCase().trim())
            }
         });
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
         console.log(this.genres)
     }
     showGenres() {
         Object.keys(this.genres).forEach(genre => 
            this.genreTagElement.insertAdjacentHTML(`beforeend`, `<li class='${genre}'>${genre}</li>`)
        )
     }
     showEntries(){
         this.entries.forEach(entry =>{
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
     }
     
 }
 class Genre {
     constructor(entry) {
         this.name = entry['genre'];
         this.code = entry['genre-v2'];
     }
     get htmlString() {
         return `<li class="${this.name}">${this.name}</li>`
     }
 }

 init();