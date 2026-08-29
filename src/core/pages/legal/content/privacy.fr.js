export default {
  title: "Politique de confidentialité",
  intro:
    "Cette page décrit exactement ce que {entity} collecte, pourquoi, où c'est traité et combien de temps c'est conservé. Elle décrit le fonctionnement réel de l'application, pas une intention.",
  sections: [
    {
      id: "responsable",
      heading: "1. Qui traite vos données",
      body: [
        "{entity} est responsable du traitement des renseignements personnels décrits ici. Pour toute question ou demande, écrivez à {email}.",
      ],
    },
    {
      id: "collecte",
      heading: "2. Ce que nous collectons",
      body: ["Uniquement ce qui est nécessaire pour faire fonctionner le service :"],
      groups: [
        {
          label: "Votre compte",
          items: [
            "prénom, nom (facultatif) et adresse courriel ;",
            "empreinte de votre mot de passe, jamais le mot de passe lui-même ;",
            "photo de profil, si vous en ajoutez une ;",
            "devise d'affichage ;",
            "identifiant de compte Google, uniquement si vous choisissez cette méthode de connexion ;",
            "dates de création et de dernière modification du compte.",
          ],
        },
        {
          label: "Ce que vous saisissez",
          items: [
            "vos abonnements et factures : intitulé, catégorie, montant, fréquence, dates de début et de fin, notes ;",
            "les échéances générées : date, montant, statut payé ou ignoré, date de règlement ;",
            "vos préférences de rappel.",
          ],
        },
        {
          label: "Sécurité et session",
          items: [
            "empreintes des codes de vérification, de réinitialisation et de changement d'adresse, avec leur date d'expiration ;",
            "compteurs de tentatives et d'envois, pour limiter les abus ;",
            "empreintes des jetons de session, avec leur date d'expiration.",
          ],
        },
      ],
    },
    {
      id: "jamais",
      heading: "3. Ce que nous ne collectons pas",
      body: ["Cette liste est aussi importante que la précédente."],
      list: [
        "Aucune connexion bancaire. L'application ne se relie à aucune institution financière.",
        "Aucune donnée de carte ni de paiement.",
        "Aucun traceur publicitaire, aucun pixel tiers, aucune régie. La seule mesure est un comptage de pages sans témoin, décrit plus bas.",
        "Aucune donnée de géolocalisation.",
        "Aucun profilage et aucune décision automatisée vous concernant.",
      ],
    },
    {
      id: "finalites",
      heading: "4. Pourquoi nous les traitons",
      list: [
        "Créer et gérer votre compte, et vérifier votre adresse courriel.",
        "Afficher vos abonnements et vos factures, et calculer vos totaux.",
        "Vous envoyer les rappels d'échéance que vous avez activés.",
        "Vous envoyer les courriels indispensables au compte : vérification, réinitialisation de mot de passe, changement d'adresse.",
        "Protéger le service contre les accès non autorisés et les abus.",
      ],
      after: [
        "Ces traitements sont nécessaires à l'exécution du service que vous demandez. Les rappels dépendent en plus de votre choix, que vous pouvez retirer à tout moment.",
      ],
    },
    {
      id: "cookies",
      heading: "5. Témoins et stockage local",
      body: [
        "Un seul témoin est déposé : celui qui maintient votre session ouverte. Il est inaccessible au JavaScript de la page et sert uniquement à renouveler votre connexion.",
        "Votre navigateur conserve également, en local, votre jeton d'accès ainsi que vos préférences de thème et de langue. Ces informations ne quittent pas votre appareil autrement que pour vous authentifier.",
        "La mesure d'audience se limite à un comptage de pages vues, assuré par l'hébergeur du site. Elle ne dépose aucun témoin et ne conserve aucun identifiant dans votre navigateur : c'est ce qui explique l'absence de bandeau de consentement.",
      ],
    },
    {
      id: "prestataires",
      heading: "6. Les prestataires qui interviennent",
      body: ["Nous faisons appel à un nombre volontairement réduit de sous-traitants :"],
      groups: [
        {
          label: "Envoi des courriels",
          items: [
            "Un service d'expédition reçoit votre adresse courriel et le contenu du message pour l'acheminer. Il ne reçoit ni vos montants ni vos notes, à l'exception de ce qui figure dans un rappel : le nom de la ligne, le montant et la date d'échéance.",
          ],
        },
        {
          label: "Stockage des photos de profil",
          items: [
            "Un service de stockage d'objets héberge uniquement la photo que vous téléversez.",
          ],
        },
        {
          label: "Connexion Google",
          items: [
            "Uniquement si vous utilisez ce mode de connexion. Google nous transmet alors votre adresse courriel, votre nom et votre photo. Nous ne recevons jamais votre mot de passe Google.",
          ],
        },
        {
          label: "Hébergement",
          items: [
            "Le serveur et la base de données sont hébergés chez un fournisseur d'infrastructure, où reposent vos données au repos.",
          ],
        },
        {
          label: "Mesure d'audience",
          items: [
            "L'hébergeur du site compte les pages vues afin que nous sachions ce qui est consulté. Il reçoit l'adresse de la page, la provenance et le type d'appareil. Aucun témoin n'est déposé, aucun identifiant n'est conservé dans votre navigateur, et cette mesure n'est jamais rattachée à votre compte.",
          ],
        },
      ],
      after: [
        "Nous ne vendons, ne louons et n'échangeons vos renseignements avec personne d'autre.",
      ],
    },
    {
      id: "conservation",
      heading: "7. Combien de temps",
      list: [
        "Compte et contenu : tant que votre compte existe.",
        "Codes de vérification et de réinitialisation : quelques minutes, puis ils expirent.",
        "Jetons de session : jusqu'à leur expiration ou leur révocation, à la déconnexion par exemple.",
        "Après suppression du compte : les données sont effacées, y compris vos abonnements, vos factures et leurs échéances.",
      ],
    },
    {
      id: "droits",
      heading: "8. Vos droits",
      body: ["Vous pouvez à tout moment :"],
      list: [
        "consulter et corriger vos renseignements depuis vos réglages ;",
        "supprimer votre compte et l'ensemble des données associées ;",
        "désactiver les rappels, individuellement ou globalement ;",
        "demander une copie de vos renseignements en écrivant à {email} ;",
        "porter plainte auprès de l'autorité de protection des renseignements personnels de votre territoire.",
      ],
    },
    {
      id: "securite",
      heading: "9. Comment c'est protégé",
      list: [
        "Les mots de passe sont hachés avec un algorithme conçu pour résister aux attaques par force brute. Ils ne sont jamais stockés en clair ni réversibles.",
        "Les codes à usage unique et les jetons de session sont stockés sous forme d'empreintes, jamais en clair.",
        "Les échanges avec le serveur passent par une connexion chiffrée.",
        "Le témoin de session est inaccessible au JavaScript, ce qui limite les vols de session.",
        "Aucun système n'est infaillible. En cas d'incident touchant vos renseignements, nous vous en informons ainsi que l'autorité compétente lorsque la loi l'exige.",
      ],
    },
    {
      id: "transferts",
      heading: "10. Traitements hors du territoire",
      body: [
        "Certains prestataires peuvent traiter ou stocker des données à l'extérieur du {jurisdiction}. Dans ce cas, nous nous assurons qu'un niveau de protection adéquat est en place, par contrat ou par les engagements du fournisseur.",
      ],
    },
    {
      id: "mineurs",
      heading: "11. Mineurs",
      body: [
        "Le service ne s'adresse pas aux enfants de moins de 14 ans. Si nous apprenons qu'un compte a été créé par un enfant en deçà de cet âge, nous le supprimons.",
      ],
    },
    {
      id: "changements",
      heading: "12. Modifications",
      body: [
        "Toute modification importante de cette politique vous sera signalée par courriel ou dans l'application avant son entrée en vigueur. La date de dernière mise à jour figure en haut de cette page.",
      ],
    },
  ],
};
