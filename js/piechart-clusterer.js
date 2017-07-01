
function PieChartClusterer(options) {
    PieChartClusterer.superclass.constructor.apply(this, arguments);
}


PieChartClusterer.SIZES = [
    [65, 65],
    [80, 80],
    [95, 95]
];


PieChartClusterer.NUMBERS = [10, 100];


PieChartClusterer.OPACITY = 0.7;


PieChartClusterer.URL_TEMPLATE = [
    '//chart.googleapis.com/chart?cht=pc',
    'chs=#{width}x#{height}', 
    'chd=t:1|#{data}', 
    'chco=FFFFFF,#{colours}', 
    'chf=a,s,000000#{opacity}|bg,s,00000000' 
].join('&');



PieChartClusterer.dec2hex = function (dec) {
    var hex = Math.floor(dec * 255).toString(16);

    return hex.length < 2 && '0' + hex || hex;
};


ymaps.ready(function () {
    ymaps.util.augment(PieChartClusterer, ymaps.Clusterer, {

        createCluster: function (center, geoObjects) {
            var cluster = PieChartClusterer.superclass.createCluster.apply(this, arguments);

            cluster.options.set({
                icons: this.getClusterIcons(geoObjects),
                numbers: this.getClusterNumbers()
            });

            return cluster;
        },

        getClusterNumbers: function () {
            return this.options.get('clusterNumbers', PieChartClusterer.NUMBERS);
        },


        getClusterIconOpacity: function () {
            return this.options.get('clusterIconOpacity', PieChartClusterer.OPACITY);
        },

        getClusterIconSizes: function () {
            var icons = this.options.get('clusterIcons');

            if(icons) {
                var sizes = [], size, i = 0;

                while(size = icons[i] && icons[i].size) {
                    sizes[i++] = size;
                }

                return sizes;
            }

            return PieChartClusterer.SIZES;
        },

        getClusterIcons: function (geoObjects) {
            var sizes = this.getClusterIconSizes(),
                size, i = 0, icons = [];

            while(size = sizes[i]) {
                icons[i++] = {
                    href: this.formatClusterIconHref(size, this.getClusterIconColours(geoObjects)),
                    size: size,
                    offset: [-Math.floor(size[0] / 2), -Math.floor(size[1] / 2)]
                };
            }

            return icons;
        },


        getClusterIconColours: function (geoObjects) {
            var count = geoObjects.length,
                countByColour = {},
                colour, geoObject;

            while(geoObject = geoObjects[--count]) {
                colour = geoObject.crime.color.c.web;

                countByColour[colour] = countByColour[colour] + 1 || 1;
            }

            return countByColour;
        },


        formatClusterIconHref: function (size, colours) {
            var values = [],
                keys = [], key,
                i = 0;

            for(keys[i] in colours) {
                values[i] = colours[keys[i++]];
            }

            var model = {
                width: size[0],
                height: size[1],
                data: values.join(','),
                colours: (keys.length < 2 ? [keys[0], keys[0]] : keys).join('|'),
                opacity: PieChartClusterer.dec2hex(this.getClusterIconOpacity())
            };

            return PieChartClusterer.URL_TEMPLATE.replace(/#{(\w+)}/g, function (s, key) {
                return model[key];
            });
        }
    });
});
