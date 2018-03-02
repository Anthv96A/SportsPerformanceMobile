import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreviousGamesPage } from './previous-games';
import { ServerProvider } from '../../providers/server/server';

@NgModule({
  declarations: [
    PreviousGamesPage,
  ],
  imports: [
    IonicPageModule.forChild(PreviousGamesPage),
  ],
  providers: [ServerProvider]
})
export class PreviousGamesPageModule {}
