import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreviousGameDetailPage } from './previous-game-detail';

@NgModule({
  declarations: [
    PreviousGameDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PreviousGameDetailPage),
  ],
})
export class PreviousGameDetailPageModule {}
