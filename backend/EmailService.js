const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async createTestAccount() {
    return await nodemailer.createTestAccount();
  }

  async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    // Para produção, substitua esta configuração pela do seu provedor de email (Gmail, SendGrid, etc.)
    const testAccount = await this.createTestAccount();
    console.log('📧 Ethereal test account created:', { user: testAccount.user, pass: testAccount.pass });

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return this.transporter;
  }

  async sendPasswordResetEmail(userEmail, token) {
    const transporter = await this.getTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    const mailOptions = {
      from: '"Cycling Workout App" <noreply@cyclingworkout.app>',
      to: userEmail,
      subject: 'Redefinição de Senha',
      html: `
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não solicitou isso, por favor, ignore este email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email de redefinição enviado: %s', info.messageId);
    console.log('👀 Visualizar email: %s', nodemailer.getTestMessageUrl(info));
  }
}

module.exports = new EmailService();