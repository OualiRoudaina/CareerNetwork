// Service d'email simplifié
// En production, utiliser un service comme SendGrid, Mailgun, ou AWS SES

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Pour l'instant, on simule l'envoi d'email
  // En production, intégrer avec un service d'email réel
  
  console.log('📧 Email envoyé:', {
    to: options.to,
    subject: options.subject,
  });

  // TODO: Intégrer avec un service d'email réel
  // Exemple avec nodemailer:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  */

  return true;
}

export function generateApplicationStatusEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  status: string
): EmailOptions {
  const statusMessages: { [key: string]: { subject: string; message: string } } = {
    accepted: {
      subject: `Félicitations ! Votre candidature pour ${jobTitle} a été acceptée`,
      message: `Bonjour ${candidateName},<br><br>Nous sommes ravis de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> chez ${companyName} a été acceptée !<br><br>Nous vous contacterons prochainement pour la suite du processus.`,
    },
    rejected: {
      subject: `Mise à jour concernant votre candidature pour ${jobTitle}`,
      message: `Bonjour ${candidateName},<br><br>Nous vous remercions pour votre candidature au poste de <strong>${jobTitle}</strong> chez ${companyName}.<br><br>Après examen attentif de votre profil, nous avons décidé de ne pas retenir votre candidature pour ce poste. Nous vous souhaitons beaucoup de succès dans vos recherches.`,
    },
    reviewed: {
      subject: `Mise à jour concernant votre candidature pour ${jobTitle}`,
      message: `Bonjour ${candidateName},<br><br>Votre candidature pour le poste de <strong>${jobTitle}</strong> chez ${companyName} est actuellement en cours d'examen. Nous vous tiendrons informé(e) dès qu'une décision sera prise.`,
    },
  };

  const statusInfo = statusMessages[status] || {
    subject: `Mise à jour concernant votre candidature pour ${jobTitle}`,
    message: `Bonjour ${candidateName},<br><br>Votre candidature pour le poste de <strong>${jobTitle}</strong> chez ${companyName} a été mise à jour.`,
  };

  return {
    to: '', // Sera rempli par l'appelant
    subject: statusInfo.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CareerNetwork</h1>
            </div>
            <div class="content">
              ${statusInfo.message}
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par CareerNetwork</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: statusInfo.message.replace(/<[^>]*>/g, ''),
  };
}

export function generateNewJobEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  jobUrl: string
): EmailOptions {
  return {
    to: '',
    subject: `Nouvelle offre d'emploi : ${jobTitle} chez ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouvelle offre d'emploi</h1>
            </div>
            <div class="content">
              <p>Bonjour ${candidateName},</p>
              <p>Une nouvelle offre d'emploi pourrait vous intéresser :</p>
              <h2>${jobTitle}</h2>
              <p><strong>Entreprise :</strong> ${companyName}</p>
              <a href="${jobUrl}" class="button">Voir l'offre</a>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par CareerNetwork</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function generateInterviewReminderEmail(
  candidateName: string,
  jobTitle: string,
  scheduledAt: Date,
  type: string,
  location?: string
): EmailOptions {
  const dateStr = new Date(scheduledAt).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    to: '',
    subject: `Rappel : Entretien pour ${jobTitle} - ${dateStr}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rappel d'entretien</h1>
            </div>
            <div class="content">
              <p>Bonjour ${candidateName},</p>
              <p>Ceci est un rappel pour votre entretien :</p>
              <div class="info-box">
                <p><strong>Poste :</strong> ${jobTitle}</p>
                <p><strong>Date et heure :</strong> ${dateStr}</p>
                <p><strong>Type :</strong> ${type === 'phone' ? 'Téléphonique' : type === 'video' ? 'Vidéo' : 'En personne'}</p>
                ${location ? `<p><strong>Lieu :</strong> ${location}</p>` : ''}
              </div>
              <p>Nous vous attendons !</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par CareerNetwork</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}





