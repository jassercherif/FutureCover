public without sharing class ReimbursementsController {
    @AuraEnabled(cacheable=true)
    public static List<Reimbursement_Request__c> getReimbursementsForCurrentUser() {
        // Récupérer l'utilisateur courant
        User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

        // Vérifier s'il y a un contact lié
        if (currentUser.ContactId == null) {
            return new List<Reimbursement_Request__c>();
        }

        // Récupérer les remboursements liés au contact
        return [
            SELECT Id, Name, Amount__c, Status__c, Date__c,	Mode__c,Frequency__c,Type__c,Pack__c,Contact__c,Fraud_Score__c,Fraud_Details__c	
            FROM Reimbursement_Request__c
            WHERE Contact__c = :currentUser.ContactId
            ORDER BY Date__c DESC
        ];
    }
    @AuraEnabled(cacheable=true)
public static Id getCurrentUserContactId() {
    User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    return currentUser.ContactId;
}


    @AuraEnabled(cacheable=true)
public static Reimbursement_Request__c getLastReimbursementForCurrentUser() {
    // Récupérer l'utilisateur courant
    User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    
    // Vérifier que l'utilisateur a bien un Contact
    if (currentUser.ContactId == null) {
        return null;
    }
    
    // Récupérer la dernière demande de remboursement liée à ce Contact
    List<Reimbursement_Request__c> reimbursements = [
        SELECT Id, Name, Amount__c, Status__c, Date__c,  Frequency__c,Mode__c, Type__c, Pack__c, Contact__c
        FROM Reimbursement_Request__c
        WHERE Contact__c = :currentUser.ContactId
        ORDER BY Date__c DESC
        LIMIT 1
    ];
    
    // Retourner la dernière demande si elle existe
    if (!reimbursements.isEmpty()) {
        return reimbursements[0];
    } else {
        return null;
    }
}
@AuraEnabled
public static void uploadFileToLastReimbursement(String base64Data, String fileName) {
    if (String.isBlank(base64Data) || String.isBlank(fileName)) {
        throw new AuraHandledException('Missing required information.');
    }

    // Récupérer la dernière demande
    Reimbursement_Request__c lastReimbursement = getLastReimbursementForCurrentUser();

    if (lastReimbursement == null) {
        throw new AuraHandledException('No reimbursement request found for the current user.');
    }

    // Utiliser son Id pour l'upload
    uploadFileToReimbursement(lastReimbursement.Id, base64Data, fileName);
}

    @AuraEnabled
    public static void uploadFileToReimbursement(Id reimbursementId, String base64Data, String fileName) {
        if (String.isBlank(reimbursementId) || String.isBlank(base64Data) || String.isBlank(fileName)) {
            throw new AuraHandledException('Missing required information.');
        }
    
        Attachment attachment = new Attachment();
        attachment.ParentId = reimbursementId;
        attachment.Name = fileName;
        attachment.Body = EncodingUtil.base64Decode(base64Data);
        attachment.ContentType = 'application/octet-stream';
    
        insert attachment;
    }
   
    
   

    @AuraEnabled
    public static String createReimbursement(
        String Name,
        Decimal amount,
        Date reimbursementDate,
        String description,
        String mode,
       String status,
        String pack,
        String fileName,
       // Blob fileBody,
        String type
    ) {
        try {
            // Récupérer l'utilisateur courant et son Contact associé
            User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            
            if (currentUser.ContactId == null) {
                return 'Erreur : Aucun contact lié à cet utilisateur.';
            }

            // Création de la demande de remboursement
            Reimbursement_Request__c newRequest = new Reimbursement_Request__c(
                Name = Name,
                Amount__c = amount,
                Date__c = reimbursementDate,
                Description__c = description,
                Status__c = status,
                //Has_valid_receipt__c = hasValidReceipt,
                Pack__c = pack,
                Mode__c = mode,
                Type__c = type,
                Contact__c = currentUser.ContactId
            );
        
            insert newRequest;
         
    
            return 'Demande de remboursement créée avec succès';
        } catch (Exception e) {
            return 'Erreur lors de la création : ' + e.getMessage();
        }
    }
    @AuraEnabled
public static void uploadFileToCurrentUserContact(String base64Data, String fileName) {
    if (String.isBlank(base64Data) || String.isBlank(fileName)) {
        throw new AuraHandledException('Missing required information.');
    }

    // Récupérer l'utilisateur courant
    User currentUser = [SELECT Id, ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];

    if (currentUser.ContactId == null) {
        throw new AuraHandledException('No contact associated with the current user.');
    }

    // Uploader le fichier
    uploadFileToRecord(currentUser.ContactId, base64Data, fileName);
}
public static void uploadFileToRecord(Id recordId, String base64Data, String fileName) {
    // Créer le document
    ContentVersion contentVersion = new ContentVersion();
    contentVersion.Title = fileName;
    contentVersion.PathOnClient = fileName;
    contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
    insert contentVersion;

    // Récupérer l'Id du ContentDocument
    ContentVersion insertedVersion = [
        SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1
    ];

    // Lier le fichier au Contact
    ContentDocumentLink link = new ContentDocumentLink();
    link.ContentDocumentId = insertedVersion.ContentDocumentId;
    link.LinkedEntityId = recordId;
    link.ShareType = 'V'; // Viewer
    link.Visibility = 'AllUsers';
    insert link;
}

    @AuraEnabled(cacheable=true)
public static Decimal getCoverageLimitForCurrentUser() {
    User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    
    if (currentUser.ContactId == null) {
        throw new AuraHandledException('Utilisateur sans contact lié');
    }

    Contact contact = [SELECT Id, Coverage_Limit__c FROM Contact WHERE Id = :currentUser.ContactId LIMIT 1];
    return contact.Coverage_Limit__c;
}
@AuraEnabled
public static String getJustificatifDownloadUrl(Id remboursementId) {
    try {
        String baseUrl = URL.getOrgDomainUrl().toExternalForm();

        // 1. Vérifier les Attachments legacy (non public)
        List<Attachment> attachments = [
            SELECT Id, Name 
            FROM Attachment 
            WHERE ParentId = :remboursementId
            ORDER BY CreatedDate DESC 
            LIMIT 1
        ];
        if (!attachments.isEmpty()) {
            // Attention, ce lien nécessite login Salesforce
            return baseUrl + '/servlet/servlet.FileDownload?file=' + attachments[0].Id;
        }

        // 2. Chercher les fichiers Salesforce (ContentDocument)
        List<ContentDocumentLink> links = [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :remboursementId
            LIMIT 1
        ];
        if (!links.isEmpty()) {
            List<ContentVersion> versions = [
                SELECT Id, Title
                FROM ContentVersion
                WHERE ContentDocumentId = :links[0].ContentDocumentId
                AND IsLatest = true
                LIMIT 1
            ];

            if (!versions.isEmpty()) {
                // Vérifier si un ContentDistribution public existe déjà
                List<ContentDistribution> existingDistributions = [
                    SELECT Id, DistributionPublicUrl
                    FROM ContentDistribution
                    WHERE ContentVersionId = :versions[0].Id
                    LIMIT 1
                ];
                if (!existingDistributions.isEmpty()) {
                    return existingDistributions[0].DistributionPublicUrl;
                } else {
                    // Sinon, créer un lien public (ContentDistribution)
                    ContentDistribution cd = new ContentDistribution();
                    cd.Name = 'Lien public pour ' + versions[0].Title;
                    cd.ContentVersionId = versions[0].Id;
                    cd.PreferencesAllowOriginalDownload = true;
                    insert cd;
                    return cd.DistributionPublicUrl;
                }
            }
        }

        throw new AuraHandledException('Aucun justificatif trouvé (ni dans Notes & Attachments ni dans Files)');
    } catch (Exception e) {
        throw new AuraHandledException('Erreur technique: ' + e.getMessage());
    }
}



    @AuraEnabled(cacheable=true)
    public static List<Reimbursement_Request__c> getAllReimbursements() {
        return [
            SELECT Id, Name, Amount__c, Status__c, Date__c, Mode__c, Frequency__c, Type__c, Pack__c, Contact__c, Contact__r.Name,
                   Fraud_Score__c, Fraud_Details__c
            FROM Reimbursement_Request__c
            ORDER BY Date__c DESC
        ];
    }
        @AuraEnabled(cacheable=true)
        public static Reimbursement_Request__c getReimbursementById(Id recordId) {
            return [
                SELECT Id, Name, Amount__c, Status__c, Date__c, Mode__c, Frequency__c, Type__c, Pack__c, Contact__c,
                       Fraud_Score__c, Fraud_Details__c
                FROM Reimbursement_Request__c
                WHERE Id = :recordId
                LIMIT 1
            ];
        }
    
    







}