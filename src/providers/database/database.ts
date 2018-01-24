import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { isTrueProperty } from 'ionic-angular/util/util';
import { Hole } from '../../models/hole.model';
import { Game } from '../../models/game.model';



@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;
 
  constructor(public sqlitePorter: SQLitePorter, private storage: Storage, private sqlite: SQLite, private platform: Platform, private http: Http) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {

      if(this.platform.is('android') || this.platform.is('ios')){

        this.sqlite.create({
          name: 'games.db',
          location: 'default'
        })
          .then((db: SQLiteObject) => {
            this.database = db;
            this.storage.get('database_filled').then(val => {
              if (val) {
                this.databaseReady.next(true);
              } else {
                this.fillDatabase();       
              }
            });
          });
      }
    });

  }


  createDatabase(){
    return this.sqlite.create({
      name: 'games.db',
      location: 'default'
    });
  }
 
  fillDatabase() {
    this.http.get('assets/hole.sql')
      .map(res => res.text())
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data => {
            this.databaseReady.next(true);
            this.storage.set('database_filled', true);
          })
          .catch(e => console.error(e));
      });
  }

  fillPreviousDatabase() {
    this.http.get('assets/previous.sql')
      .map(res => res.text())
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data => {
            this.storage.set('database_filled', true);
          })
          .catch(e => console.error(e));
      });
  }


  createGameTable(){
    let sql = "CREATE TABLE IF NOT EXISTS game(id INTEGER PRIMARY KEY AUTOINCREMENT, date DATETIME DEFAULT CURRENT_TIMESTAMP, totalScore INTEGER, preEmotions TEXT, postEmotions TEXT, goalName TEXT, difficulty TEXT)";
    return this.sqlitePorter.importSqlToDb(this.database,sql).then(data =>{
        this.storage.set('database_filled', true);
        return true;
    }).catch(err => {return false})

  }

  insertGoalName(goalName:string){
    let sql = "INSERT INTO game(goalName) VALUES (?)"
    return this.database.executeSql(sql,[goalName]).then(data=>{
        return data;
    }, err => {
      return err;
    })
  }

  insertEmotions(preEmotions:string, postEmotions:string, goalName:string){
    let sql = "UPDATE game SET preEmotions= ?, postEmotions= ? WHERE goalName= ?"
    return this.database.executeSql(sql,[preEmotions,postEmotions,goalName]).then(data=>{
        return data;
    }, err => {
      return err;
    })
  }

  getAllHoles() {
    return this.database.executeSql("SELECT * FROM hole", []).then((data) => {
      let holes: Hole[] = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          holes.push(new Hole(data.rows.item(i).holeNumber,data.rows.item(i).score))
        }
      }
      return holes;
    }, err => {
      console.log('Error: ', err);
      return [];
    });
  }
 
  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  fetchHole(id: number){
    let sql = "SELECT * FROM hole where holeNumber = ?"
    return this.database.executeSql(sql,[id]).then(data =>{
      let item: Hole[] = [];
      for (var i = 0; i < data.rows.length; i++) {
        item.push(new Hole(data.rows.item(i).holeNumber,data.rows.item(i).score));
      }
      return item;
    })
  }

  updateHole(postData: Hole){
    let sql = "UPDATE hole SET score= ? WHERE holeNumber= ?";
    return this.database.executeSql(sql,[postData.score, postData.holeNumber]).then(data =>{
      return data;
     }, err => { return err})
  }

    checkTableCount(){
      let sql ="SELECT * FROM game";
      return this.database.executeSql(sql,[]).then(data => {
        if(data.rows.length > 0){
          return true;
        }
      return false;
      })
    }

    selectFromGame(){
      let sql ="SELECT * FROM game";
      let games: Game[] = [];
      return this.database.executeSql(sql,[]).then(data => {
        if(data.rows.length > 0){
          for(let i = 0; i < data.rows.length; i++){
             games.push(new Game(data.rows.item(i).goalName, data.rows.item(i).preEmotions, data.rows.item(i).postEmotions));
          }
        }
      return games;
      })
    }


    createPreviousGameTable(){
        let sql = "CREATE TABLE IF NOT EXISTS previous(id INTEGER PRIMARY KEY AUTOINCREMENT, holeNumber INTEGER, score INTEGER)";
        return this.sqlitePorter.importSqlToDb(this.database,sql).then(data =>{
            return data;
        }).catch(err => {return false})
  
    }

    fetchPreviousHole(id: number){
      let sql = "SELECT * FROM previous where holeNumber = ?"
      return this.database.executeSql(sql,[id]).then(data =>{
        let item: Hole[] = [];
        for (var i = 0; i < data.rows.length; i++) {
          item.push(new Hole(data.rows.item(i).holeNumber,data.rows.item(i).score));
        }
        return item;
      })
    }


    fetchAllPreviousHoles(){
      let sql = "SELECT * FROM previous";
      return this.database.executeSql(sql,[]).then(data => {
        let items: Hole[] = [];

        if(data.rows.length > 1){
          for (var i = 0; i < data.rows.length; i++) {
            items.push(new Hole(data.rows.item(i).holeNumber,data.rows.item(i).score));
          }

          return items;
        } else {
          return [];
        }
      })
    }



    storagePreviousGame(holes:Hole[]){
      let sql = "INSERT INTO previous(holeNumber,score) VALUES (?,?)";
      let deferred: Promise<any>
      for(let i = 0; i < holes.length; i++){
        deferred = this.database.executeSql(sql,[holes[i].holeNumber, holes[i].score]);
      }

      return deferred.then((data) => {
          return data;
      }).catch((err) =>{
          return err;
      })
    }

    dropTables(){
      let sql:string[] = ["DROP TABLE previous", "DROP TABLE game", "DROP TABLE hole"];
      let deferred: Promise<any>;

      for(let i = 0; i < sql.length; i++){
        deferred = this.database.executeSql(sql[i], []);
      }

      return deferred.then((data)=>{
          return data;
      }).catch((err)=>{
          return err;
      })

    }
 
}