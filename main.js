 'Use strict'
 let fetchedData = [];
 let allGenres = [];

function showGenres(genres){
    const genreNavElement = document.getElementById('genrenav');
      genres.forEach(genre =>{
         console.log(genre)
     })
}

 function getGenres(allEntries) {
    let allGenres = [];
    //iterate over objects, get the genre and push to taglists
    allEntries.forEach(item =>
        allGenres.push(item.genre)
    );
    showGenres(allGenres)
}

 function getData() {
     $.ajax({
         url: '/data/entries.json',
         method: 'GET'
     }).done(function (data) {
         //Fetch all entry data from JSON file and store in a global variable
         fetchedData = data.items;
         getGenres(fetchedData);
     }).fail(function (err1, err2) {
         console.log(err1);
         console.log(err2);
     }).always(function () {
         console.log('always');
     });
 }

getData();
