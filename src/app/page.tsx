import Catalog from '@/components/Catalog'
import InfiniteSlider from '@/components/InfiniteSlider'
import HeroSection from '@/components/HeroSection'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />

            {/* Slider Section */}
            <InfiniteSlider />

            {/* Catalog Preview Section */}
            <section id="catalogo" className="bg-gray-50 py-20 flex-1">
                <div className="container mx-auto px-4">
                    <Catalog />
                </div>
            </section>
        </div>
    )
}
