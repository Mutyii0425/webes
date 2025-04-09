import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'adaliclothing@gmail.com',
    pass: process.env.EMAIL_PASS || 'fowurjrgaulthknf'
  },
  pool: true,
  maxConnections: 5
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP szerver kapcsolódási hiba:', error);
  } else {
    console.log('Email szerver kapcsolat sikeres');
  }
});

const emailQueue = [];
let isProcessing = false;
const DELAY_BETWEEN_EMAILS = 2000;

const addToEmailQueue = (emailData) => {
  return new Promise((resolve, reject) => {
    emailQueue.push({
      data: emailData,
      resolve,
      reject
    });
    
    if (!isProcessing) {
      processEmailQueue();
    }
  });
};

const processEmailQueue = async () => {
  if (emailQueue.length === 0) {
    isProcessing = false;
    return;
  }
  
  isProcessing = true;
  const { data, resolve, reject } = emailQueue.shift();
  
  try {
    const result = await transporter.sendMail(data);
    console.log('Email sikeresen elküldve:', result.messageId);
    resolve(result);
  } catch (error) {
    console.error('Email küldési hiba:', error);
    reject(error);
  }
  
  setTimeout(processEmailQueue, DELAY_BETWEEN_EMAILS);
};

const emailService = {
  send: async (options) => {
    return addToEmailQueue(options);
  },
  
  sendBulk: async (recipients, templateOptions) => {
    const results = [];
    const errors = [];
    
    for (const recipient of recipients) {
      try {
        const emailOptions = {
          from: templateOptions.from || '"Adali Clothing" <adaliclothing@gmail.com>',
          to: recipient.email,
          subject: templateOptions.subject,
          html: templateOptions.html
            .replace('{{name}}', recipient.name || 'Vásárló')
            .replace(/\{\{([^}]+)\}\}/g, (match, key) => recipient[key] || '')
        };
        
        const result = await addToEmailQueue(emailOptions);
        results.push({ email: recipient.email, success: true, messageId: result.messageId });
      } catch (error) {
        errors.push({ email: recipient.email, success: false, error: error.message });
      }
    }
    
    return {
      success: errors.length === 0,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    };
  }
};

export default emailService;
