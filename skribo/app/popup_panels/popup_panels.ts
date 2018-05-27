

angular.module('JuntasApp')
    .directive('juntasGroups', () => {

        return {
            restrict: 'E',
            templateUrl: 'popup_panels/groups.html'
        }
    })
    .directive('juntasContacts', () => {

        return {
            restrict: 'E',
            templateUrl: 'popup_panels/contacts.html'
        }
    })
    .directive('juntasBlogs', () => {

        return {
            restrict: 'E',
            templateUrl: 'popup_panels/blogs.html',
            controller: ($scope, $Config, $resource) => {

                $scope.OpenBlog = (blogItem) => {
                     
                    chrome.runtime.sendMessage({ command: 'blogs:navigate', data: blogItem._id }, function (response) {

                    });
                }

                $scope.LoadBlogs = function (user_id) {


                    $Config.ready(() => {

                        if (user_id !== null) {
                            $scope.FollowedBlogs = localStorage.getItem('juntasfollowedblogs');
                            if ($scope.FollowedBlogs)
                                $scope.FollowedBlogs = JSON.parse($scope.FollowedBlogs);



                            var followedblogsres = $resource(apiUrl + '/blogs/followedblogs/:user_id');
                             
                            followedblogsres.query({ 'user_id': user_id }, (data: any) => {
                                 
                                $scope.FollowedBlogs = data.items;
                                localStorage.setItem('juntasfollowedblogs', JSON.stringify(data.items));
                                //getGo();

                                //chrome.runtime.sendMessage({ command: 'create menus' }, function (response) { });
                            });
                        }
                    });
                }

                $scope.Search = function () {


                    var contactsStr = localStorage.getItem('juntascontacts');
                    var contacts: any;
                    if (contactsStr !== null)
                        contacts = JSON.parse(contactsStr);
                    var usersObj: any = {};

                    for (var key in contacts) {
                        usersObj[contacts[key]._id] = contacts[key];
                    }


                    var search = $resource(apiUrl + '/tabs/search');
                    $scope.LoaderState['search'] = true;
                    search.save({ 'Name': $scope.SearchInformation.Name, 'Description': $scope.SearchInformation.Description }, function (data: any) {

                        var users_for_tabs_dic: any = {};
                        if (data.result.users_for_tabs) {
                            for (var i = 0; i < data.result.users_for_tabs.length; i++) {
                                users_for_tabs_dic[data.result.users_for_tabs[i].UserId] = data.result.users_for_tabs[i];
                            }
                        }
                        if (data.result.tabs) {
                            for (var i = 0; i < data.result.tabs.length; i++) {
                                data.result.tabs[i].User = users_for_tabs_dic[data.result.tabs[i].UserId];
                            }
                        }




                        $scope.SearchInformation.Results = data.result;
                        $scope.LoaderState['search'] = false;


                    }, function (Error: any) {
                        $scope.LoaderState['search'] = false;
                        $scope.SearchInformation.Error = Error.data.error.message;
                    });
                }

                $scope.InitBlog = function (invalid) {
                    $scope.submitted = true;

                    if (invalid)
                        return;

                    //get the current page url
                    chrome.tabs.getSelected(function (selectedTab) {
                        if (selectedTab != null) {
                            //open group and set the tabid


                            var tabsResource = $resource(apiUrl + '/blogs/blog');
                            tabsResource.save({
                                'Name': $scope.CobrowseInformation.Name,
                                'Description': $scope.CobrowseInformation.Description,
                                'UserId': $scope.User._id,
                                'TabId': selectedTab.id,
                                'Configuration': { 'Theme': $scope.CobrowseInformation.Theme, 'Discovery': 'public', 'AllowPop': true },
                                'Date': new Date(),
                                'Followers': [$scope.User._id]

                            }, function (data: any) {
                                chrome.runtime.sendMessage({ command: 'blogs:open', tab: data, activeTab: selectedTab }, function (response) {
                                    //window.close();

                                });
                                // window.close();
                            }, function (error: any) { console.log(error) });
                        }
                       
                    });
                }


            }
        }
    });


