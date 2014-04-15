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
    var results = [],
        limit = 4;
    searchTerm = searchTerm.toLowerCase();

    for (var i = 0; i < data.length; i++) {
      var matchesCountry = data[i].Country.toLowerCase().indexOf(searchTerm) != -1,
          matchesCity = data[i].City.toLowerCase().indexOf(searchTerm) != -1,
          matchesName = data[i].Company.toLowerCase().indexOf(searchTerm) != -1;
      if(matchesCity || matchesCountry || matchesName) {
        results.push(data[i]);
      }
    }
    // Limit results
    results = results.length > limit ? results.slice(0, limit) : results;
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
      // Custom html tags are supported.
      // Multiple classes per element are supported, but the first one will always be an element reference.
      // Every element needs to have at least 1 unique class defined for plugin to work.
      elementWrapper: "<div class='autocomplete'></div>",
      resultsWrapper: "<div class='autocomplete__results__wrapper'</div>",
      resultsContainer: "<ul class='autocomplete__results__container'></ul>",
      resultsItem: "<li class='autocomplete__results__item' data-company='{{Company}}'><strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small></li>",
      resultsItemHighlightClass: "autocomplete__results__item--highlight",
      hiddenClass: "is-hidden"
    },
    onItem: customOnItem
  });

});
