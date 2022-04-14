import React from 'react'
import i18n from './../i18n.json'

export default function HomepageHeadingBox({ lang }) {
  const labels = i18n.homepageHeadingBox
  return (
    <div className='bg-dark text-light'>
      <div className='container'>
        <div className='row'>
          <h1 className='col'>Movies List</h1>
          <p className='alert alert-warning mx-3 w-50'>{labels.warning[lang]}</p>
        </div>
      </div>
    </div>
  )
}
