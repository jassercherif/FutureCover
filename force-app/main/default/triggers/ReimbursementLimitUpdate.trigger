trigger ReimbursementLimitUpdate on Reimbursement_Request__c (after update) {
    Set<Id> contactIds = new Set<Id>();

    // Étape 1 : collecter les contacts concernés par une demande approuvée
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

    // Étape 2 : récupérer les contacts avec leurs plafonds et taux
    Map<Id, Contact> contactsMap = new Map<Id, Contact>(
        [SELECT Id, Coverage_Limit__c, Reimbursement_Base__c, Reimbursement_Rate__c
         FROM Contact WHERE Id IN :contactIds]
    );

    List<Contact> contactsToUpdate = new List<Contact>();

    // Étape 3 : appliquer la formule correcte et mettre à jour les plafonds
    for (Reimbursement_Request__c req : Trigger.new) {
        Reimbursement_Request__c oldReq = Trigger.oldMap.get(req.Id);
        if (
            req.Status__c == 'Approved' &&
            oldReq.Status__c != 'Approved' &&
            req.Contact__c != null
        ) {
            Contact con = contactsMap.get(req.Contact__c);
            if (con != null &&
                con.Reimbursement_Rate__c != null &&
                con.Reimbursement_Rate__c != 0 &&
                con.Reimbursement_Base__c != null &&
                con.Coverage_Limit__c != null &&
                req.Amount__c != null
            ) {
                Decimal base = con.Reimbursement_Base__c;
                Decimal rate = con.Reimbursement_Rate__c;
                Decimal amount = req.Amount__c;
                Decimal eligibleAmount = amount - base;

                if (eligibleAmount > 0) {
                    // ✅ Appliquer d'abord le taux puis vérifier si on peut déduire du plafond
                    Decimal reimbursedAmount = eligibleAmount * (rate / 100);

                    if (con.Coverage_Limit__c >= reimbursedAmount) {
                        con.Coverage_Limit__c -= reimbursedAmount;
                        contactsToUpdate.add(con);
                    } else {
                        // Ne pas mettre à jour si ça dépasse — ou logguer si nécessaire
                        System.debug('⚠️ Le remboursement dépasse le plafond pour Contact ' + con.Id);
                    }
                }
            }
        }
    }

    if (!contactsToUpdate.isEmpty()) {
        update contactsToUpdate;
    }
}
