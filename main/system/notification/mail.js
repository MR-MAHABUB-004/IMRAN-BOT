const logger = require('../../catalogs/MAHABUBC.js');
const nodemailer = require('nodemailer');
const axios = require('axios');
const config = require('../../../Config.json');
const target = config.EMAIL;

async function showNotification() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/notification.txt');
    const message = response.data;

    console.log('\x1b[36m%s\x1b[0m', '\n⏩ Notification Message from GitHub:');
    console.log('\x1b[32m%s\x1b[0m', message); // Green output
  } catch (error) {
    console.error('❌ Failed to fetch notification message:', error.message);
  }
}

module.exports = async (subject, message) => {
  await showNotification(); // show notification before sending email

  if (!message) {
    return logger.err('please provide a notification message!');
  }

  let formattedSubject;
  if (typeof subject === 'string' || subject instanceof String) {
    formattedSubject = subject.toUpperCase();
  } else {
    formattedSubject = subject;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mahaburpk479@gmail.com',
      pass: 'diug cuqe rmwv wcta'
    }
  });

  const mailOptions = {
    from: 'mahaburpk479@gmail.com',
    to: target,
    subject: 'MAHABUB NOTIFICATION ( ' + formattedSubject + ' )',
    text: message
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.err('error - something went wrong when sending notification.');
    } else {
      // optionally log success
    }
  });
};
