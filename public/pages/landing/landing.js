'use strict';
 
angular.module('companion.landing', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('landing', {
		url: '/home',
		templateUrl:'pages/landing/landing.html',
	 	controller: 'landingCtrl'
		
	})

}])

.controller('landingCtrl', ['$scope','$state','$rootScope','$firebaseArray','$firebaseObject', 'THEME', function($scope, $state, $rootScope, $firebaseArray, $firebaseObject, THEME) {
	$('.button-collapse').sideNav();
	$('.parallax').parallax();
	//************Necesario para el MENU!!! ******************
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************


}])