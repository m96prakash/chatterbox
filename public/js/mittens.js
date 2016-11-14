var app = angular.module('mittens',[]);

app.controller('mittensController',function($scope,$http){
	
	$http.get('/meows',function(response){
		console.log(response);
	});

	$scope.meows = [
            'This is first sentence',
            'This is second sentence',
            'This is third sentence',
            'This is fourth sentence'
        ];

});