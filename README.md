Autocomplete
============

An autocomplete widget.



*   AutoComplete
*   When the user calls new AutoComplete():

    new AutoComplete({
      el: "#myInputElement" // required
      threshold: 2 // how many letters must be typed before AutoComplete starts fetching

      fetch: function(searchTerm, callback) {
        Required
        @param {searchTerm} string
        @param {callback} function that accepts a {result} paramater
        Returns callback, passing in an [Array] of strings or objects as the result
      },
      template: function(results) {
        Required
        @param {results} array of objects
        Returns {string} of <li> items
      },
      onItem: function(el) {
        Required
        @param {object} DOM element that was selected
      }
    });

    The DOM ends up looking like this:

    <div class="autocomplete">
      <input id="whatever" />
      <div class="autocomplete__results">
        <ul>
          <li>result 1</li>
          <li class="autocomplete__results--highlight">result 2</li>
        </ul>
      </div>
    </div>