trigger OpportunityProductTypeTrigger on Opportunity (after insert, after update) {
    Set<Id> opportunityIds = new Set<Id>();
    
    for (Opportunity opp : Trigger.new) {
        opportunityIds.add(opp.Id);
    }

    // Map des OppId -> Product2Id via OpportunityLineItem
    Map<Id, Id> oppToProductMap = new Map<Id, Id>();
    for (OpportunityLineItem oli : [
        SELECT OpportunityId, Product2Id
        FROM OpportunityLineItem
        WHERE OpportunityId IN :opportunityIds
    ]) {
        if (oli.Product2Id != null) {
            oppToProductMap.put(oli.OpportunityId, oli.Product2Id);
        }
    }

    // Map des LeadId -> Product2Id pour les Leads liés aux opportunités
    Map<Id, Id> oppToLeadProductMap = new Map<Id, Id>();
    for (Lead l : [
        SELECT ConvertedOpportunityId, Product__c
        FROM Lead
        WHERE ConvertedOpportunityId IN :opportunityIds
    ]) {
        if (l.Product__c != null) {
            oppToLeadProductMap.put(l.ConvertedOpportunityId, l.Product__c);
        }
    }

    // Regrouper tous les produits utilisés
    Set<Id> allProductIds = new Set<Id>();
    allProductIds.addAll(oppToProductMap.values());
    allProductIds.addAll(oppToLeadProductMap.values());

    Map<Id, Product2> products = new Map<Id, Product2>([
        SELECT Id, Family FROM Product2 WHERE Id IN :allProductIds
    ]);

    List<Opportunity> opportunitiesToUpdate = new List<Opportunity>();

    for (Opportunity opp : Trigger.new) {
        String newType = null;

        if (oppToProductMap.containsKey(opp.Id)) {
            Product2 p = products.get(oppToProductMap.get(opp.Id));
            if (p != null) newType = p.Family;
        } else if (oppToLeadProductMap.containsKey(opp.Id)) {
            Product2 p = products.get(oppToLeadProductMap.get(opp.Id));
            if (p != null) newType = p.Family;
        }

        if (newType != null && opp.Insurance_Type__c != newType) {
            Opportunity updatedOpp = new Opportunity(
                Id = opp.Id,
                Insurance_Type__c = newType
            );
            opportunitiesToUpdate.add(updatedOpp);
        }
    }

    if (!opportunitiesToUpdate.isEmpty()) {
        update opportunitiesToUpdate;
    }
}
