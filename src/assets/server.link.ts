import { Platform } from 'ionic-angular/platform/platform';
import { Injectable } from '@angular/core';


@Injectable()
export class URLS {
    constructor(public platform: Platform){}

    determineURL(): string{

        if(this.platform.is('android') || this.platform.is('ios') || this.platform.is('windows')){
            return "https://sports-performance.herokuapp.com"
        }

        return "http://localhost:8080"
     
    }
}
