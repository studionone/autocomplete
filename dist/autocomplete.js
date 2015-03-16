define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    el: ".js-autocomplete",
    threshold: 2,
    limit: 5,
    forceSelection: false,
    debounceTime: 200,
    templates: {
      item: "<strong>{{text}}</strong>",
      value: "{{text}}", // appended to item as 'data-value' attribute
      empty: "No matches found"
    },
    extraClasses: {}, // extend default classes (see lines 38-46)
    fetch: undefined,
    onItem: undefined
  };

  function AutoComplete(args) {
    $.extend(this, {
      config: $.extend(true, {}, defaults, args),
      results: [],
      searchTerm: "",
      displayed: false,
      selected: false,
      typingTimer: null,
      resultIndex: -1,
      specialKeys: {
        9: "tab",
        27: "esc",
        13: "enter",
        38: "up",
        40: "down"
      },
      classes: {
        wrapper:     "autocomplete",
        results:     "autocomplete__results",
        list:        "autocomplete__list",
        item:        "autocomplete__list__item",
        highlighted: "autocomplete__list__item--highlighted",
        disabled:    "autocomplete__list__item--disabled",
        empty:       "autocomplete__list__item--empty",
        searchTerm:  "autocomplete__list__item__search-term",
        loading:     "is-loading"
      },
    });

    // if 'value' template is undefined, use 'item' template
    !this.config.templates.value && (this.config.templates.value = this.config.templates.item);

    // if custom fetch/onItem is undefined, use default functions
    !this.config.fetch && (this.config.fetch = this.defaultFetch);
    !this.config.onItem && (this.config.onItem = $.proxy(this.defaultOnItem, this));

    // extend default classes
    for (var key in this.classes) {
      if (this.config.extraClasses[key]) {
        this.classes[key] = this.classes[key].concat(" ", this.config.extraClasses[key]);
      }
    }

    // define templates for all elements
    this.templates = {
      $wrapper: $("<div>").addClass(this.classes.wrapper),
      $results: $("<div>").addClass(this.classes.results),
      $list: $("<div>").addClass(this.classes.list),
      $item:
        $("<div>")
          .addClass(this.classes.item)
          .html(this.config.templates.item)
          .attr("data-value", this.config.templates.value),
      $empty:
        $("<div>")
          .addClass(this.classes.item.concat(" ", this.classes.empty, " ", this.classes.disabled))
          .html(this.config.templates.empty)
    };

    this.$el = $(this.config.el).attr("autocomplete", "off"), // turn off native browser autocomplete feature

    this.init();
  }

  AutoComplete.prototype.init = function() {
    this.wrapEl();
    this.listen();
  };

  // -------------------------------------------------------------------------
  // Subscribe to Events
  // -------------------------------------------------------------------------

  AutoComplete.prototype.listen = function() {
    var _this = this,
        itemSelector = "." + this.classes.item.replace(" ", ".");

    this.$wrapper
      .on("keyup", $.proxy(this.processTyping, this))
      .on("keydown", $.proxy(this.processSpecialKey, this));

    // 'blur' fires before 'click' so we have to use 'mousedown'
    this.$results
      .on("mousedown", itemSelector, function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this.selectResult();
      })
      .on("mouseenter", itemSelector, function() {
        _this.resultIndex = $(this).index();
        _this.highlightResult();
      });

    this.$el.on("blur", function(e) {
      if (_this.config.forceSelection) {
        e.target.value != _this.searchTerm && _this.$el.val(_this.searchTerm);
        !_this.selected && _this.$el.val("");
      }
      _this.clearResults();
    });
  };

  // -------------------------------------------------------------------------
  // Functions
  // -------------------------------------------------------------------------

  AutoComplete.prototype.wrapEl = function() {
    this.$el
      .wrap(this.templates.$wrapper)
      .after(this.templates.$results.append(this.templates.$list));

    this.$wrapper = this.$el.closest("." + this.classes.wrapper.replace(/ /g, "."));
    this.$results = $("." + this.classes.results.replace(/ /g, "."), this.$wrapper).hide();
    this.$list = $("." + this.classes.list.replace(/ /g, "."), this.$wrapper);
  };

  AutoComplete.prototype.showResults = function() {
    this.populateResults();

    if (this.results.length > 0) {
      // highlight search term
      this.$items.highlight($.trim(this.searchTerm).split(" "), {
        element: "span",
        className: this.classes.searchTerm
      });
    }

    this.$results.show();
    this.displayed = true;

    // highlight first item if forceSelection
    if (this.config.forceSelection) {
      this.resultIndex = 0;
      this.highlightResult();
    }
  };

  AutoComplete.prototype.hideResults = function() {
    this.$results.hide();
    this.displayed = false;
  };

  AutoComplete.prototype.populateResults = function() {
    this.processTemplate();
    this.$list.html(this.$items);
  };

  AutoComplete.prototype.processTemplate = function() {
    var len = this.results.length;

    this.$items = $();

    if (!len && !!this.config.templates.empty) {
      $.merge(this.$items, this.templates.$empty.html(this.config.templates.empty));
    } else {
      for (var i = 0; i < len; i++) {
        $.merge(this.$items, this.renderTemplate(this.templates.$item, this.results[i]));
      }
    }
  };

  AutoComplete.prototype.renderTemplate = function($item, obj) {
    var template = $item[0].outerHTML;

    for (var key in obj) {
      template = template.replace(new RegExp("{{" + key + "}}", "gm"), obj[key]);
    }

    $item = $(template);
    obj.disabled && obj.disabled === true && $item.addClass(this.classes.disabled);

    return $item;
  };

  AutoComplete.prototype.highlightResult = function() {
    // highlight result by adding class
    this.$items
      .removeClass(this.classes.highlighted)
      .eq(this.resultIndex)
      .addClass(this.classes.highlighted);
  };

  AutoComplete.prototype.selectResult = function() {
    var $item = this.$items.eq(this.resultIndex);

    if (!$item.hasClass(this.classes.disabled)) {
      this.selected = true;
      this.config.onItem($item); // pass actual DOM element to onItem()
      this.searchTerm = this.$el.val();
      this.clearResults();
    }
  };

  AutoComplete.prototype.clearResults = function() {
    this.results = [];
    this.$list.html(null);
    this.resultIndex = -1;
    this.hideResults();
  };

  AutoComplete.prototype.callFetch = function() {
    var _this = this,
        limit = this.config.limit;

    this.config.fetch(this.searchTerm, function(results) {
      if (!!results) {
        _this.results = limit > 0 ? results.slice(0, limit) : results;
        if ((!!_this.config.templates.empty || results.length > 0) &&
            _this.$el.is(":focus") && (_this.searchTerm.length >= _this.config.threshold)) {
          _this.showResults();
        } else {
          _this.clearResults();
        }
      }
      _this.$wrapper.removeClass(_this.classes.loading);
    });
  };

  AutoComplete.prototype.processTyping = function(e) {
    var currentInputVal = $.trim(e.target.value);

    if (this.searchTerm != currentInputVal) {
      this.searchTerm = currentInputVal;
      this.selected = false;
      if (this.searchTerm.length && this.searchTerm.length >= this.config.threshold) {
        this.debounceSearch();
      } else {
        this.clearResults();
      }
    }
  };

  AutoComplete.prototype.debounceSearch = function() {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout($.proxy(this.processSearch, this), this.config.debounceTime);
  };

  AutoComplete.prototype.processSearch = function() {
    this.$wrapper.addClass(this.classes.loading);
    this.callFetch();
  };

  AutoComplete.prototype.changeIndex = function(direction) {
    var changed = false;

    if (direction === "up") {
      if (this.resultIndex > 0 && this.results.length > 1) {
        this.resultIndex--;
        changed = true;
      }
    } else if (direction === "down") {
      if (this.resultIndex < this.results.length - 1 && this.results.length > 0) {
        this.resultIndex++;
        changed = true;
      }
    }
    return changed;
  };

  AutoComplete.prototype.processSpecialKey = function(e) {
    var keyName = this.specialKeys[e.keyCode],
        changed = false;

    e.which === 13 && this.displayed && this.resultIndex > -1 && e.preventDefault();
    clearTimeout(this.typingTimer);

    if (this.displayed) {
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
          this.resultIndex > -1 && this.selectResult();
          break;
        }
        case "tab": {
          this.resultIndex > -1 && this.selectResult();
          break;
        }
        case "esc": {
          this.config.forceSelection && this.$el.val("");
          this.clearResults();
          break;
        }
        default: {
          break;
        }
      }
    }
    changed && this.highlightResult();
  };

  AutoComplete.prototype.defaultFetch = function(searchTerm, callback) {
    var results = [
      { text: "Jon" },
      { text: "Bon", disabled: true },
      { text: "Jovi" },
    ];

    callback($.grep(results, function(result) {
      return result.text.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    }));
  };

  AutoComplete.prototype.defaultOnItem = function(item) {
    $(this.config.el).val($(item).data("value"));
  };

  // -------------------------------------------------------------------------
  // From jquery.highlight.js:
  // -------------------------------------------------------------------------

  $.extend({
    highlight: function(node, re, nodeName, className) {
      if (node.nodeType === 3) {
        var match = node.data.match(re);
        if (match) {
          var highlight = document.createElement(nodeName || "span");
          highlight.className = className || "highlight";
          var wordNode = node.splitText(match.index);
          wordNode.splitText(match[0].length);
          var wordClone = wordNode.cloneNode(true);
          highlight.appendChild(wordClone);
          wordNode.parentNode.replaceChild(highlight, wordNode);
          return 1; //skip added node in parent
        }
      } else if ((node.nodeType === 1 && node.childNodes) &&
                 !/(script|style)/i.test(node.tagName) &&
                 !(node.tagName === nodeName.toUpperCase() && node.className === className)) {
        for (var i = 0; i < node.childNodes.length; i++) {
          i += $.highlight(node.childNodes[i], re, nodeName, className);
        }
      }
      return 0;
    }
  });

  $.fn.highlight = function(words, options) {
    var settings = { className: "highlight", element: "span", caseSensitive: false, wordsOnly: false };
    $.extend(settings, options);

    if (words.constructor === String) {
      words = [ words ];
    }
    words = $.grep(words, function(word, i) {
      return word !== "";
    });
    words = $.map(words, function(word, i) {
      return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length === 0) { return this; }

    var flag = settings.caseSensitive ? "" : "i",
        pattern = "(" + words.join("|") + ")";

    if (settings.wordsOnly) {
      pattern = "\\b" + pattern + "\\b";
    }

    var re = new RegExp(pattern, flag);

    return this.each(function() {
      $.highlight(this, re, settings.element, settings.className);
    });
  };

  return AutoComplete;
});
