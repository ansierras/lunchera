'use strict';
 
angular.module('companion.userprof', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('userprof', {
		url: '/usuario/:hostKey',
		templateUrl:'pages/users/users.html',
	 	controller: 'userprofCtrl',
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

.controller('userprofCtrl', ['Auth','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME', 'COLLECTION', 'PLACES', '$http','adminserv','$stateParams', function(Auth,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, COLLECTION, PLACES, $http, adminserv, $stateParams) {
	$scope.loadingUser = true;
	$scope.loadingEncounterList = true;
	$scope.synching = false;
	$scope.userIsMe = false;
	$scope.adminserv = adminserv;
	$scope.user={}
	
	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
	})

	var hostKey = $stateParams.hostKey;
	console.log(hostKey)
	var refHost = firebase.database().ref('users/'+hostKey);
	var objHost = $firebaseObject(refHost);
	objHost.$loaded().then(function(){
		$scope.host = objHost;

		$scope.loadingUser= false;
		if ($scope.host.$id == userKey) {$scope.userIsMe = true;};
		if (!$scope.host.favGame) {$scope.favGameImg = 'assets/34.jpg'}
			else{$scope.favGameImg = $scope.host.favGame.image};
	})
	
	$scope.countries = PLACES;
	$scope.sincronizar = true;

	$('.modal').modal();
	
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
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
	$('select').material_select();
	$('.modal').modal();
	$('.parallax').parallax();

	$scope.logout = function(){
		adminserv.logoutUser();
		$state.go('login');
	}
	$scope.openMessageModal = function(){
		$('#modalMessage').modal('open');
	}
	$scope.sendMessage = function(){
		if ($scope.newMessage) {
			var newMessage = {
				author: $scope.user,
				text: $scope.newMessage
			}
			newMessage.author.userKey = userKey;
			newMessage.date = new Date().toString();
			//$scope.host.messages.push(newMessage)

			var refMessages = firebase.database().ref('messages/'+hostKey);
			var listMessages = $firebaseArray(refMessages);
			listMessages.$add(newMessage).then(function(){
				Materialize.toast('Tu mensaje ha sido enviado!', 4000)
			});
			// $scope.host.$save().then(function(){
			// 	Materialize.toast('Tu mensaje ha sido enviado!', 4000)
			// })
		};
	}



}])
