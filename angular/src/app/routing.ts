import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
export const ROUTING = RouterModule.forRoot([
    { path: "", component: LoginComponent, pathMatch: "full" }
]);