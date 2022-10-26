const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
client.connect();

const fs = require('fs');
const lang_dic = JSON.parse(fs.readFileSync('lang.json'));
const country_dic = JSON.parse(fs.readFileSync('country.json'));

function zh_country(iso_3166_1) {return country_dic[iso_3166_1]}
function zh_lang(lang) {return lang_dic[lang]}

async function zh_name(id) {
	let zh_name = await client.get(id.toString());
	let wiki_id = '';
	
	if (!zh_name) {
		zh_name = await axios.get(`https://www.wikidata.org/w/api.php?action=query&format=json&prop=entityterms&generator=search&formatversion=2&wbetlanguage=zh-cn&gsrsearch=haswbstatement%3A%22P4985%3D${id}%22`).then(resp => {
			try {
				zh_name = resp.data.query.pages[0].entityterms.label[0];
				client.set(id.toString(), zh_name);
				return zh_name;
			} catch {}
		})
	}

	return zh_name;
}


module.exports = (cat, id, res) => {
	if (cat == 'movie') {
		axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
			params: {
				language: 'zh-cn',
				api_key: 'f090bb54758cabf231fb605d3e3e0468',
				append_to_response: 'translations,credits'
			}
		}).then(async (resp) => {
			let data = resp.data;
			let poster = `https://image.tmdb.org/t/p/original${data.poster_path}`;
			
			let translations = data.translations.translations.filter(i => ['CN', 'SG', 'TW', 'US'].includes(i.iso_3166_1)).sort((a, b) => {return a.iso_3166_1.localeCompare(b.iso_3166_1)});
			let name = '';
			for (i of translations) {
				if (i.data.title) {
					name = i.data.title;
					break;
				}
			}

			let des = '';
			for (i of translations) {
				if (i.data.overview) {
					des = i.data.overview;
					break;
				}
			}

			let zh_names = new Set();
			for (i of translations.slice(0, -1)) {
				zh_names.add(i.data.title);
			}
			zh_names = Array.from(zh_names).join('/');

			let ori_name = data.original_title;
			let date = data.release_date;
			let year = date.slice(0, 4);

			let director = '';
			for (i of data.credits.crew) {
				if (i.job == "Director") {
					director = await zh_name(i.id);
					if (!director) {
						director = i.name;
					}
					break;
				}
			}

			let genres = [];
			for (i of data.genres) {
				genres.push(i.name);
			}
			genres = genres.join(' / ');

			let country = []
			for (i of data.production_countries) {
				country.push(zh_country(i.iso_3166_1));
			}
			country = country.join(' / ');

			let lang = zh_lang(data.original_language);
			let runtime = data.runtime;
			let imdb = `https://www.imdb.com/title/${data.imdb_id}/`;

			let cast = [];
			for (i of data.credits.cast.slice(0, 5)) {
				var cast_name = await zh_name(i.id);
				if (!cast_name) {
					cast_name = i.name;
				}
				cast.push({
					name: cast_name,
					character: i.character
				});
			}
			
			let castinfo = [];
			for (i of cast) {
				if (i.character) {
					castinfo.push(`${i.name} 饰 ${i.character}`);
				} else {
					castinfo.push(i.name);
				}
			}

			let info = `[img]${poster}[/img]
[size=3]
[b]${name} ${ori_name} (${year})[/b]
导演   ${director}
类型   ${genres}
国家   ${country}
语言   ${lang}
上映   ${date}
片长   ${runtime} 分钟
IMDb  ${imdb}
演员   ${castinfo.join('\n          ')}

${des}
[/size]`

			res.send({
				cat: 'movie',
				name: name,
				ori_name: ori_name,
				zh_names: zh_names,
				date: date,
				year: year,
				poster: poster,
				des: des,
				director: director,
				genres: genres,
				country: country,
				lang: lang,
				runtime: runtime,
				imdb: imdb,
				cast: cast,
				info: info
			})
		})
	}

	if (cat == 'tv') {
		axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
			params: {
				language: 'zh-cn',
				api_key: 'f090bb54758cabf231fb605d3e3e0468',
				append_to_response: 'translations,credits'
			}
		}).then(async (resp) => {
			let data = resp.data;

			let poster = [];
			for (i of data.seasons) {
				poster.push({
					name: i.name,
					path: `https://image.tmdb.org/t/p/original${i.poster_path}`
				})
			}
			
			let translations = data.translations.translations.filter(i => ['CN', 'SG', 'TW', 'US'].includes(i.iso_3166_1)).sort((a, b) => {return a.iso_3166_1.localeCompare(b.iso_3166_1)});
			let name = '';
			for (i of translations) {
				if (i.data.name) {
					name = i.data.name;
					break;
				}
			}

			let des = '';
			for (i of translations) {
				if (i.data.overview) {
					des = i.data.overview;
					break;
				}
			}

			let zh_names = new Set();
			for (i of translations.slice(0, -1)) {
				zh_names.add(i.data.name);
			}
			zh_names = Array.from(zh_names).join('/');

			let ori_name = data.original_name;
			let date = data.first_air_date;
			let year = date.slice(0, 4);

			let creator = [];
			for (i of data.created_by) {
				var creator_name = await zh_name(i.id);
				if (!creator_name) {
					creator_name = i.name;
				}
				creator.push(creator_name);
			}
			creator = creator.join(' / ');

			let genres = [];
			for (i of data.genres) {
				genres.push(i.name);
			}
			genres = genres.join(' / ');

			let country = []
			for (i of data.origin_country) {
				country.push(zh_country(i));
			}
			country = country.join(' / ');

			let lang = zh_lang(data.original_language);
			let imdb = `https://www.imdb.com/title/${data.imdb_id}/`;
			
			let network = [];
			for (i of data.networks) {
				network.push(i.name);
			}
			network = network.join(' / ');

			let cast = [];
			for (i of data.credits.cast.slice(0, 5)) {
				var cast_name = await zh_name(i.id);
				if (!cast_name) {
					cast_name = i.name;
				}
				cast.push({
					name: cast_name,
					character: i.character
				});
			}

			let castinfo = [];
			for (i of cast) {
				if (i.character) {
					castinfo.push(`${i.name} 饰 ${i.character}`);
				} else {
					castinfo.push(i.name);
				}
			}

			let info = `[size=3]
[b]${name} ${ori_name} (${year})[/b]
主创   ${creator}
类型   ${genres}
国家   ${country}
语言   ${lang}
网络	 ${network}
首播   ${date}
IMDb  ${imdb}
演员   ${castinfo.join('\n          ')}

${des}
[/size]`
			
			res.send({
				cat: 'tv',
				name: name,
				ori_name: ori_name,
				zh_names: zh_names,
				date: date,
				year: year,
				poster: poster,
				des: des,
				creator: creator,
				genres: genres,
				country: country,
				lang: lang,
				network: network,
				imdb: imdb,
				cast: cast,
				info: info
			})
		})
	}
}
