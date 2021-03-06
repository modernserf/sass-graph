
var assert = require("assert");
var path = require("path");

var fixtures = path.resolve("test/fixtures");
var files = {
  'a.scss': fixtures + "/a.scss",
  'b.scss': fixtures + "/b.scss",
  '_c.scss': fixtures + "/_c.scss",
  'd.scss': fixtures + "/d.scss",
  '_e.scss': fixtures + "/components/_e.scss"
}
 
describe('sass-graph', function(){
  var sassGraph = require("../sass-graph");

  describe('parsing a graph of all scss files', function(){
    var graph = sassGraph.parseDir(fixtures, {loadPaths: [fixtures + '/components']});

    it('should have all files', function(){
      assert.equal(Object.keys(files).length, Object.keys(graph.index).length);
    })

    it('should have the correct imports for a.scss', function() {
      assert.deepEqual([files['b.scss']], graph.index[files['a.scss']].imports);
    });

    it('should have the correct importedBy for _c.scss', function() {
      assert.deepEqual([files['b.scss']], graph.index[files['_c.scss']].importedBy);
    });

    it('should traverse ancestors of _c.scss', function() {
      ancestors = [];
      graph.visitAncestors(files['_c.scss'], function(k) {
        ancestors.push(k);
      })
      assert.deepEqual([files['b.scss'], files['a.scss']], ancestors);
    });


  })

  describe('parseFile', function () {
    it('should parse imports', function () {
      var graph = sassGraph.parseFile(files['a.scss']);
      var expectedDescendents = [files['b.scss'], files['_c.scss']];
      var descendents = [];
      graph.visitDescendents(files['a.scss'], function (imp) {
        descendents.push(imp);
        assert.notEqual(expectedDescendents.indexOf(imp), -1);
      });
      assert.equal(expectedDescendents.length, descendents.length);
    }); 
  });

  describe('parseFile', function () {
    it('should parse imports with loadPaths', function () {
      var graph = sassGraph.parseFile(files['d.scss'], {loadPaths: [fixtures + '/components']} );
      var expectedDescendents = [files['_e.scss']];
      var descendents = [];
      graph.visitDescendents(files['d.scss'], function (imp) {
        descendents.push(imp);
        assert.notEqual(expectedDescendents.indexOf(imp), -1);
      });
      assert.equal(expectedDescendents.length, descendents.length);
    }); 
  });

  describe('parseFile', function () {
    it('should thow an error', function () {
      try {
        var graph = sassGraph.parseFile(files['d.scss']);
      } catch (e) {
        assert.equal(e, "File to import not found or unreadable: e");
      }
      
    }); 
  });

});
