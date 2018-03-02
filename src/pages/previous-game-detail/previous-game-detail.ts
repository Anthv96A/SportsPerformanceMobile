import { Component } from '@angular/core';
import { IonicPage, NavParams, AlertController } from 'ionic-angular';
import { Game } from '../../models/game.model';



@IonicPage()
@Component({
  selector: 'page-previous-game-detail',
  templateUrl: 'previous-game-detail.html',
})
export class PreviousGameDetailPage {

  public game: Game;
  background = {link: 'assets/imgs/ball.jpg'};

  constructor(public navParams: NavParams,public alertCtrl: AlertController) {}

  ionViewDidLoad() {
    this.game = this.navParams.get('game')
  }

  gameEmotions(){
   let alert = this.alertCtrl.create({
      title: "Your emotions from game",
      message: ` 
        <ul>
          <li> Game pre-emotions: ${this.game.preEmotions}  </li>
          <li> Game post-emotions: ${this.game.postEmotions} </li>
        </ul>
      `,
      buttons: ['OK']
    });
    alert.present();
  }

}
