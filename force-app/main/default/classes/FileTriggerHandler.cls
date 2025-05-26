public class FileTriggerHandler {
    public static void moveContactFilesToReimbursement(List<Reimbursement_Request__c> newRequests) {
        if (newRequests.isEmpty()) return;

        // Récupérer les UserIds liés à chaque reimbursement request (si tu as un champ UserId ou ContactId dans Reimbursement_Request__c)
        Set<Id> userIds = new Set<Id>();
        for (Reimbursement_Request__c req : newRequests) {
            // Ici on suppose que tu as un champ OwnerId (utilisateur) ou Contact__c
            if (req.OwnerId != null) userIds.add(req.OwnerId);
            // Ou si tu as un champ Contact__c sur la reimbursement request
            // if (req.Contact__c != null) contactIds.add(req.Contact__c);
        }

        if (userIds.isEmpty()) return;

        // Récupérer les Contacts liés aux Users
        Map<Id, Id> userIdToContactId = new Map<Id, Id>();
        for (User u : [SELECT Id, ContactId FROM User WHERE Id IN :userIds]) {
            if (u.ContactId != null) userIdToContactId.put(u.Id, u.ContactId);
        }

        // Récupérer les fichiers liés aux contacts
        Set<Id> contactIds = new Set<Id>(userIdToContactId.values());
        if (contactIds.isEmpty()) return;

        List<ContentDocumentLink> contactFiles = [
            SELECT Id, ContentDocumentId, LinkedEntityId, ContentDocument.LatestPublishedVersion.CreatedDate
            FROM ContentDocumentLink
            WHERE LinkedEntityId IN :contactIds
            ORDER BY ContentDocument.LatestPublishedVersion.CreatedDate DESC
        ];

        if (contactFiles.isEmpty()) return;

        // Pour chaque reimbursement request, on associe le dernier fichier du contact lié
        List<ContentDocumentLink> linksToDelete = new List<ContentDocumentLink>();
        List<ContentDocumentLink> linksToInsert = new List<ContentDocumentLink>();

        for (Reimbursement_Request__c req : newRequests) {
    Id contactId = userIdToContactId.get(req.OwnerId);
    if (contactId == null) continue;

    // Chercher le fichier le plus récent du contact
    ContentDocumentLink fileToMove;
    for (ContentDocumentLink cdl : contactFiles) {
        if (cdl.LinkedEntityId == contactId) {
            fileToMove = cdl;
            break;
        }
    }
    if (fileToMove == null) continue;

    // Supprimer lien actuel
    linksToDelete.add(fileToMove);

    // Créer nouveau lien vers reimbursement request
    ContentDocumentLink newLink = new ContentDocumentLink();
    newLink.ContentDocumentId = fileToMove.ContentDocumentId;
    newLink.LinkedEntityId = req.Id;
    newLink.ShareType = 'V';
    newLink.Visibility = 'AllUsers';
    linksToInsert.add(newLink);

    // Supprimer le fichier de la liste pour ne pas le réutiliser plusieurs fois
    Integer indexToRemove = -1;
    for (Integer i = 0; i < contactFiles.size(); i++) {
        if (contactFiles[i].Id == fileToMove.Id) {
            indexToRemove = i;
            break;
        }
    }
    if (indexToRemove != -1) {
        contactFiles.remove(indexToRemove);
    }
}


        if (!linksToDelete.isEmpty()) {
            delete linksToDelete;
        }
        if (!linksToInsert.isEmpty()) {
            insert linksToInsert;
        }
    }
}
