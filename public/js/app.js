'use strict';
var companion = angular.module('companion', [
    'ui.router',
    'firebase',
    'angular-media-preview',
    'companion.perfil',
    'companion.login',
    'companion.detailGroup',
    'companion.listGroups',
    'companion.createGroup',
    'companion.detailMarket',
    'companion.listMarket',
    'companion.createMarket',
    'companion.listEncounters',
    'companion.detailEncounter',
    'companion.createEncounter',
    'companion.register',
    'companion.userprof',
    'companion.admin',
    'companion.detailDeal',
    'companion.listUsers',
    'companion.landing']);

companion.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/perfil');

    var config = {
        apiKey: "AIzaSyBRJBXEK8PY-_LPTozzkwgn6YIsoadltG0",
        authDomain: "lunchera-tests.firebaseapp.com",
        databaseURL: "https://lunchera-tests.firebaseio.com",
        projectId: "lunchera-tests",
        storageBucket: "lunchera-tests.appspot.com",
        messagingSenderId: "152064789080"
    };
    firebase.initializeApp(config);
});




companion.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

companion.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault(); 
    console.log("oh no")
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}]);






