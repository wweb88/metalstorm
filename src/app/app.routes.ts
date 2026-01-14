import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { SquadToolComponent } from './Pages/squad-tool/squad-tool.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'squad-tool', component: SquadToolComponent },
  { path: '**', redirectTo: '' }
];
