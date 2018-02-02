import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GoalProvider } from '../../providers/goal/goal';


@IonicPage()
@Component({
  selector: 'page-goals',
  templateUrl: 'goals.html',
})
export class GoalsPage {


  selectedGoal;

  goals: string[] = []

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private goalService: GoalProvider
  ) {}

  ionViewDidLoad() {
     this.goals = this.goalService.getGoals();
  }

  selectedGoalFromList(goal){
    this.selectedGoal = goal;

    this.navCtrl.push('PlayGamePage', {selected: this.selectedGoal}).then(() =>{
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    })
  }

}
