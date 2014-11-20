module.exports = function(grunt){
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/js/*.js',
        dest: 'public/min/<%= pkg.name %>.min.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/main.css': 'public/scss/*.scss'
        }
      } 
    },

    watch: {
      scripts: {
        files: ['public/js/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false,
          livereload: true,
        },
      },

      css: {
        files: ['public/scss/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
          livereload: true,
        }
      } 
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.registerTask('default', ['watch'])
}