require.config({
  "paths": {
    "jquery": "/bower_components/jquery/dist/jquery",
    "data": "/src/js/data",
    "autocomplete": "/src/js/autocomplete"
  },
  shim: {
    'jquery': {
      exports: '$'
    }
  }
});

require([ "data", "jquery", "autocomplete" ], function(data, $, AutoComplete) {

  // var customTemplate = function(results) {
  //   var items = "",
  //       r = results.length
  //   for(var i = 0; i < r; i++) {
  //     items += "<li data-company='" + results[i].Company + "'><strong>" + results[i].Company + "</strong><br/><small>" + results[i].City + ", " + results[i].Country + "</small></li>";
  //   }
  //   return items;
  // };

  var customFetch = function(searchTerm, cb) {
    var results = [];
    searchTerm = searchTerm.toLowerCase();

    for (var i = 0; i < data.length; i++) {
      var matchesCountry = data[i].Country.toLowerCase().indexOf(searchTerm) != -1,
          matchesCity = data[i].City.toLowerCase().indexOf(searchTerm) != -1,
          matchesName = data[i].Company.toLowerCase().indexOf(searchTerm) != -1;
      if(matchesCity || matchesCountry || matchesName) {
        results.push(data[i]);
      }
    }
    cb(results);
    // setTimeout(function() {
    //   cb(results);
    // }, 1000);
  };

  var customOnItem = function(el) {
    var company = $(el).attr("data-company");
    $("#autocomplete1").val(company);
  };

  var x = new AutoComplete({
    el: "#autocomplete1",
    fetch: customFetch,
    template: {
      // Custom html tags are supported. Appearance is based on custom css classes (see below).
      resultsContainer: "<ul>{{items}}</ul>",
      resultsItem: "<li data-company='{{Company}}'><strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small></li>"
    },
    css: {
      // Multiple classes per element are supported, but the first one will always be an element reference.
      // Every element needs to have at least 1 unique class defined for plugin to work (!)
      hidden: "is-hidden",
      elementWrapper: "autocomplete",
      resultsWrapper: "autocomplete__results",
      resultsContainer: "autocomplete__results__content",
      resultsItem: "autocomplete__results__item",
      resultsItemHighlight: "autocomplete__results__item--highlight"
    },
    onItem: customOnItem
  });

});
