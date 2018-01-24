import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatisticsPage } from './statistics';
import { ChartsModule } from 'ng2-charts';
import { StatisticsProvider } from '../../providers/statistics/statistics';
import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    StatisticsPage
  ],
  imports: [
    IonicPageModule.forChild(StatisticsPage),
    ChartsModule,
    PipesModule
  ],
  providers: [ StatisticsProvider ]
})
export class StatisticsPageModule {}
