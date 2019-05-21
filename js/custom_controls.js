L.Control.LayersWindow = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('img');

        img.src = './images/logo.png';
		img.style.width = '3vw';
		img.style.height = '12vw'
		img.id = 'logo'
		

        return img;
    }
});

L.control.watermark2 = function(opts) {
    return new L.Control.Watermark2(opts);
}
if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }
  }
  
function getTileURL(lat, lon, zoom) {
      var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
      var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
      return [ zoom ,xtile ,ytile];
  }
map.getCeterTile = function(map, baseUrl){
    tileLocation = getTileURL(map.getCenter().lat,map.getCenter().lng,map.getZoom());

}


/* https://github.com/consbio/Leaflet.Basemaps
on map zoom/pan/?change
    grab img tags under basemap active, basemap alt, basemap
    change to basemap.url.getcenteraltile


https://github.com/ScanEx/Leaflet-IconLayers

*/