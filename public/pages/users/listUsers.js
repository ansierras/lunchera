'use strict';
 
angular.module('companion.listUsers', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('listUsers', {
		url: '/comunidad',
		templateUrl:'pages/users/listUsers.html',
	 	controller: 'listUsersCtrl',
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

.controller('listUsersCtrl', ['Auth','adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME','PLACES', function(Auth, adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, PLACES) {
	$scope.filter = {};
	$scope.loadingUserList = true;
	$scope.adminserv = adminserv;
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','','active','']
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
		for (var i = PLACES.length - 1; i >= 0; i--) {
			if(PLACES[i].id == $scope.user.countryId){
				$scope.cities = PLACES[i].cities;
			}
		}
		$scope.filter.cityId = $scope.user.cityId
		var refStr = adminserv.getContextById('ref','country',objUser.countryId)+'/users'
		var refUsers = firebase.database().ref('/users').orderByChild('countryId').equalTo($scope.user.countryId);
		var arrayUsers = $firebaseArray(refUsers);
		arrayUsers.$loaded().then(function(){
			$scope.usersList = arrayUsers;
			console.log($scope.usersList)
			$scope.loadingUserList = false;
		})
	})

	$scope.filterFunc = function(entry){
		return entry.cityId==$scope.filter.cityId
	}

}])