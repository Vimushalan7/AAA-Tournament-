const fs = require('fs');

async function getImageUrl(charName) {
  try {
    const res = await fetch('https://freefire.fandom.com/api.php?action=query&titles=' + charName + '&prop=pageimages&format=json&pithumbsize=300');
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

getImageUrl('Hayato').then(url => console.log('Hayato:', url));
getImageUrl('FreeFireHayato').then(url => console.log('FreeFireHayato:', url));
getImageUrl('Shimada_Hayato').then(url => console.log('Shimada_Hayato:', url));
getImageUrl('Hayato_Yagami').then(url => console.log('Hayato_Yagami:', url));
