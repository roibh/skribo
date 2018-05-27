
/* Copyright (c) Appteligent, 2012 All Rights Reserved */


class youtube {


    YT_PLAYER_APIs = ['seekTo', 'getCurrentTime', 'getDuration',
        'getPlayerState', 'getVideoLoadedFraction',
        'getVideoUrl'];
    console: any;
    settings: any;
    trackerTimerId: any;
    lastTrackedTime: number = 0;
    trackingIntervalMillis = 1000;
    initialOffsetSeconds = 0;
    port: any;
    playerInitWaitTimerId: any;
    playerInitWaitTimerIntervalMillis: number = 250;
    trackUrl = window.location.href;
    curTime: any
    secondsLeft: any;



    public player: any;
    public HTML5PlayerAdapter: any;

    constructor() {
        this.settings = {
            vr_enable_debugging_output: false,
            vr_forget_if_seconds_left: 5,
            vr_forget_after_days: 7
        }

        this.player = this.getPlayer();
        this.HTML5PlayerAdapter = {
            seekTo: function (offsetSeconds: number, dummy: any) {
                this.player.currentTime = offsetSeconds;
            },
            getCurrentTime: function () {
                return this.player.currentTime;
            },
            getDuration: function () {
                return this.player.duration;
            },
            getPlayerState: function () {
                return this.player.ended ? 0 : this.player.paused ? 2
                    : this.player.networkState === 2 ? 3 : !this.player.ended
                        && !this.player.paused ? 1 : -1;
            },
            pauseVideo: function () {
                this.player.pause();
            }
        }

        this.waitForPlayer();

    }


    /**
      * Attempts to locate and return initialized YT player object. Returns null
      * if not found.
      *
      * @returns {Object} player object or null
      * @private
      */
    getPlayer(): any {
        var player = this.findFlashPlayer();
        var html5Player: any;

        if (!player) {
            // See if there is an HTML5 player
            html5Player = document.getElementsByTagName('video')[0];
            if (html5Player && html5Player.readyState >= 1/* Have meta data */) {
                player = Object.create(this.HTML5PlayerAdapter, {
                    player: {
                        get: function () {
                            return html5Player;
                        }
                    },
                    isHTML5: {
                        get: function () {
                            return true;
                        }
                    }
                });
            }
        } else {
            if (player.getVideoLoadedFraction() === 0)
                return null; // Flash player is not ready yet
        }

        return player;
    }



    /**
     * Scans current DOM tree for embed elements, finds one, which implements
     * YouTube player API and returns it, otherwise returns null
     * @returns {object|null}
     */
    findFlashPlayer(): any {
        var players = document.getElementsByTagName('embed');
        this.player = null;

        // If there is a single embed element, chances are that we are looking
        // at one, embedded in an iframe in which case we can't rely on its being
        // named or id'd
        if (players.length === 1) {
            this.player = players[0];
            return this.isYouTubePlayer(this.player) ? this.player : null;
        }

        // we are looking for an embed element, which has 'name' and 'id'
        // attributes set to 'movie_player'
        Array.prototype.some.call(players, function (p: any) {
            if (p.name === 'movie_player' &&
                p.id === 'movie_player' &&
                this.isYouTubePlayer(p)) {
                this.player = p;
            }
            return this.player !== null;
        });

        return this.player;
    }


    isYouTubePlayer(p: any) {
        return p && this.YT_PLAYER_APIs.every(function (f) {
            return typeof p[f] === 'function';
        });
    }

    seekTo(player: any, offsetSeconds: number) {
        player.seekTo(offsetSeconds, true);
        // check if it worked
        return Math.abs(player.getCurrentTime() - offsetSeconds) <= 1;
    }

    _seek(player: any, offsetSeconds: number) {
        if (this.seekTo(player, offsetSeconds)) {
            // check if it worked
          //  console.info('[seek] Advanced the player's ' + 'position to %is',
           //     offsetSeconds);
            this.initialOffsetSeconds = 0;
        } else {
            this.initialOffsetSeconds = offsetSeconds;
           // console.info('[seek] Could not advance player's position to',
            //    offsetSeconds, 'remembered it for later');
        }
    }

