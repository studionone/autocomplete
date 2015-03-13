require([ "jquery", "autocomplete" ], function($, AutoComplete) {

  "use strict";

  describe("AutoComplete", function() {
    var tester;
    beforeEach(function() {
      setFixtures("<input id='js-autocomplete-test' />");
      tester = new AutoComplete({
        el: "#js-autocomplete-test",
        forceSelection: false,
        extraClasses: {
          wrapper: "ohdeer"
        }
      });
    });

    describe("The object", function() {

      it("should exist.", function() {
        expect(tester).toBeDefined();
      });

      it("should have a config.el attribute.", function() {
        expect(tester.config.el).toBeDefined();
      });

      it("should override the defauls with the user-generated options.", function() {
        expect(tester.config.el).toEqual("#js-autocomplete-test");
      });

      it("should have an empty array as the results.", function() {
        expect(tester.results).toEqual([]);
      });

    });

    describe("The DOM element", function() {

      it("should exist.", function() {
        var el = $(tester.config.el);
        expect(el).toExist();
      });

      it("should be wrapped in a div with the passed ID.", function() {
        expect(tester.$wrapper).toExist();
      });

      it("should add extra class to wrapper", function() {
        expect(tester.$wrapper).toHaveClass("ohdeer");
      });

      it("should have a HIDDEN results div directly after it.", function() {
        expect(tester.$results).toExist();
        expect(tester.$results).toBeHidden();
      });

    });

    describe("The display of results", function() {
      var el;

      beforeEach(function() {
        el = tester.$results;
      });

      it("should show results on showResults().", function() {
        tester.showResults();
        expect(el).toBeVisible();
      });

      it("should set displayed to true showResults().", function() {
        tester.displayd = false;
        tester.showResults();
        expect(tester.displayed).toBeTruthy;
      });

      it("should hide results on hideResults().", function() {
        tester.hideResults();
        expect(el).toBeHidden();
      });

      it("should clear all html on clearResults.", function() {
        tester.$list.html("<li>content</li>");
        tester.clearResults();
        expect(tester.$list).toBeEmpty();
      });

      it("should clear the global results array on clearResults.", function() {
        tester.results = [ 1, 2, 3 ];
        tester.clearResults();
        expect(tester.results).toEqual([]);
      });

      it("should hide results panel on clearResults.", function() {
        tester.showResults();
        tester.clearResults();
        expect(el).toBeHidden();
      });

      it("should set displayed to false on hide results.", function() {
        tester.showResults();
        tester.hideResults();
        expect(tester.displayed).toBeFalsy();
      });

      it("should set the input's value on selectResult", function() {
        tester.results = [ { text: "robisaduck" } ];
        tester.showResults();
        tester.resultIndex = 0;
        tester.selectResult();
        expect($(tester.config.el).val()).toEqual("robisaduck");
      });

      it("should display empty results item if it's defined & nothing was found", function() {
        tester.config.templates.empty = "No matches found";
        tester.results = [];
        tester.showResults();
        expect(tester.$results.text()).toBe("No matches found");
      });

      it("shouldn't call selectResult() if disabled item is clicked", function() {
        var $disabledItem = $(tester.config.templates.resultsItem).addClass("is-disabled");
        spyOn(tester, "selectResult");
        tester.$results.html($disabledItem);
        $disabledItem.trigger("mousedown");

        // expect(tester.clearResults).not.toHaveBeenCalled();
        expect(tester.selectResult).not.toHaveBeenCalled();
      });

      describe("with forceSelection enabled", function() {

        beforeEach(function() {
          tester.config.forceSelection = true;
        });

        it("should set resultIndex to 0 when .showResults() is called", function() {
          tester.showResults();

          expect(tester.resultIndex).toEqual(0);
        });

        it("should call .highlightResult() when .showResults() is called", function() {
          spyOn(tester, "highlightResult");
          tester.showResults();

          expect(tester.highlightResult).toHaveBeenCalled();
        });

        it("should clear input value if 'esc' is pressed", function() {
          spyOn(tester.$el, "val");
          tester.displayed = true;
          tester.processSpecialKey({ keyCode: 27 });

          expect(tester.$el.val).toHaveBeenCalledWith("");
        });

        it("should clear input if e.relatedTarget is 'null' (for ex. mouseclick on empty area)", function() {
          var e = $.Event("blur");
          e.relatedTarget = null;
          spyOn(tester.$el, "val");
          tester.$el.trigger(e);

          expect(tester.$el.val).toHaveBeenCalledWith("");
        });

        it("shouldn't clear input if item has been previously selected", function() {
          var e = $.Event("blur");
          e.relatedTarget = null;
          tester.selected = true;
          spyOn(tester.$el, "val");
          tester.$el.trigger(e);

          expect(tester.$el.val).not.toHaveBeenCalled();
        });

      });
    });

    describe("The user typing", function() {

      it("should reset index when searching.", function() {
        tester.processSearch("test search");
        expect(tester.resultIndex).toEqual(-1);
      });

      it("should not fetch results if input is blank.", function() {
        spyOn(tester, "debounceSearch");
        tester.config.threshold = 0;
        tester.searchTerm = "o";
        tester.processTyping({ target: { value: "" } });
        expect(tester.debounceSearch).not.toHaveBeenCalled();
      });

      it("should not fetch results if input length is less than threshold.", function() {
        spyOn(tester, "debounceSearch");
        tester.config.threshold = 2;
        tester.searchTerm = "Oo";
        tester.processTyping({ target: { value: "O" } });
        expect(tester.debounceSearch).not.toHaveBeenCalled();
      });

      it("should add loadingClass & fetch results if searchTerm.length >= threshold and different from previous input value", function() {
        tester.config.threshold = 2;
        spyOn(tester, "callFetch");
        spyOn(tester.$el, "val").andReturn("f");
        tester.processSearch("fr");
        expect(tester.$wrapper).toHaveClass(tester.classes.loading);
        expect(tester.callFetch).toHaveBeenCalled();
      });

      it("should remove loadingClass when .callFetch() is called", function() {
        tester.config.fetch = function(searchTerm, cb) { cb([]); };
        tester.callFetch();
        expect(tester.$wrapper).not.toHaveClass("is-loading");
      });

      it("should clear results if the input is empty.", function() {
        spyOn(tester, "clearResults");
        tester.searchTerm = "s";
        tester.processTyping({ target: { value: "" }});
        expect(tester.clearResults).toHaveBeenCalled();
      });

      it("should call highlightResult() if navigating is possible.", function() {
        spyOn(tester, "highlightResult");
        tester.resultIndex = 1;
        tester.displayed = true;
        tester.results = [ "a", "b", "c" ];
        tester.processSpecialKey({ keyCode: 38 });
        expect(tester.highlightResult).toHaveBeenCalled();
      });

      it("shouldn't call highlightResult() if only one result when up/down.", function() {
        spyOn(tester, "highlightResult");
        tester.resultIndex = 0;
        tester.displayed = true;
        tester.results = [ "a" ];
        tester.processSpecialKey({ keyCode: 38 });
        expect(tester.highlightResult).not.toHaveBeenCalled();
      });

      it("should call highlightResult() if navigating down is possible.", function() {
        spyOn(tester, "highlightResult");
        tester.resultIndex = 1;
        tester.displayed = true;
        tester.results = [ "a", "b", "c" ];
        tester.processSpecialKey({ keyCode: 40 });
        expect(tester.highlightResult).toHaveBeenCalled();
      });

      describe("with forceSelection enabled", function() {
        var e;

        it("should restore input value if user changes it and blurs input before selection", function() {
          spyOn(tester.$el, "val");
          e = $.Event("blur");
          e.target = { value: "foo" };
          tester.config.forceSelection = true;
          tester.searchTerm = "foom";
          tester.selected = true;

          tester.$el.trigger(e);
          expect(tester.$el.val).toHaveBeenCalledWith("foom");
        });

      });
    });

    describe("The fetching of results", function() {

      it("shouldn't change the global result set if nothing returned.", function() {
        tester.results = [ 1 ];
        spyOn(tester.config, "fetch").andReturn([]);
        tester.callFetch("fra");
        expect(tester.results).toEqual([ 1 ]);
      });

    });

    describe("Rendering results", function() {

      it("should return properly rendered item element.", function() {
        tester.results = [ { text: "Ben" } ];
        tester.processTemplate();
        expect(tester.$items[0].outerHTML.replace(/\"/g, "\'"))
          .toEqual("<div class='autocomplete__list__item' data-value='Ben'><strong>Ben</strong></div>");
      });

      it("calling populateResults() should fill the list div.", function() {
        tester.results = [ 1, 2, 3 ];
        tester.populateResults();
        expect(tester.$list).not.toBeEmpty();
      });

    });

    describe("Navigating results", function() {

      it("should not be able to move up at index 0.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 0;
        tester.changeIndex("up");
        expect(tester.resultIndex).toEqual(0);
      });

      it("should not be able to move down at last item.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 2;
        tester.changeIndex("down");
        expect(tester.resultIndex).toEqual(2);
      });

      it("should move down if not at last item.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 1;
        tester.changeIndex("down");
        expect(tester.resultIndex).toEqual(2);
      });

      it("should move up if not at first item.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 1;
        tester.changeIndex("up");
        expect(tester.resultIndex).toEqual(0);
      });

      it("should return true if changed.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 1;
        var changed = tester.changeIndex("up");
        expect(changed).toBeTruthy();
      });

      it("should return false if not changed.", function() {
        tester.results = [ "a", "b", "c" ];
        tester.resultIndex = 0;
        var changed = tester.changeIndex("up");
        expect(changed).toBeFalsy();
      });

    });
  });
});
