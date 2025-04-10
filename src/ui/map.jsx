import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import cityData from '../utils/city.geojson.json';
import regionData from '../utils/region.geojson.json';

const Map = () => {
  const [showCity, setShowCity] = useState(true);
  const [showRegion, setShowRegion] = useState(false);

  const handleToggle = (layer) => {
    if (layer === 'city') {
      setShowCity(true);
      setShowRegion(false);
    } else {
      setShowCity(false);
      setShowRegion(true);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label>
          <input
            type="radio"
            name="layer"
            checked={showCity}
            onChange={() => handleToggle('city')}
            className="mr-1"
          />
          By City
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="layer"
            checked={showRegion}
            onChange={() => handleToggle('region')}
            className="mr-1"
          />
          By Region
        </label>
      </div>

      <div style={{ width: '100%', height: '600px' }}>
        <ComposableMap
          projection="geoMercator"
          width={800}
          height={600}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            zoom={20}
            maxZoom={100}
            minZoom={20}
            center={[120, 12]} // Adjust this to center your map properly
          >
            {showCity && (
              <Geographies geography={cityData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: '#ECEFF1',
                          stroke: '#607D8B',
                          strokeWidth: 0.75,
                          outline: 'none',
                        },
                        hover: {
                          fill: '#CFD8DC',
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#FF5722',
                          outline: 'none',
                        },
                      }}
                    />
                  ))
                }
              </Geographies>
            )}
            {showRegion && (
              <Geographies geography={regionData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: '#FFCCBC',
                          stroke: '#FF7043',
                          strokeWidth: 0.75,
                          outline: 'none',
                        },
                        hover: {
                          fill: '#FFAB91',
                          outline: 'none',
                        },
                        pressed: {
                          fill: '#D84315',
                          outline: 'none',
                        },
                      }}
                    />
                  ))
                }
              </Geographies>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};

export default Map;
