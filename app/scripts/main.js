var app = angular.module('diamondslide', []);

var GameCtrl = function($scope) {
    var timeAtStart;
    var lastRandomIndex = -1;
    var ignoreInput = false;
    var arrowCodes = {
        38: 'top',
        37: 'left',
        39: 'right',
        40: 'bottom'
    };

    var getRandomNumbersForOptions = function() {
        var randomNumbers = [];
        while (randomNumbers.length < 4) {
            var newNum = Math.floor(Math.random()*4) + 1;
            if (randomNumbers.indexOf(newNum) == -1) {
                randomNumbers.push(newNum);
            }
        }
        return randomNumbers;
    };

    var options = getRandomNumbersForOptions();
    
    var slideTowardsCorrectOption = function(clone, keyCode) {
        window.console.log('case ' + arrowCodes[keyCode]);
        var SLIDE_TIME = 200;
        switch(arrowCodes[keyCode]) {
            case 'top':
                clone.animate({
                    top: '-250px'
                }, SLIDE_TIME);
                break;
            case 'left':
                clone.animate({
                    left: 0
                }, SLIDE_TIME);
                break;
            case 'right':
                clone.animate({
                    left: '100px'
                }, SLIDE_TIME);
                break;
            case 'bottom':
                clone.animate({
                    top: '-150px'
                }, SLIDE_TIME);
                break;
        }
        clone.fadeOut(200, function() {
            /// window.location.reload();
            initialize();
            $scope.$apply();
        });
    };

    var initialize = function() {
        options = getRandomNumbersForOptions();
        $scope.data = {
            'top' : options[0],
            'left' : options[1],
            'right' : options[2],
            'bottom' : options[3],
        };
        var randomIndex = Math.floor(Math.random()*4);
        window.console.log(options + ' ' + randomIndex);
        if (randomIndex == lastRandomIndex) {
            window.console.log('re initialize');
            initialize();
            $scope.$$phase || $scope.$apply();
            return;
        } else {
            lastRandomIndex = randomIndex;
        }
        $scope.random = options[randomIndex];
        $scope.bestReactionTime = getBestReactionTime();
        timeAtStart = new Date();
        ignoreInput = false;
    };

    var getBestReactionTime = function(reactionTime) {
        if (sessionStorage && sessionStorage.bestReactionTime) {
            return sessionStorage.bestReactionTime;
        }
        return 0;
    };

    var saveBestReactionTime = function(reactionTime) {
        if ($scope.bestReactionTime == 0 ||
            reactionTime < $scope.bestReactionTime) {
            $scope.bestReactionTime = reactionTime;
            if (sessionStorage) {
                sessionStorage.bestReactionTime =
                    $scope.bestReactionTime;
            }
        }
    };

    $scope.$watch('bestReactionTime', function(){
        window.console.log('bestReactionTime updated');
    });

    $scope.$watch('$viewContentLoaded', function(){
        initialize();
        $scope.reactionTime = 0;
     });

    
    $("body").keyup(function(event){

        window.console.log(event.which);
        var pressed = event.which;
        onAction(pressed);
    });

    $scope.clickAction = function(pressed) {
        onAction(pressed);
    };

    var onAction = function(pressed) {
        if (ignoreInput) {
            return;
        } else {
            ignoreInput = true;
        }
        if ($scope.data[arrowCodes[pressed]] == $scope.random) {
            var timeNow = new Date();
            var reactionTime =
                (timeNow - timeAtStart)/1000;
            saveBestReactionTime(reactionTime);
            $scope.reactionTime = reactionTime;
            $scope.$$phase || $scope.$apply();
            var clone = $("#center").clone().
                appendTo($('#diamonds')).
                attr('id', 'center-clone').
                css({
                    left: '50px',
                    top: '-200px',
                    position: 'relative',
                    zIndex: 999});
            slideTowardsCorrectOption(clone, pressed);
        } else {
            ignoreInput = false;
            window.console.log('WRONG');
        }
    };
};

app.controller('game', ['$scope', GameCtrl]);