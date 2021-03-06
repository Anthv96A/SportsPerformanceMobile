import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { URLS } from '../../assets/server.link';
import { Response } from '@angular/http/src/static_response';


@Injectable()
export class ServerProvider {

  private url: string;

  games: Game[] = [];

  constructor(public http: Http, private urls: URLS) {
     this.url = this.urls.determineURL();
  }

  finishGame(game:Game): Observable<any> {
    const body = JSON.stringify(game);
    const headers = new Headers({'Content-Type':'application/json'})
    return this.http.post(`${this.url}/game/new`,body,{headers:headers}).map(this.extractData).catch(this.extractError);
  }

  getLastGame(name:string): Observable<any> {
    return this.http.get(`${this.url}/game/last/${name}`).map(this.extractData).catch(this.extractError);
  }

  getAllGamesWithinPeriod(from:string, to:string): Observable<any>{
      return this.http.get(`${this.url}/game/games-period/${from}/${to}`).map((response:Response) => {
          let games: Game[] = response.json();
          let gamesTransformed: Game[] = [];
          for(let game of games){
              gamesTransformed.push(new Game(game.name, game.preEmotions, game.postEmotions, game.totalScore, game.holes, game.goals, game.datePlayed))
          }
          this.games = gamesTransformed;
          return gamesTransformed;
      }).catch(this.extractError);
  }
    private extractData = (response: Response) => {
      return response.json();
    }
    private extractError = (error: Response) => {
        return Observable.throw(error.json());
    }
}
