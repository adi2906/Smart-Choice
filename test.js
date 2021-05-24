const NodeGeocoder = require('node-geocoder');
const options = {
    provider: 'google',
   
    // Optional depending on the providers
    fetch: customFetchImplementation,
    apiKey: '6e18e9ffc1ef42e5826a767dee562987', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
  };