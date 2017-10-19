'use strict';
 
angular.module('companion.detailEncounter', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('detailEncounter', {
		url: '/mesa/:encounterCountry/:encounterId',
		templateUrl:'pages/encounters/detailEncounter.html',
	 	controller: 'detailEncounterCtrl',
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

.controller('detailEncounterCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','$stateParams', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, $stateParams) {
	$scope.iAmAdmin = false;
	$scope.loadingEncounter = true;

	$scope.userIsInQueue = false;
	$scope.userIsPlayer = false;

	$scope.adminserv = adminserv;
	$scope.enterQueueBtnClass="" + THEME.navFabColor;
	$scope.newMessage = {};
	$('.dropdown-button').dropdown();
	$('.tooltipped').tooltip({delay: 50});
	$('.parallax').parallax();
	$('.modal').modal();
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['active','','','']
	$(".button-collapse").sideNav();
	
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************
	$scope.encounterId = $stateParams.encounterId;
	$('ul.tabs').tabs();
	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
		var refStr = adminserv.getContextById('ref','country',$stateParams.encounterCountry)+'/encounters/'+$stateParams.encounterId;
		var refEncounter = firebase.database().ref(refStr);
		var objEncounter = $firebaseObject(refEncounter);
		objEncounter.$loaded().then(function(){
			$scope.thisEncounter = objEncounter;
			if (!$scope.thisEncounter) {
				$state.go('listEncounters') //debería crear un página vacia que muestre que ese encuentro no existe
			}
			if (objEncounter.admin == userKey) {
				$scope.iAmAdmin = true;
				$scope.thisEncounter.warning = false;
				$scope.thisEncounter.$save();
			}
			$scope.loadingEncounter = false;
			

			if ($scope.thisEncounter.queue) {
				for (var i = 0; i < $scope.thisEncounter.queue.length; i++) {
					var queuer=$scope.thisEncounter.queue[i]
					if(queuer.userKey == userKey){
						$scope.userIsInQueue = true
						break;
					}
				}
			}
			if ($scope.thisEncounter.players) {
				for (var i = 0; i < $scope.thisEncounter.players.length; i++) {
					var player=$scope.thisEncounter.players[i]
					if(player.userKey == userKey){
						$scope.userIsPlayer = true
						$scope.userAsPlayer = player;
						break;
					}
				}
			}
			if ($scope.userIsPlayer || $scope.userIsInQueue) {
				var newClass = "disabled" + $scope.theme.navFabColor;
				console.log(newClass)
				$scope.enterQueueBtnClass= newClass;
			}
			var refOrg = firebase.database().ref('users/'+objEncounter.admin);
			var objOrg = $firebaseObject(refOrg);
			objOrg.$loaded().then(function(result){
			    $scope.organizer = objOrg;  
			})
		})
	})

	$scope.goto = function(destino){
		$state.go(destino);
	}
	$scope.rsvp = function(){
		if (!$scope.userIsPlayer) {
			if (!$scope.thisEncounter.players) {
				$scope.thisEncounter.players = [];	
			}
			$scope.thisEncounter.players.push({
				name: $scope.user.name + ' ' + $scope.user.lastNames,
				photoURL: $scope.user.photoURL,
				userKey: userKey,
				status: "payment_pending"
			})
			$scope.thisEncounter.warning = true;
			$scope.thisEncounter.$save().then(function(){
				if (adminserv.userIsMe(userKey)) {
					$scope.userIsPlayer = true;
					$scope.userAsPlayer = $scope.thisEncounter.players[$scope.thisEncounter.players.length-1]
				};
				Materialize.toast('Has reservado un puesto para esta mesa', 4000)
				$scope.enterQueueBtnClass="disabled";
				$scope.thisEncounter.availableSeats.pop();
				$scope.thisEncounter.$save();
			}, function(error) {
	  			console.log("Error:", error);
			})
		}else{
			Materialize.toast('ya tienes un puesto reservado en esta mesa', 4000)
		};
	}
	


	$scope.removeQueuer = function(queuer){
		for (var i = 0; i < $scope.thisEncounter.queue.length; i++) {
			if($scope.thisEncounter.queue[i].userKey == queuer.userKey){
				$scope.thisEncounter.queue.splice(i,1);
				break;
			}
		}
		$scope.thisEncounter.$save().then(function(){
			Materialize.toast('El usuario ha sido removido de la lista de espera', 4000)
		}, function(error) {
  			console.log("Error:", error);
		})
	}
	$scope.removePlayer = function(player){
		for (var i = 0; i < $scope.thisEncounter.players.length; i++) {
			if($scope.thisEncounter.players[i].userKey == player.userKey){
				$scope.thisEncounter.players.splice(i,1);
				$scope.thisEncounter.availableSeats.push({
					type: 'free',
					name: "Reservar puesto",
					photoURL: "./assets/default-avatar.png"
				})
				$scope.userIsPlayer = false;
				break;
			}
		}
		$scope.thisEncounter.$save().then(function(){
			Materialize.toast('El usuario ha sido retirado de la lista de invitados', 4000)
		}, function(error) {
  			console.log("Error:", error);
		})
	}
	$scope.deleteEncounter = function(){
		$scope.thisEncounter.$remove().then(function(ref) {
			Materialize.toast('La mesa ha sido borrada', 4000)
			$state.go('listEncounters');
		}, function(error) {
		  console.log("Error:", error);
		});
	}

	$scope.addMessage = function(){
		if ($scope.newMessage.text && $scope.newMessage.text != "") {
			$scope.newMessage.author = $scope.user;
			$scope.newMessage.author.userKey = userKey;
			$scope.newMessage.date = new Date().toString();
			if (!$scope.thisEncounter.discussion) {
				$scope.thisEncounter.discussion = [];
			};
			$scope.thisEncounter.discussion.push($scope.newMessage)
			$scope.thisEncounter.$save()
		}
		$scope.newMessage.text = "";
	}
	$scope.confirmDelete = function(){
		$('#modalDelete').modal('open');
	}
}])