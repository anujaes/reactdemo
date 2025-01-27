'use strict'

const express = require('express')
const request = require('request')
const path = require('path')
// const tmdbApiKey = process.env.TMDB_API_KEY
const tmdbApiKey = '6838866538b632f6671c08a5facb8fbf'

const optionsTrending = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/trending/movie/day',
  qs: {
    api_key: tmdbApiKey,
    language: undefined
  }
}

const optionsTopRatedRecommended = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/movie/top_rated',
  qs: {
    api_key: tmdbApiKey,
    region: 'gb',
    language: undefined
  }
}

const optionsMovieDetails = {
  method: 'GET',
  url: undefined,
  qs: {
    api_key: tmdbApiKey,
    append_to_response: 'videos,credits',
    language: undefined
  }
}

const optionsMovieAutocomplete = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/search/movie',
  qs: {
    api_key: tmdbApiKey,
    query: undefined,
    language: undefined
  }
}

const optionsMovieReviews = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/review',
  qs: {
    api_key: tmdbApiKey,
    query: undefined,
    language: undefined
  }
}

let parsedResult

tmdbApiKey
  ? console.log('TMDb api key is found')
  : console.log('TMDb api key is NOT found among environment variables!')

async function apiCall(options) {
  // (I.) promise to return the parsedResult for processing
  function tmdbRequest() {
    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  // (II.)
  try {
    parsedResult = await tmdbRequest()
  } catch (e) {
    console.error(e)
  }
  return parsedResult
}

function endpointCreation() {
  try {
    const app = express()
    const port = 6000

    app.use(express.static(path.join(__dirname, 'client/build')))

    // providing a constant endpoint for trending movies
    app.get('/api/:lang/trending', async (req, res) => {
      const lang = req.params.lang
      optionsTrending.qs.language = lang
      res.json(await apiCall(optionsTrending))
      console.log(`/api/${lang}/trending endpoint has been called!`)
    })

    // providing a constant endpoint for a random top rated movie
    app.get('/api/:lang/topRatedRecommended', async (req, res) => {
      const lang = req.params.lang
      optionsTopRatedRecommended.qs.language = lang
      const topRatedResponse = await apiCall(optionsTopRatedRecommended)
      const randomIndex = Math.floor(Math.random() * Math.floor(20)) // one page contains exactly 20 results
      const topRatedRandomMovie = topRatedResponse.results[randomIndex]
      res.json(topRatedRandomMovie)
      console.log(`/api/${lang}/topRatedRecommended endpoint has been called!`)
    })

    // providing a dynamic endpoint to movie detail pages
    app.get('/api/:lang/movieDetails/:tmdbId', async (req, res) => {
      const id = req.params.tmdbId
      const lang = req.params.lang
      // console.log(req.params)
      optionsMovieDetails.qs.language = lang
      optionsMovieDetails.url = `https://api.themoviedb.org/3/movie/${id}`
      res.json(await apiCall(optionsMovieDetails))
      console.log(`/api/${lang}/movieDetails/${id} endpoint has been called!`)
    })

    // providing a dynamic endpoint to movie autocomplete
    app.get('/api/:lang/movieAutocomplete', async (req, res) => {
      const query = req.query.q
      const lang = req.params.lang
      optionsMovieAutocomplete.qs.language = lang
      optionsMovieAutocomplete.qs.query = query
      res.json(await apiCall(optionsMovieAutocomplete))
      console.log(`/api/${lang}/movieAutocomplete?q=${query} endpoint has been called!`)
    })

    // GET requet to get the reviews
    app.get('/api/:lang/reviews/:tmdbId', async (req, res) => {
      const id = req.params.tmdbId
      const lang = req.params.lang
      optionsMovieReviews.qs.language = lang
      optionsMovieReviews.url = `http://api.themoviedb.org/3/movie/${id}/reviews`
      res.json(await apiCall(optionsMovieReviews))
      console.log(`/api/${lang}/movieReviews/${id} endpoint has been called!`)
    })

    app.listen(port)

    console.log(`API is listening on ${port}`)
  } catch (e) {
    console.error(e)
  }
}
endpointCreation()
