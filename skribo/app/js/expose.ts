

class expose {

    constructor(el: any, options: any) {
        this.removeOverlays();

        // default options
        options = options || {};
        //$('body').trigger('expose:init', [this, options]);

        var padding = options.padding || 0,
            bounds: any = [],
            xValues = [0],
            sortedX: any = [];
        ////this.each(function (i: any, el: any) {
        var $el = scripter(el);
        var offset: any = $el.offset();
        var x0 = offset.left - padding;
        var y0 = offset.top - padding;
        var x1 = offset.left + $el.outerWidth() + padding;
        var y1 = offset.top + $el.outerHeight() + padding;

            bounds.push({ topLeft: { x: x0, y: y0 }, bottomRight: { x: x1, y: y1 } });
            xValues.push(x0);
            xValues.push(x1);
            //  });
            xValues.push(scripter(document).outerWidth());
        xValues.sort(function (a, b) {
            return a - b;
        });

        // ugh, unique values in the sorted array
        var last: any;
        for (var i = 0; i < xValues.length; i++) {
            if (last != xValues[i]) {
                last = xValues[i];
                sortedX.push(xValues[i]);
            }
        }

        // sorted by top y-values
        bounds.sort(function (a: any, b: any) {
            return a.topLeft.y - b.topLeft.y;
        });

        // each vertical slice
        for (var i = 0; i < sortedX.length - 1; i++) {
            var j0: any = sortedX[i],
                x1 = sortedX[i + 1],
                intersecting: any = [];

            for (var j = 0; j < bounds.length; j++) {
                var bound = bounds[j];
                if (bound.topLeft.x <= j0 && bound.bottomRight.x >= x1) {
                    // bound spans x-range
                    intersecting.push([bound.topLeft.y, bound.bottomRight.y]);
                }
            }

            var yValues = [0];
            for (var j = 0; j < intersecting.length; j++) {
                var bound = intersecting[j];
                if (bound[0] > yValues[yValues.length - 1]) {
                    yValues.push(bound[0]);
                    yValues.push(bound[1]);
                } else {
                    yValues.pop();
                    yValues.push(bound[1]);
                }
            }
            yValues.push(scripter(document).outerHeight());

            for (var j = 0; j < yValues.length - 1; j = j + 2) {
                this.showOverlay(x0, yValues[j], x1, yValues[j + 1], options);
            }
        }

       // $('body').trigger('expose:shown', this);
        return this;
    };

    removeOverlays() {
        scripter('.expose-overlay').remove();
        //$('body').trigger('expose:overlay:removed');
    }

    showOverlay(x0: number, y0: number, x1: number, y1: number, options: any) {

         
        scripter('body').append(`<div class='expose-overlay'></div>`).css({
            position: 'absolute',
            top: y0 + 'px',
            left: x0 + 'px',
            width: (x1 - x0) + 'px',
            height: (y1 - y0) + 'px'
        });

        ////var overlay = $('<div class='expose-overlay'></div>').css().appendTo($('body'));
        ////if (!options.static) {
        ////    overlay.bind('click', this.removeOverlays);
        ////}

        //$('body').append(overlay).trigger('expose:overlay:shown', [x0, y0, x1, y1, overlay]);
    }

}






   // $(document).bind('expose:hide', removeOverlays);
