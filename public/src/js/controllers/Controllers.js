angular.module('Controllers', [])

.controller('LoginController', ['$scope', '$location', 'Data', function($scope, $location, Data) {
  if (localStorage.getItem('token') !== null) {
    $location.path('dashboard');
  }

  //initially set those objects to null to avoid undefined error
  $scope.login = {};
  $scope.username = '';

  $scope.doLogin = function(user) {
    Data.post('login', user).then(function(results) {
      Data.toast(results);
      if (results.success) {
        var user = {
          'id': results.userId,
          'token': results.token
        };
        localStorage.setItem('user', JSON.stringify(user));
        $location.path('dashboard');
      }
    });
  };

}])

.controller('SignupController', ['$scope', '$location', 'Data', function($scope, $location, Data) {

  $scope.signup = {
    userName: '',
    password: ''
  };
  $scope.signUp = function(user) {
    Data.post('signUp', user).then(function(results) {
      Data.toast(results);
      if (results.success) {
        var user = {
          'id': results.userId,
          'token': results.token
        };
        localStorage.setItem('user', JSON.stringify(user));
        $location.path('dashboard');
      } else {
        //console.log(results);
      }
    });
  };
}])

.controller('DashboardController', ['$scope', '$location', 'Data', function($scope, $location, Data) {

  $scope.logout = function() {
    Data.get('logout').then(function(results) {
      Data.toast(results);
      localStorage.removeItem('user');
      $location.path('login');
    });
  };

  $scope.selected = [];

  $scope.toggleItem = function(id) {
    var newItem = true;
    angular.forEach($scope.selected, function(value, key) {
      if (id == value) {
        $scope.selected.splice(key, 1);
        newItem = false;
      }
    });
    if (newItem) {
      $scope.selected.push(id);
    }
  };

  $scope.deleteTodos = function() {
    Data.post('deleteTodos', {
        checked: $scope.selected,
        userId: JSON.parse(localStorage.getItem('user')).id
      })
      .then(function(results) {
        $scope.todos = results.todos;
      });
  };

  $scope.createTodo = function() {
    $scope.formData.userId = JSON.parse(localStorage.getItem('user')).id;
    Data.post('todo', $scope.formData)
      .then(function(results) {
        if (results.success) {
          $scope.todos = results.todos;
          $scope.formData = null;
        }
      });
  };

  Data.get('signedin').then(function(results) {
    if (results.success) {
      $scope.username = results.username;

      // when landing on the page, get all todos and show them

      Data.post('todos', {
        userId: JSON.parse(localStorage.getItem('user')).id
      }).then(function(results) {
        if (results.success) {
          $scope.todos = results.todos;
        } else {

        }
      });

    } else {
      localStorage.removeItem('user');
      $location.path('login');
    }
  });
}]);