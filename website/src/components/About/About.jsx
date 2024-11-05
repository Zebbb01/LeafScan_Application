import React from 'react'
import './About.css'
import about_img from '../../assets/about.png'
import play_icon from '../../assets/play-icon.png'
import logo from '../../assets/logo.png'

const About = ({setPlayState}) => {
  return (
    <div className='about'>
        <div className='about-left'>
            <img src={about_img} alt='' className='about-img' />
            <img src={logo} alt="logo" className='logo-video' />
            <img src={play_icon} alt='' className='play-icon' onClick = {() =>{setPlayState(true)}} />
        </div>
        <div className='about-right'>
            <h3>ABOUT CACAO</h3>
            <h2>Cacao Leaf Disease Detection System</h2>
            <p>
      The Cacao Leaf Disease Detection System is an advanced tool designed to identify and forecast various diseases that affect cacao plants. This system utilizes machine learning and data analysis to provide accurate and timely predictions, helping farmers and researchers protect their crops and improve yields.
    </p>
    <p>
      Our system is capable of detecting multiple types of diseases that commonly affect cacao leaves. By analyzing visual data and environmental factors, it can predict the onset of diseases and suggest preventive measures.
    </p>
    <p>
      With this technology, we aim to support sustainable cacao farming practices and ensure the health and productivity of cacao plants. Our detection system is user-friendly and can be integrated into existing agricultural workflows to provide real-time insights and recommendations.
    </p>
            
        </div>
    </div>
  )
}

export default About