import React, { useState, useEffect, Fragment, useCallback } from 'react'
import i18n from './../i18n.json'
import { Card, Container, Row, Col } from 'react-bootstrap'
import './css/reviews.css'

export default function MovieDetails({ selectedMovie, lang }) {
  const [data, setData] = useState(null)
  const [dataIsReady, setDataIsReady] = useState(false)
  const [id] = useState(selectedMovie)
  const [reviewData,setMovieReview] = useState(null)
  const [labels] = useState(i18n.details)

  const getTmdbApi = useCallback(async () => {
    try {
      const response = await fetch(`/api/${lang}/movieDetails/${id}`)
      const json = await response.json()
      // issue: #83; docs: https://www.themoviedb.org/documentation/api/status-codes
      if (json.status_code > 1) throw new Error('The resource you requested could not be found.')
      setData(json)
      setDataIsReady(true)
    } catch (e) {
      console.error(e)
    }
  }, [lang, id])

  const getReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/${lang}/reviews/${id}`)
      const json = await response.json()
      if (json.status_code > 1) throw new Error('The resource you requested could not be found.')
      setMovieReview(json)
    } catch (e) {
      console.error(e)
    }
  }, [lang, id])


  useEffect(() => {
    getTmdbApi()
    getReviews()
  }, [lang, getTmdbApi,getReviews])

  // component candidates:
  const getTitle = () => {
    const title = data.title
    return title
  }

  const getReleaseYear = () => {
    const releaseYear = data.release_date.match(/[0-9]{4}/)
    return releaseYear
  }

  const getReleaseDate = () => {
    const releaseDate = data.release_date
    return releaseDate
  }

  const getTagline = () => {
    const tagline = data.tagline
    return tagline
  }

  const getOverview = () => {
    const overView = data.overview
    return overView
  }

  const getRuntime = () => {
    const runtime = data.runtime
    return runtime
  }

  const getVotes = () => {
    const votes = data.vote_average
    return votes
  }

  const getGenres = () => {
    const genresArray = data.genres
    const genres = genresArray.map((genreElement, index) => (
      <span key={index + 1}>{(index ? ', ' : '') + genreElement.name}</span>
    ))
    return genres
  }

  const getCompanies = () => {
    const companiesArray = data.production_companies
    const companies = companiesArray.map((companyElement, index) => (
      <span key={index + 1}>{(index ? ', ' : '') + companyElement.name}</span>
    ))
    return companies
  }

  const getCompanyLogos = () => {
    const companiesArray = data.production_companies
    const companyLogos = companiesArray.map(companyElement => (
      <Fragment key={companyElement.id}>
        {companyElement.logo_path ? (
          <img
            className='company-logo-margin'
            src={'https://image.tmdb.org/t/p/w45' + companyElement.logo_path}
            alt='company logo'
          />
        ) : null}
      </Fragment>
    ))
    return companyLogos
  }

  const getBackground = () => {
    const background = data.backdrop_path
    return background
  }

  const getPoster = () => {
    const poster = 'https://image.tmdb.org/t/p/w342' + data.poster_path
    return poster
  }

  const getCrew = () => {
    const castImageBase = 'https://image.tmdb.org/t/p/w90_and_h90_face'
    // cast display priority: Director, Writer, Novel, Screenplay
    const directorArray = data.credits.crew.filter(crewMember => crewMember.job === 'Director')
    const writerArray = data.credits.crew.filter(crewMember => crewMember.job === 'Writer')
    const novelWriterArray = data.credits.crew.filter(crewMember => crewMember.job === 'Novel')
    const screenWriterArray = data.credits.crew.filter(crewMember => crewMember.job === 'Screenplay')
    const importantCrewArray = [...directorArray, ...writerArray, ...novelWriterArray, ...screenWriterArray]

    const importantCrewArrayReduced = importantCrewArray.reduce((acc, currentCastMember) => {
      let found = acc.find(el => el.name === currentCastMember.name)
      found ? (found.job = found.job + ' & ' + currentCastMember.job) : acc.push(currentCastMember)
      return acc
    }, [])

    const importantCrewMembers = importantCrewArrayReduced.map(crewMember => (
      <Fragment key={crewMember.id + crewMember.job}>
        <li className='col media my-3'>
          {crewMember.profile_path ? (
            <img alt={crewMember.name} src={castImageBase + crewMember.profile_path} className='mr-3 rounded-circle' />
          ) : (
            <div className='mr-3'>
              <svg width='90' height='90'>
                <circle cx='45' cy='45' r='45' fill='#D5D8DC' />
                Sorry, your browser does not support inline SVG.
              </svg>{' '}
            </div>
          )}
          <div className='media-body'>
            <h5 className='mt-0 mb-1'>{crewMember.name}</h5>
            {crewMember.job}
          </div>
        </li>
      </Fragment>
    ))
    return importantCrewMembers
  }

  const getCast = () => {
    const imagePath = 'https://image.tmdb.org/t/p/w500'
    const castDetails = data.credits.cast
    return (castDetails.slice(0, 10).map (castMember => {
      return (
        <Col md="auto" key={castMember.id}>
          <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={imagePath + castMember.profile_path} />
            <Card.Body>
              <Card.Title>{castMember.original_name}</Card.Title>
              <Card.Text>{castMember.character}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      )
    }))
  }

  const populateReviews = () => {
    const imagePath = 'https://image.tmdb.org/t/p/w500'
    const reviewDetails = reviewData.results
    return (reviewDetails.map ( reviewMember =>{
      return(
        <div className='row zero-mar child-container' key={reviewMember.id}>
          <div className='col-md-3 author-face'>
            <img src = {imagePath + reviewMember.author_details.avatar_path} alt={reviewMember.author}
              // onError={e => { e.currentTarget.src = './avatar.webp' }}
            />
            <p>{reviewMember.author}</p>
            <h6>{ new Date(reviewMember.updated_at).toLocaleString()}</h6>
          </div>
          <div className='col-md-9 review-content'>
            <p>{reviewMember.content}</p>
          </div>
        </div>
      )
    }))
  }

  const bgImage = dataIsReady
    ? 'linear-gradient(rgba(52,58,64,.6), rgba(52,58,64,.6)), url(https://image.tmdb.org/t/p/w1280' + getBackground() + ')'
    : 'url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)'

  return (
    <Fragment>
      {dataIsReady ? (
        <div className='container'>
          <header border-bottom='1px' solid='#000'>
            <h2 className='display-4 mt-2 heading-line' id='movieDetailsLabel' display='inline'>
              {getTitle()}
              <span className='lead heading-line'> ({getReleaseYear()}) </span>
            </h2>
          </header>
          {getTagline() === '' ? (
            <blockquote className='lead'> </blockquote>
          ) : (
            <blockquote className='blockquote-footer lead'>{getTagline()}</blockquote>
          )}
          <div className='row text-white greyscale-img-background' style={{ backgroundImage: bgImage }}>
            <div className='col-md-3 my-3'>
              <img src={getPoster()} alt='poster' className='poster-width' />
            </div>
            <div className='col m-4'>
              <div>
                <h4>{labels.overview[lang]}</h4>
                <p className='mb-2'>{getOverview()}</p>
              </div>
              <h4>{labels.creators[lang]}</h4>
              <div className='row'>
                <ul className='row list-unstyled list-group list-group-horizontal'>{getCrew()}</ul>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-3 my-3'>
              <h4>{labels.facts[lang]}</h4>
              {getCompanyLogos()}
              <br />
              <strong>{labels.company[lang]}</strong> {getCompanies()}
              <br />
              <strong>{labels.duration[lang]}</strong> {getRuntime()} {labels.mins[lang]}
              <br />
              <strong>{labels.genre[lang]}</strong> {getGenres()}
              <br />
              <strong>{labels.release[lang]}</strong> {getReleaseDate()}
              <br />
              <strong>{labels.voted[lang]}</strong> ★{getVotes()}/10
              <br />
            </div>
            <Container fluid="md">
              <Row className="justify-content-md-center">
                {getCast ()}
              </Row>
            </Container>
          </div>
          {/* reviews */}
          <Container className='container reviews-container' fluid='lg'>
            <h2>It's Review Time</h2>
            <div className='scroll-container'>
              {populateReviews()}
              {console.log(reviewData)}
            </div>
          </Container>
        </div>
      ) : null}
    </Fragment>
  )
}
