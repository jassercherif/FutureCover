trigger UpdateContractAndOpportunity on ContentVersion (after insert) {
    Set<Id> contentDocIds = new Set<Id>();

    // Récupérer uniquement les ContentVersion avec une version supérieure à 1 (donc fichier déjà existant mis à jour)
    for (ContentVersion cv : Trigger.New) {
        if (cv.ContentDocumentId != null && Integer.valueOf(cv.VersionNumber) > 1) {
            contentDocIds.add(cv.ContentDocumentId);
        }
    }

    if (!contentDocIds.isEmpty()) {
        // Trouver les objets liés aux documents (ex : Contracts)
        List<ContentDocumentLink> links = [
            SELECT ContentDocumentId, LinkedEntityId 
            FROM ContentDocumentLink 
            WHERE ContentDocumentId IN :contentDocIds
        ];

        Set<Id> contractIds = new Set<Id>();
        for (ContentDocumentLink link : links) {
            if (link.LinkedEntityId.getSObjectType() == Contract.SObjectType) {
                contractIds.add(link.LinkedEntityId);
            }
        }

        if (!contractIds.isEmpty()) {
            // Récupérer les contrats dont le statut est "Send"
            List<Contract> contracts = [
                SELECT Id, Status, Opportunity__c 
                FROM Contract 
                WHERE Id IN :contractIds AND Status = 'Send'
            ];

            Set<Id> opportunityIds = new Set<Id>();
            for (Contract c : contracts) {
                if (c.Opportunity__c != null) {
                    opportunityIds.add(c.Opportunity__c);
                }
            }

            // Récupérer les opportunités à mettre à jour si elles ne sont pas déjà "Closed Won"
            Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>();
            if (!opportunityIds.isEmpty()) {
                oppMap = new Map<Id, Opportunity>([
                    SELECT Id, StageName 
                    FROM Opportunity 
                    WHERE Id IN :opportunityIds
                ]);
            }

            List<Contract> contractsToUpdate = new List<Contract>();
            List<Opportunity> opportunitiesToUpdate = new List<Opportunity>();

            for (Contract c : contracts) {
                c.Status = 'Signed';
                contractsToUpdate.add(c);

                Opportunity opp = oppMap.get(c.Opportunity__c);
                if (opp != null && opp.StageName != 'Closed Won') {
                    opportunitiesToUpdate.add(new Opportunity(
                        Id = opp.Id,
                        StageName = 'Closed Won'
                    ));
                }
            }

            if (!contractsToUpdate.isEmpty()) {
                update contractsToUpdate;
            }

            if (!opportunitiesToUpdate.isEmpty()) {
                update opportunitiesToUpdate;
            }
        }
    }
}
