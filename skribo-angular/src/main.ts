import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
(window as any).SkriboUrl = 'https://skribo.herokuapp.com/';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}



if (!('indexedDB' in window)) {
  console.log('This browser doesn\'t support IndexedDB');

}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
