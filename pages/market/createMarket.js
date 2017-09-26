'use strict';
 
angular.module('companion.createMarket', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('createMarket', {
		url: '/nuevaoferta',
		templateUrl:'pages/market/createMarket.html',
	 	controller: 'createMarketCtrl',
	 	resolve: {
			"currentAuth": ["adminserv", "$state", function(adminserv, $state) {
				var firebaseUser = adminserv.getUserKey();
				if (firebaseUser) {
				  return true
				} else {
				  console.log("Signed out");
				  $state.go("login");
				}
			}]
		}	
	})

}])

.controller('createMarketCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','$location','MENU_ITEMS', 'THEME', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, $location, MENU_ITEMS, THEME) {
	$scope.loadingGames = true;
	$scope.newOffer = {
		game: null,
		type: 'selling',
		date: new Date().toString(),
		overallState: '3',
		inShrink: 'false'
	}
	$scope.unknownGame = {}
	$('.modal').modal();
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','active','','']
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************

	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
	})

	var refGames = firebase.database().ref('games/general'); 
	var listGames = $firebaseArray(refGames);
	listGames.$loaded().then(function(){
		$scope.generalCollection = listGames;
		$scope.loadingGames = false;
	})

	$scope.selectGame = function(game){
		$scope.newOffer.game = game;
	}
	$scope.saveOffer = function(){
		if (!$scope.newOffer.game) {
			Materialize.toast('Debes escoger un juego para esta oferta', 4000) 
		}else{
			$scope.newOffer.admin = $scope.user;
			$scope.newOffer.admin.userKey = userKey;
			$scope.newOffer.city = $scope.user.cityId;
			$scope.newOffer.country = $scope.user.countryId;
			var refStr = adminserv.getContextById('ref','country',$scope.user.countryId)+'/market'
			var refMarket = firebase.database().ref(refStr);
			var arrayMarket = $firebaseArray(refMarket);

			arrayMarket.$add($scope.newOffer).then(function(response){
				//quitar loader
				console.log(response)
				$location.path('/mercado/'+response.key);
			});
			console.log($scope.newOffer)
		}
	}
	$scope.gameNotFound = function(){
		$('#modalGameNotFound').modal('open');
	}
	
	$scope.useUnknownGame = function(){
		$scope.unknownGame.thumbnail ="http://www.meeplesource.com/prodimages/16mm-MixedMeeples-Original-large.jpg";
		$scope.newOffer.game = $scope.unknownGame;
	}

	
}])
