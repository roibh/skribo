import { Api } from './controllers/api';
import { Scripts } from './controllers/scripts';
import { ServerConfiguration, ClientConfiguration, ConfiguredServer, MethodType, ServerType } from '@methodus/server';

console.log(ServerConfiguration, ClientConfiguration);

@ServerConfiguration(ServerType.Express, { port: process.env.PORT || 8020 })
@ClientConfiguration(Api, MethodType.Local, ServerType.Express)
@ClientConfiguration(Scripts, MethodType.Local, ServerType.Express)
class SetupServer extends ConfiguredServer {

}

new SetupServer();


