import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
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
      <div>
        <input
          type="radio"
          id="city"
          name="layer"
          checked={showCity}
          onChange={() => handleToggle('city')}
        />
        <label htmlFor="city">By City</label>
        <input
          type="radio"
          id="region"
          name="layer"
          checked={showRegion}
          onChange={() => handleToggle('region')}
        />
        <label htmlFor="region">By Region</label>
      </div>
      <div style={{ width: '100%', height: '500px' }}>
        <ComposableMap projection="geoMercator">
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
        </ComposableMap>
      </div>
    </div>
  );
};

export default Map;
