import React from 'react'
import './About.css'
import about_img from '../../assets/about.png'
import play_icon from '../../assets/play-icon.png'
import logo from '../../assets/logo.png'

const About = ({ setPlayState }) => {
  return (
    <div className='about'>
        <div className='about-left'>
            <img src={about_img} alt='' className='about-img' />
            <img src={logo} alt="logo" className='logo-video' />
            <img src={play_icon} alt='' className='play-icon' onClick={() => { setPlayState(true) }} />
        </div>
        <div className='about-right'>
            <h3>ABOUT CACAO</h3>
            <h2>Cacao Leaf Disease Detection System</h2>
            <p>
              The Cacao Leaf Disease Detection System is designed to help farmers protect their cacao crops from a range of diseases. Using advanced machine learning, this system accurately identifies various common cacao leaf diseases based on images of the leaves. By analyzing the images and providing preventive measures, the system helps farmers take action before the diseases spread, minimizing crop damage and improving harvest quality.
              The system can detect several cacao leaf diseases, including Cacao Early Blight, Cacao Late Blight, Cacao Leaf Spot, and Branch Dieback. For each detected disease, it provides useful information such as its cause, contributing factors, and prevention methods. This knowledge is essential for farmers to make informed decisions on how to manage their crops effectively.
            </p>
            <p>
              For example, the system helps prevent diseases like Cacao Early Blight, which can be mitigated by using resistant cacao varieties, applying fungicides, and ensuring proper spacing between trees. Similarly, Branch Dieback can be controlled by implementing regular pruning practices and improving soil nutrition. Each disease detection includes detailed advice to manage and prevent the disease, ensuring a healthier crop and better yield.
              In addition to disease detection, the system forecasts cacao production trends based on historical data, weather patterns, and environmental factors. This feature helps farmers plan their resources better, ensuring they are prepared for the upcoming season’s harvest.
            </p>
            <p>
              To visualize cacao production trends, we’ve included a bar graph that showcases cacao fruit production over the years. This allows farmers to track past performance and assess the impact of various factors on production, helping them make more informed decisions for the future.
              The goal of this system is to combine disease detection, forecasting, and data visualization to support farmers in growing cacao more sustainably and productively. The system is easy to use and can be seamlessly integrated into existing farming practices, providing valuable insights and tools for informed decision-making.
            </p>
        </div>
    </div>
  )
}

export default About
