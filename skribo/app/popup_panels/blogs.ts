
class BlogsController implements ng.IController {
    /**
     *
     */
    constructor() {


    }
    navigateTo() {

        chrome.runtime.sendMessage({ command: 'blogs:navigate' }, function (response) {

        });
    }


}