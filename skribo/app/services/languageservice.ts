
class LanguageService implements juntas.ILanguageService {
    $inject = ['gettextCatalog'];

    constructor(public gettextCatalog: any) {
        this.Languages = <Array<juntas.ILanguage>>[
            { id: 'eng', code: 'en_EN', name: 'english', 'short': 'en', },
            { id: 'heb', code: 'he_IL', name: '\u05e2\u05d1\u05e8\u05d9\u05ea', 'short': 'he', rtl: true },
            { id: 'rus', name: 'russian', 'short': 'ru', },
            { id: 'de', name: 'german', 'short': 'de', }]
    }

    public Languages: juntas.ILanguage[];

    public setGlobalLanguage(language: juntas.ILanguage) {
        this.gettextCatalog.setCurrentLanguage(language.code);
        localStorage.setItem('language', JSON.stringify(language));
        if (language.rtl) {
            (window as any)['language-override'] = 'rtl';
            var path = '../css/bootstrap-rtl.css';
            $(`link[id='rtlbootstrapfile']`).attr('href', path);
            $(`link[id='rtlfile']`).attr('href', 'css/rtl.css');
        }
        else {
            $(`link[id='rtlbootstrapfile']`).attr('href', '');
            $(`link[id='rtlfile']`).attr('href', '');
        }
    }


    public setLanguage(language: juntas.ILanguage, tabId: string) {
        this.gettextCatalog.setCurrentLanguage(language.code);
        var tabconfStr = localStorage.getItem('TABCONF' + tabId);
        var tabconf: any;
        if (tabconfStr !== null)
            tabconf = JSON.parse(tabconfStr);
        tabconf.Language = language;
        localStorage.setItem('TABCONF' + tabId, JSON.stringify(tabconf));

        if (language.rtl) {
            var path = '../css/bootstrap-rtl.css';
            $(`link[id='rtlfile']`).attr('href', path);
        }
        else {
            $(`link[id='rtlfile']`).attr('href', '');
        }
    }

    public getGlobalCurrent(): juntas.ILanguage {
        var dStr = localStorage.getItem('language');
        var d: any;
        if (dStr !== undefined && dStr !== null)
            d = JSON.parse(dStr);
        else
            return <juntas.ILanguage>{ id: 'eng', code: 'en_EN', name: 'english', 'short': 'en', };

        return d;
    }


    public getCurrent(tabId: string): juntas.ILanguage {


        var confStr = localStorage.getItem('TABCONF' + tabId);
        var confObj: any;
        if (confStr !== undefined && confStr !== null)
            confObj = JSON.parse(confStr);
         
        if (confObj && confObj.Language) {
            if (typeof confObj.Language === 'string')
                return this.Languages.filter(lng => lng.id === confObj.id)[0];
            else
                return confObj.Language;
        }

        var dStr = localStorage.getItem('language');
        if (dStr !== undefined && dStr !== null) {
            return JSON.parse(dStr);

        }
        else {
            return <juntas.ILanguage>{ id: 'eng', code: 'en_EN', name: 'english', 'short': 'en', };
        }

    }
}


angular.module('JuntasApp').service('$Language', LanguageService);
