
var marked = eval('marked');


var JuntasApp = angular.module('JuntasApp',
    ['simplemde', 'ui.bootstrap', 'ngResource', 'dialogs.main', 'gettext', 'JuntasLanguages', 'angular-tour', 'hl.sticky']).config(
    [function () {


    }]).run(function ($Language: juntas.ILanguageService) {


        $Language.setGlobalLanguage($Language.getGlobalCurrent());


    })

    .service('$blogNav', function () {
        this.$scope = null;
        this.handle = (navItem: any) => {
            if (navItem.action) {
                let fun = eval('this.$scope.' + navItem.action);
                fun();

            }



        }
        this.nav =
            [
                { name: 'home', icon: 'fa fa-home' },
                { name: 'new post', icon: 'fa fa-plus', action: 'ShowNewPostForm' },
                { name: 'search', icon: 'fa fa-search' },


            ]

    })

    .controller('blogController', function ($blogNav: any, $scope: any, gettextCatalog: any, $resource: any) {
        var apiUrl = '';
        var blog_id = window.location.hash.replace('#/', '');
        $scope.blog = {};
        $scope.blog_id = blog_id;
        $blogNav.$scope = $scope;
        $scope.$blogNav = $blogNav;
        chrome.storage.sync.get({
            juntas_server: 'https://www.juntason.com'
        }, function (items: any) {
            apiUrl = items.juntas_server;

            init();


        });
        $scope.edits = () => {            
            return $scope.blogPosts && $scope.blogPosts.filter(p => p.edit).length;

        }
        $scope.renderMarkdown = function (str: string) {
            return marked(str);
        }

        $scope.applyEdit = (post) => {
            $scope.blogPosts.forEach(item => item.edit = false);
            $scope.blogPosts.forEach(item => item.hide = true);
            post.edit = true;
            post.hide = false;
        }


        $scope.ShowNewPostForm = function () {
            $scope.blogPosts.push({ edit: true, blog_id: blog_id });

        }






        function init() {
            var singleBlogRes = $resource(apiUrl + '/blogs/blog/');
            var postsRes = $resource(apiUrl + '/blogs/posts/');
            postsRes.query({ 'blog_id': blog_id }, (result) => {
                $scope.blogPosts = result;
            });


            singleBlogRes.get({ 'id': blog_id }, (data: any) => {
                $scope.blog = data;


                // var editor = new Quill('#editor', {
                //     modules: {
                //         toolbar: [
                //             [{ header: [1, 2, false] }],
                //             ['bold', 'italic', 'underline'],
                //             ['image', 'code-block'],
                //             [{ 'direction': 'rtl' }],
                //         ]
                //     },
                //     theme: 'snow'
                // });

                // var Delta = Quill.import('delta');

                // // Store accumulated changes
                // var change = new Delta();
                // editor.on('text-change', function (delta) {
                //     change = change.compose(delta);
                // });

                // // Save periodically
                // var in_save_operation = false;
                // setInterval(() => {
                //     if (change.length() > 0 && !in_save_operation) {
                //         console.log('Saving changes', change);
                //         if (!$scope.post)
                //             $scope.post = {};

                //         $scope.post.body = editor.getContents();
                //         $scope.post.blog_id = $scope.blog_id;
                //         in_save_operation = true;
                //         postsRes.save($scope.post, (data: any) => {
                //             if (data._id)
                //                 $scope.post._id = data._id;
                //             in_save_operation = false;
                //         });
                //         change = new Delta();
                //     }
                // }, 5 * 1000);

                // // Check for unsaved data
                // window.onbeforeunload = function () {
                //     if (change.length() > 0) {
                //         return 'There are unsaved changes. Are you sure you want to leave?';
                //     }
                // }



            });

        }





    })








function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// then to call it, plus stitch in '4' in the third group
function guid() { return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase(); }
