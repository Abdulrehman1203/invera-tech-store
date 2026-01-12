import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar />
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Redefine Your<br />
                        <span className="text-highlight">Digital Lifestyle</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience premium quality electronics and accessories designed for the modern era.
                        Elevate your workspace with our curated collection.
                    </p>
                    <div className="hero-cta-group">
                        <Link to="/products" className="btn-primary-lg" style={{ textDecoration: 'none' }}>
                            Shop Collection
                        </Link>
                    </div>
                </div>
                <div className="hero-image-container">
                    <div className="hero-circle"></div>
                    <img
                        src="/media/products/headphones.png"
                        alt="Premium Headphones"
                        className="hero-img"
                    />
                </div>
            </section>

            <section className="features">
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                    </div>
                    <h3 className="feature-title">Premium Quality</h3>
                    <p className="feature-text">Curated products from top tier brands ensuring authentic and lasting quality.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                    </div>
                    <h3 className="feature-title">Fast Delivery</h3>
                    <p className="feature-text">Express shipping worldwide with real-time tracking for every order.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <h3 className="feature-title">Secure Choice</h3>
                    <p className="feature-text">Protected payments and 30-day money back guarantee for peace of mind.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
