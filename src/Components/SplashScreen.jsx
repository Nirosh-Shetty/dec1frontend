import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './../assets/base_logo.png';
import './../Styles/SplashScreen.css';

const SplashScreen = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set timeout for splash screen duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
      navigate('/home');
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete, navigate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <img 
            src={logo} 
            alt="Food You'd Cook Logo" 
            className="splash-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;