Autocomplete
============

An autocomplete widget. Built to be as reusable as possible. Means a tiny bit more work for the instantiator, but hopefully flexible and simple enough to be used in different contexts.

## Usage
The AutoComplete widget is always instantiated with an html element. This element is expected to be an `input` element, as the user will type and be presented with a set of matched results.

Essentially your code will look like this:

```
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
```

## fetch(), template(), and onItem() Explained
Once you wrap your head around the concepts, the AutoComplete should make sense. But here are the three custom functions explained.

### fetch()
As a user is typing, the widget takes their string of typed text and passes it to the fetch function. When instantiating this widget you should create your own custom fetch() function. This function receives two arguments: `searchTerm` and a `callback`. The searchTerm will come as a string and you do with it whatever you want (ping an endpoing with an XHR request, iterate through local data, whatever). Whenever you are satisfied and have a resultset back, simply use `callback()` and pass it the array of results in a JSON format (array of objects).

**Local Example:**
```
var myFetch = function(searchTerm, callback) {
  var results = [],
      mydata = [{name: "David", age: 2}, {name: "Mark", age: 4}],
      searchString = searchTerm.toLowerCase();

  for(var i = 0; i < mydata.length; i++) {
    if(mydata[i].name.toLowerCase().indexOf(searchString) != -1) {
      results.push(mydata[i]);
    }
  }

  callback(results);
};
```

**XHR Example:**
```
var myFetch = function(searchTerm, callback) {
  var results = [];
  $.ajax({
    url: "http://www.mysite.com/endpoint/search?q=" + searchTerm
  }).done(function(data) {
    callback(data);
  });
};
```

Once `new AutoComplete` is instantiated, it changes the original `<input type="text" />` to look like this:

```
<div class="autocomplete">
  <input id="something" type="text" />
  <div class="autocomplete__results">
    <ul>
      <li>result 1</li>
      <li class="autocomplete__results--highlight">result 2</li>
      <li>result 3</li>
    </ul>
  </div>
</div>
```