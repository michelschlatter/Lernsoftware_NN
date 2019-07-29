/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function ComputationMetricTests() {
    const { test } = QUnit;

    /**
     * runs the test methods
     * */
    var run = function () {
        QUnit.module("Comnputation_Metrics", () => {

            /*
             * Tests if the squarred error is calculated correctly
             */
            test("CalculateSquaredError", t => {
                let nnc = new NeuralNetworkComputer();
                let functions = nnc.getFunctionsForUnittesting();

                let sqrError1 = functions.getSquaredError(-0.8, 1);
                t.ok(compareFloat(4, sqrError1, 3.24), "Squared error for one negative value is correct");

                let sqrError2 = functions.getSquaredError(-0.8, -1);
                t.ok(compareFloat(4, sqrError2, 0.04), "Squared error for both negative values is correct");

                let sqrError3 = functions.getSquaredError(1, 0.5);
                t.ok(compareFloat(4, sqrError3, 0.25), "Squared error for positive values is correct");
            });

            /*
             * Tests if two floats are compared correctly 
             */
            test("CompareFloat", t => {
                let res1 = compareFloat(5, 0.399995, 0.4)
                t.ok(res1, "Round up on five digits after the decimal point is correct");
                let res2 = compareFloat(5, 0.399994, 0.4)
                t.notOk(res2, "Round down on five digits after the decimal point is correct");
            });

            /*
             * Tests if the mean sqaurred error is calculated correctly
             */
            test("CalculateMse", t => {
                let nnc = new NeuralNetworkComputer();
                let functions = nnc.getFunctionsForUnittesting();

                let mse = functions.getMse(1.5, 5);
                t.ok(compareFloat(4, mse, 0.3), "SquareError for positive values is correct and has type float");
            });

            /*
             * Tests if the accuracy is calculated correctly
             */
            test("CalculateAccuracy", t => {
                let nnc = new NeuralNetworkComputer();
                let functions = nnc.getFunctionsForUnittesting();

                let accuracy = functions.calculateAccuracyInPercent(81, 100);
                t.ok(compareFloat(4, accuracy, 81.0), "SquareError for positive values is correct and has type float");
            });

            /*
             * Tests if the output neuron index matches with the active index in the labels array 
             */
            test("IsClassificationCorrect", t => {
                let nnc = new NeuralNetworkComputer();
                let functions = nnc.getFunctionsForUnittesting();

                let result = {
                    topActiveIndexes: [2]
                };
                let item = {
                    labels: [0, 0, 1]
                };
                let res1 = functions.isClassificationPredictionCorrect(result, item);
                t.ok(res1, "Classification correctness check is correct");

                result.topActiveIndexes.push(1); // expected false, because multiple neurons are active
                let res2 = functions.isClassificationPredictionCorrect(result, item);
                t.ok(!res2, "Classification correctness for multiple active neurons check is correct");

                result.topActiveIndexes = [0]; // expected false, because wrong neuron is active
                let res3 = functions.isClassificationPredictionCorrect(result, item);
                t.ok(!res3, "Classification correctness for wrong neuron active check is correct");

                result.topActiveIndexes = [4]; // expected false, neuron index is out of range
                let res4 = functions.isClassificationPredictionCorrect(result, item);
                t.ok(!res4, "Classification correctness check for neuron out of range is correct");
            });
        });
    }

    /**
     * Runs the test methods
     * */
    this.runTests = function () {
        run();
    }
}
