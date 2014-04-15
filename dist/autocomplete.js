define([ "jquery" ], function($) {

  "use strict";
  var AutoComplete, methods;

  AutoComplete = function(args) {

    this.config = {
      el: "",
      threshold: 2,
      fetch: this.defaultFetch,
      template: {
        elementWrapper: "<div class='autocomplete'></div>",
        resultsWrapper: "<div class='autocomplete__results__wrapper'></div>",
        resultsContainer: "<ul class='autocomplete__results__container'></ul>",
        resultsItem: "<li class='autocomplete__results__item' data-company='{{Company}}'><strong>{{Company}}</strong><br/><small>{{City}}, {{Country}}</small></li>",
        resultsItemHighlightClass: "autocomplete__results__item--highlight",
        hiddenClass: "is-hidden"
      },
      onItem: this.defaultOnItem
    };

    var props = {
      results: [],
      displayed: false,
      resultIndex: 0,
      specialkeys: {
        9: "tab",
        27: "esc",
        13: "enter",
        38: "up",
        40: "down"
      }
    };

    $.extend(this, props);
    $.extend(this.config, args);

    // cache references to dom elements used
    this.$el = $(this.config.el);
    this.$resultsItemList = $();
    
    this.init();

  };

  methods = {
    // I like this method of storing methods and then attaching to the prototype at the end...

    init: function() {
      this.wrapEl();
      this.setupListeners();
    },

    wrapEl: function() {
      this.$el
        .wrap(this.config.template.elementWrapper)
        .after($(this.config.template.resultsWrapper).addClass(this.config.template.hiddenClass));
      this.$wrapper = this.$el.parent();
      // http://jsperf.com/find-sibling-vs-find-wrapper-child
      this.$resultsPanel = this.$el.next();
    },
    
    showResultsPanel: function() {
      this.$resultsPanel.removeClass(this.config.template.hiddenClass);
      this.displayed = true;
      this.highlightResult();
    },

    hideResultsPanel: function() {
      this.$resultsPanel.addClass(this.config.template.hiddenClass);
      this.displayed = false;
    },

    clearResults: function() {
      this.results = [];
      this.$resultsPanel.html("");
      this.hideResultsPanel();
    },

    callFetch: function(searchTerm, cb) {
      var _this = this;
      this.config.fetch(searchTerm, function(results) {
        if (results.length > 0) {
          _this.results = results;
          cb();
        } else {
          _this.clearResults();
        }
      });
    },

    renderList: function() {
      var $container = $(this.config.template.resultsContainer);
      this.$resultsItemList = $(this.processTemplate(this.results));

      return $container.html(this.$resultsItemList);
    },

    populateResultPanel: function() {
      var $results = this.renderList();
      this.$resultsPanel.html($results);
      this.showResultsPanel();
    },

    changeIndex: function(direction) {
      var changed = false;
      if (direction === "up") {
        if (this.resultIndex > 0 && this.results.length > 1) {
          this.resultIndex--;
          changed = true;
        }
      } else if (direction === "down") {
        if (this.resultIndex < this.results.length - 1 && this.results.length > 1) {
          this.resultIndex++;
          changed = true;
        }
      }
      return changed;
    },

    setupListeners: function() {
      var _this = this;
      this.$wrapper.on("keypress", function(e) {
        if(e.which === 13) {
          e.preventDefault();
          return false;
        }
      });

      this.$wrapper.on("keyup", function(e) {
        _this.processTyping(e);
      });

      // 'blur' fires before 'click' so we have to use 'mousedown'
      this.$resultsPanel.on("mousedown", "." + $(this.config.template.resultsItem)[0].className, function(e) {
        _this.config.onItem(this);
        _this.clearResults();
      });

      this.$el.on("blur", function() {
        if (!_this.visible) {
          _this.clearResults();
        }
      });
    },

    processTyping: function(e) {
      // if there is an above-threshold value passed
      if (e.target.value) {
        var keyName = this.specialkeys[e.keyCode];
        if (keyName && this.displayed) {
          this.processSpecialKey(keyName, e);
        } else if (!keyName) {
          this.processSearch(e.target.value);
        }
      } else {
        this.clearResults();
      }
    },

    processSearch: function(searchTerm) {
      var _this = this;
      this.resultIndex = 0;
      if (searchTerm && searchTerm.length >= this.config.threshold) {
        this.callFetch(searchTerm, function() {
          _this.populateResultPanel();
        });
      }
    },

    processSpecialKey: function(keyName, e) {
      var changed = false;
      switch (keyName) {
      case "up": {
        changed = this.changeIndex("up");
        break;
      }
      case "down": {
        changed = this.changeIndex("down");
        break;
      }
      case "enter": {
        this.selectResult();
        break;
      }
      case "esc": {
        this.clearResults();
        break;
      }
      default: {
        break;
      }
      }

      if (changed) {
        this.highlightResult();
      }
    },

    highlightResult: function() {
      // highlight result by adding/removing class
      this.$resultsItemList
        .removeClass(this.config.template.resultsItemHighlightClass)
        .eq(this.resultIndex)
        .addClass(this.config.template.resultsItemHighlightClass);
    },

    selectResult: function() {
      // pass actual DOM element to onItem()
      var el = this.$resultsItemList[this.resultIndex];
      this.config.onItem(el);
      this.clearResults();
    },

    // These three templates are the defaults that a user would override
    processTemplate: function(results) {
      var listLength = results.length,
          listItem = "",
          listItems = "";
      // should return an HTML string of list items
      for (var i = 0; i < listLength; i++) {
        listItem = this.renderTemplate(this.config.template.resultsItem, results[i]);
        // append newly formed list item to other list items
        listItems += listItem;
      }
      return listItems;
    },

    renderTemplate: function(template, obj) {
      for (var key in obj) {
        template = template.replace(new RegExp("{{" + key + "}}", "gm"), obj[key]);
      }
      return template;
    },

    defaultOnItem: function(el) {
      var selectedValue = $(el).text();
      $(this.el).val(selectedValue);
    },

    defaultFetch: function(searchTerm, cb) {
      // must return an array
      cb([ "a","b","c" ]);
    }

  };

  // extend app's prototype w/the above methods
  for (var attrname in methods) {
    AutoComplete.prototype[attrname] = methods[attrname];
  }

  return AutoComplete;

});


