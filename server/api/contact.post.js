import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nom, prenom, email, message } = body;

  if (message && message.trim().length < 5) {
    return {
      success: false,
      message: "Votre message est trop court. Veuillez écrire un message plus détaillé.",
    };
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "gerald-f@hotmail.fr",
      subject: "Nouveau formulaire de contact",
      text: `Bonjour Cécile, tu as une nouvelle demande de contact de la part de ${prenom}.\n\nVoici son message:\n${message}\n\nTu peux la recontacter à l'adresse suivante: ${email}`,
    });
    console.log(`Nouvelle demande reçue de ${prenom} ${nom} (${email})`);

    return {
      success: true,
      message: `Merci ${prenom} ! Votre message a été envoyé avec succès. Nous vous contacterons bientôt sur ${email}.`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    };
  }
});
