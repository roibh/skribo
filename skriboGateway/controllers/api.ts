import { Body, Method, MethodConfig, MethodType, Param, Response, Query, Verbs, MethodError, MethodResult } from '@methodus/server';
import { debug } from 'util';
const AdwordsUser = require('node-adwords').AdwordsUser;
var auth = require('../auth/adwords-auth');
const AdwordsConstants = require('node-adwords').AdwordsConstants;


const clientId = '255821801347-ej0uipmjrq93ottab7obbj0vgeqbshv8.apps.googleusercontent.com';
const clientSecret = 'I3xfM4IYsZ6DbsHTPIGeh6ep';
const redirectUri = 'http://localhost:8020/api/auth';

let userInfo = {
    developerToken: '97z8AFCZpBu1yEHFliaOyg', //your adwords developerToken
    userAgent: 'AllJobs MCC', //any company name
    clientCustomerId: '675-699-7184', //the Adwords Account id (e.g. 123-123-123)
    client_id: clientId, //this is the api console client_id
    client_secret: clientSecret,
    refresh_token: undefined,
    auth: undefined,
    redirect_url: redirectUri
};


export function authMiddleware(req, res, next) {
    // userInfo.redirect_url = userInfo.redirect_url ||  redirectUri + encodeURIComponent(req.url);
    debugger
    if (!userInfo.auth) {

        userInfo.auth = 'tempauth';
        return auth.getTokens(clientId, clientSecret, userInfo.redirect_url, function (err, tokens) {

            if (err) throw err;
            userInfo.auth = tokens;
            next();

        });
    } else {

        console.log(userInfo.redirect_url);
        next();
    }


}


async function refreshTokens() {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (userInfo.refresh_token) {
                clearInterval(interval);
                resolve();
            }
            if (userInfo.auth) {
                auth.getRefresTokens(clientId, clientSecret, userInfo.redirect_url, userInfo.auth, (err, tokens: any) => {
                 
                    tokens = JSON.parse(tokens);
                    if (!tokens)
                        userInfo.auth = null;

                    clearInterval(interval);
                     
                    userInfo.refresh_token = tokens.refresh_token;
                    resolve();
                });
            }

        }, 1000);



    })

}


@MethodConfig('Api')
export class Api {
    @Method(Verbs.Get, '/api/auth')
    public async auth(@Query('code') code, @Query('returnto') returnto, @Response() res) {
        userInfo.auth = code;
        if (!userInfo.refresh_token) {
            await refreshTokens();
        }
        res.redirect(302, returnto);
    }


    @Method(Verbs.Get, '/api/clients', [authMiddleware])
    public async listClients() {

        if (!userInfo.refresh_token) {
            await refreshTokens();
        }

        let user = new AdwordsUser(userInfo);
        let campaignService = user.getService('CampaignService', 'v201802');
        //create selector
        let selector = {
            fields: ['Id', 'Name'],
            ordering: [{ field: 'Name', sortOrder: 'ASCENDING' }],
            paging: { startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE }
        }

        const result = await new Promise((resolve, reject) => {
            campaignService.get({ serviceSelector: selector }, (error, result) => {
                resolve(result);
            })
        })
        return new MethodResult(result);
    }

    @Method(Verbs.Get, '/api/adgroups', [authMiddleware])
    public async listAdGroups() {

        if (!userInfo.refresh_token) {
            await refreshTokens();
        }


        let user = new AdwordsUser(userInfo);
        let adGroupService = user.getService('AdGroupService', 'v201802');
        //create selector
        let selector = {
            fields: ['Id', 'Name'],
            //ordering: [{ field: 'Name', sortOrder: 'ASCENDING' }],
            paging: { startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE }
        }

        const result = await new Promise((resolve, reject) => {
            adGroupService.get({ serviceSelector: selector }, (error, result) => {
                resolve(result);
            })
        })
        return new MethodResult(result);
    }


    @Method(Verbs.Get, '/api/accounts', [authMiddleware])
    public async listAccounts() {

        if (!userInfo.refresh_token) {
            await refreshTokens();
        }


        let user = new AdwordsUser(userInfo);
        let adGroupService = user.getService('AccountLabelService', 'v201802');
        //create selector
        let selector = {
            fields: ['Id', 'Name'],
            //ordering: [{ field: 'Name', sortOrder: 'ASCENDING' }],
            paging: { startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE }
        }

        const result = await new Promise((resolve, reject) => {
            adGroupService.get({ serviceSelector: selector }, (error, result) => {
                resolve(result);
            })
        })
        return new MethodResult(result);
    }

    // @Method(Verbs.Post, '/api/player')
    // public async create() {
    //     let p = new PlayerModel('1', 'player 1');
    //     await DB.Player.insert(p);
    //     return new MethodResult(p)
    // }

    // @Method(Verbs.Get, '/api/player/:player_id')
    // public async read( @Param('player_id') playerId: number) {
    //     return await DB.Player.find({ 'Id': playerId });
    // }

    // @Method(Verbs.Put, '/api/player')
    // public async update() {

    // }


    // @Method(Verbs.Delete, '/api/player')
    // public delete() {

    // }



}