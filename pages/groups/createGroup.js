'use strict';
 
angular.module('companion.createGroup', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('createGroup', {
		url: '/crearGrupo',
		views:{
			'': {
				templateUrl:'pages/groups/createGroup.html',
			 	controller: 'createGroupCtrl'	}
		}
	})

}])

.controller('createGroupCtrl', ['$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME', function($scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME) {

	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','','active']
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************


}])
