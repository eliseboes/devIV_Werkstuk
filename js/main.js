 'Use strict'

 async function init() {
     const entryList = new Entrylist();
     await entryList.fetch();
     entryList.getGenres();
     entryList.sortGenres();
 }

 class Entrylist {
     //Creeër een constrcutor om bepaalde data in op te slagen
     constructor() {
         this.resultElement = document.getElementById('results');
         this.genreTagElement = document.getElementById('genretags');
         this.genreTagElement = document.getElementById('doelgroepentags');
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
            // showError(err.message);
         } finally {}
     }
     getGenres() {
         //Itereren over objecten, haal de beschikbaar genres op en push naar taglist genres
         //All words have to be capitalized in order to count them correctly
         this.entries.forEach(item =>{
                this.genres.push(item['genre-v2'])
         }
          );
     }
     sortGenres() {
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
         const genreNavElement = document.getElementById('genrenav');
         genres.forEach(genre => {
             console.log(genre)
         })
     }
 }

//  class Genre {
//     constructor(country) {
//       this.name = entry['genre'];
//       this.code = entry['genre-v2'];
//     }
//     get htmlString() {
//       return `
// <li>${this.name}</li>
//       `
//     }
//   }

 init();