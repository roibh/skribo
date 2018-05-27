var Quill = eval("Quill");
var SimpleMDE = eval("SimpleMDE");

angular.module('JuntasApp')
    .directive('blogForm', function () {

        return {
            restrict: 'E',
            scope: {
                post: "="
            },
            templateUrl: 'blog-form.html',
            link: function ($scope, element, attrs) {
                $('#editor').html(($scope as any).post.body);
            },

            controller: ($scope: any, gettextCatalog: any, $resource: any) => {

                $scope.simplemdeOptions = { autoDownloadFontAwesome: true, autofocus: true, promptURLs: true, spellChecker: true }
                var apiUrl = "";
                chrome.storage.sync.get({
                    juntas_server: 'https://www.juntason.com'
                }, function (items: any) {

                    apiUrl = items.juntas_server;

                    var blog_id = window.location.hash.replace('#/', '');
                    $scope.blog_id = blog_id;
                    var postsRes = $resource(apiUrl + '/blogs/posts/');
                    var saveTimeOut = null;
                    $scope.$watch('post', (oldval, newval) => {
                        if (!newval.title)
                            return;

                        clearTimeout(saveTimeOut);
                        saveTimeOut = setTimeout(function () {
                            var sendObj = JSON.parse(JSON.stringify($scope.post));
                            delete sendObj.edit;
                            delete sendObj.hide;
                            postsRes.save(sendObj, (data: any) => {
                                if (data._id)
                                    $scope.post._id = data._id;

                            });
                        }, 3000);

                    }, true);



                });




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

                // Check for unsaved data
                // window.onbeforeunload = function () {
                //     if (change.length() > 0) {
                //         return 'There are unsaved changes. Are you sure you want to leave?';
                //     }
                // }




            }

        }
    })







