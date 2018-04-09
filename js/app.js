var map;

var ViewModel = function () {
    this.markers = [{
            position: {
                lat: 29.965562,
                lng: 31.270058
            },
            title: 'grand mall, maadi'
        },
        {
            position: {
                lat: 29.971120,
                lng: 31.270863
            },
            title: 'olympic center, maadi'
        },
        {
            position: {
                lat: 29.963343,
                lng: 31.262886
            },
            title: 'Yacht Club, maadi'
        },
        {
            position: {
                lat: 29.969797,
                lng: 31.250863
            },
            title: 'metro station, maadi'
        },
        {
            position: {
                lat: 29.967083,
                lng: 31.242199
            },
            title: 'Maadi Military Hospital'
        }
    ];
    this.search_input = ko.observable("");
    // holds the filtered markers
    this.active_markers = [];


    this.show_infowindow = function () {
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout((function () {
                this.setAnimation(null);
            }).bind(this), 700);
        }
        // get wiki articles realted to location
        $.ajax({
            type: 'GET',
            url: "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
                this.title + "&format=json&prop=info&inprop=url&utf8=&callback=?",
            dataType: 'json',
            timeout: 5000,
            success: function (data) {
                if (data.query.pages) {
                    let wikiArticles = "";
                    let articles = data.query.pages;
                    for (var key in articles) {
                        wikiArticles += "<a href='" + articles[key].fullurl + "' target='_blank'>" +
                            articles[key].title;
                        wikiArticles += "<span class='readingtime'>" + Math.round((articles[key].length / 10000) + 1) + " minutes</span> </a><br>";
                    }
                    infowindow.setContent(wikiArticles);
                } else {
                    infowindow.setContent("didn't find articles!");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                infowindow.setContent('failed to fetch wiki articeles');
            }

        });
        infowindow.open(map, this);
    };

    // intialize the map
    this.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 29.966091,
                lng: 31.254389
            },
            zoom: 14,
        });

        // create all markers [intial state]
        for (var i = 0; i < this.markers.length; i++) {
            this.marker = new google.maps.Marker({
                map: map,
                position: this.markers[i].position,
                title: this.markers[i].title,
                animation: null
            });
            this.active_markers.push(this.marker);
            infowindow = new google.maps.InfoWindow();
            this.marker.addListener('click', this.show_infowindow);
        }
    };
    this.initMap(); // renders the map on load


    // filter markers and populate the selection list 
    this.filtered_markers = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.active_markers.length; i++) {
            if (this.active_markers[i].title.toLowerCase().includes(
                    this.search_input().toLowerCase())) {

                result.push(this.active_markers[i]);
                this.active_markers[i].setVisible(true);
            } else {
                this.active_markers[i].setVisible(false);
            }
        }
        return result;
    }, this);

};

function mapsError() {
    alert('Maps failed to load!');
}

function run() {
    ko.applyBindings(new ViewModel());
}

$(function(){
    $('#toggle').click(function(){
        $('#nav').toggle();
    });
});