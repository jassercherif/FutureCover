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
}
