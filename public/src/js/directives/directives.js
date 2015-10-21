angular.module('Directives', [])

.directive('passwordMatch', [function() {

  return {
    require: "ngModel",
    scope: {
      originalPassword: "=passwordMatch"
    },
    link: function(scope, element, attributes, ngModel) {
      ngModel.$validators.passwordMatch = function(modelValue) {
        return modelValue == scope.originalPassword;
      };

      scope.$watch("originalPassword", function() {
        ngModel.$validate();
      });
    }
  };

}]);
