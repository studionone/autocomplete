module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    jasmine: {
      standard: {
        src: "src/js/*.js",
        options: {
          specs: "spec/tests/*.js",
          vendor: "bower_components/jquery/dist/jquery.js"
        }
      },
      amd: {
        src: "src/js/*.js",
        options: {
          helpers: [ "node_modules/jasmine-jquery/lib/jasmine-jquery.js", "bower_components/jquery/dist/jquery.js" ],
          specs: "spec/tests/*.js",
          host: "http://127.0.0.1:8000",
          template: require("grunt-template-jasmine-requirejs"),
          templateOptions: {
            requireConfig: {
              baseUrl: "./",
              paths: {
                jquery: "./bower_components/jquery/dist/jquery"
              },
              shim: {
                jquery: {
                  exports: "$"
                }
              }
            }
          }
        }
      }
    },

    watch: {
      scripts: {
        files: [ "Gruntfile.js", "src/js/*.js", "spec/tests/*.js" ],
        tasks: [ "jasmine:amd" ],
        options: {
          nospawn: true
        }
      }
    },

    connect: {
      test: {
        hostname: "http://127.0.0.1",
        port: 8000,
        keepalive: true
      }
    },

    copy: {
      main: {
        src: "src/js/autocomplete.js",
        dest: "dist/autocomplete.js"
      }
    },

    bump: {
      options: {
        files: [ "package.json" ],
        updateConfigs: [],
        commit: true,
        commitMessage:  "Release v%VERSION%",
        commitFiles: [ "package.json" ], // "-a" for all files
        createTag: true,
        tagName: "v%VERSION%",
        tagMessage: "Version %VERSION%",
        push: true,
        pushTo: "origin master",
        gitDescribeOptions: "--tags" // options to use with "$ git describe"
      }
    }

  });

  // This loads in all the grunt tasks auto-magically.
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.registerTask("default", [  "copy", "connect", "jasmine:amd" ]);
  grunt.registerTask("dev", [ "connect", "watch" ]);
};
