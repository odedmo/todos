var app = angular.module('myApp', ['ngRoute', 'ngAnimate', 'toaster', 'Controllers', 'DataService', 'Directives']);

app.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/login', {
          title: 'Login',
          templateUrl: 'views/login.html',
          controller: 'LoginController'
        })
        .when('/signup', {
          title: 'Signup',
          templateUrl: 'views/signup.html',
          controller: 'SignupController'
        })
        .when('/dashboard', {
          title: 'Dashboard',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardController'
        })
        .when('/', {
          title: 'Login',
          templateUrl: 'views/login.html',
          controller: 'LoginController',
          role: '0'
        })
        .otherwise({
          redirectTo: '/login'
        });
    }
  ])
  .run(['$rootScope', '$location', 'Data', function($rootScope, $location, Data) {
    //   $rootScope.$on("$routeChangeStart", function(event, next, current) {
    //     $rootScope.authenticated = false;
    //     // check if user logged in
    //     Data.get('session').then(function(results) {
    //       if (results.id) {
    //         $rootScope.authenticated = true;
    //         $rootScope.id = results.id;
    //         $rootScope.name = results.name;
    //         $rootScope.email = results.email;
    //       } else {
    //         var nextUrl = next.$$route.originalPath;
    //         if (nextUrl == '/signup' || nextUrl == '/login') {

    //         } else {
    //           $location.path("/login");
    //         }
    //       }
    //     });
    //   });
  }]);
