'use strict';
 
angular.module('companion.admin', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('adminsite', {
		url: '/adminsite',
		templateUrl:'pages/adminsite/admin.html',
	 	controller: 'adminCtrl',
	 	resolve: {
			"currentAuth": ["adminserv", "$state", function(adminserv, $state) {
				var firebaseUser = adminserv.getUserKey();
				if (firebaseUser) {
					console.log(adminserv.getUserStatus())
					if (adminserv.getUserStatus() == 'admin') {
						return true
					}else{
						$state.go("perfil");
					};
				  
				} else {
				  console.log("Signed out");
				  $state.go("login");
				}
			}]
		}	
	})

}])

.controller('adminCtrl', ['Auth','adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME','PLACES', function(Auth, adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, PLACES) {
	$scope.adminserv = adminserv;
	$scope.generalGames = [];
	$scope.pendingGames = [];
	

	var marketDuration = 4; // var in days
	var encounterDuration = 1; // var in days
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','','','active']
	$(".button-collapse").sideNav();
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************

	$scope.workingGameDB = false;
	$scope.workingFlushEncounters = false;
	$scope.workingFlushEMarket = false;

	$scope.progress = {width: '0%'}

	// var users = ['-Ko_WXrF2UXRa8K7CTOt','-KobkVmPXKf_Wmhk0PlP','-KobrC41U19Snr5bd1ZP'];
	// var userRefs = [];
	// var usersObjects = [];
	// $scope.usersComplete = [];
	// for (var i = users.length - 1; i >= 0; i--) {
		
	// 	userRefs[i] = firebase.database().ref('users/'+users[i]+'/short');
	// 	usersObjects[i] = $firebaseObject(userRefs[i]);
	// 	usersObjects[i].$loaded().then(function(){
	// 		//$scope.usersComplete.push(usersObjects[i]);
	// 	})
	// };
	// $scope.usersComplete = usersObjects
	var usersRef = firebase.database().ref('users');
	var usersList = $firebaseArray(usersRef);
	usersList.$loaded().then(function(){
		$scope.users = usersList;
		
	})

	$scope.gamesDB = function(){
		var gamesAdded = 0;
		$scope.workingGameDB = true;
		var pendRef = firebase.database().ref('games/pending');
  		var pendList = $firebaseArray(pendRef);
  		pendList.$loaded().then(function(pendingList) {
  			var pendLength = pendList.length;
  			var generalRef = firebase.database().ref('games/general');
  			var generalList = $firebaseArray(generalRef);
  			generalList.$loaded().then(function(result){
  				var found = false;
  				var progress = 0;
  				for(var pending of pendList){
  					found = false;
  					for(var general of generalList){
  						if (pending.gameId == general.gameId) {
  							found = true;
  							break;
  						}
  					}
  					if (!found) {
  						generalList.$add(pending);
  						gamesAdded++;
  					}
  					pendList.$remove(pending);
  					progress++;
  					$scope.progress = {width: Math.round((progress/pendLength)*100)+'%'}
  				}
  				var stringNewGames = "Se agregaron "+gamesAdded+" juegos a la base de datos"
  				Materialize.toast(stringNewGames, 8000);
  			})
  			
  		})
	}

	$scope.flushEncounters = function(){
		var maxDur = encounterDuration*86400000;
		$scope.workingFlushEncounters = true;
		var today = new Date();

		var encounterRefs =[];
		var encounterLists = [];
		var progress = 0;
		$scope.progress = {width: '0%'}
		for (var i = PLACES.length - 1; i >= 0; i--) {
			var refStr = PLACES[i].ref+'/encounters' 
			encounterRefs[i] = firebase.database().ref(refStr);
			encounterLists[i] = $firebaseArray(encounterRefs[i]);
			encounterLists[i].$loaded().then(function(result){
				for (var j = result.length - 1; j >= 0; j--) {
					var encDate = new Date(result[j].date)
					if (today-encDate>=maxDur) {
						result.$remove(result[j])
					}
				};
				progress++;
				$scope.progress = {width: Math.round((progress/PLACES.length)*100)+'%'}
			})
		};

		// var refStr = 'colombia/encounters';
		// var encountersRef = firebase.database().ref(refStr);
		// var encountersList = $firebaseArray(encountersRef);
		// encountersList.$loaded().then(function(){
		// 	for (var encounter of encountersList) {
		// 		var encDate = new Date(encounter.date)
		// 		if (today-encDate >= maxDur) {
		// 			encountersList.$remove(encounter)
		// 		}
		// 	}
		// })
	}

	$scope.flushMarket = function(){
		var maxDur = marketDuration*86400000;
		$scope.workingFlushMarket = true;
		var today = new Date();
		var marketRefs =[];
		var marketLists = [];
		var progress = 0;
		$scope.progress = {width: '0%'}
		for (var i = PLACES.length - 1; i >= 0; i--) {
			var refStr = PLACES[i].ref+'/market' 
			marketRefs[i] = firebase.database().ref(refStr);
			marketLists[i] = $firebaseArray(marketRefs[i]);
			marketLists[i].$loaded().then(function(result){
				for (var j = result.length - 1; j >= 0; j--) {
					var offDate = new Date(result[j].date)
					if (today-offDate>=maxDur) {
						console.log(result[j])
						result.$remove(result[j])
					}
				};
				progress++;
				$scope.progressMarket = {width: Math.round((progress/PLACES.length)*100)+'%'}
			})
		};
		// var refStr = 'colombia/market';
		// var marketRef = firebase.database().ref(refStr);
		// var marketList = $firebaseArray(marketRef);
		// marketList.$loaded().then(function(){
		// 	for (var offer of marketList) {
		// 		var offDate = new Date(offer.date)
		// 		if (today-offDate>=maxDur) {
		// 			console.log(today-offDate)
		// 			marketList.$remove(offer)
		// 		}
		// 	}
		// })
	}

	$scope.loadGeneral = function(){
		var gamesRef = firebase.database().ref('games/general').orderByChild("name");
		var gamesList = $firebaseArray(gamesRef);
		gamesList.$loaded().then(function(){
			$scope.generalGames = gamesList;
		})
	}
	$scope.loadPending = function(){
		var gamesRef = firebase.database().ref('games/pending').orderByChild("name");
		var gamesList = $firebaseArray(gamesRef);
		gamesList.$loaded().then(function(){
			$scope.pendingGames = gamesList;
		})
	}

}])