
gsip = '132.73.209.192';
gsport = '8080'
app_port = '5500'
var gsurl = `http://${gsip}:${gsport}/geoserver`; // For the pgRouting base url

var local_ne = L.tileLayer.wms(`http://${gsip}:${gsport}/geoserver/wms?`,{
    layers: 'br7_bg',
    format: 'image/png',
    tiled: true,
    srs: 'EPSG:4326'
})
var scale, osmGeocoder;


var CartoDB_PositronNoLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		maxZoom: 19
	});	// CartoDB - Positron No Labels (CC Attribution 3.0 Unported, free to use, must attribute should check with carto https://github.com/CartoDB/cartodb/issues/12033)
    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 17
    });
    var local_wmts = L.tileLayer('http://localhost:8080/geoserver/gwc/service/wmts?layer=br7_bg&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Format=image/png&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}', {
        attribution: 'Data: Be\'er Sheva Municipality'
    });
var jer_1m = L.tileLayer.wms(`http://${gsip}:${gsport}/geoserver/wms?`,{
    layers: 'br7:Flight_02-11-18_18-11-7'
})

var map = L.map('map2', {
    layers: local_ne,
    center: [ 31.258889, 34.799722 ],
    zoom: 12,
    maxZoom: 18,
    zoomSnap: 0.5,
    zoomDelta: 0.5
    });
map.spin(true);

var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var fountainIcon = L.icon({
        iconUrl: './css/images/fountain.png',
        iconSize:     [25, 27]
    });
var basemaps = {
        'OpenStreetMap_Mapnik': OpenStreetMap_Mapnik,
        'CartoDB - Positron (No Labels)':CartoDB_PositronNoLabels,
        'Beer Sheva, roads and fountains': local_ne,
        'Jerusalem 1m (ECW)':jer_1m,
        'esri World Imagery': Esri_WorldImagery,
        'Local WMTS':local_wmts
        /*Countries: L.tileLayer.wms('https://demo.boundlessgeo.com/geoserver/ows?', {
        layers: 'ne:ne_10m_admin_0_countries'
    }),

    Boundaries: L.tileLayer.wms('https://demo.boundlessgeo.com/geoserver/ows?', {
        layers: 'ne:ne_10m_admin_0_boundary_lines_land'
    }),

    'Countries, then boundaries': L.tileLayer.wms('https://demo.boundlessgeo.com/geoserver/ows?', {
        layers: 'ne:ne_10m_admin_0_countries,ne:ne_10m_admin_0_boundary_lines_land'
    }),

    'Boundaries, then countries': L.tileLayer.wms('https://demo.boundlessgeo.com/geoserver/ows?', {
        layers: 'ne:ne_10m_admin_0_boundary_lines_land,ne:ne_10m_admin_0_countries'
    }),
    'Beer Sheva, roads and fountains': L.tileLayer.wms('http://localhost:8080/geoserver/wfs?BGCOLOR=0xF2EFE9', {
        //layers: 'ne:ne,beersheva:landuse,beersheva:dogParks,beersheva:roads_osm,beersheva:addresses,beersheva:Fountains'
        layers: 'ne:ne,beersheva:BeerSheva'
    })*/
};
/*
var roads = L.tileLayer.wms(`http://${gsip}:${gsport}/geoserver/wms?`, {
        layers: 'beersheva:roads_osm,beersheva:Fountains'
    })
*/
var rootUrl = `http://${gsip}:${gsport}/geoserver/wms`;

var defaultParameters = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'br7:Fountains',
        outputFormat: 'text/javascript',
        format_options: 'callback: getJson'    
};

var parameters = L.Util.extend(defaultParameters);

console.log(rootUrl + L.Util.getParamString(parameters));

var fountains,layers, source, target, sourceMarker, targetMarker;
var selectedPoint=null;
var pathLayer = L.geoJSON(null);

