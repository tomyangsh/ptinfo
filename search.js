const axios = require('axios')

module.exports = (query, res) => {
  axios.get('https://api.themoviedb.org/3/search/multi', {
    params: {
      query: query,
      language: 'zh-cn',
      api_key: 'f090bb54758cabf231fb605d3e3e0468'
    }
  }).then(resp => {
    let data = resp.data;
    let results = [];

    for (i of data.results) {
      let poster = '';
      if (i.poster_path) {
        poster = 'https://image.tmdb.org/t/p/original' + i.poster_path;
      } 
      if (i.media_type == 'movie') {
        results.push({'id': i.id, 'cat': 'movie', 'name': i.title, 'date': i.release_date, 'poster': poster});
      } else if (i.media_type == 'tv') {
        results.push({'id': i.id, 'cat': 'tv', 'name': i.name, 'date': i.first_air_date, 'poster': poster});
      }
    }

    res.send(results);
  })
}
