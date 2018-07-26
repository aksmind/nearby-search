import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation';
import { OfflinePage } from '../offline/offline';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  options: GeolocationOptions;
  currentPos: Geoposition;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  restaurants:any;
  hospitals: any;
  userLatitude;
  userLongitude;
  latLng;
  restroOrHospital;
  hospitalFlag: boolean = true;
  restroFlag: boolean = true;
  markers: any;
  userMarker;
  selectedMarker;
  loading: any;

  constructor(public platform: Platform, public loadingCtrl: LoadingController, private network: Network, public navCtrl: NavController, public geolocation : Geolocation, private storage: Storage) {

    platform.ready().then(() => {
      let disconnectSub = this.network.onDisconnect().subscribe(() => {
        console.log('you are offline');
        navCtrl.push(OfflinePage);
      });
      
      let connectSub = this.network.onConnect().subscribe(()=> {
        console.log('you are online');
        navCtrl.push(HomePage);
      });
    });

    this.markers = [];

  }

  ionViewDidLoad(){
    this.loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: 'Loading please wait'
    });
    this.loading.present();
    setTimeout(() => {
      this.getUserPosition();
      // console.log("Loading...");
      // loading.dismiss();
    });
    // this.getUserPosition();
  }

  // getOffline(){
  //   this.navCtrl.push(OfflinePage);
  // }

  showOnMap(place){
    // let lat = place.geometry.viewport.b.b;
    // let lon = place.geometry.viewport.f.f;
    // console.log("latitude " + lat + "longitude " + lon);
    // console.log(place);
    if(this.markers !== undefined){
      for(let i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);  
      }
    }
    if(this.userMarker !== undefined){
      this.userMarker.setMap(null);  
    }
    if(this.selectedMarker !== undefined){
      this.selectedMarker.setMap(null);
    }
    // this.createMarker(place);
    this.selectedMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location
    });

    // let bounds = new google.maps.LatLngBounds();
    let loc = new google.maps.LatLng(this.selectedMarker.position.lat(),this.selectedMarker.position.lng());
    // bounds.extend(loc);
    // this.map.fitBounds(bounds); //auto zoom
    // this.map.panToBounds(bounds);  //auto center

    // this.restroFlag = true;
    // this.hospitalFlag = true;

    // this.latLng = new google.maps.LatLng(lat,lon);
    let mapOptions = {
      center: loc,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    // this.addMarker();
    this.selectedMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
    // this.selectedMarker.setMap(this.map);
    let content = "<h3>" + place.name + "</h3>" + place.vicinity;
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(this.selectedMarker,'click',() => {
      infoWindow.open(this.map,this.selectedMarker);
    });
  }

  getUserPosition(){
    this.options = {
      enableHighAccuracy: false
    };

    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
      this.currentPos = pos;
      // console.log(pos);
      this.latLng = new google.maps.LatLng(this.currentPos.coords.latitude,this.currentPos.coords.longitude);
      let mapOptions = {
        center: this.latLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addMarker();
      this.showNearByHospitals();
      // this.addMap(pos.coords.latitude,pos.coords.longitude);
      this.loading.dismiss();

    },(err: PositionError) => {
      console.log("error" + err.message);
      // this.navCtrl.push(OfflinePage);
    });
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
        this.showNearByHospitals();
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
        this.showNearByRestro();
      }
    }
  }

  showNearByHospitals(){
    this.restaurants = null;
    this.restroOrHospital = 1;
    //remove markers of restaurants
    if(this.markers !== undefined){
      for(let i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);  
      }
    }
    if(this.selectedMarker !== undefined){
      this.selectedMarker.setMap(null);
    }

    this.getHospitals(this.latLng).then((results: Array<any>) => {
      this.hospitals = results;
      this.storage.set('hospital',JSON.stringify(this.hospitals));
      if(this.hospitalFlag){
        // this.hospitalFlag = false;
        for(let i=0;i<results.length;i++){
          this.createMarker(results[i]);
        }
      }
    },(status) => console.log(status));

    this.getRestaurants(this.latLng).then((results: Array<any>) => {
      this.restaurants = results;
      this.storage.set('restaurant',JSON.stringify(this.restaurants));
      this.restaurants = null;
    },(status) => console.log(status));

  }

  showNearByRestro(){
    this.hospitals = null;
    this.restroOrHospital = 2;
    //remove markers of hospitals
    if(this.markers !== undefined){
      for(let i=0;i<this.markers.length;i++){
        this.markers[i].setMap(null);  
      }
    }
    if(this.selectedMarker !== undefined){
      this.selectedMarker.setMap(null);
    }

    this.getRestaurants(this.latLng).then((results: Array<any>) => {
      this.restaurants = results;
      this.storage.set('restaurant',JSON.stringify(this.restaurants));
      if(this.restroFlag){
        // this.restroFlag = false;
        for(let i=0;i<results.length;i++){
          this.createMarker(results[i]);
        }
      }
    },(status) => console.log(status));
  }

  addMarker(){
    this.userMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
    let content = "<p>This is your current position ! </p>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(this.userMarker,'click',() => {
      infoWindow.open(this.map,this.userMarker);
    });
  }

  getRestaurants(latLng){
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
      location: latLng,
      radius: 8047,
      types: ['restaurant']
    };
    return new Promise((resolve,reject) => {
      service.nearbySearch(request,function(results,status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
          resolve(results);
        }
        else{
          reject(status);
        }
      });
    });
  }

  getHospitals(latLng){
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
      location: latLng,
      radius: 8047,
      types: ['hospital','health']
    };
    return new Promise((resolve,reject) => {
      service.nearbySearch(request,function(results,status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
          resolve(results);
        }
        else{
          reject(status);
        }
      });
    });
  }

  createMarker(place){
    // if(this.marker !== undefined){
    //   console.log("Marker is undefined");
    //   this.marker.setMap(null);  
    // }
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location
    });
    let content = "<h3>" + place.name + "</h3>" + place.vicinity;
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(marker,'click',() => {
      infoWindow.open(this.map,marker);
    });
    marker.setMap(this.map);
    this.markers.push(marker);
  }

}
