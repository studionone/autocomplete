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

  var customFetch = function() {
    return data;
  };

  var customOnItem = function(el) {
    var company = $(el).attr("data-company");
    $("#autocomplete1").val(company);
  };

  var x = new AutoComplete({
    el: "#autocomplete1",
    threshold: 2,
    limit: 5,
    data: customFetch(), // Data is fetched only once;
    searchFields: ['Country', 'City', 'Company'],
    template: {
      // Custom html tags are supported.
      // Multiple classes per element are supported, but the first one will always be an element reference.
      // Every element needs to have at least 1 unique class defined for plugin to work.
      elementWrapper: "<div class='js-autocomplete'></div>",
      resultsWrapper: "<div class='autocomplete'></div>",
      resultsContainer: "<ul class='autocomplete__results'></ul>",
      resultsItem: "<li class='autocomplete__results__item' data-company='{{Company}}'><strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small></li>",
      resultsItemHighlightClass: "autocomplete__results__item--highlight",
      searchTermHighlightClass: "autocomplete__search-term--highlight",
      hiddenClass: "is-hidden"
    },
    onItem: customOnItem
  });

});
