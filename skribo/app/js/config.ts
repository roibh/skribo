

angular.module('JuntasApp')
    .provider('$Config', function () {
        var type: any;
        return {
            setType: function (value: any) {
                type = value;
            },
            $get: ($http: ng.IHttpService) => {
                this.site = window.juntas_configuration;
                 
                

                return {
                    ready: (callback: Function) => {
                        callback();

                       

                    },
                    site: this.site
                };
            }
        };
    })