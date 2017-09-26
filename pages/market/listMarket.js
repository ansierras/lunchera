'use strict';
 
angular.module('companion.listMarket', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('listMarket', {
		url: '/mercado',
		templateUrl:'pages/market/listMarket.html',
	 	controller: 'listMarketCtrl',
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

.controller('listMarketCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME','PLACES', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, PLACES) {
	$scope.loadingMarketList = false;
	$scope.filter = {};
	$scope.cities = [];
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','active','','']
	$(".button-collapse").sideNav();
	$('ul.tabs').tabs();
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
		for (var i = PLACES.length - 1; i >= 0; i--) {
			if(PLACES[i].id == $scope.user.countryId){
				$scope.cities = PLACES[i].cities;
			}
		}
		$scope.filter.cityId = $scope.user.cityId
		var refStr = adminserv.getContextById('ref','country',objUser.countryId)+'/market'
		var refMarket = firebase.database().ref(refStr)//.orderByChild('city').equalTo($scope.user.cityId);
		var arrayMarket = $firebaseArray(refMarket);
		arrayMarket.$loaded().then(function(){
			$scope.marketList = arrayMarket;
			$scope.loadingMarketList = false;
		})
	})

	$scope.filterSelling = function(entry){
		return entry.city==$scope.filter.cityId
	}
	$scope.filterBuying = function(entry){
		return entry.type === 'buying'
	}
	$scope.filterFunc = function(entry){
		return entry.city==$scope.filter.cityId
	}

}])
