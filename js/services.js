
companion.service('adminserv',['Auth','$http','PLACES','DATESTUFF', '$firebaseObject', function(Auth, $http, PLACES, DATESTUFF, $firebaseObject) {
	var userKey = '';
    var userStatus = null;
    var overallStates = ["Muy mal estado","Mal estado","Buen estado","Casi como nuevo","Nuevo"];
    var searchById = function(array, id){
        for(var entry of array){
            if (entry.id == id) {
                return entry;
                break;
            };
        }  
    }
	return {
		getUserKey: function() {
            if(userKey==''){
                userKey = localStorage.getItem("userKey");
            }
            return userKey;
        },
        setUserKey: function(newUserKey) {
            localStorage.setItem("userKey", newUserKey)
            userKey = newUserKey;
        },
        logoutUser: function(){
            userKey = '';
            userStatus = null;
            localStorage.removeItem('userKey');
            localStorage.removeItem('userStatus');
            Auth.$signOut();
        },
        getContextById: function(type, constant, argId){
            switch(constant){
                case 'city':
                    if (type == 'name' && argId[0] && argId[1]) {return searchById(searchById(PLACES, argId[0]).cities , argId[1]).name;}
                    break;
                case 'country':
                    if (argId) {
                        if (type == 'name') {return searchById(PLACES, argId).name;}
                        else {return searchById(PLACES, argId).ref;}
                    }
            }
        },
        getUserByKey: function(userKey){
            if (userKey=='') {
                return null;
            }else{
                var refUser = firebase.database().ref('users/'+userKey);
                var objUser = $firebaseObject(refUser);
                objUser.$loaded().then(function(result){
                    console.log(result)
                    return result;
                })
            }
            
        },
        interpretDate: function(dateStr){
            var date = new Date(dateStr);
            return DATESTUFF.dayNames[date.getDay()] + ' ' + date.getDate() + ' de ' + DATESTUFF.monthNames[date.getMonth()] + ' de ' + date.getFullYear()
        },
        interpretDateLong: function(dateStr){
            var date = new Date(dateStr);
            var returnString = DATESTUFF.dayNames[date.getDay()] + ' ' + date.getDate() + ' de ' + DATESTUFF.monthNames[date.getMonth()] + ' de ' + date.getFullYear();
            returnString+=" a las " + (date.getUTCHours()-5) + ":" + date.getUTCMinutes()
            return returnString
        },
        interpretDateMessage: function(dateStr){
            var date = new Date(dateStr);
            var returnString = date.getDate() + '/' + DATESTUFF.monthNamesShort[date.getMonth()] + '/' + date.getFullYear();
            returnString+=" a las " + (date.getUTCHours()-5) + ":" + date.getUTCMinutes()
            return returnString
        },
        getOAState: function(state){
            return overallStates[state-1];
        },
        setUserStatus: function(status){
            localStorage.setItem("userStatus", status)
            userStatus = status;
        },
        getUserStatus: function(){
            if(!userStatus){
                userStatus = localStorage.getItem("userStatus");
            }
            return userStatus;
        },
        userIsMe: function(keyToCheck){
            if (keyToCheck == userKey) {
                return true;
            }else{
                return false;
            };
        }   
	}
}])

