/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function VectorGridTests() {
    const { test } = QUnit;

    /**
    * runs the test methods
    * */
    var run = function () {
        QUnit.module("VectorGrid", () => {
            /**
            * Tests if the vector grid sets and gets a vector correctly 
            **/
            test("SetAndGet", t => {
                let grid = new VectorGrid();
                let fakeContainer = $('<div>');
                grid.init(5, 3, fakeContainer, 100);
                let vector = [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
                grid.setVector(vector);
                let returnedVector = grid.getVector();
                t.deepEqual(vector, returnedVector, "Setted Vector and getted  vector are equal");
            });
          });
    }

    /**
     * runs the test methods
     * */
    this.runTests = function () {
        run();
    }
}
