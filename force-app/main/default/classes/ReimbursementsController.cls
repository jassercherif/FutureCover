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
            SELECT Id, Name, Amount__c, Status__c, Date__c,	Has_valid_receipt__c,Frequency__c,Type__c,Pack__c,Contact__c,Supporting_Documents__c	
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

@AuraEnabled
    public static void uploadFileToContact(Id contactId, String base64Data, String fileName) {
        if (String.isBlank(contactId) || String.isBlank(base64Data) || String.isBlank(fileName)) {
            throw new AuraHandledException('Missing required information.');
        }
    
        Attachment attachment = new Attachment();
        attachment.ParentId = contactId;
        attachment.Name = fileName;
        attachment.Body = EncodingUtil.base64Decode(base64Data);
        attachment.ContentType = 'application/octet-stream';
    
        insert attachment;

        Contact oppToUpdate = [SELECT Id, Fax FROM Contact WHERE Id = :contactId LIMIT 1];
        oppToUpdate.Fax = '+33 1 45 67 89 01';
        update oppToUpdate;
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
        SELECT Id, Name, Amount__c, Status__c, Date__c, Has_valid_receipt__c, Frequency__c, Type__c, Pack__c, Contact__c, Supporting_Documents__c
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

        /*Contact oppToUpdate = [SELECT Id, Fax FROM Contact WHERE Id = :contactId LIMIT 1];
        oppToUpdate.Fax = '+33 1 45 67 89 01';
        update oppToUpdate;*/
    }

    @AuraEnabled
    public static String createReimbursement(
        String Name,
        Decimal amount,
        Date reimbursementDate,
        String description,
       // Boolean hasValidReceipt,
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
                
                Type__c = type,
                Contact__c = currentUser.ContactId
            );
        
            insert newRequest;
         
    
            return 'Demande de remboursement créée avec succès';
        } catch (Exception e) {
            return 'Erreur lors de la création : ' + e.getMessage();
        }
    }


}
