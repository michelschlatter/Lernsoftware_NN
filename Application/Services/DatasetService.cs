/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Application.Interfaces;
using Application.Mapping;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Application.Services
{
    public class DatasetService
    {
        IDatasetRepository _datasetRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="datasetRepository">DatasetRepository</param>
        public DatasetService(IDatasetRepository datasetRepository)
        {
            _datasetRepository = datasetRepository;
        }


        /// <summary>
        /// Gets all visibile datasets for the user
        /// </summary>
        /// <param name="userId">nullable userid</param>
        /// <returns>list of datasets</returns>
        public List<DatasetDto> GetAllVisible(int? userId)
        {
            List<DatasetDto> dtoList = new List<DatasetDto>();
            foreach(Dataset ds in _datasetRepository.GetAllVisible(userId).OrderBy(x => x.Name).ToList())
            {
                try
                {
                    dtoList.Add(DatasetMapper.ToDto(ds));
                }
                catch { }// ignore error so other datasets can be loaded correctly
            }
            return dtoList;
        }

        /// <summary>
        /// Gets all editable datasets for the user
        /// </summary>
        /// <param name="userId">userid</param>
        /// <returns>list of datasets</returns>
        public List<DatasetDto> GetAllEditable(int userId)
        {
            List<DatasetDto> dtoList = new List<DatasetDto>();

            foreach (Dataset ds in _datasetRepository.GetAllEditable(userId))
            {
                try
                {
                    dtoList.Add(DatasetMapper.ToDto(ds));
                }
                catch { }// ignore error so other datasets can be loaded correctly
            }
            return dtoList;
        }

        /// <summary>
        /// Gets a dataset by name
        /// </summary>
        /// <param name="name">name of the dataset</param>
        /// <returns>DatasetDto</returns>
        public DatasetDto GetByName(string name)
        {
            Dataset ds = _datasetRepository.GetByName(name);
            return DatasetMapper.ToDto(ds);
        }

        /// <summary>
        /// Gets a dataset by id and checks the access rights
        /// </summary>
        /// <param name="id">dataset id</param>
        /// <param name="userId">userid</param>
        /// <returns>Dataset</returns>
        public DatasetDto GetById(int id, int? userId)
        {
            Dataset dataset = _datasetRepository.GetById(id);
            if(dataset.UserId == userId || dataset.Flags.HasFlag(DataSetFlags.Public))
            {
                return DatasetMapper.ToDto(dataset);
            }
            else
            {
                throw new Exception("Not Authorized");
            }
        }

        /// <summary>
        /// Checks the rights for the deletion and deletes the dataset
        /// </summary>
        /// <param name="id">dataset id</param>
        /// <param name="userId">userid</param>
        public void Delete(int id, int userId)
        {
            Dataset ds = _datasetRepository.GetById(id);
            if(ds.UserId != userId){
                throw new Exception("No permission to delete this dataset.");
            }
            if (ds != null)
            {
                _datasetRepository.Delete(ds);
                _datasetRepository.DataContext.Commit();
            }
        }

        /// <summary>
        ///  Checks the right for the update process and updates the dataset and
        /// </summary>
        /// <param name="datasetDto">dataset</param>
        /// <param name="userId">userid</param>
        /// <returns>the updated dataset</returns>
        public DatasetDto Update(DatasetDto datasetDto, int userId)
        {
            ValidateDataset(datasetDto);

            Dataset result = null;
            if (datasetDto.Id > 0)
            {
                Dataset ds = _datasetRepository.GetById(datasetDto.Id);
                ds.Data = datasetDto.Json;
                ds.Flags = datasetDto.Flags;
                ds.Name = datasetDto.Name;
                ds.Modified = DateTime.Now;
                if(ds.UserId != userId)
                {
                    throw new Exception("No permission to update this dataset.");
                }

                _datasetRepository.DataContext.Commit();
                result = ds;
            }
            else
            {
                Dataset ds = new Dataset()
                {
                    Id = 0,
                    Name = datasetDto.Name,
                    Flags = datasetDto.Flags,
                    Data = datasetDto.Json,
                    UserId = userId,
                    Created = DateTime.Now,
                    Modified = DateTime.Now
                };
                _datasetRepository.Add(ds);
                _datasetRepository.DataContext.Commit();
                result = ds;
            }

            return DatasetMapper.ToDto(result);
        }


        /// <summary>
        /// Validates the dataset
        /// </summary>
        /// <param name="dataset">dataset</param>
        public void ValidateDataset(DatasetDto dataset)
        {
            DatasetEnvelopeDto datasetEnvelope = dataset.Dataset;
            if (string.IsNullOrEmpty(dataset.Name))
            {
                throw new Exception("Please enter a name for the provided dataset.");
            }
            else
            {
                if (_datasetRepository.GetByName(dataset.Name) != null && dataset.Id < 1)
                {
                    throw new Exception("A dataset with this name already exists.");
                }
            }

            if (datasetEnvelope.Items.Length > 0)
            {
                int inputLength = datasetEnvelope.Items.FirstOrDefault()?.Data?.Length ?? throw new Exception("First item entry has no 'Data' attribute");
                int outputLength = datasetEnvelope.Items.FirstOrDefault()?.Labels?.Length ?? throw new Exception("First item entry has no 'Label' attribute");
                foreach (DataItemDto item in datasetEnvelope.Items)
                {

                    if (item.Labels == null || item.Data == null)
                    {
                        throw new Exception($"Item entry {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} must have a label and a data attribute.");
                    }

                    if (item.Data.Length < 1)
                    {
                        throw new Exception($"Item {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} 'Data' attribute must have length > 0");
                    }

                    if (item.Labels.Length < 1)
                    {
                        throw new Exception($"Item {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} 'Labels' attribute must have length > 0");
                    }

                    if (item.Data.Length != inputLength)
                    {
                        throw new Exception($"Dataset is not consistent. Item number {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} " +
                                            $" 'Data' attribute has a different length ({item.Data.Length}) than the first Item ({inputLength})");
                    }

                    if (item.Labels.Length != outputLength)
                    {
                        throw new Exception($"Dataset is not consistent. Item number {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} " +
                                            $" 'Label' attribute has a different length ({item.Labels.Length}) than the first Item ({outputLength})");
                    }

                    if (datasetEnvelope.ProblemType.ToLower() == "classification")
                    {
                        bool foundOne = false;
                        foreach (int label in item.Labels)
                        {
                            if (label == 1d && foundOne)
                            {
                                throw new Exception($"Item number {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} is not one-hot encoded. Two '1' found.");
                            }
                            if (label == 1d)
                            {
                                foundOne = true;
                            }
                            if (label != 0d && label != 1d)
                            {
                                throw new Exception($"Item number {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} is not one-hot encoded. Only '0' and '1's are allowed.");
                            }
                        }
                        if (!foundOne)
                        {
                            throw new Exception($"Item number {(Array.IndexOf(datasetEnvelope.Items, item) + 1)} is not one-hot encoded. No '1' was found.");
                        }
                    }
                }
            }
            else
            {
                throw new Exception("No Items found!");
            }

            if (datasetEnvelope.OutputDescription != null && datasetEnvelope.OutputDescription.Length > 0)
            {
                if (datasetEnvelope.Items.First().Labels.Length != datasetEnvelope.OutputDescription.Length)
                {
                    throw new Exception("'OutputDescription' must have the same number of descriptions like there are Outputneurons / Label entries.");
                }
                if (datasetEnvelope.ProblemType.ToLower() == "regression")
                {
                    throw new Exception("'OutputDescription' only possible with problem type 'classification'.");
                }
            }

            if (datasetEnvelope.Layers != null && datasetEnvelope.Layers.Length > 0)
            {
                if (datasetEnvelope.Layers.Length < 2)
                {
                    throw new Exception("If you want to provide layers, you must provide at least two layers (input and outputlayer)");
                }

                LayerDto inputLayer = datasetEnvelope.Layers.First();
                if (!string.IsNullOrEmpty(inputLayer.Activation) || inputLayer.Bias)
                {
                    throw new Exception("Inputlayer can not have an activation Function or a Bias!");
                }

                if (datasetEnvelope.Items.First().Data.Length != datasetEnvelope.Layers.First().Neurons)
                {
                    throw new Exception($"Inputlayer must have same number of neurons like the length of the data input ({datasetEnvelope.Items.First().Data.Length})");
                }
                if (datasetEnvelope.Items.First().Labels.Length != datasetEnvelope.Layers.Last().Neurons)
                {
                    throw new Exception($"Outputlayer must have same number of neurons like the length of the label ({datasetEnvelope.Items.First().Labels.Length})");
                }

                for (int i = 0; i < datasetEnvelope.Layers.Length; i++)
                {
                    LayerDto layer = datasetEnvelope.Layers[i];
                    if (layer.Neurons < 1)
                    {
                        throw new Exception($"Layer {i + 1} must have a positive number of neurons");
                    }

                    if (!string.IsNullOrEmpty(layer.Activation) && i != 0)
                    {
                        if (!new List<string>() { "relu", "sigmoid", "tanh", "softmax", "linear" }.Contains(layer.Activation.ToLower()))
                        {
                            throw new Exception($"Layer {i + 1} activation function must have value 'linear', 'relu', 'sigmoid', 'softmax' or 'tanh'");
                        }
                    }
                }
            }

            if (datasetEnvelope.Matrix != null && datasetEnvelope.Matrix.Length > 0)
            {
                if (datasetEnvelope.Matrix.Length != 2)
                {
                    throw new Exception("Please enter two numbers [rows, columns] for the Matrix Property");
                }
                else
                {
                    int length = datasetEnvelope.Matrix[0] * datasetEnvelope.Matrix[1];
                    if (length != datasetEnvelope.Items.First().Data.Length)
                    {
                        throw new Exception($"The vector of the matrix must have the same length like the data input vector which is {datasetEnvelope.Items.First().Data.Length}.");
                    }
                }
            }

            if (datasetEnvelope.TrainingSettings != null)
            {
                if (!string.IsNullOrEmpty(datasetEnvelope.TrainingSettings.Optimizer))
                {
                    if (!new List<string>() { "rmsprop", "adam", "sgd", "sgdm" }.Contains(datasetEnvelope.TrainingSettings.Optimizer.ToLower()))
                    {
                        throw new Exception("TrainingSetting Optimizer must have value 'rmsprop', 'adam', 'sgd' or 'sgdm'");
                    }
                    if (!new List<string>() { "rmsprop", "sgdm" }.Contains(datasetEnvelope.TrainingSettings.Optimizer.ToLower()) && datasetEnvelope.TrainingSettings.Momentum.HasValue)
                    {
                        throw new Exception("Momentum only possible with Optimizer 'rmsprop' or 'sgdm'");
                    }
                }

                if (!string.IsNullOrEmpty(datasetEnvelope.TrainingSettings.Loss))
                {
                    if (!new List<string>() { "mse", "sce" }.Contains(datasetEnvelope.TrainingSettings.Loss.ToLower()))
                    {
                        throw new Exception("TrainingSetting Loss must have value 'mse' (=mean squared error) or 'sce' (=softmax cross entropy).");
                    }
                }
            }

            if (!string.IsNullOrEmpty(datasetEnvelope.ProblemType))
            {
                if (!new List<string>() { "classification", "regression" }.Contains(datasetEnvelope.ProblemType.ToLower()))
                {
                    throw new Exception("ProblemType must have value 'Classification' or 'Regression' ");
                }
            }
            else
            {
                throw new Exception("Problemtype [Regression, Classification] required!");
            }
        }
    }
}
