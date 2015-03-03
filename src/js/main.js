require.config({
  paths: {
    jquery: "/bower_components/jquery/dist/jquery",
    data: "/src/js/data",
    autocomplete: "/src/js/autocomplete"
  },
  shim: {
    jquery: {
      exports: "$"
    }
  }
});

require([ "data", "jquery", "autocomplete" ], function(data, $, AutoComplete) {

  "use strict";

  var customFetch, customOnItem;

  customFetch = function(searchTerm, cb) {
    var results = [],
        searchFields = [ "Country", "City", "Company" ],
        matchFlag = false;
    searchTerm = searchTerm.toLowerCase().trim().split(" "); // for space-divided multi-term search
    for (var i = 0; i < data.length; i++) {
      // Init/reset matchFlags for current searchTerms
      matchFlag = false;
      for (var j = 0; j < searchTerm.length; j++) {
        for (var k = 0; k < searchFields.length; k++) {
          // If (in current data obj) any searchField matches current searchTerm - set current matchFlag true.
          matchFlag = matchFlag || data[i][searchFields[k]].toLowerCase().indexOf(searchTerm[j]) != -1;
        }
      }
      // If (for current searchFields) all searchTerms flags are true, push current data obj to results.
      matchFlag && results.push(data[i]);
    }
    cb(results);
  };

  customOnItem = function(el) {
    if (!el.dataset.disabled) {
      var company = $(el).attr("data-company");
      $("#autocomplete1").val(company);
    }
  };

  new AutoComplete({
    el: "#autocomplete1",
    threshold: 2,
    limit: 5,
    forceSelection: true, // input value has to come from results
    fetch: customFetch,
    template: {
      // Custom html tags are supported.
      // Multiple classes per element are supported, but the first one will always be an element reference.
      // Every element needs to have at least 1 unique class for plugin to work.
      elementWrapper: "<div class='js-autocomplete'></div>",
      resultsWrapper: "<div class='autocomplete'></div>",
      resultsContainer: "<ul class='autocomplete__results'></ul>",
      resultsItem: "<li class='autocomplete__results__item' data-company='{{Company}}'><strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small></li>",
      // noResultsItem can be undefined. It simply will not be displayed then.
      noResultsItem: "<li class='autocomplete__results__item' data-disabled='true'>No matches found</li>",
      resultsItemHighlightClass: "autocomplete__results__item--highlight",
      searchTermHighlightClass: "autocomplete__search-term--highlight",
      hiddenClass: "is-hidden"
    },
    onItem: customOnItem
  });

});
