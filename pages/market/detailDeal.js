'use strict';
 
angular.module('companion.detailDeal', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('detailDeal', {
		url: '/trato/:dealCountry/:dealId',
		templateUrl:'pages/market/detailDeal.html',
	 	controller: 'detailDealCtrl',
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

.controller('detailDealCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','$stateParams', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, $stateParams) {
	$scope.iAmAdmin = false
	$scope.loadingOffer = true;
	$scope.newMessage = {};
	$scope.userOffer = {};
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
	$scope.offerId = $stateParams.dealId;
	$scope.adminserv = adminserv;
	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
		var refStr = adminserv.getContextById('ref','country',$stateParams.dealCountry)+'/deals/'+$stateParams.dealId;
		var refOffer = firebase.database().ref(refStr);
		var objOffer = $firebaseObject(refOffer);
		objOffer.$loaded().then(function(){
			$scope.thisOffer = objOffer;
			console.log($scope.thisOffer)
			if (objOffer.admin.userKey == userKey) {$scope.iAmAdmin = true;}
			$scope.loadingOffer = false;
			var refOrg = firebase.database().ref('users/'+objOffer.admin.userKey);
			var objOrg = $firebaseObject(refOrg);
			objOrg.$loaded().then(function(result){
			    $scope.organizer = objOrg;  
			})
		}).catch(function(error){
			console.log(error)
		})
	}).catch(function(error){
		console.log(error)
	})

	$scope.formatPrice = function(price){
		return price.toFixed(2).replace(/./g, function(c, i, a) {
		    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
		});
	}


}])
