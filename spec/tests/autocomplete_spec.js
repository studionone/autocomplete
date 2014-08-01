require([ "autocomplete" ], function(AutoComplete) {

  "use strict";

  describe("AutoComplete", function() {
    var tester;
    beforeEach(function() {
      setFixtures("<input id='js-autocomplete-test' />");
      tester = new AutoComplete({
        el: "#js-autocomplete-test"
      });

    });

    afterEach(function() {
      tester = undefined;
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
        var el = tester.$el;
        expect(el.parent(".js-autocomplete")).toExist();
      });

      it("should have a HIDDEN results div directly after it.", function() {
        var el = tester.$resultsPanel;
        expect(el).toExist();
        expect(el).toHaveClass("is-hidden");
      });

    });

    describe("The display of results", function() {
      var el;

      beforeEach(function() {
        el = tester.$resultsPanel;
      });

      afterEach(function() {
        el = undefined;
      });

      it("should remove is-hidden class on showResults().", function() {
        tester.showResultsPanel();
        expect(el).not.toHaveClass("is-hidden");
      });

      it("should set displayed to true showResults().", function() {
        tester.displayd = false;
        tester.showResultsPanel();
        expect(tester.displayed).toBeTruthy;
      });

      it("should add is-hidden class on hideResults().", function() {
        tester.hideResultsPanel();
        expect(el).toHaveClass("is-hidden");
      });

      it("should clear all html on clearResults.", function() {
        el.html("<li>content</li>");
        tester.clearResults();
        expect(el).toBeEmpty();
      });

      it("should clear the global results array on clearResults.", function() {
        tester.results = [1, 2, 3];
        tester.clearResults();
        expect(tester.results).toEqual([]);
      });

      it("should hide results panel on clearResults.", function() {
        tester.showResultsPanel();
        tester.clearResults();
        expect(el).toHaveClass("is-hidden");
      });

      it("should set displayed to false on hide results.", function() {
        tester.showResultsPanel();
        tester.hideResultsPanel();
        expect(tester.displayed).toBeFalsy();
      });

      it("should set the input's value on selectResult", function() {
        tester.results = [{Company: "Company", City: "Franklin", Country: "USA"}];
        spyOn(tester, "renderList").andCallThrough();
        tester.resultIndex = 0;
        tester.populateResultPanel();
        tester.selectResult();
        expect($(tester.config.el).val()).toEqual("CompanyFranklin, USA");
      });

    });

    describe("The user typing", function() {

      it("should reset index when searching.", function() {
        tester.processSearch("test search");
        expect(tester.resultIndex).toEqual(-1);
      });

      it("should not fetch results if searchTerm is blank.", function() {
        spyOn(tester, "callFetch");
        tester.processSearch("");
        expect(tester.callFetch).not.toHaveBeenCalled();
      });

      it("should not fetch results if searchTerm is less than threshold.", function() {
        tester.config.threshold = 2;
        spyOn(tester, "callFetch");
        tester.processSearch("f");
        expect(tester.callFetch).not.toHaveBeenCalled();
      });

      it("should fetch results if searchTerm is greater than threshold.", function() {
        tester.config.threshold = 2;
        spyOn(tester, "callFetch");
        tester.processSearch("fra");
        expect(tester.callFetch).toHaveBeenCalled();
      });

      it("should clear results if the input is empty.", function() {
        var e = {
          target: {
            value: ""
          }
        };
        spyOn(tester, "clearResults");
        tester.processTyping(e);
        expect(tester.clearResults).toHaveBeenCalled();
      });

      it("should processSpecial if there are special keys and results are displayed.", function() {
        tester.displayed = true;
        var e = {
          target: {
            value: "test"
          },
          keyCode: 38 // up arrow
        };
        spyOn(tester, "processSpecialKey");
        tester.processTyping(e);
        expect(tester.processSpecialKey).toHaveBeenCalled();
      });

      it("should not processSpecial if there are special keys and results are not displayed.", function() {
        tester.displayed = false;
        var e = {
          target: {
            value: "test"
          },
          keyCode: 38 // up arrow
        };
        spyOn(tester, "processSpecialKey");
        tester.processTyping(e);
        expect(tester.processSpecialKey).not.toHaveBeenCalled();
      });

      it("should call highlightResult() if navigating is possible.", function() {
        tester.resultIndex = 1;
        tester.results = ["a", "b", "c"];
        spyOn(tester, "highlightResult");
        tester.processSpecialKey("up");
        expect(tester.highlightResult).toHaveBeenCalled();
      });

      it("shouldn't call highlightResult() if only one result when up/down.", function() {
        tester.resultIndex = 0;
        tester.results = ["a"];
        spyOn(tester, "highlightResult");
        tester.processSpecialKey("up");
        expect(tester.highlightResult).not.toHaveBeenCalled();
      });

      it("should call highlightResult() if navigating down is possible.", function() {
        tester.resultIndex = 1;
        tester.results = ["a", "b", "c"];
        spyOn(tester, "highlightResult");
        tester.processSpecialKey("down");
        expect(tester.highlightResult).toHaveBeenCalled();
      });

    });

    describe("The fetching of results", function() {

      it("shouldn't change the global result set if nothing returned.", function() {
        tester.results = [1];
        spyOn(tester.config, "fetch").andReturn([]);
        tester.callFetch("fra");
        expect(tester.results).toEqual([1]);
      });

    });

    describe("Rendering results", function() {

      it("should return a string of <li>s inside a <ul>.", function() {
        tester.results = [{name: "Ben"}];
        tester.config.template.resultsItem = "<li>{{name}}</li>";
        var list = tester.renderList();
        expect(list.html()).toEqual($('<ul class="autocomplete__results__container"><li>Ben</li></ul>').html());
      });

      it("calling populateResultPanel should fill the resultsID div.", function() {
        tester.results = [1, 2, 3];
        tester.populateResultPanel();
        expect($("#" + tester.config.resultsID)).not.toBeEmpty();
      });

    });

    describe("Navigating results", function() {

      it("should not be able to move up at index 0.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 0;
        tester.changeIndex("up");
        expect(tester.resultIndex).toEqual(0);
      });

      it("should not be able to move down at last item.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 2;
        tester.changeIndex("down");
        expect(tester.resultIndex).toEqual(2);
      });

      it("should move down if not at last item.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 1;
        tester.changeIndex("down");
        expect(tester.resultIndex).toEqual(2);
      });

      it("should move up if not at first item.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 1;
        tester.changeIndex("up");
        expect(tester.resultIndex).toEqual(0);
      });

      it("should return true if changed.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 1;
        var changed = tester.changeIndex("up");
        expect(changed).toBeTruthy();
      });

      it("should return false if not changed.", function() {
        tester.results = ["a", "b", "c"];
        tester.resultIndex = 0;
        var changed = tester.changeIndex("up");
        expect(changed).toBeFalsy();
      });

    });

  });
});