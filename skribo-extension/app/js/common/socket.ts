class Socket {
    private static socket;
    private static socketsInitialized;

    public static initSocketEvents(juntasServer, logic) {
        if (!this.socketsInitialized) {
            this.socket = io(juntasServer);
            fp.if(User.getUser(), () => this.socket.emit('juntas connect', { UserId: User.getUser()._id }));

            setInterval(() => {
                var contacts: any = fp.maybeJson(localStorage.getItem('juntascontacts'));
                var xusers: any = [];
                for (var u in contacts) {
                    xusers.push(u);
                }

                fp.if(User.getUser(), () => this.socket.emit('get user state', { UserId: User.getUser()._id, users: xusers }));

            }, 1000 * 30);


            this.socket.on('tab disconnect', (navData: juntas.navData) => {
                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    tab.Followers[navData.User._id].online = false;
                    tab.dirty = true;
                    Chrome.sendMessage(tab.TabId, {
                        command: 'update_user_states', 'data': tab.Followers
                    }, (response) => {
                    });
                });
            });

            this.socket.on('user state', (data: any) => {
                var onlineusers = fp.maybeJson(localStorage.getItem('juntascontactsonline'));
                if (onlineusers !== data.Users) {
                    Tabs.keys().map((tabkey) => {
                        let tab = Tabs.byKey(tabkey);
                        Object.keys(tab.Followers).map((userkey) => {
                            fp.if(data.Users.indexOf(userkey) > -1, () => {
                                tab.Followers[userkey].online = true;
                                fp.ensure(tab, 'messages', []);
                            }, () => { tab.Followers[userkey].online = false; });

                            Chrome.sendMessage(tab.TabId, {
                                command: 'update_user_states', 'data': tab.Followers
                            });
                        });
                    });
                }
                localStorage.setItem('juntascontactsonline', JSON.stringify(data.Users));
            });

            this.socket.on('user connected to tab', (navData: juntas.navData) => {
                logic.createContextMenus();

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    fp.ensure(tab, 'Followers', {});
                    fp.ensure(tab, 'messages', []);
                    tab.Followers[navData.User._id] = navData.User;
                    tab.Followers[navData.User._id].online = true;
                    tab.dirty = true;

                    fp.if(User.getUser()._id !== navData.User._id, () => {
                        try {
                            logic.spawnNotification('user online', navData.User.Picture.data.url, navData.User.FirstName + ' ' + navData.User.LastName, navData.TabId);
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    console.log('running the call ','update_user_states');
                    Chrome.sendMessage(tab.TabId, { command: 'update_user_states', 'data': tab.Followers });
                });
            });

            this.socket.on('image captured', (navData: juntas.navData) => {
                var tabkey = 'TAB' + navData.TabId;
                fp.if(Tabs.byKey(tabkey), (tab) => {
                    tab.dirty = true;
                    fp.ensure(tab, 'reloads', []);
                    tab.reloads.push(navData.FileName);

                    fp.ensure(tab, 'History', []);
                    tab.History.map((history) => {
                        if (history.Thumb === navData.FileName) {
                          
                            var d = new Date();
                            history.Thumb = history.Thumb + '?' + d.getTime();
                            history.TestThumb = history.TestThumb + '?' + d.getTime();
                            tab.reloads = [];
                        }
                    });

                    Chrome.sendMessage(tab.TabId, { command: 'tabs:navigate', data: tab });


                });

            });



            this.socket.on('delete history', (navData: juntas.navData) => {

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    tab.History = tab.History.filter(history => history._id !== navData._id);
                    tab.dirty = true;
                    Chrome.sendMessage(tab.TabId, { command: 'tabs:navigate', data: tab });
                });
            });

            this.socket.on('page scroll', (navData: juntas.scrollData) => {

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    fp.if(tab.UserId !== User.getUser(), () => {
                        chrome.tabs.executeScript(tab.TabId, { code: 'window.scrollTo(0, ' + navData.details.top + ');' }, function (data) {
                        });
                    });
                });
            });

            this.socket.on('webrtc offer accepted', (navData: juntas.offerData) => {

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    fp.if(tab.UserId !== User.getUser() || tab.UserId.indexOf(User.getUser()._id) > -1, () => {
                        fp.ensure(tab, 'rtcmessages', []);
                        tab.rtcmessages.push({ 'type': 'video_offer_accepted', 'data': navData });
                    });
                });

            });
            this.socket.on('webrtc ice candidate', (iceData: juntas.iceData) => {

                var tabkey = 'TAB' + iceData.TabId;
                fp.if(Tabs.byKey(tabkey), (tab) => {
                    fp.if(tab.UserId !== User.getUser(), () => {
                        fp.ensure(tab, 'rtcmessages', []);
                        tab.rtcmessages.push({ 'type': 'ice_candidate', 'data': iceData });
                    });
                });
            });

            this.socket.on('webrtc create offer', (navData: juntas.offerData) => {
                var tabkey = 'TAB' + navData.TabId;
                fp.if(navData.offer.type !== 'answer', () => {
                    fp.if(Tabs.byKey(tabkey), (tab) => {
                        fp.if(navData.User._id !== User.getUser()._id, () => {
                            fp.if(navData.application === 'videochat', () => {
                                logic.spawnNotification('video call', navData.User.Picture.data.url, 'Video chat', navData.TabId, (tabId: number) => {
                                    chrome.windows.onRemoved.addListener((windowId: number) => {
                                        if (logic.activeVideoWindow && logic.activeVideoWindow.id == windowId)
                                            logic.activeVideoWindow = null
                                    });
                                    fp.ensure(tab, 'rtcmessages', []);

                                    if (!logic.activeVideoWindow) {
                                        chrome.windows.create({
                                            width: 1200,
                                            height: 600,
                                            top: 0,
                                            left: 0,
                                            'tabId': tabId,
                                            'type': 'popup',
                                            'state': 'docked',
                                            'url': chrome.extension.getURL('app/video.html') + '#/' + navData.TabId
                                        }, (window: any) => {
                                            logic.activeVideoWindow = window;
                                            tab.rtcmessages.push({ 'type': 'video_offer', 'data': navData });
                                        });
                                    }
                                });
                            }, () => {
                                chrome.runtime.sendMessage({ command: 'pop video' });
                            });
                        });
                    });
                });
            });

            this.socket.on('tabs:navigate', (navData: juntas.navData) => {
                

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    let tabid = tab.TabId;

                    chrome.tabs.get(tab.TabId, (selectedTab) => {
                        fp.ensure(tab, 'History', []);
                        fp.if(tab.History.filter(history => history.Url === navData.Map.Url), null, () => tab.History.push(navData.Map));
                        tab.dirty = true;
                        fp.if(tab.reloads, () => {
                            tab.History.map((history) => {
                                fp.if(history.Thumb === navData.Map.Thumb, () => {
                                    let d = new Date();
                                    history.Thumb = history.Thumb + '?' + d.getTime();
                                    history.TestThumb = history.TestThumb + '?' + d.getTime();
                                    tab.reloads = [];
                                });
                            });
                        });

                        Chrome.sendMessage(tab.TabId, { command: 'tabs:navigate', data: tab });

                        fp.if(User.getUser(), (user) => {
                            fp.if(user._id !== navData.Map.UserId, () => {
                                logic.spawnNotification(navData.Map.Url, logic.imageurl(navData.Map.Thumb, 'url_images'), 'Moving along', tabid);
                                if (tab.Configuration.CaptureNavigation) {
                                    chrome.tabs.update(selectedTab.id, { url: navData.Map.Url });
                                }
                            });
                        });
                    });
                });
            });


            this.socket.on('notify party', (navData: juntas.navData) => {
                var tabkey = 'TAB' + navData.TabId;
                var url: string = juntasServer + '/juntify/start?j=' + navData.TabId;
                if (navData.Tab.map[0]) {
                    url = navData.Tab.map[0].Url;
                }

                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    var tabid = tab.TabId;


                    if (User.getUser()._id !== navData.User._id) {
                        logic.spawnNotification('user online',
                            navData.User.Picture.data.url, navData.User.FirstName + ' ' + navData.User.LastName, tabid, () => {
                                var user = User.getUser();
                                if (user) {
                                    chrome.tabs.update(tabid, { url: juntasServer + '/juntify/start?j=' + navData.TabId }, () => {
                                        logic.fillMyTab(navData.TabId.toString(), tabid, () => { });
                                    });
                                }
                            });
                    } else {

                        chrome.tabs.getSelected((selectedTab) => {
                            logic.fillMyTab(navData.TabId.toString(), selectedTab.id, () => {
                               Chrome.sendMessage(selectedTab.id, { command: 'show sidebar', tab: tab }, (response) => {
                                    chrome.windows.update(selectedTab.windowId, { focused: true });
                                });
                            });
                        });
                    }
                }, () => {
                    if (User.getUser()._id !== navData.User._id) {
                        logic.soundManager.play('call');
                        logic.spawnNotification('user calling...',
                            navData.User.Picture.data.url, navData.User.FirstName + ' ' + navData.User.LastName, 0, (window: any, notification: any) => {
                                logic.soundManager.stop();
                                notification.close();

                                chrome.tabs.create({ url: url }, (selectedTab) => {
                                    logic.fillMyTab(navData.TabId.toString(), selectedTab.id, () => {
                                        if (!selectedTab) {
                                            // probably no window available
                                            chrome.windows.create({ url: url }, (win) => {
                                                // better to focus after window creation callback
                                                chrome.windows.update(win.id, { focused: true })
                                            });
                                        } else {
                                            // better to focus after tab creation callback
                                            chrome.tabs.update({ url: url }, (selectedTab) => {
                                                chrome.windows.update(selectedTab.windowId, { focused: true })
                                            });
                                        }
                                    });
                                });


                                //chrome.tabs.create({},
                                //    (selectedTab) => {
                                //        var user = User.getUser();
                                //        if (user !== null) {
                                //            chrome.tabs.update(selectedTab.id, { url: this.juntasServer + '/juntify/start?j=' + navData.TabId }, () => {
                                //                this.fillMyTab(navData.TabId.toString(), selectedTab.id, () => {
                                //                });
                                //            });
                                //        }
                                //    });
                            });
                    }
                    else {
                        chrome.tabs.getSelected((selectedTab) => {
                            logic.fillMyTab(navData.TabId.toString(), selectedTab.id, () => {
                                var tabkey = 'TAB' + navData.TabId;

                                var d = localStorage.getItem(tabkey);
                                if (!d)
                                    return;

                                fp.if(Tabs.byKey(tabkey), (tab) => {
                                    Chrome.sendMessage(selectedTab.id, { command: 'show sidebar', tab: tab }, (response) => chrome.windows.update(selectedTab.windowId, { focused: true }));

                                });

                            });
                        });
                    }

                })

            });


            this.socket.on('game data', (gameData: juntas.gameData) => {
                var tabkey = 'TAB' + gameData.TabId;
                fp.if(Tabs.byKey(gameData.TabId), (tab) => {
                    tab.messages.push({
                        'type': 'game_data', 'gameObject': gameData
                    });
                    tab.dirty = true;
                });

            });






            this.socket.on('pop member', (navData: juntas.navData) => {
                var tabkey = 'TAB' + navData.TabId;
                fp.if(Tabs.byKey(navData.TabId), (tab) => {
                    logic.spawnNotification(navData.Map.Url, juntasServer + '/url_images/' + navData.Map.Thumb, 'Openning new tab', navData.TabId)
                    fp.if(User.getUser(), (user) => {
                        navData.Map.isHistory = true;
                        tab.History.push(navData.Map);
                        tab.dirty = true;
                        if (tab.UserId !== user._id) {
                            chrome.tabs.get(tab.TabId, function (selectedTab) {
                                chrome.tabs.update(selectedTab.id, { url: navData.Map.Url }, function () {
                                })
                            });
                        }
                    }, () => {
                        chrome.tabs.create({ 'url': navData.Map.Url, 'active': true }, function (tab) {
                            Tabs.add(tabkey, { UserId: '', Name: '', '_id': navData.TabId, TabId: tab.id, load: true, dirty: true })
                            // this.juntastabs[tabkey] = { '_id': navData.TabId, TabId: tab.id, load: true, dirty: true };
                        });

                    });


                });
            });



            this.socket.on('commentAdded', (commentObject: juntas.comment, msg: any) => {


                fp.if(Tabs.byKey(commentObject.tabid), (tab) => {
                    fp.ensure(tab, 'NewCommentCount', 0);
                    fp.ensure(tab, 'Comments', []);
                    fp.if(User.getUser(), (user) => {
                        tab.NewCommentCount++;

                        var commentUser = tab.Followers[commentObject.comment.UserId];
                        commentUser.isTyping = false;
                        tab.smalldirty = true;
                        fp.ensure(tab, 'messages', []);
                        fp.ensure(tab, 'Comments', []);
                        tab.Comments.push(commentObject.comment);


                        logic.persistTab('TAB' + commentObject.tabid);

                        if (commentUser._id !== user._id) {

                            chrome.tabs.executeScript(tab.TabId, { code: `if(!document.orgtitle) document.orgtitle = document.title;document.title = (${tab.NewCommentCount}) ${(document as any).orgtitle}` });
                        }

                        Chrome.sendMessage(tab.TabId, {
                            command: 'comment_added', data: {
                                'type': 'comment_added', 'commentObject': commentObject, 'commentUser': commentUser
                            }
                        }, (response) => {
                            // return responseFillData({ 'result': 'ok' });
                        });




                    });
                    commentObject.comment.isComment = true;
                });
            });

            this.socket.on('like url', (updateObject: juntas.tabUpdate, msg: any) => {
                fp.if(Tabs.byKey(updateObject.TabId), (tab) => {
                    var histories = tab.History;
                    for (var x = 0; x < histories.length; x++) {
                        if (histories[x].hash == updateObject.hash) {
                            if (!histories[x].Likes) {
                                histories[x].Likes = [];
                            }
                            histories[x].Likes.push(updateObject.Map);
                        }

                    }
                    tab.dirty = true;
                    Chrome.sendMessage(tab.TabId, { command: 'tabs:navigate', data: tab });


                });

            });



            this.socket.on('user is typing', (updateObject: juntas.scrollData) => {
                fp.if(Tabs.byKey(updateObject.TabId), (tab) => {
                    fp.ensure(tab, 'Followers', {});
                    tab.Followers[updateObject.UserId].isTyping = true;
                    setTimeout(() => {
                        tab.Followers[updateObject.UserId].isTyping = false;
                        tab.smalldirty = true;
                        Chrome.sendMessage(tab.TabId, { command: 'user is typing', data: tab.Followers });
                    }, 1000 * 10);
                    tab.smalldirty = true;
                   Chrome.sendMessage(tab.TabId, { command: 'user is typing', data: tab.Followers });
                });
            });

            this.socket.on('error', function (err: any) {
                console.debug(err);
            });

            this.socket.on('disconnect', () => {
                //Doesn't fire the 'connect' callback
                var user = User.getUser();
                if (user) {

                    this.socket = io.connect(juntasServer);
                    this.socket.emit('juntas connect', { UserId: user._id });
                }
            });
            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {




                if (changeInfo.status === 'loading' && changeInfo.url !== undefined) {
                    if (changeInfo.url.indexOf('cse.google') < 0) {

                        var t = Tabs.byId(tabId);

                        if (t) {
                            var configuration = logic.getTabConf(t._id);
                            if (configuration && configuration.CaptureNavigation) {
                                var user = User.getUser();
                                if (user) {

                                    if (t.UserId === user._id || t.UserId.indexOf(user._id) > -1) {
                                        chrome.browserAction.setIcon({ path: '../icons/icon48_on.png' });
                                        if (t.lastUrl !== changeInfo.url) {
                                            t.dirty = true;
                                            t.lastUrl = tab.url;
                                            this.socket.emit('tabs:navigate', { TabId: t._id, Url: changeInfo.url, UserId: user._id });
                                        }
                                    }
                                }
                            }
                            //chrome.tabs.getSelected(function (selectedTab) {              
                            //    socket.emit('chat message', selectedTab.url);
                            //});
                            //chrome.tabs.executeScript(tabId, {
                            //    code: ' if (document.body.innerText.indexOf('Cat') !=-1) {' +
                            //          '     alert('Cat not found!');' +
                            //          ' }'
                            //});
                            //var canvas = document.createElement('canvas');
                            //var imageData = drawIconOnCanvas(19, 1, canvas, true);
                            //chrome.browserAction.setIcon({
                            //    imageData: imageData
                            //});
                        }
                        else {
                            //var canvas = document.createElement('canvas');
                            //var imageData = drawIconOnCanvas(19, 1, canvas, false);
                            //chrome.browserAction.setIcon({
                            //    imageData: imageData
                            //});
                        }
                    }
                }
                else {
                    //var canvas = document.createElement('canvas');
                    //var imageData = drawIconOnCanvas(19, 1, canvas, false);
                    //chrome.browserAction.setIcon({
                    //    imageData: imageData
                    //});
                }


            });
            this.socketsInitialized = true;
        }
        return this.socket;
    }
}