import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {EosioService} from './services/eosio.service';
import {ConfigsService} from './services/configs.service';
import {AuthService} from './services/auth.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MsigComponent} from './pages/msig/msig.component';
import {HomeComponent} from './pages/home/home.component';
import {FoundersComponent} from './pages/founders/founders.component';
import {ChartService} from './services/chart.service';
import {UtilsModule} from './utils/utils.module';
import {StakedComponent} from './pages/staked/staked.component';
import {MatNativeDateModule} from '@angular/material';
import {ChartComponent} from './utils/components/chart/chart.component';
import {MenuComponent} from './utils/components/menu/menu.component';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {TopMenuComponent} from './utils/components/top-menu/top-menu.component';
import {EosWidgetService} from './services/eos-widget';
import {ThousandSuffixesPipe} from './utils/million-pipe';
import {PortfolioComponent} from './pages/portfolio/portfolio.component';
import {BytePipe} from './utils/byte.pipe';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {SearchFilterPipe} from './utils/search.pipe';
import {usaDialog} from './utils/components/usa-dialog/usa-dialog.utils';
import {allertDialog} from './utils/components/allert-dialog/allert-dialog.utils';
import {CountDown} from 'ng4-date-countdown-timer';
import {ClipboardModule} from 'ngx-clipboard';
import {DeviceDetectorModule} from 'ngx-device-detector';
import {AirdropComponent} from './pages/airdrop/airdrop.component';
import {stakedDialog} from './utils/components/staked-dialog/staked-dialog.utils';
import {unstakedDialog} from './utils/components/unstaked-dialog/unstaked-dialog.utils';
import {CountdownTimerModule} from 'ngx-countdown-timer';
import {NgxSpinnerModule} from 'ngx-spinner';
import {AccountExistPipe} from './utils/account-exist.pipe';
import {BuyRamDialog} from './utils/components/buy-ram-dialog/buy-ram-dialog';
import { ThousandPipe } from './utils/num-pipe';
import {NumberTransformPipe} from './utils/number-transform.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MsigComponent,
    HomeComponent,
    FoundersComponent,
    AirdropComponent,
    ChartComponent,
    MenuComponent,
    TopMenuComponent,
    ThousandSuffixesPipe,
    NumberTransformPipe,
    PortfolioComponent,
    BytePipe,
    AccountExistPipe,
    SearchFilterPipe,
    StakedComponent,
    usaDialog,
    stakedDialog,
    unstakedDialog,
    CountDown,
    allertDialog,
    BuyRamDialog,
    ThousandPipe
  ],
  exports: [
    MenuComponent,
    TopMenuComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    ChartsModule,
    AppRoutingModule,
    UtilsModule,
    NgScrollbarModule,
    MatNativeDateModule,
    NgxWebstorageModule.forRoot(),
    NgxSpinnerModule,
    NgbModule,
    CountdownTimerModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    ClipboardModule
  ],
  providers: [
    ChartService,
    EosioService,
    ConfigsService,
    AuthService,
    MenuComponent,
    TopMenuComponent,
    EosWidgetService,
    ThousandSuffixesPipe,
    ThousandPipe,
    NumberTransformPipe,
    BytePipe,
    AccountExistPipe
  ],
  entryComponents: [
    usaDialog,
    stakedDialog,
    allertDialog,
    unstakedDialog,
    BuyRamDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
