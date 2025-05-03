trigger ReimbursementLimitUpdate on Reimbursement_Request__c (after update) {
    Set<Id> contactIds = new Set<Id>();

    // Étape 1 : collecter les Id des contacts concernés
    for (Reimbursement_Request__c req : Trigger.new) {
        Reimbursement_Request__c oldReq = Trigger.oldMap.get(req.Id);
        if (
            req.Status__c == 'Approved' &&
            oldReq.Status__c != 'Approved' &&
            req.Contact__c != null
        ) {
            contactIds.add(req.Contact__c);
        }
    }

    if (contactIds.isEmpty()) return;

    // Étape 2 : récupérer les contacts avec les champs nécessaires
    Map<Id, Contact> contactsMap = new Map<Id, Contact>(
        [SELECT Id, Coverage_Limit__c, Reimbursement_Base__c, Reimbursement_Rate__c
         FROM Contact WHERE Id IN :contactIds]
    );

    List<Contact> contactsToUpdate = new List<Contact>();

    // Étape 3 : appliquer la formule et mettre à jour les plafonds
    for (Reimbursement_Request__c req : Trigger.new) {
        Reimbursement_Request__c oldReq = Trigger.oldMap.get(req.Id);
        if (
            req.Status__c == 'Approved' &&
            oldReq.Status__c != 'Approved' &&
            req.Contact__c != null
        ) {
            Contact con = contactsMap.get(req.Contact__c);
            if (con != null && 
                con.Reimbursement_Rate__c != 0 && 
                req.Amount__c != null && 
                con.Reimbursement_Base__c != null && 
                con.Reimbursement_Rate__c != null
            ) {
                Decimal amountDifference = req.Amount__c - con.Reimbursement_Base__c;
                if (amountDifference > 0) {
                    Decimal usedAmount = amountDifference * (100 / con.Reimbursement_Rate__c);
                    if (con.Coverage_Limit__c != null) {
                        con.Coverage_Limit__c -= usedAmount;
                        contactsToUpdate.add(con);
                    }
                }
            }
        }
    }

    // Étape 4 : mise à jour des contacts
    if (!contactsToUpdate.isEmpty()) {
        update contactsToUpdate;
    }
}
