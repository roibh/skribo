import { ToastOptions } from 'ng2-toastr';
import { NgModule } from '@angular/core';


@NgModule({



})
export class CustomOption extends ToastOptions {
    animate = 'flyRight'; // you can override any options available
    newestOnTop = false;
    showCloseButton = true;
}
