trigger LeadConversionTrigger on Lead (after update) {
    // Vérifier si le trigger doit s'exécuter
    if (Trigger.isAfter && Trigger.isUpdate) {
        List<Opportunity> opportunitiesToUpdate = new List<Opportunity>();
        List<OpportunityLineItem> opportunityLineItems = new List<OpportunityLineItem>();
        Set<Id> convertedLeadIds = new Set<Id>();
        Set<Id> productIds = new Set<Id>();
        
        // Identifier les leads convertis et collecter les produits associés
        for (Lead l : Trigger.new) {
            if (l.IsConverted && !Trigger.oldMap.get(l.Id).IsConverted && l.ConvertedOpportunityId != null) {
                convertedLeadIds.add(l.Id);
                if (l.Product__c != null) {
                    productIds.add(l.Product__c);
                }
            }
        }
        
        // Si aucun lead converti, sortir
        if (convertedLeadIds.isEmpty()) return;
        
        // Récupérer le Pricebook "Insurance Products" une seule fois
        Pricebook2 insurancePricebook;
        try {
            insurancePricebook = [SELECT Id FROM Pricebook2 WHERE Name = 'Insurance Products' LIMIT 1];
        } catch (Exception e) {
            System.debug('Pricebook "Insurance Products" non trouvé: ' + e.getMessage());
            return;
        }
        
        // Récupérer les opportunités converties
        Map<Id, Opportunity> convertedOpportunities = new Map<Id, Opportunity>([
            SELECT Id, Pricebook2Id 
            FROM Opportunity 
            WHERE Id IN (SELECT ConvertedOpportunityId FROM Lead WHERE Id IN :convertedLeadIds)
        ]);
        
        // Récupérer les produits associés aux leads
        Map<Id, Product2> products = new Map<Id, Product2>([
            SELECT Id, Name 
            FROM Product2 
            WHERE Id IN :productIds
        ]);
        
        // Récupérer les PricebookEntry pour ces produits
        Map<Id, PricebookEntry> pricebookEntries = new Map<Id, PricebookEntry>();
        for (PricebookEntry pbe : [
            SELECT Id, Product2Id, UnitPrice 
            FROM PricebookEntry 
            WHERE Product2Id IN :productIds 
            AND Pricebook2Id = :insurancePricebook.Id
        ]) {
            pricebookEntries.put(pbe.Product2Id, pbe);
        }
        
        // Traiter chaque lead converti
        for (Lead l : Trigger.new) {
            if (convertedLeadIds.contains(l.Id)) {
                Opportunity opp = convertedOpportunities.get(l.ConvertedOpportunityId);
                if (opp == null) continue;
                
                // Assigner le Pricebook si nécessaire
                if (opp.Pricebook2Id == null) {
                    opp.Pricebook2Id = insurancePricebook.Id;
                    opportunitiesToUpdate.add(opp);
                }
                
                // Ajouter le produit si disponible
                if (l.Product__c != null && products.containsKey(l.Product__c)) {
                    PricebookEntry pbe = pricebookEntries.get(l.Product__c);
                    if (pbe != null && l.NumberOfEmployees != null) {
                        OpportunityLineItem oli = new OpportunityLineItem(
                            OpportunityId = opp.Id,
                            Product2Id = l.Product__c,
                            Quantity = l.NumberOfEmployees,
                            UnitPrice = pbe.UnitPrice,
                            PricebookEntryId = pbe.Id
                        );
                        opportunityLineItems.add(oli);
                    }
                }
            }
        }
        
        // Mettre à jour les opportunités et ajouter les lignes de produits
        Savepoint sp = Database.setSavepoint();
        try {
            if (!opportunitiesToUpdate.isEmpty()) {
                update opportunitiesToUpdate;
            }
            if (!opportunityLineItems.isEmpty()) {
                insert opportunityLineItems;
            }
        } catch (Exception e) {
            Database.rollback(sp);
            System.debug('Erreur lors de la mise à jour: ' + e.getMessage() + 
                        '\nStack Trace: ' + e.getStackTraceString());
        }
    }
}