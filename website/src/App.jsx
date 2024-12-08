import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import video from './assets/Cacao farming (360p).mp4'; 
import Spinner from './components/Spinner/Spinner';

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
const BarGraph = React.lazy(() => import('./components/BarGraph/BarGraph'));
const UploadCsv = React.lazy(() => import('./components/ForecastDamage/UploadCsv'));
const ForecastDamage = React.lazy(() => import('./components/ForecastDamage/ForecastDamage'));
const LossGraph = React.lazy(() => import('./components/LossGraph/LossGraph'));

const App = () => {
  const [user, setUser] = useState(null);
  const [playState, setPlayState] = useState(false);
  const location = useLocation();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // Track if data is loading

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
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
      {(location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/')) && (
        <>
          <video autoPlay muted loop className="video-background">
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div>
        </>
      )}

      {!(location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/')) && (
        <Suspense fallback={<Spinner message="Loading Navbar..." />}>
          <Navbar user={user} onLogout={handleLogout} />
        </Suspense>
      )}

      <Suspense fallback={<Spinner message="Loading content..." />}>
        <Routes>
          <Route path='/' element={<Login setUser={setUser} />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/update/:id' element={<UpdateProfile setUser={setUser} />} />
          <Route path='/home' element={
            <div className='App'>
              {user && (
                <>
                  <Suspense fallback={<Spinner message="Loading Hero..." />}>
                    <Hero />
                  </Suspense>
                  <div className="container">
                    <Suspense fallback={<Spinner message="Loading Title..." />}>
                      <Title subTitle='Disease Detection' title='Scan Your Cacao Leaf' />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Scan..." />}>
                      <Scan />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Title..." />}>
                      <Title subTitle='Disease Overview' title='Types of Cacao Leaf Diseases' />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Collections..." />}>
                      <Collections />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Title..." />}>
                      <Title subTitle='Forecasting' title='Cacao Fruit Production Forecast' />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Forecast..." />}>
                      <Forecast />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Title..." />}>
                      <Title subTitle='Damage Forecasting' title='Forecasted Impact on Cacao Fruit Production' />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Forecast Damage..." />}>
                      <UploadCsv setIsDataLoaded={setIsDataLoaded} setLoadingData={setLoadingData} />
                    </Suspense>
                    {isDataLoaded && (
                      <Suspense fallback={<Spinner message="Loading BarGraph..." />}>
                        <ForecastDamage setIsDataLoaded={setIsDataLoaded} isDataLoaded={isDataLoaded} />
                      </Suspense>
                    )}
                    <Suspense fallback={<Spinner message="Loading LossGraph..." />}>
                      <LossGraph />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading BarGraph..." />}>
                      <BarGraph />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading About..." />}>
                      <About setPlayState={setPlayState} />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Title..." />}>
                      <Title subTitle='Reach Out' title='Contact Us' />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Contact..." />}>
                      <Contact />
                    </Suspense>
                    <Suspense fallback={<Spinner message="Loading Footer..." />}>
                      <Footer />
                    </Suspense>
                  </div>
                  <Suspense fallback={<Spinner message="Loading VideoPlayer..." />}>
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
