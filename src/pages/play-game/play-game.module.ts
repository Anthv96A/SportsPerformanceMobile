import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayGamePage } from './play-game';
import { GameProvider } from '../../providers/game/game';
import { ServerProvider } from '../../providers/server/server';

@NgModule({
  declarations: [
    PlayGamePage,
  ],
  imports: [
    IonicPageModule.forChild(PlayGamePage),
  ],
  providers: [GameProvider, ServerProvider]
})
export class PlayGamePageModule {}
