/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function NeuralNetworkTests() {
    const { test } = QUnit;

    /**
    * runs the test methods
    * */
    var run = function () {
        QUnit.module("NeuralNetwork", () => {
              /**
               * Tests if the passed parameters are applied correctly when creating a neural network
               **/
                test("CreateNn", t => {
                    let nn = new NeuralNetwork();
                    nn.createNn({ neurons: 2 },
                        [
                            { neurons: 10, hasBias: true, activation: 'sigmoid' },
                            { neurons: 5, hasBias: false, activation: 'tanh' }
                        ],
                        { neurons: 2, hasBias: true, activation: 'softmax' });
                    let tfModel = nn.getModel();
                    let layer1 = tfModel.layers[0].getConfig();
                    let layer2 = tfModel.layers[1].getConfig();
                    let layer3 = tfModel.layers[2].getConfig();

                    t.equal(layer1.batchInputShape[1], 2, "Inputlayer neurons are equal");
                    t.equal(layer1.units, 10, "HL1 neurons are equal");
                    t.equal(layer1.activation, 'sigmoid', "HL1 activation is equal");
                    t.equal(layer1.useBias, true, "HL1 bias are equal");

                    t.equal(layer2.units, 5, "HL2 neurons are equal");
                    t.equal(layer2.activation, 'tanh', "HL2 activation is equal");
                    t.equal(layer2.useBias, false, "HL2 bias are equal");

                    t.equal(layer3.units, 2, "Outputlayer neurons are equal");
                    t.equal(layer3.activation, 'softmax', "Outputlayer activation is equal");
                    t.equal(layer3.useBias, true, "Outputlayer bias are equal");
                });

                /**
                 * Tests if the passed parameters are applied correctly when compiling the neural network
                 **/
                test("Compile", t => {
                    let nn = new NeuralNetwork();
                    nn.createNn({ neurons: 2 },
                        [
                            { neurons: 5, hasBias: false, activation: 'tanh' }
                        ],
                        { neurons: 2, hasBias: true, activation: 'softmax' });

                    nn.compile('mse', 'sgd', 0.12, 0.0);
                    let tfModel = nn.getModel();

                    let optimizerName = tfModel.optimizer.getClassName(); 
                    let lossName = tfModel.loss.name ? tfModel.loss.name : tfModel.loss; // SGDOptimizer softmaxCrossEntropy
                    let learningRate = tfModel.optimizer.learningRate;

                    t.equal(optimizerName, 'SGDOptimizer', "Optimizer is correct");
                    t.equal(lossName, 'meanSquaredError', "loss is correct");
                    t.equal(learningRate, 0.12, "learningrate is correct");
                  
                });

            /**
            * Tests if the netinput is calculated correctly
            **/
            test("CalculateNetInput", t => {
                let nn = new NeuralNetwork();
                let inputs = [0, 0];
                let weights = [1, 1];
                let result = 0;

                t.equal(nn.calculateNetInput(inputs, weights), result, 'net input with result 0 is calculated successfully');

                inputs = [1, 1];
                weights = [1, 1];
                result = 2;
                t.equal(nn.calculateNetInput(inputs, weights), result, 'net input for result 2 is calculated successfully');

                inputs = [100, -100];
                weights = [10, 10];
                result = 0;
                t.equal(nn.calculateNetInput(inputs, weights), result, 'net input for result 0 (with negativ inputs) is calculated successfully');

                t.equal(nn.calculateNetInput(inputs, weights, true, 0.5), 0.5, 'net input for with bias is calculated successfully');
            });

           /**
           * Tests if the perceptron algorithm works properly
           **/
            test("CalculateNextPerceptronWeights", t => {
                /*
                 * The values below are taken from the script
                 * Business Intelligence
                 * Part 1: Data Mining
                 * Lecture Notes (2.0)
                 * Spring Semester 2019
                 * Prof. Dr. Kaspar Riesen
                 * Source: moodle.fhnw.ch
                 **/
                 
                let nn = new NeuralNetwork();
                let inputs = [0, 0];
                let weights = [2, 0];
                let biasWeight = -2;
                let dataset = [[0, 1], [1, 0], [2, 1]];
                let labels = [0, 0, 1];
                let lr = 1;

                for (let i = 0; i < 3; i++) {

                    let newWeights = nn.trainPerceptronWeights(dataset, labels, weights, true, biasWeight, lr);
                    weights = newWeights.weights;
                    biasWeight = newWeights.biasWeight;

                    if (i == 0) {
                        t.equal(newWeights.weights[0], 3, 'Iteration 1: weight 1 is correct');
                        t.equal(newWeights.weights[1], 1, 'Iteration 1: weights 2 is correct');
                        t.equal(newWeights.biasWeight, -2, 'Iteration 1: BiasWeight is correct');

                    } else if (i == 1) {
                        t.equal(newWeights.weights[0], 2, 'Iteration 2: weight 1 is correct');
                        t.equal(newWeights.weights[1], 1, 'Iteration 2: weights 2 is correct');
                        t.equal(newWeights.biasWeight, -3, 'Iteration 2: BiasWeight is correct');
                    } else if (i == 2) {
                        t.equal(newWeights.weights[0], 2, 'Iteration 3: weight 1 is correct');
                        t.equal(newWeights.weights[1], 1, 'Iteration 3: weights 2 is correct');
                        t.equal(newWeights.biasWeight, -3, 'Iteration 3: BiasWeight is correct');                    }
                }
            });

           /**
           * Tests if the binary step function behaves correctly
           **/
            test("CalculateBinaryStep", t => {
                let nn = new NeuralNetwork();

                t.equal(nn.binaryStepActivationFunction(-0.001), 0, 'Binary step function correct for input -0.001');
                t.equal(nn.binaryStepActivationFunction(0), 1, 'Binary step function correct for input 0');
                t.equal(nn.binaryStepActivationFunction(0.001), 1, 'Binary step function correct for input +0.001');

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
