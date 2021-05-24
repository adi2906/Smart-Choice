const NodeGeocoder = require('node-geocoder');

//map muta
const options = {
    provider: 'opencage',

    apiKey: '6e18e9ffc1ef42e5826a767dee562987', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports.getLocation = async function getLocation (location) {
    const rets = await geocoder.geocode(location);
    return rets;
}