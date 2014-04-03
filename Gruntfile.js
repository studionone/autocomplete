module.exports = function(grunt) {

  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    connect: {
      server: {
        options: {
          hostname: "127.0.0.1",
          port: 8888
        }
      }
    },

    watch: {
      test: {
        files: [ "src/js/*.js" ],
        tasks: [ "connect", "jasmine" ]
      }
    },

    jasmine: {
      all: {
        src: [ "src/js/*.js" ],
        options: {
          helpers: [ "spec/helpers/*.js", "bower_components/jquery/dist/jquery.js" ],
          host: "http://127.0.0.1:8888/",
          specs: "spec/tests/*.js"
        }
      }
    },

    jshint: {
      src: [ "Gruntfile.js", "src/js/*.js", "!src/js/data.js" ],
      options: {
        jshintrc: "./.jshintrc"
      }
    },
    jscs: {
      src: [ "Gruntfile.js", "src/**/*.js", "!src/js/data.js" ],
      options: {
        config: "./.jscs.json"
      }
    }

  });

  // This loads in all the grunt tasks auto-magically.
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  // Tasks
  grunt.registerTask("default", [ "jshint", "jscs", "watch" ]);
};
