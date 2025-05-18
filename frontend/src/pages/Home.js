import HeroSection from '../components/Home/HeroSection';
import TrendingProducts from '../components/Home/TrendingProducts';
import Features from '../components/Home/Features';
export default function Home() {
    return (
        <div>
            <HeroSection />
                   <TrendingProducts />
                   <Features />
        </div>
    );
}