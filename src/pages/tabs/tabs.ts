import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  // These tab roots are the name of the page name in string format
  tab1root: string;
  tab2root: string;

  constructor() {
    this.tab1root = 'StatisticsPage';
    this.tab2root = 'GamePage';
  }

}
