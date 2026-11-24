// Ajoute les textes du pied de page et des pages (À propos, Contact, Confidentialité, Conditions, Mentions légales)
// aux trois fichiers de traduction, sans toucher au reste. Relançable sans risque.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'i18n', 'locales');

const T = {
  fr: {
    footer: {
      colExplore: 'Explorer',
      colMerchants: 'Commerçants',
      colSite: 'AfroPonte',
      about: 'À propos',
      contact: 'Contact',
      privacy: 'Confidentialité',
      terms: 'Conditions d’utilisation',
      legal: 'Mentions légales',
      backToTop: 'Retour en haut',
      whatsapp: 'WhatsApp',
    },
    pages: {
      backHome: 'Retour à l’accueil',
      updated: 'Dernière mise à jour : {{date}}',
      toComplete: '(à compléter)',
      contactEmail: 'Écrire un e-mail',
      contactWhatsapp: 'Écrire sur WhatsApp',
      about: {
        title: 'À propos d’AfroPonte',
        intro: 'AfroPonte est un pont entre l’Afrique et le Brésil : un annuaire qui aide à trouver, près de chez soi, les restaurants, boutiques, salons de coiffure et ateliers de couture africains.',
        sections: [
          { h: 'Notre mission', p: 'Rendre visibles les commerces africains et afro-descendants du Brésil, et faciliter la rencontre entre ceux qui les tiennent et ceux qui les cherchent : touristes, étudiants, migrants, hommes d’affaires, familles.' },
          { h: 'Ce que vous pouvez faire', p: 'Chercher un commerce par ville, catégorie ou pays d’origine, le voir sur la carte, enregistrer vos favoris, laisser un avis, et écrire directement à un commerçant depuis l’application, sans passer par WhatsApp.' },
          { h: 'Pour les commerçants', p: 'Présenter son activité est gratuit. Chaque fiche est vérifiée avant sa publication, et les avis et photos sont modérés pour garder un annuaire fiable.' },
          { h: 'Une communauté', p: 'AfroPonte grandit avec ses utilisateurs : proposez un commerce qui manque, signalez une information fausse, partagez votre expérience.' },
          { h: 'Trois langues', p: 'Le site est disponible en français, en anglais et en portugais.' },
        ],
      },
      contact: {
        title: 'Nous contacter',
        intro: 'Une question, une suggestion, un commerce à ajouter ou un problème à signaler ? Écrivez-nous.',
        sections: [
          { h: 'Pour les utilisateurs', p: 'Pour contacter un commerçant, utilisez la messagerie de l’application depuis sa fiche.' },
          { h: 'Pour les commerçants', p: 'Pour inscrire ou revendiquer votre activité, créez un compte commerçant. Besoin d’aide ? Écrivez-nous.' },
          { h: 'Signaler un problème', p: 'Une fiche incorrecte ou un contenu inapproprié ? Utilisez le bouton de signalement, ou écrivez-nous en indiquant la page concernée.' },
        ],
      },
      privacy: {
        title: 'Politique de confidentialité',
        intro: 'Cette page explique quelles données AfroPonte collecte, pourquoi, et quels sont vos droits, conformément à la loi brésilienne de protection des données (LGPD, loi n° 13.709/2018).',
        sections: [
          { h: 'Données que nous collectons', p: 'Compte : nom, adresse e-mail, mot de passe (chiffré), téléphone (facultatif), langue et type de compte. Utilisation : favoris, avis, photos et messages échangés dans l’application. Position : uniquement si vous utilisez « Près de moi », pour calculer les commerces proches.' },
          { h: 'Pourquoi nous les utilisons', p: 'Pour créer et sécuriser votre compte, afficher l’annuaire, permettre la messagerie, modérer les contenus et améliorer le service. Nous ne vendons pas vos données.' },
          { h: 'Vos messages', p: 'Les conversations sont privées. Seules les conversations signalées peuvent être consultées par l’équipe de modération, pour traiter le signalement.' },
          { h: 'Partage des données', p: 'Vos données ne sont partagées qu’avec les prestataires techniques nécessaires au fonctionnement du site (hébergement, envoi d’e-mails), ou si la loi l’exige. Les avis et photos que vous publiez sont visibles par les autres visiteurs.' },
          { h: 'Stockage sur votre appareil', p: 'Le site enregistre dans votre navigateur votre langue et votre session de connexion. À ce jour, il n’utilise pas de cookies publicitaires.' },
          { h: 'Durée de conservation', p: 'Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de vos données à tout moment.' },
          { h: 'Vos droits', p: 'Vous pouvez demander l’accès, la correction, l’export ou la suppression de vos données, et retirer votre consentement. Écrivez à {{email}}.' },
        ],
      },
      terms: {
        title: 'Conditions d’utilisation',
        intro: 'En utilisant AfroPonte, vous acceptez les règles ci-dessous.',
        sections: [
          { h: 'Le service', p: 'AfroPonte est un annuaire gratuit de commerces africains au Brésil, avec une messagerie intégrée. Nous ne vendons aucun produit ni service nous-mêmes.' },
          { h: 'Votre compte', p: 'Vous êtes responsable de votre compte et de la confidentialité de votre mot de passe. Donnez des informations exactes. Un compte peut être suspendu en cas d’abus.' },
          { h: 'Fiches des commerçants', p: 'Les commerçants sont responsables de l’exactitude de leurs informations (adresse, horaires, tarifs). Chaque fiche est validée par l’équipe avant publication, et peut être refusée ou retirée si elle est fausse ou trompeuse.' },
          { h: 'Avis, photos et messages', p: 'Publiez uniquement des contenus honnêtes, qui vous appartiennent et respectent les autres. Sont interdits : insultes, harcèlement, discrimination, contenus illégaux, faux avis et spam. Les contenus peuvent être modérés ou supprimés.' },
          { h: 'Signalements', p: 'Vous pouvez signaler une fiche, un avis, une photo ou un message. L’équipe les examine et peut suspendre les comptes concernés.' },
          { h: 'Responsabilité', p: 'Les informations des fiches viennent des commerçants et des utilisateurs : nous ne pouvons pas garantir qu’elles soient toujours exactes. Les échanges et achats entre utilisateurs et commerçants se font sous leur seule responsabilité.' },
          { h: 'Modifications', p: 'Nous pouvons modifier ces conditions. La date de mise à jour figure en bas de page.' },
        ],
      },
      legal: {
        title: 'Mentions légales',
        intro: 'Informations sur l’éditeur du site AfroPonte.',
        sections: [
          { h: 'Éditeur', p: 'Le site est édité par {{owner}}. Contact : {{email}}.' },
          { h: 'Hébergement', p: 'Le site est hébergé par un prestataire d’hébergement web ; ses coordonnées sont communiquées sur demande à {{email}}.' },
          { h: 'Propriété intellectuelle', p: 'La marque AfroPonte, le logo, la conception du site et ses textes sont protégés. Les photos et textes publiés par les utilisateurs et les commerçants restent leur propriété ; en les publiant, ils autorisent AfroPonte à les afficher sur le site.' },
          { h: 'Données personnelles', p: 'Le traitement de vos données est décrit dans la politique de confidentialité.' },
          { h: 'Signaler un contenu', p: 'Pour signaler un contenu illicite, utilisez le bouton de signalement ou écrivez à {{email}}.' },
        ],
      },
    },
  },

  en: {
    footer: {
      colExplore: 'Explore',
      colMerchants: 'Merchants',
      colSite: 'AfroPonte',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms of use',
      legal: 'Legal notice',
      backToTop: 'Back to top',
      whatsapp: 'WhatsApp',
    },
    pages: {
      backHome: 'Back to home',
      updated: 'Last updated: {{date}}',
      toComplete: '(to be completed)',
      contactEmail: 'Send an email',
      contactWhatsapp: 'Write on WhatsApp',
      about: {
        title: 'About AfroPonte',
        intro: 'AfroPonte is a bridge between Africa and Brazil: a directory that helps you find African restaurants, shops, hair salons and tailoring workshops near you.',
        sections: [
          { h: 'Our mission', p: 'To make African and Afro-descendant businesses in Brazil easier to find, and to connect the people who run them with the people looking for them: tourists, students, migrants, business travelers and families.' },
          { h: 'What you can do', p: 'Search for a business by city, category or country of origin, see it on the map, save favorites, leave a review, and write directly to a merchant from the app, without going through WhatsApp.' },
          { h: 'For merchants', p: 'Listing your business is free. Every listing is checked before it is published, and reviews and photos are moderated to keep the directory reliable.' },
          { h: 'A community', p: 'AfroPonte grows with its users: suggest a business that is missing, report wrong information, share your experience.' },
          { h: 'Three languages', p: 'The site is available in French, English and Portuguese.' },
        ],
      },
      contact: {
        title: 'Contact us',
        intro: 'A question, a suggestion, a business to add or a problem to report? Write to us.',
        sections: [
          { h: 'For users', p: 'To contact a merchant, use the in-app messaging from their listing.' },
          { h: 'For merchants', p: 'To list or claim your business, create a merchant account. Need help? Write to us.' },
          { h: 'Report a problem', p: 'An incorrect listing or inappropriate content? Use the report button, or write to us and tell us which page it is on.' },
        ],
      },
      privacy: {
        title: 'Privacy policy',
        intro: 'This page explains what data AfroPonte collects, why, and what your rights are, in line with Brazil’s General Data Protection Law (LGPD, Law No. 13,709/2018).',
        sections: [
          { h: 'Data we collect', p: 'Account: name, email address, password (encrypted), phone number (optional), language and account type. Activity: favorites, reviews, photos and messages exchanged in the app. Location: only if you use “Near me”, to calculate nearby businesses.' },
          { h: 'Why we use it', p: 'To create and secure your account, display the directory, enable messaging, moderate content and improve the service. We do not sell your data.' },
          { h: 'Your messages', p: 'Conversations are private. Only reported conversations may be reviewed by the moderation team, to handle the report.' },
          { h: 'Sharing', p: 'Your data is only shared with the technical providers needed to run the site (hosting, sending emails), or when the law requires it. Reviews and photos you publish are visible to other visitors.' },
          { h: 'Storage on your device', p: 'The site saves your language and your login session in your browser. At this time, it does not use advertising cookies.' },
          { h: 'Retention', p: 'Your data is kept as long as your account is active. You can ask for your account and data to be deleted at any time.' },
          { h: 'Your rights', p: 'You can request access, correction, export or deletion of your data, and withdraw your consent. Write to {{email}}.' },
        ],
      },
      terms: {
        title: 'Terms of use',
        intro: 'By using AfroPonte, you agree to the rules below.',
        sections: [
          { h: 'The service', p: 'AfroPonte is a free directory of African businesses in Brazil, with built-in messaging. We do not sell any product or service ourselves.' },
          { h: 'Your account', p: 'You are responsible for your account and for keeping your password confidential. Give accurate information. An account may be suspended in case of abuse.' },
          { h: 'Merchant listings', p: 'Merchants are responsible for the accuracy of their information (address, opening hours, prices). Each listing is approved by the team before publication, and may be refused or removed if it is false or misleading.' },
          { h: 'Reviews, photos and messages', p: 'Only post honest content that belongs to you and respects others. Insults, harassment, discrimination, illegal content, fake reviews and spam are forbidden. Content may be moderated or removed.' },
          { h: 'Reports', p: 'You can report a listing, a review, a photo or a message. The team reviews them and may suspend the accounts involved.' },
          { h: 'Liability', p: 'Listing information comes from merchants and users: we cannot guarantee that it is always accurate. Exchanges and purchases between users and merchants are made at their own responsibility.' },
          { h: 'Changes', p: 'We may change these terms. The update date is shown at the bottom of the page.' },
        ],
      },
      legal: {
        title: 'Legal notice',
        intro: 'Information about the publisher of the AfroPonte site.',
        sections: [
          { h: 'Publisher', p: 'The site is published by {{owner}}. Contact: {{email}}.' },
          { h: 'Hosting', p: 'The site is hosted by a web hosting provider; its details are available on request at {{email}}.' },
          { h: 'Intellectual property', p: 'The AfroPonte name, logo, site design and texts are protected. Photos and texts published by users and merchants remain their property; by publishing them, they allow AfroPonte to display them on the site.' },
          { h: 'Personal data', p: 'The processing of your data is described in the privacy policy.' },
          { h: 'Report content', p: 'To report unlawful content, use the report button or write to {{email}}.' },
        ],
      },
    },
  },

  pt: {
    footer: {
      colExplore: 'Explorar',
      colMerchants: 'Comerciantes',
      colSite: 'AfroPonte',
      about: 'Sobre',
      contact: 'Contato',
      privacy: 'Privacidade',
      terms: 'Termos de uso',
      legal: 'Informações legais',
      backToTop: 'Voltar ao topo',
      whatsapp: 'WhatsApp',
    },
    pages: {
      backHome: 'Voltar ao início',
      updated: 'Última atualização: {{date}}',
      toComplete: '(a completar)',
      contactEmail: 'Enviar um e-mail',
      contactWhatsapp: 'Escrever no WhatsApp',
      about: {
        title: 'Sobre a AfroPonte',
        intro: 'A AfroPonte é uma ponte entre a África e o Brasil: um guia que ajuda a encontrar, perto de você, restaurantes, lojas, salões de cabeleireiro e ateliês de costura africanos.',
        sections: [
          { h: 'Nossa missão', p: 'Dar visibilidade aos negócios africanos e afrodescendentes do Brasil e aproximar quem os mantém de quem os procura: turistas, estudantes, imigrantes, empresários e famílias.' },
          { h: 'O que você pode fazer', p: 'Buscar um negócio por cidade, categoria ou país de origem, vê-lo no mapa, salvar seus favoritos, deixar uma avaliação e escrever diretamente ao comerciante pelo aplicativo, sem passar pelo WhatsApp.' },
          { h: 'Para comerciantes', p: 'Divulgar seu negócio é gratuito. Cada cadastro é verificado antes da publicação, e as avaliações e fotos são moderadas para manter o guia confiável.' },
          { h: 'Uma comunidade', p: 'A AfroPonte cresce com seus usuários: sugira um negócio que está faltando, avise sobre uma informação errada, compartilhe sua experiência.' },
          { h: 'Três idiomas', p: 'O site está disponível em francês, inglês e português.' },
        ],
      },
      contact: {
        title: 'Fale conosco',
        intro: 'Uma dúvida, uma sugestão, um negócio para adicionar ou um problema para comunicar? Escreva para nós.',
        sections: [
          { h: 'Para usuários', p: 'Para falar com um comerciante, use as mensagens do aplicativo a partir do cadastro dele.' },
          { h: 'Para comerciantes', p: 'Para cadastrar ou reivindicar seu negócio, crie uma conta de comerciante. Precisa de ajuda? Escreva para nós.' },
          { h: 'Comunicar um problema', p: 'Um cadastro incorreto ou um conteúdo inadequado? Use o botão de denúncia ou escreva para nós indicando a página.' },
        ],
      },
      privacy: {
        title: 'Política de privacidade',
        intro: 'Esta página explica quais dados a AfroPonte coleta, por quê, e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).',
        sections: [
          { h: 'Dados que coletamos', p: 'Conta: nome, e-mail, senha (criptografada), telefone (opcional), idioma e tipo de conta. Uso: favoritos, avaliações, fotos e mensagens trocadas no aplicativo. Localização: somente se você usar “Perto de mim”, para calcular os negócios próximos.' },
          { h: 'Por que os usamos', p: 'Para criar e proteger sua conta, exibir o guia, permitir as mensagens, moderar conteúdos e melhorar o serviço. Não vendemos seus dados.' },
          { h: 'Suas mensagens', p: 'As conversas são privadas. Somente conversas denunciadas podem ser analisadas pela equipe de moderação, para tratar a denúncia.' },
          { h: 'Compartilhamento', p: 'Seus dados só são compartilhados com os prestadores técnicos necessários ao funcionamento do site (hospedagem, envio de e-mails) ou quando a lei exigir. As avaliações e fotos que você publica ficam visíveis para os outros visitantes.' },
          { h: 'Armazenamento no seu aparelho', p: 'O site guarda no seu navegador o idioma e a sessão de login. Atualmente, não usa cookies de publicidade.' },
          { h: 'Tempo de armazenamento', p: 'Seus dados são mantidos enquanto sua conta estiver ativa. Você pode pedir a exclusão da conta e dos dados a qualquer momento.' },
          { h: 'Seus direitos', p: 'Você pode pedir acesso, correção, exportação ou exclusão dos seus dados e retirar seu consentimento. Escreva para {{email}}.' },
        ],
      },
      terms: {
        title: 'Termos de uso',
        intro: 'Ao usar a AfroPonte, você aceita as regras abaixo.',
        sections: [
          { h: 'O serviço', p: 'A AfroPonte é um guia gratuito de negócios africanos no Brasil, com mensagens integradas. Nós mesmos não vendemos nenhum produto ou serviço.' },
          { h: 'Sua conta', p: 'Você é responsável pela sua conta e pela confidencialidade da sua senha. Informe dados corretos. Uma conta pode ser suspensa em caso de abuso.' },
          { h: 'Cadastros de comerciantes', p: 'Os comerciantes são responsáveis pela exatidão das informações (endereço, horários, preços). Cada cadastro é aprovado pela equipe antes da publicação e pode ser recusado ou removido se for falso ou enganoso.' },
          { h: 'Avaliações, fotos e mensagens', p: 'Publique apenas conteúdos honestos, que lhe pertencem e respeitam os outros. São proibidos: insultos, assédio, discriminação, conteúdos ilegais, avaliações falsas e spam. Os conteúdos podem ser moderados ou removidos.' },
          { h: 'Denúncias', p: 'Você pode denunciar um cadastro, uma avaliação, uma foto ou uma mensagem. A equipe analisa e pode suspender as contas envolvidas.' },
          { h: 'Responsabilidade', p: 'As informações dos cadastros vêm dos comerciantes e dos usuários: não podemos garantir que estejam sempre corretas. As trocas e compras entre usuários e comerciantes são feitas sob responsabilidade deles.' },
          { h: 'Alterações', p: 'Podemos alterar estes termos. A data de atualização aparece no fim da página.' },
        ],
      },
      legal: {
        title: 'Informações legais',
        intro: 'Informações sobre o responsável pelo site AfroPonte.',
        sections: [
          { h: 'Responsável', p: 'O site é publicado por {{owner}}. Contato: {{email}}.' },
          { h: 'Hospedagem', p: 'O site é hospedado por um prestador de hospedagem web; os dados dele são fornecidos mediante solicitação a {{email}}.' },
          { h: 'Propriedade intelectual', p: 'O nome AfroPonte, o logotipo, o design do site e seus textos são protegidos. As fotos e textos publicados por usuários e comerciantes continuam sendo deles; ao publicá-los, eles autorizam a AfroPonte a exibi-los no site.' },
          { h: 'Dados pessoais', p: 'O tratamento dos seus dados está descrito na política de privacidade.' },
          { h: 'Denunciar um conteúdo', p: 'Para denunciar um conteúdo ilícito, use o botão de denúncia ou escreva para {{email}}.' },
        ],
      },
    },
  },
};

for (const lang of Object.keys(T)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  fs.copyFileSync(file, file + '.bak');
  data.footer = { ...(data.footer || {}), ...T[lang].footer };
  data.pages = T[lang].pages;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${lang}.json : footer et pages ajoutés (sauvegarde : ${lang}.json.bak)`);
}