    setupPlayer(player: any, playerType: any) {
        //this.port = (chrome.extension as any).connect({
        //    name: window.location.href
        //});
        this.port = chrome.runtime.connect('behimaeapdpdfokmhjahapambjidjdap', { name: 'behimaeapdpdfokmhjahapambjidjdap' });

        this.port.onDisconnect.addListener( () => {
            //console.warn('[port.onDisconnect] Background script unexpectedly '
            //    + 'disconnected the content script', this.port.name);
            this.trackTimeUpdate(false);
        });

        this.port.onMessage.addListener( (msg: any) => {
            var vid: any;
            try {
                if (msg.name === 'seekTo') {
                    this._seek(player, msg.data);
                } else if (msg.name === 'ready') {
                    vid = msg.data;
                  //  console.info('[setupPlayer>ready] Received ready notification '
                   //     + ' from the tracker, initial position(%is)',
                   //     vid.offsetSeconds);
                    // See if need to advance the position
                    if (vid.offsetSeconds > player.getCurrentTime()) {
                        this._seek(player, vid.offsetSeconds);
                    }
                }
            } catch (error) {
                // If we get an exception out of seek attempt, it is likely
                // because the player became unusable, hence try to re-get it
                this.trackTimeUpdate(false);
                this.port.disconnect();
                this.waitForPlayer();
            }
        });

        this.port.postMessage({
            name: 'ready',
            data: playerType || 'flash'
        });

        this.trackTimeUpdate(true);
    }

    trackTimeUpdate(track: any) {
        if (track && this.trackerTimerId) {
            // Already tracking
        } else if (track) {
            this.trackerTimerId = setInterval(
                () => {
                    var p = this.player || this.getPlayer();
                    //,
                    //this.curTime,
                    //   this.secondsLeft;

                    // Make sure the video we're tracking is still the same
                    // as new YouTube interface now reuses the same player
                    // for different videos
                    if (window.location.href !== this.trackUrl) {
                        this.trackUrl = window.location.href;

                        this.trackTimeUpdate(false); // Just in case

                        this.port.disconnect();

                        // Re-get the player in case if switched from flash to
                        // html5 or vice-versa
                        p = this.player = this.getPlayer();
                        if (!p) {
                            this.waitForPlayer();
                            return;
                        }

                        // And load the new one
                        this.setupPlayer(p, 'youtube');

                        return;
                    }

                    if (p.getPlayerState() === 0/* Ended */) {
                        this.port.postMessage({
                            name: 'ended'
                        });
                        this.trackTimeUpdate(false);
                        return;
                    }

                    if (this.initialOffsetSeconds) {
                        this._seek(p, this.initialOffsetSeconds);
                    }

                    this.curTime = p.getCurrentTime();
                    this.secondsLeft = p.getDuration() - this.curTime;

                    if (this.secondsLeft <= this.settings.vr_forget_if_seconds_left) {
                      //  console.info('[yt>trackTimeUpdate] Ended tracking',
                        //    'video because it has only',
                        //    this.secondsLeft, 'seconds left');
                        this.port.postMessage({
                            name: 'ended'
                        });
                        this.trackTimeUpdate(false);
                    } else {
                        if (this.curTime !== this.lastTrackedTime) {
                            this.lastTrackedTime = this.curTime;

                            this.port.postMessage({
                                name: 'timeupdate',
                                data: this.curTime
                            });
                        }
                    }
                }, this.trackingIntervalMillis);
        } else {
            if (this.trackerTimerId)
                clearInterval(this.trackerTimerId);

            this.trackerTimerId = undefined;
            this.lastTrackedTime = 0;
        }
    }

    waitForPlayer() {
        this.player = this.getPlayer();
        // This bit waits for YouTube player to initialize
        if (this.player) {
            this.trackUrl = window.location.href;
           // console.debug('[onload] Player found', this.player.getCurrentTime());
            this.setupPlayer(this.player, 'youtube');
        } else if (!this.playerInitWaitTimerId) {
           // console.info('[onload] There's no player yet, waiting...');
            // Wait for page scripts to initialize the YT player
            this.playerInitWaitTimerId = setInterval(() => {
                this.player = this.getPlayer();

                if (this.player) {
                    this.trackUrl = window.location.href;
                    clearInterval(this.playerInitWaitTimerId);
                    this.playerInitWaitTimerId = null;
                  //  console.info('[onload>mutationObserver] Player found');
                    this.setupPlayer(this.player, 'youtube');
                   // console.info('[onload>mutationObserver] Player initialized');
                }
            }, this.playerInitWaitTimerIntervalMillis);
        }
    }
}


var tube = new youtube();
