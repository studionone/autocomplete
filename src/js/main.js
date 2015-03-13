require.config({
  paths: {
    jquery: "/bower_components/jquery/dist/jquery",
    data: "/src/js/data",
    autocomplete: "/src/js/autocomplete"
  }
});

require([ "jquery", "data", "autocomplete" ], function($, data, AutoComplete) {

  "use strict";

  var $input, customFetch;

  $(document).ready(function() {

    $input = $(".js-autocomplete-company");

    customFetch = function(searchTerm, cb) {
      var results = [],
          searchFields = [ "Country", "City", "Company" ],
          foundMatch, i, j, k;

      searchTerm = $.trim(searchTerm.toLowerCase()).split(" ");

      for (i = 0; i < data.length; i++) {
        foundMatch = false;
        for (j = 0; j < searchTerm.length; j++) {
          for (k = 0; k < searchFields.length; k++) {
            foundMatch = foundMatch || data[i][searchFields[k]].toLowerCase().indexOf(searchTerm[j]) != -1;
          }
        }
        foundMatch && results.push(data[i]);
      }

      setTimeout(function() { cb(results); }, 500); // setTimeout to simulate data loading delay
    };

    $input.length && new AutoComplete({
      el: $input,
      threshold: 2,
      limit: 5,
      forceSelection: true,
      fetch: customFetch,
      templates: {
        item: "<strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small>",
        value: "{{Company}}",
      },
    });

  });

});
