// Initialize the map
const map = L.map('map').setView([37.8, -96], 4);
const visitorsMap = {};

visitorsData.split('\n').forEach(line => {
    const parts = line.split(', ');
    const county = parts[0];
    const visitors = parts.slice(1);
    visitorsMap[county] = visitors;
});

const stateId = {
    "01": "AL",
    "02": "AK",
    "04": "AZ",
    "05": "AR",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    "10": "DE",
    "11": "DC",
    "12": "FL",
    "13": "GA",
    "15": "HI",
    "16": "ID",
    "17": "IL",
    "18": "IN",
    "19": "IA",
    "20": "KS",
    "21": "KY",
    "22": "LA",
    "23": "ME",
    "24": "MD",
    "25": "MA",
    "26": "MI",
    "27": "MN",
    "28": "MS",
    "29": "MO",
    "30": "MT",
    "31": "NE",
    "32": "NV",
    "33": "NH",
    "34": "NJ",
    "35": "NM",
    "36": "NY",
    "37": "NC",
    "38": "ND",
    "39": "OH",
    "40": "OK",
    "41": "OR",
    "42": "PA",
    "44": "RI",
    "45": "SC",
    "46": "SD",
    "47": "TN",
    "48": "TX",
    "49": "UT",
    "50": "VT",
    "51": "VA",
    "53": "WA",
    "54": "WV",
    "55": "WI",
    "56": "WY"
};

let info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = props ? 
        `<h4>${props.NAME}</h4><b>State: ${stateId["" + props.STATE]}</b><br />Visitors: ${props.visits}` : 
        'Hover over a county';
};

info.addTo(map);

const countyInfo = document.querySelector('#info-bar .county-info');
const visitorsCount = document.querySelector('#info-bar .visitors-count');
const visitorsList = document.querySelector('#info-bar .visitors-list');

// Function to normalize county names
function normalizeCountyName(name) {
    return name.replace(/ /g, "_").replace(/\./g, "_").replace("'", "_").replace("-", "_");
}

// Function to get color based on county name
function getColor(county) {
    for (let color in visitData) {
        if (visitData[color].paths.includes(county)) {
            return color;
        }
    }
    return '#000000'; // Default color if not found
}

function highlightFeature(e) {
    const props = e.target.feature.properties;
    info.update(props);

    // Update info bar
    countyInfo.textContent = `${props.NAME}, ${stateId[props.STATEFP]}`;
    visitorsCount.textContent = `Number of visitors: ${props.visits.split(' ')[0]}`;

    const countyKey = `${normalizeCountyName(props.NAME)}__${stateId[props.STATEFP]}`;
    const visitors = visitorsMap[countyKey] || [];
    visitorsList.textContent = `Visitors: ${visitors.join(', ')}`;
}

function resetHighlight(e) {
    info.update();
    countyInfo.textContent = '';
    visitorsCount.textContent = '';
    visitorsList.textContent = '';
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });

    // Create custom tooltip
    layer.bindTooltip(`${feature.properties.NAME}, ${stateId["" + feature.properties.STATEFP]}`, {
        permanent: false,
        direction: 'auto',
        className: 'custom-tooltip'
    });

    // Assign visits to the properties for display purposes
    for (let color in visitData) {
        if (visitData[color].paths.includes(`${normalizeCountyName(feature.properties.NAME)}__${stateId["" + feature.properties.STATEFP]}`)) {
            feature.properties.visits = visitData[color].label;
            break;
        }
    }
}

const geojson = L.geoJson(usCountiesData, {
    style: function (feature) {
        return {
            weight: 0.75,
            opacity: 1,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.7,
            fillColor: getColor(`${normalizeCountyName(feature.properties.NAME)}__${stateId["" + feature.properties.STATEFP]}`)
        };
    },
    onEachFeature: onEachFeature
}).addTo(map);
