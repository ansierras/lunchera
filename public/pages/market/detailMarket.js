'use strict';
 
angular.module('companion.detailMarket', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('detailMarket', {
		url: '/oferta/:offerCountry/:offerId',
		templateUrl:'pages/market/detailMarket.html',
	 	controller: 'detailMarketCtrl',
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

.controller('detailMarketCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','$stateParams', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, $stateParams) {
	$scope.iAmAdmin = false
	$scope.loadingOffer = true;
	$scope.newMessage = {};
	$scope.userOffer = {};
	$('.modal').modal();
	$('.parallax').parallax();
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
	$scope.offerId = $stateParams.offerId;
	$scope.adminserv = adminserv;
	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
		var refStr = adminserv.getContextById('ref','country',$stateParams.offerCountry)+'/market/'+$stateParams.offerId;
		var refOffer = firebase.database().ref(refStr);
		var objOffer = $firebaseObject(refOffer);
		objOffer.$loaded().then(function(){
			$scope.thisOffer = objOffer;
			if (objOffer.admin.userKey == userKey) {
				$scope.iAmAdmin = true;
				$scope.thisOffer.warning = false;
				$scope.thisOffer.$save();

			}
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
	$scope.addMessage = function(){
		if ($scope.newMessage.text && $scope.newMessage.text != "") {
			$scope.newMessage.author = $scope.user;
			$scope.newMessage.author.userKey = userKey;
			$scope.newMessage.date = new Date().toString();
			if (!$scope.thisOffer.discussion) {
				$scope.thisOffer.discussion = [];
			};
			$scope.thisOffer.discussion.push($scope.newMessage)
			if (!$scope.iAmAdmin) {$scope.thisOffer.warning = true;};
			$scope.thisOffer.$save()
		}
		$scope.newMessage.text = "";
	}

	$scope.deleteOffer = function(){
		$scope.thisOffer.$remove().then(function(ref) {
			Materialize.toast('La oferta ha sido borrada', 4000)
			$state.go('listMarket');
		}, function(error) {
		  console.log("Error:", error);
		});
	}

	$scope.wantToBuy = function(){
		$('#modalMakeOffer').modal('open');
	}

	$scope.makeOffer = function(){
		if ($scope.userOffer.offer) {
			$scope.userOffer.author = $scope.user;
			$scope.userOffer.author.userKey = userKey;
			if (!$scope.thisOffer.offers) {
				$scope.thisOffer.offers = [];
			};
			$scope.thisOffer.warning = true;
			$scope.thisOffer.offers.push($scope.userOffer)
			$scope.thisOffer.$save().then(function(){
				Materialize.toast('Has hecho una oferta!', 4000)
			})
		}
		$scope.userOffer.offer = "";
	}

	$scope.acceptOffer = function(offer){
		$scope.selectedOffer = offer;
		$('#modalAcceptOffer').modal('open');
	}
	$scope.rejectOffer = function(offer){
		$scope.selectedOffer = offer;
		$('#modalRejectOffer').modal('open');
	}

	$scope.confirmRejectOffer = function(){
		for (var i = 0; i < $scope.thisOffer.offers.length; i++) {
			if($scope.thisOffer.offers[i].author.userKey == $scope.selectedOffer.author.userKey && $scope.thisOffer.offers[i].offer == $scope.selectedOffer.offer){
				$scope.thisOffer.offers.splice(i,1);
				break;
			}
		}
		$scope.thisOffer.$save().then(function(){
			Materialize.toast('La oferta ha sido rechazada', 4000)
		}, function(error) {
  			console.log("Error:", error);
		})
	}

	$scope.confirmAcceptOffer = function(){
		var newDeal = $scope.thisOffer;
		newDeal.sellerKey = userKey;
		newDeal.buyerKey = $scope.selectedOffer.author.userKey;
		newDeal.buyer = $scope.selectedOffer.author;
		newDeal.ammount = $scope.selectedOffer.offer;
		newDeal.dateOfDeal = new Date().toString();
		
		var refStr = adminserv.getContextById('ref','country',$stateParams.offerCountry)+'/deals';

		var refDeals = firebase.database().ref(refStr);
  		var arrayDeals = $firebaseArray(refDeals);
		arrayDeals.$add(newDeal).then(function(){
			//quitar loader
			$scope.deleteOffer();
			Materialize.toast('Trato hecho! ponte en contacto con el usuario cuanto antes!', 4000)
			$state.go('perfil')
		});
	}
}])
