'use strict';

angular.module('CollaborativeMap')
  .directive('toolbox', ['$http',
    function($http) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/toolbox',
        replace: true,

        link: function postLink($scope) {

          $scope.views = {
            userView: true,
            historyView: true,
            toolBarIn: true,
            settingsView: true,
            toolsView: true
          };

          $scope.toggleToolbar = function(view) {
            var vs = $scope.views;
            if (vs.toolBarIn) {
              vs.toolBarIn = false;
              vs[view] = false;
            } else if (!vs[view]) {
              hideAllViews();
            } else {
              hideAllViews();
              vs.toolBarIn = false;
              vs[view] = false;
            }
          };

          function hideAllViews() {
            var vs = $scope.views;
            for (var key in vs) {
              vs[key] = true;
            }
          }

          $scope.watchUsers = {};
          $scope.watchUser = function(userId) {
            if ($scope.watchUsers[userId]) {
              delete $scope.watchUsers[userId];
            } else {
              $scope.watchUsers[userId] = true;
            }
          };

          $scope.userBounds = {};

          $scope.getUserBounds = function(userId) {
            var bounds = $scope.userBounds[userId];
            if (bounds) {
              var bound = L.rectangle(bounds, {
                color: '#ff0000',
                weight: 1,
                fill: false
              });
              bound.addTo($scope.map);
              $scope.map.fitBounds(bound, {
                'padding': [5, 5]
              });
              setTimeout(function() {
                $scope.map.removeLayer(bound);
              }, 3000);
            }
          };

          $scope.isWatchingAll = false;
          $scope.watchAll = function() {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };


          $scope.loadHistory = function() {
            $http({
              method: 'GET',
              url: '/api/history/' + $scope.mapId
            })
              .
            success(function(data) { //, status, headers, config) {
              data.forEach(function(action) {
                if (action.date) {
                  var tmpDate = new Date(action.date);
                  action.dateString = tmpDate.getHours() + ':' +
                    tmpDate.getMinutes() + ':' + tmpDate.getSeconds() +
                    ' - ' + tmpDate.getDate() + '.' +
                    (tmpDate.getMonth() + 1) + '.' +
                    tmpDate.getFullYear();

                }
              });
              $scope.history = data;

            })
              .
            error(function(data) { //, status, headers, config) {
              console.log(data);
            });

          };

          $scope.featureHistory = function(id, rev) {
            console.log(id, rev);
            $scope.revertFeature(id, rev);

          };

          $scope.revertFeature = function(id, rev){
            /////api/history/revertFeature/:mapId/:fid/:toRev
            $http({
              method: 'GET',
              url: '/api/history/revertFeature/' + $scope.mapId + '/' + id + '/' + rev
            })
            .success(function(data) { //, status, headers, config) {
                console.log(data);
              })
            .error(function(data) { //, status, headers, config) {
              console.log(data);
            });
          };

          //TODO: in map handler auslagern
          $scope.panToFeature = function(id) {
            var target = $scope.map._layers[id];

            if (target._latlng) {
              $scope.map.panTo(target._latlng);
            }else if(target._latlngs){
              var bounds = target.getBounds();
              $scope.map.fitBounds(bounds);
            }
          };

        }
      };
    }
  ]);