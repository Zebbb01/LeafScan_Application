import React from 'react';
import './Hero.css';
import arrow from '../../../assets/arrow.png';
import videoSource from '../../../assets/Cacao farming (360p).mp4';
import { Link } from 'react-scroll';

const Hero = () => {
  return (
    <div className='hero container'>
      {/* Adding the video background */}
      <video autoPlay muted loop className="hero-video">
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay on top of the video */}
      <div className="hero-overlay"></div>
      
      <div className='hero-text'>
        <h1>Cacao Leaf Disease Detection</h1>
        <p>Upload an image of the cacao leaf to detect diseases using our advanced detection system.</p>
        <Link to='hero container' smooth={true} offset={900} duration={500} className='btn'>
          Get Started <img src={arrow} alt='' />
        </Link>
      </div>
    </div>
  );
};

export default Hero;