$.ajax({
    url: rootUrl + L.Util.getParamString(parameters),
    dataType: 'jsonp',
    jsonpCallback: 'getJson',
    success: function(data){
        fountains = L.geoJson(data, {
            onEachFeature: function(feature, layer){
				layer.bindPopup(feature.properties.name);
			},
            pointToLayer: function (feature, latlng) {
                //return L.circleMarker(latlng, geojsonMarkerOptions);
                return L.marker(latlng, {icon: fountainIcon});
            }
        })
    }
}).done(function(){
    layers = {"Fountains":fountains}
    L.control.layers(basemaps,layers).addTo(map);
    scale = L.control.scale({updateWhenIdle:true}).addTo(map); 
    osmGeocoder = new L.Control.OSMGeocoder({position: 'topleft'});

    map.addControl(osmGeocoder);
    /*L.Routing.control({
        waypoints: [
            //L.latLng(31.258889, 34.799722),
        // L.latLng(32.068123,34.7741023)
        ],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim()
    }).addTo(map);*/

    sourceMarker = L.marker([31.2496076, 34.78717803], {draggable:true, opacity:0.5})
        .on('dragend',function(e){
            selectedPoint = e.target.getLatLng()
            getVertex(selectedPoint)
            getRoute();
             })
        .on('add',function(e){
                selectedPoint = e.target.getLatLng()
                getVertex(selectedPoint)
            }).addTo(map)

    targetMarker = L.marker([31.250781, 34.77503], {draggable:true})
    .on('dragend',function(e){
        selectedPoint = e.target.getLatLng()
        getVertex(selectedPoint)
        getRoute();
         })
    .on('add',function(e){
        selectedPoint = e.target.getLatLng()
        getVertex(selectedPoint)
    }).addTo(map)
    
    map.spin(false);
    
}).done(function(){
    setTimeout(function () {
        L.control.scalefactor().addTo(map);
        L.control.zoomprint({ position: 'bottomleft' }).addTo(map);
        $("#zoomPrint").html(map.getZoom());
        $("#zoomPrint").css({'font-family': "'Open Sans', Helvetica, sans-serif",
            'background-color': 'rgba(255,255,255,1)',
            'padding': '2px 8px',
            'box-shadow': '0 0 15px rgba(0,0,0,0.2)',
            'border-radius': '5px'});
    }, 2500);
    
})

function getVertex(selectedPoint){
    var url = `${gsurl}/wfs?service=WFS&version=1.0&request=GetFeature&typeName=br7:nearest_vertex&outputformat=application/json&viewparams=x:${selectedPoint.lng};y:${selectedPoint.lat};`
    console.log(url)
    $.ajax({
        url:url,
        async:false,
        success: function(data){
            loadVertex(data, selectedPoint.toString() === sourceMarker.getLatLng().toString());
        }
    })
}
var features;
function loadVertex(response, isSource){

    features = response.features;
    console.log(response)
    res = response;
    if(map.hasLayer(pathLayer)){
        map.removeLayer(pathLayer);
    }
    if(isSource){
        source = features[0].properties.id;
        console.log('s.id '+source)
    }else{
        target = features[0].properties.id;
        console.log('t.id '+target)
    }

};

function getRoute(){
    var url = `${gsurl}/wfs?service=WFS&version=1.0&request=GetFeature&typeName=br7:shortest_path&outputformat=application/json&viewparams=source:${source};target:${target};`
    $.getJSON(url, function(data){
        if(map.hasLayer(pathLayer)){
            map.removeLayer(pathLayer);
        }
        pathLayer = L.geoJSON(data,
            style={
                color:'cyan',
                weight:3
            }).addTo(map)
    })
}
/*
function handleJson(data) {
    fountains = L.geoJson(data, {
        //onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            //return L.circleMarker(latlng, geojsonMarkerOptions);
            return L.marker(latlng, {icon: fountainIcon});
        }
    })
    
}

var parameters = L.Util.extend(defaultParameters, {typeName: "beersheva:roads_osm"});
    console.log(rootUrl + L.Util.getParamString(parameters));
    
    $.ajax({
        url: rootUrl + L.Util.getParamString(parameters),
        dataType: 'jsonp',
        jsonpCallback: 'getJson',
        success: handleJson
    });
    var roads;
function handleJson(data) {
    roads = L.geoJson(data).addTo(map)
    L.control.layers(basemaps,[roads]).addTo(map);
}
*/

L.Control.ip = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('div');

        ipstring = `<h2>http://${gsip}:${app_port}</h2>`;
        img.id = 'ipaddress'
        //img.style.width = '200px';
        
        return img;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.ip = function(opts) {
    return new L.Control.ip(opts);
}

L.control.ip({ position: 'bottomright' }).addTo(map);
$("#ipaddress").html(ipstring);
$("#ipaddress").css({'font-family': "'Open Sans', Helvetica, sans-serif",
            'background-color': 'rgba(255,255,255,1)',
            'padding': '2px 8px',
            'box-shadow': '0 0 15px rgba(0,0,0,0.2)',
            'border-radius': '5px'});

L.Control.zoomPrint = L.Control.extend({
                onAdd: function(map) {
                    var zValue = L.DomUtil.create('div');
                    zValue.html = map.getZoom()
                    zValue.id = 'zoomPrint'
            
                    return zValue;
                },
            
                onRemove: function(map) {
                    // Nothing to do here
                }
            });
L.control.zoomprint = function(opts) {
                return new L.Control.zoomPrint(opts);
            }




map.on('zoomend',function(){
    $("#zoomPrint").html(map.getZoom());
})
            