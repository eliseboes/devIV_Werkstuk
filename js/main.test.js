"use strict";

test(`
Wanneer je countGenres uitvoert, zal deze functie het aantal genres teruggeven die in de array voorkomen
`, () => {
  expect(countGenres([comedy, comedy, comedy, dans, dans, dans, dans, theater, theater])).toBe({comedy:3, dans: 4, theater: 2});
});


let countGenres = (sortedEntries) => {
    const filteredEntries = sortedEntries.filter(
        entry => entry.genre != undefined
    );
    const correctedFilteredEntries = filteredEntries.map(entry => {
        return entry.genre.toLowerCase().trim()
    })

    const reducedGenres = correctedFilteredEntries.reduce(groupBy, {})
    function groupBy(acc, genre) {
        const count = acc[genre] || 0;
        return {
            ...acc,
            [genre]: count + 1
        }
    }
    return reducedGenres;
}