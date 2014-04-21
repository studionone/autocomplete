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

  var customFetch = function(searchTerm, cb) {
    var results = [],
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
  };

  var customOnItem = function(el) {
    var company = $(el).attr("data-company");
    $("#autocomplete1").val(company);
  };

  var x = new AutoComplete({
    el: "#autocomplete1",
    threshold: 2,
    limit: 5,
    fetch: customFetch,
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


  var filterData = function() {
    this.results = [];
    this.searchTerm = this.searchTerm.toLowerCase().trim().split(' ');
    var matchFlags = [], // Every searchTerm has its own matchFlag for current searchFields set;
        i = 0;
    // 1. Init data loop - stop if EoD or results limit reached
    while ( (i < this.config.data.length) && (this.results.length < this.config.limit) ) {
      matchFlags = [false]; // Init / reset matchFlags for current searchTerms
      // 2. Init searchTerm loop
      for (var j = 0; j < this.searchTerm.length; j++) {
        // 3. Init searchFields loop
        for (var k = 0; k < this.config.searchFields.length; k++) {
          // 4. If (in current data item) any searchField matches current searchTerm, return true.
          matchFlags[j] =
            (this.config.data[i][this.config.searchFields[k]].toLowerCase().indexOf(this.searchTerm[j]) != -1) || matchFlags[j];
        }
      }
      // 5. If, for current searchFields, all searchTerms returned true, push 'em to results.
      if (matchFlags.reduce(function(prev, curr, i, arr){ return  prev && curr; })) {
        this.results.push(this.config.data[i]);
      }
      i++;
    }
    if (this.results.length > 0) {
      this.populateResultPanel();
    } else {
      this.clearResults();
    }
  };

});
