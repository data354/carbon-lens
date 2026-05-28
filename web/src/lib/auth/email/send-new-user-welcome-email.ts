import { resend } from "./client";

export function sendNewUserWelcomeEmail({
  to,
  name,
  email,
  temporaryPassword,
  loginLink,
}: {
  to: string;
  name: string;
  email: string;
  temporaryPassword: string;
  loginLink: string;
}) {
  const from = "Carbon Lens <carbon.lens@data354.com>";
  const subject =
    "Bienvenue sur Carbon Lens - Votre compte a été créé";

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue sur Carbon Lens</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      
      <!-- Container principal -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            
            <!-- Card principale -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header avec logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #528c00 0%, #6aa300 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">
                    Carbon Lens
                  </h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                    Données fiables pour les politiques climatiques
                  </p>
                </td>
              </tr>
              
              <!-- Contenu principal -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Message de bienvenue -->
                  <div style="margin-bottom: 32px;">
                    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                      Bonjour ${name} 👋
                    </h2>
                    <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Votre compte Carbon Lens a été créé avec succès ! Vous pouvez maintenant accéder à notre plateforme d'analyse des données carbone du Sénégal.
                    </p>
                  </div>
                  
                  <!-- Informations de connexion -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                    <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                      🔐 Vos informations de connexion
                    </h3>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Email :</strong>
                      <code style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 14px; color: #1f2937; display: block;">${email}</code>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Mot de passe temporaire :</strong>
                      <code style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 14px; color: #1f2937; display: block;">${temporaryPassword}</code>
                    </div>
                    
                    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 12px; margin-top: 16px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Important :</strong> Changez votre mot de passe lors de votre première connexion pour des raisons de sécurité.
                      </p>
                    </div>
                  </div>
                  
                  <!-- Bouton de connexion -->
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${loginLink}" style="display: inline-block; background: linear-gradient(135deg, #528c00 0%, #6aa300 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(82, 140, 0, 0.2);">
                      🚀 Se connecter à Carbon Lens
                    </a>
                  </div>
                  
                  <!-- Fonctionnalités -->
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 32px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 20px 0; color: #374151; font-size: 18px; font-weight: 600;">
                      🌍 Ce que vous pouvez faire avec Carbon Lens
                    </h3>
                    
                    <div style="display: grid; gap: 16px;">
                      <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <span style="color: #528c00; font-size: 18px;">📊</span>
                        <div>
                          <strong style="color: #374151; font-size: 15px; display: block; margin-bottom: 4px;">Analyser les données carbone</strong>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Visualisez et analysez les stocks de carbone forestier du Sénégal</p>
                        </div>
                      </div>
                      
                      <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <span style="color: #528c00; font-size: 18px;">🗺️</span>
                        <div>
                          <strong style="color: #374151; font-size: 15px; display: block; margin-bottom: 4px;">Explorer la carte interactive</strong>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Naviguez dans les régions et zones forestières en temps réel</p>
                        </div>
                      </div>
                      
                      <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <span style="color: #528c00; font-size: 18px;">📈</span>
                        <div>
                          <strong style="color: #374151; font-size: 15px; display: block; margin-bottom: 4px;">Générer des rapports</strong>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">Créez des rapports détaillés pour guider les politiques climatiques</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                    Carbon Lens - Plateforme d'analyse carbone du Sénégal
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `;

  const text = `
Bienvenue sur Carbon Lens !

Bonjour ${name},

Votre compte Carbon Lens a été créé avec succès !

Informations de connexion :
- Email : ${email}
- Mot de passe temporaire : ${temporaryPassword}

IMPORTANT: Changez votre mot de passe lors de votre première connexion.

Accédez à votre compte : ${loginLink}

L'équipe Carbon Lens
  `;

  return resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });
}
