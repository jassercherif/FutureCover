public class ReimbursementRequestHandler {
    public static void evaluateRequests(List<Reimbursement_Request__c> requests) {
        Set<Id> contactIds = new Set<Id>();
        
        // Étape 1 : Collecte des Id des contacts
        for (Reimbursement_Request__c req : requests) {
            if (req.Contact__c != null) {
                contactIds.add(req.Contact__c);
            }
        }

        // Étape 2 : Récupérer les données des contacts
        Map<Id, Contact> contactMap = new Map<Id, Contact>([
            SELECT Id, Coverage_Limit__c, Reimbursement_Base__c, Reimbursement_Rate__c
            FROM Contact
            WHERE Id IN :contactIds
        ]);

        // Étape 3 : Calculer et mettre à jour les demandes
        for (Reimbursement_Request__c req : requests) {
            if (req.Contact__c != null && contactMap.containsKey(req.Contact__c)) {
                Contact contact = contactMap.get(req.Contact__c);

                // Initialisation des variables avec les valeurs par défaut
                Decimal coverageLimit = contact.Coverage_Limit__c != null ? contact.Coverage_Limit__c : 0;
                Decimal base = contact.Reimbursement_Base__c != null ? contact.Reimbursement_Base__c : 0;
                Decimal rate = contact.Reimbursement_Rate__c != null ? contact.Reimbursement_Rate__c : 0;
                Decimal amount = req.Amount__c != null ? req.Amount__c : 0;

                // Étape 4 : Calcul du montant remboursé avec la formule fournie
                // Formule : UsedAmount = (Amount__c − Reimbursement_Base__c) × (100 / Reimbursement_Rate__c)
                if (rate != 0) {
                    if (amount > base) {
                        // SCÉNARIO 1 : Montant > base → calcul normal
                        Decimal usedAmount = (amount - base) * (100 / rate);
                        if (usedAmount > coverageLimit) {
                            req.Status__c = 'Rejected';
                        }
                    } else {
                        // SCÉNARIO 2 : Montant ≤ base → pas de remboursement, donc statut accepté
                        req.Status__c = 'Rejected';
                    }
                }
            }
        }
    }
    public static void handleBeforeInsert(List<Reimbursement_Request__c> newRequests) {
        Set<Id> contactIds = new Set<Id>();
        for (Reimbursement_Request__c req : newRequests) {
            if (req.Contact__c != null) {
                contactIds.add(req.Contact__c);
            }
        }
    
        // Rechercher les demandes existantes pour les contacts
        Map<Id, List<Reimbursement_Request__c>> existingRequestsMap = new Map<Id, List<Reimbursement_Request__c>>();
        for (Reimbursement_Request__c existing : [
            SELECT Id, Amount__c, Date__c, Mode__c, Type__c, Pack__c, Status__c, Contact__c
            FROM Reimbursement_Request__c
            WHERE Contact__c IN :contactIds
            ORDER BY Date__c DESC
        ]) {
            if (!existingRequestsMap.containsKey(existing.Contact__c)) {
                existingRequestsMap.put(existing.Contact__c, new List<Reimbursement_Request__c>());
            }
            existingRequestsMap.get(existing.Contact__c).add(existing);
        }
    
        for (Reimbursement_Request__c newReq : newRequests) {
            if (newReq.Contact__c == null || !existingRequestsMap.containsKey(newReq.Contact__c)) {
                continue;
            }
    
            List<Reimbursement_Request__c> contactRequests = existingRequestsMap.get(newReq.Contact__c);
    
            // 1. Previous_fraudulent_requests__c (i.e., previous rejected requests)
            Integer fraudCount = 0;
            for (Reimbursement_Request__c req : contactRequests) {
                if (req.Status__c == 'Rejected') {
                    fraudCount++;
                }
            }
            newReq.Previous_fraudulent_requests__c = fraudCount;
    
            // 2. Is_Duplicate__c
            for (Reimbursement_Request__c existing : contactRequests) {
                if (
                    existing.Amount__c == newReq.Amount__c &&
                    existing.Date__c == newReq.Date__c &&
                    existing.Mode__c == newReq.Mode__c &&
                    existing.Type__c == newReq.Type__c &&
                    existing.Pack__c == newReq.Pack__c &&
                    existing.Status__c == newReq.Status__c
                ) {
                    newReq.Is_Duplicate__c = 1;
                    break;
                }
                else {
                    newReq.Is_Duplicate__c = 0;
                }
            }
    
            // 3. Time_since_last_request__c
            if (!contactRequests.isEmpty()) {
                Date lastDate = contactRequests[0].Date__c;
                if (lastDate != null && newReq.Date__c != null) {
                    newReq.Time_since_last_request__c = newReq.Date__c.daysBetween(lastDate);
                }
            }
    
            // 4. Frequency__c (number of requests in last 30 days)
            Date thresholdDate = Date.today().addDays(-30);
            Integer recentCount = 0;
            for (Reimbursement_Request__c r : contactRequests) {
                if (r.Date__c != null && r.Date__c >= thresholdDate) {
                    recentCount++;
                }
            }
            newReq.Frequency__c = recentCount;
        }
    }
    
}
