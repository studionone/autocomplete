Autocomplete
============

An autocomplete widget. Built to be as reusable as possible. Means a tiny bit more work for the instantiator, but hopefully flexible and simple enough to be used in different contexts.


Clone this repository. Run `npm install` and `bower install`. Then run `grunt`. This will start up a server at `localhost:8000` and will run jasmine tests. Navigate to /index.html and you'll be presented with a sample of this autocomplete (see screenshot). It is running on local data, and should give you a good feel of what this autocomplete does. Tailor it to your needs and use it in your own project!

![autocomplete](/autocomplete-example.png)

## Dependencies
* jQuery

## Usage
The AutoComplete widget is always instantiated with an html element. This element is expected to be an `input` element, as the user will type and be presented with a set of matched results. Other than the element, you will also want to set a threshold of characters that must be typed before the Autocomplete will start fetching results. By default this is set at 2, but you can override that. You can also limit the number of results displayed in the result list by using the `limit` config option.

```js
new AutoComplete({
  el: "#myInputElement",
  threshold: 2,
  limit: 5,
  ...
});
```

# Templating
You can pass a `template` config option to the Autocomplete. It accepts a handful of properties, but only one is required - `resultsItem`.
```js
new AutoComplete({
  ...
  template: {
    elementWrapper:   "<div class='js-autocomplete'></div>",
    resultsWrapper:     "<div class='autocomplete'></div>",
    resultsContainer:     "<ul class='autocomplete__results'></ul>",
    resultsItem:            "<li class='autocomplete__results__item' data-age='{{age}}'>{{name}}</li>",

    resultsItemHighlightClass: "autocomplete__results__item--highlight",
    searchTermHighlightClass: "autocomplete__search-term--highlight",
    hiddenClass: "is-hidden"
  },
  ...
});
```
When creating the `resultsItem` string, variables are surrounded by double curly brackets, like {{this}}. No need to escape the html, the script will look through the html string and replace all variables in curly brackets with the values in your data.

The three class properties are to assist when styling the autocomplete.

Once `new AutoComplete` is instantiated, it changes the original `<input type="text" />`. It wraps it in an '.autocomplete' div and appends a result div after.

```html
<div class="js-autocomplete">
  <input id="myInputElement" type="text" />
  <div class="autocomplete">
    <ul class="autocomplete__results">
      <li class="autocomplete__results__item" data-age="44">Mark</li>
      <li class="autocomplete__results__item autocomplete__results--highlight" data-age="24">Daniel</li>
      <li class="autocomplete__results__item" data-age="42">Carrie</li>
    </ul>
  </div>
</div>
```

## fetch(), and onItem() Explained
There are two custom functions which must be passed to this widget for it to be useful. They are explained below.

### fetch()
As a user is typing, the widget takes the string of typed text and passes it to this fetch function. When instantiating this widget you should create your own custom fetch() function. This function receives two arguments: `searchTerm` and a `callback`. The searchTerm will come as a string and you do with it whatever you want (ping an endpoint with an XHR request, iterate through local data, up to you). Whenever you are satisfied and have results, simply use `callback()` and pass it the array of results in JSON format.

**Local Example:**
```js
new AutoComplete({
  ...
  fetch: myFetch,
  ...
});


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
```js
new AutoComplete({
  ...
  fetch: myFetch,
  ...
});

var myFetch = function(searchTerm, callback) {
  var results = [];
  $.ajax({
    url: "http://www.mysite.com/endpoint/search?q=" + searchTerm
  }).done(function(data) {
    callback(data);
  });
};
```

### onItem()
Just as the fetch function gives you full control of how the data is fetched, this function gives you full control of what happens when a user **selects** a result in the autocomplete. The typical case is the input value is replaced by the value of the result. But sometimes you may want to do other things (set hidden variables in your form based on the data-id of the list item, navigate directly to a url, etc.).

This function is only passed the DOM element (not the jQuery element, the actual DOM element) of the selected item. So you are receiving exactly **one** list item that will be formatted just as you specified in the myTemplate() function.

**Example:**
```js
new AutoComplete({
  ...
  onItem: myOnItem,
  ...
});

var myOnItem = function(el) {
  var selectedValue = $(el).text();
  $("#myInput").val(selectedValue);
}
```

## CSS
By default this should work without much styling, but here are some recommended styling options to set:

```css
.is-hidden {
  display: none;
}
.autocomplete__results {
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: scroll;
}
.autocomplete__results ul {
  list-style: none;
  margin: 0px;
  padding: 0px;
}
.autocomplete__results ul li {
  border-bottom: 1px solid #ccc;
  padding: 3px;
  font-size: 0.8em;
}
.autocomplete__results ul li:last-child {
  border: 0px;
}
.autocomplete__results ul li:hover,
.autocomplete__results--highlight {
  background: #efefef;
}
```
