import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoalsPage } from './goals';
import { GoalProvider } from '../../providers/goal/goal';

@NgModule({
  declarations: [
    GoalsPage,
  ],
  imports: [
    IonicPageModule.forChild(GoalsPage),
  ],
  providers: [GoalProvider]
})
export class GoalsPageModule {}
