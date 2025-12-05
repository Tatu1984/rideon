const axios = require('axios');

/**
 * Geocode address to coordinates
 */
exports.geocode = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADDRESS_REQUIRED',
          message: 'Address is required'
        }
      });
    }

    // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 5
      },
      headers: {
        'User-Agent': 'RideOn/1.0'
      }
    });

    const results = response.data.map(item => ({
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to geocode address'
      }
    });
  }
};

/**
 * Reverse geocode coordinates to address
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COORDINATES_REQUIRED',
          message: 'Latitude and longitude are required'
        }
      });
    }

    // Using OpenStreetMap Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json'
      },
      headers: {
        'User-Agent': 'RideOn/1.0'
      }
    });

    const result = {
      address: response.data.display_name,
      latitude: parseFloat(response.data.lat),
      longitude: parseFloat(response.data.lon),
      details: {
        road: response.data.address?.road,
        neighbourhood: response.data.address?.neighbourhood,
        suburb: response.data.address?.suburb,
        city: response.data.address?.city || response.data.address?.town,
        state: response.data.address?.state,
        postcode: response.data.address?.postcode,
        country: response.data.address?.country
      }
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to reverse geocode coordinates'
      }
    });
  }
};

/**
 * Calculate route between two points
 */
exports.getRoute = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COORDINATES_REQUIRED',
          message: 'Start and end coordinates are required'
        }
      });
    }

    // Using OSRM (Open Source Routing Machine) - free alternative
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true
        }
      }
    );

    if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: 'Could not find route between the given coordinates'
        }
      });
    }

    const route = response.data.routes[0];

    const result = {
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      geometry: route.geometry,
      legs: route.legs.map(leg => ({
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps.map(step => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver?.instruction,
          location: step.maneuver?.location
        }))
      }))
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to calculate route'
      }
    });
  }
};

/**
 * Get place autocomplete suggestions
 */
exports.autocomplete = async (req, res) => {
  try {
    const { query, latitude, longitude } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'QUERY_REQUIRED',
          message: 'Query is required'
        }
      });
    }

    const params = {
      q: query,
      format: 'json',
      limit: 10,
      addressdetails: 1
    };

    // If user location provided, prioritize nearby results
    if (latitude && longitude) {
      params.lat = latitude;
      params.lon = longitude;
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params,
      headers: {
        'User-Agent': 'RideOn/1.0'
      }
    });

    const results = response.data.map(item => ({
      placeId: item.place_id,
      displayName: item.display_name,
      address: item.address,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch autocomplete suggestions'
      }
    });
  }
};
