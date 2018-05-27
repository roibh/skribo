import { Body, Method, MethodConfig, MethodType, Param, Response, Query, Verbs, MethodError, MethodResult } from '@methodus/server';



@MethodConfig('Api')
export class Scripts {
    @Method(Verbs.Get, '/scripts/list')
    public async list() {

        const { Client } = require('pg')
        const client = new Client()

        await client.connect()

        const res = await client.query('SELECT $1::text as message', ['Hello world!'])
        console.log(res.rows[0].message) // Hello world!
        await client.end()

    }





}