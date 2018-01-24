import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContinueGamePage } from './continue-game';
import { GameProvider } from '../../providers/game/game';
import { ServerProvider } from '../../providers/server/server';

@NgModule({
  declarations: [
    ContinueGamePage,
  ],
  imports: [
    IonicPageModule.forChild(ContinueGamePage),
  ],
  providers:[GameProvider, ServerProvider]
})
export class ContinueGamePageModule {}
