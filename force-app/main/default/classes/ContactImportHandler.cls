public class ContactImportHandler {
    public static void processContactsFromAttachment(Id oppId) {
        try {
            // 1. Récupération de l'opportunité
            Opportunity opp = [
                SELECT Id, Name, StageName, AccountId
                FROM Opportunity
                WHERE Id = :oppId
                LIMIT 1
            ];

            // 2. Vérification du stade de l'opportunité
            if (opp.StageName != 'Closed Won') {
                System.debug('L\'opportunité n\'est pas au stade "Closed Won". Traitement annulé.');
                return;
            }

            // 3. Vérification du compte associé
            Id accountId = opp.AccountId;
            if (accountId == null) {
                System.debug('Aucun compte associé à cette opportunité.');
                return;
            }

            // 4. Récupération des pièces jointes
            List<Attachment> attachments = [
                SELECT Id, Name, Body
                FROM Attachment
                WHERE ParentId = :oppId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];

            if (attachments.isEmpty()) {
                System.debug('Aucune pièce jointe trouvée.');
                return;
            }

            Attachment csvFile = attachments[0];

            // 5. Vérification que c'est bien un CSV
            if (!csvFile.Name.toLowerCase().endsWith('.csv')) {
                System.debug('Le fichier n\'est pas un CSV.');
                return;
            }

            // 6. Lecture du contenu du fichier
            String content = csvFile.Body.toString();
            if (String.isBlank(content)) {
                System.debug('Le fichier CSV est vide.');
                return;
            }

            // 7. Séparation des lignes
            List<String> lines = content.split('\\r?\\n');
            if (lines.isEmpty()) {
                System.debug('Aucune donnée dans le fichier CSV.');
                return;
            }

            // 8. Détection du séparateur
            String delimiter = lines[0].contains(';') ? ';' : ',';

            // 9. Détection de l'en-tête
            Boolean hasHeader = lines[0].toLowerCase().contains('firstname') &&
                              lines[0].toLowerCase().contains('lastname') &&
                              lines[0].toLowerCase().contains('email');
           
            Integer startIndex = hasHeader ? 1 : 0;
            List<Contact> newContacts = new List<Contact>();

            // 10. Traitement ligne par ligne
            for (Integer i = startIndex; i < lines.size(); i++) {
                try {
                    if (String.isBlank(lines[i])) continue;

                    List<String> columns = lines[i].split(delimiter, -1); // -1 pour garder les valeurs vides

                    // Vérification du nombre minimal de colonnes
                    if (columns.size() < 5) {
                        System.debug('Ligne ' + (i+1) + ' ignorée - nombre de colonnes insuffisant: ' + lines[i]);
                        continue;
                    }

                    String firstName = columns[0].trim();
                    String lastName = columns[1].trim();
                    String email = columns[2].trim().toLowerCase(); // Normaliser l'email en minuscules
                    String phone = columns[3].trim();
                    String title = columns[4].trim();

                    // Validation des champs obligatoires
                    if (String.isBlank(lastName)) {
                        System.debug('Ligne ' + (i+1) + ' ignorée - LastName est obligatoire');
                        continue;
                    }
                    
                    if (String.isBlank(email) || !email.contains('@')) {
                        System.debug('Ligne ' + (i+1) + ' ignorée - Email est invalide');
                        continue;
                    }

                    // 11. Création du contact
                    Contact newContact = new Contact(
                        FirstName = firstName,
                        LastName = lastName,
                        Email = email,
                        Phone = phone,
                        Title = title,
                        AccountId = accountId,
                        Level__c = 'Tertiary'
                    );

                    newContacts.add(newContact);

                    // 12. Récupération des produits associés à l'opportunité
                    List<OpportunityLineItem> opportunityProducts = [
                        SELECT Product2.Coverage_Limit__c, Product2.Reimbursement_Base__c, Product2.Reimbursement_Rate__c
                        FROM OpportunityLineItem
                        WHERE OpportunityId = :oppId
                    ];

                    if (!opportunityProducts.isEmpty()) {
                        OpportunityLineItem oppProduct = opportunityProducts[0]; // Prendre le premier produit associé
                        
                        // Mettre à jour les informations dans le Contact ou un autre objet lié (Reimbursement_Request__c)
                        newContact.Coverage_Limit__c = oppProduct.Product2.Coverage_Limit__c;
                        newContact.Reimbursement_Base__c = oppProduct.Product2.Reimbursement_Base__c;
                        newContact.Reimbursement_Rate__c = oppProduct.Product2.Reimbursement_Rate__c;
                    }

                } catch (Exception e) {
                    System.debug('Erreur ligne ' + (i+1) + ': ' + e.getMessage());
                }
            }

            // 13. Insertion des contacts
            if (!newContacts.isEmpty()) {
                Database.SaveResult[] results = Database.insert(newContacts, false);
                
                // Log des erreurs d'insertion
                for (Integer j = 0; j < results.size(); j++) {
                    if (!results[j].isSuccess()) {
                        System.debug('Erreur création contact ' + newContacts[j].FirstName + ' ' +
                                   newContacts[j].LastName + ': ' +
                                   results[j].getErrors()[0].getMessage());
                    }
                }
                
                // Filtrer les contacts créés avec succès
                List<Contact> successfullyCreatedContacts = new List<Contact>();
                for (Integer j = 0; j < results.size(); j++) {
                    if (results[j].isSuccess()) {
                        successfullyCreatedContacts.add(newContacts[j]);
                    }
                }
                
                // 14. Création des utilisateurs seulement pour les contacts créés avec succès
                if (!successfullyCreatedContacts.isEmpty()) {
                    createUsersForContacts(successfullyCreatedContacts);
                } else {
                    System.debug('Aucun contact créé avec succès, donc aucun utilisateur à créer.');
                }
            } else {
                System.debug('Aucun contact valide à créer.');
            }

        } catch (Exception e) {
            System.debug('Erreur globale: ' + e.getMessage() +
                       '\nStack Trace: ' + e.getStackTraceString());
        }
    }

    // Méthode séparée pour la création des utilisateurs
    private static void createUsersForContacts(List<Contact> contacts) {
        if (contacts == null || contacts.isEmpty()) return;

        // Récupération du profil
        List<Profile> profiles = [SELECT Id FROM Profile WHERE Name = 'Insured' LIMIT 1];
        if (profiles.isEmpty()) {
            System.debug('Profil Insured non trouvé');
            return;
        }
        Id profileId = profiles[0].Id;
        
        // Vérifier si l'organisation a des licences disponibles
        List<PermissionSetLicenseAssign> availableLicenses = [SELECT Id FROM PermissionSetLicenseAssign 
                                                           WHERE PermissionSetLicenseId IN 
                                                           (SELECT Id FROM PermissionSetLicense WHERE DeveloperName = 'Customer_Community')];
        if (availableLicenses.isEmpty()) {
            System.debug('Aucune licence disponible pour créer des utilisateurs Insured');
            return;
        }

        List<User> newUsers = new List<User>();
        String orgIdentifier = UserInfo.getOrganizationId().substring(0, 8);
        
        for (Contact c : contacts) {
            if (String.isBlank(c.Email) || c.Id == null) continue;

            try {
                String alias = (c.FirstName != null && c.FirstName.length() >= 2 ?
                              c.FirstName.substring(0, 2) : 'us') +
                             (c.LastName != null && c.LastName.length() >= 2 ?
                              c.LastName.substring(0, 2) : 'er');
                
                // Créer un nom d'utilisateur unique mais stable
                String username = c.Email.split('@')[0] + '.' + orgIdentifier + '@' + c.Email.split('@')[1];
                username = username.toLowerCase(); // Les noms d'utilisateur sont sensibles à la casse
                
                // Vérifier si l'utilisateur existe déjà
                List<User> existingUsers = [SELECT Id FROM User WHERE Username = :username LIMIT 1];
                if (!existingUsers.isEmpty()) {
                    System.debug('Utilisateur existe déjà pour l\'email: ' + c.Email);
                    continue;
                }

                newUsers.add(new User(
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    Username = username,
                    CommunityNickname = (c.FirstName + c.LastName).left(40), // Doit être unique et <= 40 chars
                    Alias = alias.left(8),
                    TimeZoneSidKey = 'Europe/Paris',
                    LocaleSidKey = 'fr_FR',
                    EmailEncodingKey = 'UTF-8',
                    LanguageLocaleKey = 'fr',
                    ProfileId = profileId,
                    ContactId = c.Id,
                    IsActive = true
                ));
            } catch (Exception e) {
                System.debug('Erreur création utilisateur pour contact ' + c.Id + ': ' + e.getMessage());
            }
        }

        // Insertion des utilisateurs
        if (!newUsers.isEmpty()) {
            Database.SaveResult[] userResults = Database.insert(newUsers, false);
            for (Integer i = 0; i < userResults.size(); i++) {
                if (!userResults[i].isSuccess()) {
                    System.debug('Erreur création utilisateur ' + newUsers[i].Email + ': ' +
                               userResults[i].getErrors()[0].getMessage());
                } else {
                    System.debug('Utilisateur créé avec succès: ' + newUsers[i].Username);
                }
            }
        } else {
            System.debug('Aucun utilisateur valide à créer.');
        }
}}
