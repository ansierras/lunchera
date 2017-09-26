'use strict';
 
angular.module('companion.detailGroup', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('detailGroup', {
		url: '/grupo/:groupId',
		views:{
			'': {
				templateUrl:'pages/groups/detailGroup.html',
			 	controller: 'detailGroupCtrl'	}
		}
	})

}])

.controller('detailGroupCtrl', ['$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','$stateParams', function($scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, $stateParams) {

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
	$scope.groupId = $stateParams.groupId;

}])
