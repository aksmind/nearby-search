import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-offline',
  templateUrl: 'offline.html',
})
export class OfflinePage {

  hospitals: any;
  restaurants: any;
  restroOrHospital;
  noData: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OfflinePage');
  }

  getTopics(ev: any){ 
    if(this.restroOrHospital == 1){  // 1 means hospitals
      let servVal = ev.target.value;
      if(servVal && servVal.trim() != ''){
        this.hospitals = this.hospitals.filter((hospital) => {
          // return (hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1)
          if(hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1){
            return hospital.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1;
          }
          else{
            return hospital.vicinity.toLowerCase().indexOf(servVal.toLowerCase()) > -1
          }
        })
      }
      else{
        this.getHospitals();
      }
    }
    if(this.restroOrHospital == 2){  // 2 means restaurants
      let servVal = ev.target.value;
      if(servVal && servVal.trim() != ''){
        this.restaurants = this.restaurants.filter((restaurant) => {
          //return (restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1)
          if(restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1){
            return restaurant.name.toLowerCase().indexOf(servVal.toLowerCase()) > -1;
          }
          else{
            return restaurant.vicinity.toLowerCase().indexOf(servVal.toLowerCase()) > -1
          }
        })
      }
      else{
        this.getrestaurants();
      }
    }
  }

  getHospitals(){
    this.restroOrHospital = 1;
    this.restaurants = null;
    this.storage.get('hospital').then((val) => {
      this.hospitals = JSON.parse(val);
    })
  }

  getrestaurants(){
    this.restroOrHospital = 2;
    this.hospitals = null;
    this.storage.get('restaurant').then((val) => {
      this.restaurants = JSON.parse(val);
    })
  }

}
