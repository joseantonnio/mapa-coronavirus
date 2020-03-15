require('./bootstrap');

feather.replace();
moment.locale('pt-br');

$(document).ajaxStart(function() {
    $.LoadingOverlay("show", {
        image: "",
        fontawesome: "fas fa-circle-notch fa-spin",
        size: 5
    });
});

$(document).ajaxStop(function() {
    $.LoadingOverlay("hide");
});

$('[data-toggle="tooltip"]').tooltip();

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    if ($("#sidebar-wrapper").is(":hidden")) {
        $("#sidebar-wrapper").show();
        $("main").addClass('col-md-9');
        $("main").addClass('col-lg-10');
        $("main").removeClass('col-12');
    } else {
        $("#sidebar-wrapper").hide();
        $("main").removeClass('col-md-9');
        $("main").removeClass('col-lg-10');
        $("main").addClass('col-12');
    }
});

var $_GET = {};
if (document.location.toString().indexOf('?') !== -1) {
    var query = document.location
        .toString()
        // get the query string
        .replace(/^.*?\?/, '')
        // and remove any existing hash string (thanks, @vrijdenker)
        .replace(/#.*$/, '')
        .split('&');

    for (var i = 0, l = query.length; i < l; i++) {
        var aux = decodeURIComponent(query[i]).split('=');
        $_GET[aux[0]] = aux[1];
    }
}

$("#search").autocomplete({
    delay: 500,
    source: function(request, response) {
        $.ajax({
            url: "/cities",
            type: 'get',
            dataType: "json",
            data: {
                q: request.term
            },
            success: function(data) {
                response(data);
            }
        });
    },
    select: function(event, ui) {
        // Set selection
        $('#search').val(ui.item.label); // display the selected text

        var location = ui.item.value.split(","),
            url = window.location.protocol + '//' + window.location.hostname + '?lat=' + location[0] + '&lng=' + location[1];

        window.location.href = url;

        return false;
    }
});

var southWest = L.latLng(-36.879621, -71.894531),
    northEast = L.latLng(6.315299, -26.894531),
    bounds = L.latLngBounds(southWest, northEast);

if ($_GET['lat'] != undefined && $_GET['lng'] != undefined) {
    var coronamap = L.map('coronamap', { maxBounds: bounds }).setView([$_GET['lat'], $_GET['lng']], 11);
} else {
    var coronamap = L.map('coronamap', { maxBounds: bounds }).setView([-15.5819581, -53.0541564], 4);
}

L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png	', {
    attribution: 'Mapa pela comunidade &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagens por <a href="https://maps.wikimedia.org/">Wikimedia Maps</a>',
    maxZoom: 11,
    minZoom: 4,
    tileSize: 256,
    zoomOffset: 0,
}).addTo(coronamap);

$.ajax({
    url: "/infections",
    type: 'get',
    dataType: "json",
    success: function(data) {
        var markers = data;

        var markerClusters = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                var markers = cluster.getAllChildMarkers();
                var cases = 0;

                markers.forEach(function(marker) {
                    cases += marker.options.cases;
                });

                var c = ' marker-cluster-';
                if (cases < 50) {
                    c += 'small';
                } else if (cases < 100) {
                    c += 'medium';
                } else {
                    c += 'large';
                }

                return new L.DivIcon({
                    html: '<div><span>' + cases + '</span></div>',
                    className: 'marker-cluster' + c,
                    iconSize: new L.Point(40, 40)
                });
            }
        });

        for (var i = 0; i < markers.length; ++i) {
            var popup = markers[i].city.name +
                '<br/><b>Casos:</b> ' + markers[i].cases +
                '<br/><b>Mortes:</b> ' + markers[i].deaths +
                '<br/><b>Recuperados:</b> ' + markers[i].recovered +
                '<br/><b>Casos Graves (UTI):</b> ' + markers[i].serious +
                '<br/><b>Primeiro Caso:</b> ' + moment(markers[i].first_case).format("DD [de] MMMM [de] YYYY");

            var m = L.circleMarker([markers[i].city.lat, markers[i].city.lng], { color: "#e74c3c", radius: markers[i].city.radius, cases: markers[i].cases }).bindPopup(popup);
            markerClusters.addLayer(m);
        }

        coronamap.addLayer(markerClusters);
    }
});