require.config({
  paths: {
    jquery: "/bower_components/jquery/dist/jquery",
    data: "/src/js/example_data",
    autocomplete: "/src/js/autocomplete"
  }
});

require([ "jquery", "data", "autocomplete" ], function($, data, Autocomplete) {

  "use strict";

  $(document).ready(function() {

    new Autocomplete({
      el: ".js-autocomplete-company",
      threshold: 2,
      limit: 5,
      forceSelection: true,
      templates: {
        item: "{{Company}}<br /><small>{{City}}, {{Country}}</small>",
        value: "{{Company}}",
      },
      fetch: function(searchTerm, cb) {
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
      }
    });

  });

});
