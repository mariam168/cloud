import React from 'react';
import HeroSection from '../components/HeroSection';
import TrendingProducts from '../components/TrendingProducts';
import Features from '../components/Features';


export default function Home() {
    return (
        <div>
            <HeroSection />
                   <TrendingProducts />
                   <Features />
        </div>
    );
}