/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace Infrastructure.Smtp
{
    public class Smtp : ISender
    {
        protected string Host { get; private set; }
        protected int Port { get; private set; }
        protected string UserName { get; private set; }
        protected string Password { get; private set; }
        protected string MailFrom { get; private set; }
        protected string ApplicationName { get; private set; }


        public Smtp(string host, int port, string userName, string password, string mailFrom, string applicationName)
        {
            Host = host;
            Port = port;
            UserName = userName;
            Password = password;
            MailFrom = mailFrom;
            ApplicationName = applicationName;
        }

        /// <summary>
        /// Sends the password to the user via email
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="newPassword">new password</param>
        public void SendPassword(UserDto user, string newPassword)
        {
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(MailFrom);
            mail.To.Add(user.Email);
            mail.Body = "Dear User <br /><br />" +
                $"Your new Password is: {newPassword} <br /><br />" +
                "Kind regards <br /><br />" +
                $"{ApplicationName}";
            mail.Subject = "New Password";
            mail.IsBodyHtml = true;


            using (SmtpClient client = new SmtpClient(Host, Port))
            {
                client.Credentials = new NetworkCredential(UserName, Password);
                client.Send(mail);
            }
        }
    }
}