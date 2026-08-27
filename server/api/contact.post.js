import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nom, prenom, email, message } = body;

  if (message && message.trim().length < 5) {
    return {
      success: false,
      message:
        "Votre message est trop court. Veuillez écrire un message plus détaillé.",
    };
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "gerald-f@hotmail.fr",
      subject: `Nouvelle demande de contact — ${prenom.trim()} ${nom.trim()}`,

      html: `
    <div style="
      margin:0;
      padding:40px 20px;
      background:#E6DFDD;
      font-family:Arial,sans-serif;
      color:#676463;
    ">

      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
      ">

        <!-- En-tête -->

        <div style="
          padding:35px 30px;
          text-align:center;
          background:#ffffff;
        ">

          <div style="
            font-family:Georgia,serif;
            font-size:28px;
            color:#5A3419;
            margin-bottom:12px;
          ">
            Les Photos de Cécile
          </div>

          <div style="
            width:60px;
            height:1px;
            background:#D9D2CF;
            margin:0 auto;
          "></div>

        </div>


        <!-- Contenu -->

        <div style="
          padding:10px 35px 40px;
        ">

          <h1 style="
            font-family:Georgia,serif;
            font-size:25px;
            font-weight:normal;
            color:#5A3419;
            margin:0 0 25px;
          ">
            Nouvelle demande de contact
          </h1>


          <p style="
            font-size:15px;
            line-height:1.7;
          ">
            Bonjour Cécile,
          </p>


          <p style="
            font-size:15px;
            line-height:1.7;
          ">
            Tu as reçu une nouvelle demande de contact depuis ton site
            <strong style="color:#5A3419;">
              Les Photos de Cécile
            </strong>.
          </p>


          <!-- Coordonnées -->

          <div style="
            margin:30px 0;
            padding:20px;
            background:#FAF8F7;
            border-radius:10px;
          ">

            <p style="
              margin:0 0 10px;
              font-size:15px;
            ">
              <strong style="color:#5A3419;">
                Nom :
              </strong>
              ${nom.trim()}
            </p>

            <p style="
              margin:0 0 10px;
              font-size:15px;
            ">
              <strong style="color:#5A3419;">
                Prénom :
              </strong>
              ${prenom.trim()}
            </p>

            <p style="
              margin:0;
              font-size:15px;
            ">
              <strong style="color:#5A3419;">
                Adresse e-mail :
              </strong>
              <a
                href="mailto:${email.trim()}"
                style="
                  color:#5A3419;
                  text-decoration:none;
                "
              >
                ${email.trim()}
              </a>
            </p>

          </div>


          <!-- Message -->

          <p style="
            margin:0 0 10px;
            font-size:15px;
            color:#5A3419;
            font-weight:bold;
          ">
            Message :
          </p>

          <div style="
            padding:20px;
            background:#FAF8F7;
            border-left:3px solid #5A3419;
            border-radius:8px;
            font-size:15px;
            line-height:1.7;
            white-space:pre-line;
          ">
            ${message.trim()}
          </div>


          <!-- Bouton -->

          <div style="
            margin-top:30px;
            text-align:center;
          ">

            <a
              href="mailto:${email.trim()}"
              style="
                display:inline-block;
                padding:14px 28px;
                background:#5A3419;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                font-size:14px;
              "
            >
              Répondre au client
            </a>

          </div>


          <p style="
            margin-top:30px;
            font-size:14px;
            line-height:1.7;
            color:#8F8C85;
          ">
            Tu peux répondre directement à cette personne à l'adresse
            indiquée ci-dessus.
          </p>

        </div>


        <!-- Pied de mail -->

        <div style="
          padding:20px 30px;
          text-align:center;
          border-top:1px solid #D9D2CF;
          font-size:12px;
          color:#8F8C85;
        ">
          Les Photos de Cécile<br>
          8 allée sablée — 80000 Amiens<br>
          07717773859
        </div>

      </div>

    </div>
  `,
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
