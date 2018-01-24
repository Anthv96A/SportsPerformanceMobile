import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Game } from '../../models/game.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { URL } from '../../assets/server.link';
import { Response } from '@angular/http/src/static_response';

@Injectable()
export class ServerProvider {

  private url: string = URL;

  constructor(public http: Http) {}

  finishGame(game:Game): Observable<any> {
    console.log(game)
    const body = JSON.stringify(game);
    const headers = new Headers({'Content-Type':'application/json'})
    return this.http.post(`${this.url}/game/new`,body,{headers:headers})
       .map((res)=>{ return res.json();})
  }

  getLastGame(name:string): Observable<any> {
    const headers = new Headers({'Content-Type':'application/json'})
    return this.http.get(`${this.url}/game/last/${name}`).map((response: Response) =>{
        return response.json();
    }).catch((err) =>{ 
        return Observable.throw(err);
      })
  }

}
