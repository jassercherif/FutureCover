trigger CreateContractQuoteAccepted on Quote (after update) {

    // Liste pour stocker les contrats à insérer
    List<Contract> contractsToInsert = new List<Contract>();

    // Parcours des Quotes mises à jour
    for (Quote q : Trigger.new) {
        
        // Vérifie si le statut du Quote est passé à "Accepted"
        if (q.Status == 'Accepted' && Trigger.oldMap.get(q.Id).Status != 'Accepted') {

            // Vérifie si l'Opportunité associée a le statut "Contract Preparation"
            Opportunity opp = [SELECT Id, StageName, AccountId FROM Opportunity WHERE Id = :q.OpportunityId LIMIT 1];
            
            if (opp.StageName == 'Contract Preparation') {
                
                // Créer un nouveau contrat
                Contract newContract = new Contract(
                    AccountId = opp.AccountId,    // Associe le contrat au compte de l'opportunité
                    Opportunity__c = opp.Id,
                    Quote__c=q.Id,          // Lien correct entre le contrat et l'opportunité
                    StartDate = Date.today(),     // Date de début du contrat
                    //EndDate = Date.today().addMonths(12), // Date de fin du contrat (12 mois par défaut)
                    Status = 'Draft',             // Statut initial du contrat
                    ContractTerm = 12             // Durée en mois du contrat (12 mois ici)
                );
                
                // Ajouter le contrat à la liste
                contractsToInsert.add(newContract);
            }
        }
    }

    // Insérer les contrats si la liste n'est pas vide
    if (!contractsToInsert.isEmpty()) {
        insert contractsToInsert;
    }
}
