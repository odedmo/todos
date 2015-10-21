angular.module('DataService', [])

.factory('Data', ['$http', 'toaster',
  function($http, toaster) {

    // This service connects to our REST API
    var serviceBase = 'api/';
    var obj = {};
    var token = null;
    
    obj.toast = function(data) {
      toaster.pop(data.status, "", data.message, 2000, 'trustedHtml');
    };
    obj.get = function(q) {
      token = JSON.parse(localStorage.getItem('user')).token;
      return $http.get(serviceBase + q + '?token=' + token).then(function(results) {
        return results.data;
      });
    };
    obj.post = function(q, object) {
      token = localStorage.getItem('user') !== null ? JSON.parse(localStorage.getItem('user')).token : '';
      object.token = token;
      return $http.post(serviceBase + q, object).then(function(results) {
        return results.data;
      });
    };

    obj.delete = function(q, array) {
      return $http.delete(serviceBase + q).then(function(results) {
        return results.data;
      });
    };

    // obj.put = function(q, object) {
    //   return $http.put(serviceBase + q, object).then(function(results) {
    //     return results.data;
    //   });
    // };

    return obj;
  }
]);
