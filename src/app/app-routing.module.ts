import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MsigComponent} from './pages/msig/msig.component';
import {AppComponent} from './app.component';
import {ChartComponent} from './utils/components/chart/chart.component'
import { HomeComponent } from './pages/home/home.component';
import {PortfolioComponent} from './pages/portfolio/portfolio.component';
import {StakedComponent} from './pages/staked/staked.component';
import {FoundersComponent} from './pages/founders/founders.component';
import {AirdropComponent} from './pages/airdrop/airdrop.component'

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'chart', component: ChartComponent},
  // { path: 'msig', component: MsigComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'portfolio', component: PortfolioComponent, /*canActivate: [AuthGuard]*/ },
  { path: 'home', component: HomeComponent },
  { path: 'staking', component: StakedComponent },
  { path: 'founders', component: FoundersComponent },
  { path: 'airdrop', component: AirdropComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true},)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
