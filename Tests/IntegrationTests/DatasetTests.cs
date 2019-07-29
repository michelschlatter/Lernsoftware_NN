/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Application.Dtos;
using Application.Helpers;
using Application.Mapping;
using Application.Services;
using Domain.Entities;
using Infrastructure;
using Infrastructure.Helpers;
using Infrastructure.Repositories;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Tests
{
    [TestClass]
    public class DatasetTest
    {

        /// <summary>
        /// TestMethod: Gets the visible datasets for users and checks the access rights
        /// </summary>
        [TestMethod]
        public void CheckDatasetAccessRights()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService)
                = InitDb("DatasetById");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");
            User initialUser = CreateInitialuser(dbContext, "user@blueneurons.ch");

            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);
            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);
            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);
            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);
            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);


            var adminDatasets = datasetService.GetAllVisible(adminUser.Id);
            Assert.IsTrue(adminDatasets.Count == 5);

            var userDatasets = datasetService.GetAllVisible(initialUser.Id);
            Assert.IsTrue(userDatasets.Count == 3);
        }

        /// <summary>
        /// Testmethod: Gets a dataset by id and checks the access rights
        /// </summary>
        [TestMethod]
        public void GetDatasetByIdInclCheckRights()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService)
                = InitDb("DatasetByIdCheckRights");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");
            User initialUser = CreateInitialuser(dbContext, "user@blueneurons.ch");

            Dataset publicDs = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);
            Dataset privateDs = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);

            Assert.IsTrue(datasetService.GetById(publicDs.Id, initialUser.Id) != null);
            Assert.IsTrue(datasetService.GetById(publicDs.Id, adminUser.Id) != null);
            Assert.IsTrue(datasetService.GetById(privateDs.Id, adminUser.Id) != null);
            Assert.ThrowsException<Exception>(() => datasetService.GetById(privateDs.Id, initialUser.Id));
        }


        /// <summary>
        /// Testmethod: Tests if a dataset can be loaded by its name
        /// </summary>
        [TestMethod]
        public void GetByName()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService)
                = InitDb("GetByName");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");
            User initialUser = CreateInitialuser(dbContext, "user@blueneurons.ch");

            Dataset xorDs = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);
            Assert.IsNotNull(datasetService.GetByName(xorDs.Name));
        }

        /// <summary>
        /// Testmethod: Deletes the dataset and checks the rights
        /// </summary>
        [TestMethod]
        public void DeleteDatasetInclCheckRights()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService) 
                = InitDb("DeleteDataset");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");
            User initialUser = CreateInitialuser(dbContext, "user@blueneurons.ch");

            Dataset publicDs = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);
            Dataset privateDs = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);
            Dataset privateDs2 = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);


            datasetService.Delete(privateDs.Id, adminUser.Id);
            Assert.AreEqual(dbContext.Datasets.Count(), 2);
            Assert.ThrowsException<Exception>(() => datasetService.Delete(publicDs.Id, initialUser.Id));
            Assert.ThrowsException<Exception>(() => datasetService.Delete(privateDs2.Id, initialUser.Id));
            datasetService.Delete(publicDs.Id, adminUser.Id);
            datasetService.Delete(privateDs2.Id, adminUser.Id);
            Assert.AreEqual(dbContext.Datasets.Count(), 0);
        }

        /// <summary>
        /// Testmethod: Updates a dataset and checks the rights
        /// </summary>
        [TestMethod]
        public void UpdateDatasetInclCheckRights()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService) 
                = InitDb("UpdateDataset");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");
            User initialUser = CreateInitialuser(dbContext, "user@blueneurons.ch");

            Dataset dataset = CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Public);

            DatasetDto datasetDto = new DatasetDto();
            datasetDto.Name = "Dataset name changed";
            datasetDto.Flags = DataSetFlags.Private;
            datasetDto.Json = dataset.Data;
            datasetDto.Id = dataset.Id;

            datasetService.Update(datasetDto, adminUser.Id);

            Dataset updatedDataset = dbContext.Datasets.First(x => x.Id == dataset.Id);
            DatasetDto updatedDatasetDto = new DatasetDto();
            updatedDatasetDto.Json = updatedDataset.Data;

            Assert.AreEqual(datasetDto.Name, updatedDataset.Name);
            Assert.AreEqual(datasetDto.Flags, updatedDataset.Flags);
            Assert.ThrowsException<Exception>(() => datasetService.Update(datasetDto, initialUser.Id));
        }

        /// <summary>
        /// Testmethod: Tests if the validation of the dataset behaves correctly
        /// </summary>
        [TestMethod]
        public void DatasetValidationTest()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository, DatasetRepository datasetRepository, DatasetService datasetService)
            = InitDb("DatasetValidationTest");
            User adminUser = CreateInitialuser(dbContext, "admin@blueneurons.ch");

            DatasetDto dsDto = GetXorDatasetDto(DataSetFlags.Private);
            datasetService.ValidateDataset(dsDto);

            //One hot encoding
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Labels = new double[] { 0d, 0d };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Labels = new double[] { 1d, 1d };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Labels = new double[] { 2d, 0d };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Labels = new double[] { 0d };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            // Labels and Data defined
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Labels = null;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.First().Data = null;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.Last().Labels = null;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Items.Last().Data = null;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            // Outputdescription
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.OutputDescription = new string[] { "class 1" };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.OutputDescription = new string[] { "class 1", "class 2" };
            datasetService.ValidateDataset(dsDto);

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.OutputDescription = null;
            datasetService.ValidateDataset(dsDto);

            // Layer Definition
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers.Last().Neurons = 5;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers.First().Neurons = 1;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers = new LayerDto[] { new LayerDto() { Neurons = 3 } };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers[1].Neurons = 0;
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers[1].Activation = "Unknown";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Layers[1].Activation = "";
            datasetService.ValidateDataset(dsDto);

            //Matrix
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Matrix = new int[] { 1, 2 };
            datasetService.ValidateDataset(dsDto);

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Matrix = new int[] { 2, 2 };
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.Matrix = null;
            datasetService.ValidateDataset(dsDto);

            // Training definition
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.TrainingSettings.Loss = "";
            datasetService.ValidateDataset(dsDto);

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.TrainingSettings.Loss = "Unknown";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.TrainingSettings.Optimizer = "";
            datasetService.ValidateDataset(dsDto);

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.TrainingSettings.Optimizer = "Unknown";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            //Problem Type
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.ProblemType = "Unknown";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Dataset.ProblemType = "";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            // Name
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Name = "";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto));

            CreateInitialXorDataset(dbContext, adminUser, DataSetFlags.Private);
            dsDto = GetXorDatasetDto(DataSetFlags.Private);
            dsDto.Name = "XOR";
            Assert.ThrowsException<Exception>(() => datasetService.ValidateDataset(dsDto)); //already exists
        }

        /// <summary>
        /// Gets the xor datasetdto for the Testmethods
        /// </summary>
        /// <param name="flags">Flags for the dataset</param>
        /// <returns>xor datasetdto</returns>
        private Dataset xorDataset = null; //cache
        private DatasetDto GetXorDatasetDto(DataSetFlags flags)
        {
            if (xorDataset == null)
            {
                xorDataset = new Dataset()
                {
                    Data = File.ReadAllText("Resources/xor_ok.json"),
                    Flags = flags,
                    UserId = 0,
                    Name = "XOR"
                };
            }
            return DatasetMapper.ToDto(xorDataset);
        }

        /// <summary>
        /// Creates a initial user for the test methods
        /// </summary>
        /// <param name="dbContext">DataContext</param>
        /// <param name="email">Email</param>
        /// <returns>initial User</returns>
        private User CreateInitialuser(DataContext dbContext, string email)
        {
            User user = new User();
            user.Email = email;
            user.Salt = PasswordHelper.CreateSalt();
            user.Password = PasswordHelper.HashPassword("1234", user.Salt);
            dbContext.Users.Add(user);
            dbContext.SaveChanges();
            return user;
        }

        /// <summary>
        /// Creates a intitial Dataset for the Testmethods
        /// </summary>
        /// <param name="dbContext">Datacontext</param>
        /// <param name="user">User which owns the dataset</param>
        /// <param name="flags">Flags for the dataset</param>
        /// <returns>intial dataset</returns>
        private Dataset CreateInitialXorDataset(DataContext dbContext, User user, DataSetFlags flags)
        {
            Dataset xorDataset = new Dataset()
            {
                Data = File.ReadAllText("Resources/xor.json"),
                Flags = flags,
                UserId = user.Id,
                Name = "XOR"
            };
            dbContext.Datasets.Add(xorDataset);
            dbContext.SaveChanges();
            return xorDataset;
        }

        /// <summary>
        /// Creates the initial dbcontext, services and repositories 
        /// </summary>
        /// <param name="dbName">Database name for the in memory database</param>
        /// <returns>DbContext, Userservice, UserRepository, DatasetRepository, DatasetService</returns>
        private static (DataContext, UserService, UserRepository, DatasetRepository, DatasetService) InitDb(string dbName)
        {
            DataContext dbContext = new DataContext(DataContextFactory.GetInMemoryDb(dbName));
            UserRepository userRep = new UserRepository(dbContext);
            UserService userService = new UserService(userRep);

            DatasetRepository datasetRepository = new DatasetRepository(dbContext);
            DatasetService datasetService = new DatasetService(datasetRepository);

            return (dbContext, userService, userRep, datasetRepository, datasetService);
        }
    }
}
