import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import video from './assets/Cacao farming (360p).mp4'; // Import the video

const Navbar = React.lazy(() => import('./components/Navbar/Navbar'));
const Hero = React.lazy(() => import('./components/Navbar/Hero/Hero'));
const Collections = React.lazy(() => import('./components/Collections/Collections'));
const Title = React.lazy(() => import('./components/Title/Title'));
const About = React.lazy(() => import('./components/About/About'));
const Contact = React.lazy(() => import('./components/Contact/Contact'));
const Footer = React.lazy(() => import('./components/Footer/Footer'));
const VideoPlayer = React.lazy(() => import('./components/VideoPlayer/VideoPlayer'));
const SignUp = React.lazy(() => import('./components/SignUp/SignUp'));
const Login = React.lazy(() => import('./components/Login/Login'));
const UpdateProfile = React.lazy(() => import('./components/UpdateProfile/UpdateProfile'));
const Scan = React.lazy(() => import('./components/Scan/Scan'));
const Forecast = React.lazy(() => import('./components/Forecast/ForecastLine'));

const App = () => {
  const [user, setUser] = useState(null);
  const [playState, setPlayState] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Add or remove authBackground for video background pages
    if (['/', '/signup', location.pathname.startsWith('/update/')].includes(location.pathname)) {
      document.body.classList.add('authBackground');
    } else {
      document.body.classList.remove('authBackground');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <>
      {/* Conditionally render video background and overlay on login, signup, and update profile pages */}
      {(location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/')) && (
        <>
          <video autoPlay muted loop className="video-background">
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div>
        </>
      )}

      {/* Conditionally render Navbar only on non-auth pages */}
      {!(location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/')) && (
        <Suspense fallback={<div>Loading Navbar...</div>}>
          <Navbar user={user} onLogout={handleLogout} />
        </Suspense>
      )}

      {/* Conditionally render pages: home, scan, etc. */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/' element={<Login setUser={setUser} />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/update/:id' element={<UpdateProfile setUser={setUser} />} />
          <Route path='/home' element={
            <div className='App'>
              {/* Home, Scan, Forecast, etc. should only be visible if the user is authenticated */}
              {user && (
                <>
                  <Suspense fallback={<div>Loading Hero...</div>}>
                    <Hero />
                  </Suspense>
                  <div className="container">
                    <Suspense fallback={<div>Loading Title...</div>}>
                      <Title subTitle='Disease Detection' title='Scan Your Cacao Leaf' />
                    </Suspense>
                    <Suspense fallback={<div>Loading Scan...</div>}>
                      <Scan />
                    </Suspense>
                    <Suspense fallback={<div>Loading Title...</div>}>
                      <Title subTitle='Disease Overview' title='Types of Cacao Leaf Diseases' />
                    </Suspense>
                    <Suspense fallback={<div>Loading Collections...</div>}>
                      <Collections />
                    </Suspense>
                    <Suspense fallback={<div>Loading Title...</div>}>
                      <Title subTitle='Forecasting' title='Cacao Fruit Production Forecast' />
                    </Suspense>
                    <Suspense fallback={<div>Loading Forecast...</div>}>
                      <Forecast />
                    </Suspense>
                    <Suspense fallback={<div>Loading About...</div>}>
                      <About setPlayState={setPlayState} />
                    </Suspense>
                    <Suspense fallback={<div>Loading Title...</div>}>
                      <Title subTitle='Reach Out' title='Contact Us' />
                    </Suspense>
                    <Suspense fallback={<div>Loading Contact...</div>}>
                      <Contact />
                    </Suspense>
                    <Suspense fallback={<div>Loading Footer...</div>}>
                      <Footer />
                    </Suspense>
                  </div>
                  <Suspense fallback={<div>Loading VideoPlayer...</div>}>
                    <VideoPlayer playState={playState} setPlayState={setPlayState} />
                  </Suspense>
                </>
              )}
            </div>
          } />
        </Routes>
      </Suspense>
      <ToastContainer position="bottom-right" />
    </>
  );
};

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
