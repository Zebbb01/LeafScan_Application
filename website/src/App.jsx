import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import video from './public/CacaoVideo.mp4'; 
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
const EditDisease = React.lazy(() => import('./components/Scan/EditDisease'));
const Forecast = React.lazy(() => import('./components/Forecast/ForecastLine'));
const BarGraph = React.lazy(() => import('./components/BarGraph/BarGraph'));
const UploadCsv = React.lazy(() => import('./components/ForecastDamage/UploadCsv'));
const ForecastDamage = React.lazy(() => import('./components/ForecastDamage/ForecastDamage'));
const ForecastLossGraph = React.lazy(() => import('./components/ForecastDamage/ForecastLossGraph'));
const LossGraph = React.lazy(() => import('./components/LossGraph/LossGraph'));
const PredictLossGraph = React.lazy(() => import('./components/PredictLossGraph/PredictLossGraph'));
const ReportTable = React.lazy(() => import('./components/ReportData/ReportData'));

const App = () => {
  const [user, setUser] = useState(null);
  const [playState, setPlayState] = useState(false);
  const location = useLocation();
  const [isDataLoaded, setIsDataLoaded] = useState(false);  // State for tracking data load
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false); // State for tracking CSV upload
  const [severityChanged, setSeverityChanged] = useState(false); // State for tracking severity change

  const handleGraphToggle = () => {
    setIsGraphVisible(prevState => !prevState);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const hiddenNavbarRoutes = ['/', '/signup', location.pathname.startsWith('/update/','/edit-disease')];
    if (hiddenNavbarRoutes.some(route => location.pathname === route)) {
      document.body.classList.add('authBackground');
    } else {
      document.body.classList.remove('authBackground');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setIsGraphVisible(false); 
    }
  }, [user]);

  return (
    <>
      {(location.pathname === '/' || location.pathname === '/signup' || location.pathname.startsWith('/update/') || location.pathname === '/edit-disease') && (
        <>
          <video autoPlay muted loop className="video-background">
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div>
        </>
      )}

      {!(location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/edit-disease' || location.pathname.startsWith('/update/')) && (
        <Suspense fallback={<Spinner />}>
          <Navbar user={user} onLogout={handleLogout} />
        </Suspense>
      )}

      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route
            path='/'
            element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />}
          />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/update/:id' element={<UpdateProfile setUser={setUser} />} />
          <Route path='/edit-disease' element={<EditDisease />} />
          <Route
            path='/home'
            element={user ? (
              <div className='App'>
                {user && (
                  <>
                  <>
                    <Suspense fallback={<Spinner message="Loading Hero..." />}><Hero /></Suspense>
                    <div className="container">
                      <Suspense fallback={<Spinner />}><Title subTitle='Disease Detection' title='Scan Your Cacao Leaf' /></Suspense>
                      <Suspense fallback={<Spinner />}><Scan /></Suspense>
                      <Suspense fallback={<Spinner />}><Title subTitle='Disease Overview' title='Types of Cacao Leaf Diseases' /></Suspense>
                      <Suspense fallback={<Spinner />}><Collections /></Suspense>
                      <Suspense fallback={<Spinner />}><Title subTitle='Damage Forecasting' title='Forecasted Impact on Cacao Fruit Production' /></Suspense>
                      <Suspense fallback={<Spinner />}><UploadCsv setIsDataLoaded={setIsDataLoaded} setCsvUploaded={setCsvUploaded} setSeverityChanged={setSeverityChanged} /></Suspense>
                      {isDataLoaded && (
                        <>
                          <Suspense fallback={<Spinner />}><ReportTable csvUploaded={csvUploaded} severityChanged={severityChanged} setSeverityChanged={setSeverityChanged} /></Suspense>
                          <div className={`graph-container ${isGraphVisible ? 'show' : ''}`}>
                            {isGraphVisible && (
                              <>
                                <Suspense fallback={<Spinner />}><ForecastDamage isDataLoaded={isDataLoaded} /></Suspense>
                                <Suspense fallback={<Spinner />}><ForecastLossGraph /></Suspense>
                                <Suspense fallback={<Spinner />}><LossGraph /></Suspense>
                                <Suspense fallback={<Spinner />}><PredictLossGraph /></Suspense>
                              </>
                            )}
                          </div>
                          <button className='show-graph-btn' onClick={handleGraphToggle}>
                            {isGraphVisible ? 'Hide Graph' : 'Show Graph'}
                          </button>
                        </>
                      )}
                    </div>
                    <Suspense fallback={<Spinner />}><Title subTitle='Forecasting' title='Cacao Fruit Production Forecast' /></Suspense>
                    <Suspense fallback={<Spinner />}><Forecast /></Suspense>
                    <Suspense fallback={<Spinner />}><BarGraph /></Suspense>
                    <Suspense fallback={<Spinner />}><About setPlayState={setPlayState} /></Suspense>
                    <Suspense fallback={<Spinner />}><Title subTitle='Reach Out' title='Contact Us' /></Suspense>
                    <Suspense fallback={<Spinner />}><Contact /></Suspense>
                    <Suspense fallback={<Spinner />}><Footer /></Suspense>
                    
                  </>
                  <Suspense fallback={<Spinner />}><VideoPlayer playState={playState} setPlayState={setPlayState} /></Suspense>
                  </>
                  
                )}
              </div>
            ) : (
              <Navigate to="/" />
            )}
          />
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