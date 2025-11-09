// frontend/src/components/HomeSpotlight.jsx
import SpotlightGrid from './SpotlightGrid'

export default function HomeSpotlight() {
  return (
    <div className="space-y-6">
      <SpotlightGrid
        role="founder"
        titleHi="संस्थापक"
        viewAllPath="founders"
        limit={10}
      />
      <SpotlightGrid
        role="management"
        titleHi="प्रबंधन टीम"
        viewAllPath="management"
        limit={10}
      />
    </div>
  )
}
