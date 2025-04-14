trigger OpportunityTrigger on Opportunity (after update) {
    // Liste pour stocker les nouveaux devis
    List<Quote> quotesToInsert = new List<Quote>();
    Set<Id> oppIds = new Set<Id>();
    
    // Étape 1: Identifier les opportunités qualifiées
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        
        if (opp.StageName == 'Qualification' && oldOpp.StageName != 'Qualification') {
            oppIds.add(opp.Id);
        }
    }
    
    if (oppIds.isEmpty()) return;
    
    // Étape 2: Récupérer les informations nécessaires
    // a. Récupérer les opportunités avec leur pricebook
    Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>([
        SELECT Id, Name, AccountId, Pricebook2Id 
        FROM Opportunity 
        WHERE Id IN :oppIds
    ]);
    
    // b. Récupérer les contacts principaux
    Map<Id, Id> oppToContactId = new Map<Id, Id>();
    for (OpportunityContactRole ocr : [
        SELECT OpportunityId, ContactId 
        FROM OpportunityContactRole 
        WHERE OpportunityId IN :oppIds 
        AND IsPrimary = true
    ]) {
        oppToContactId.put(ocr.OpportunityId, ocr.ContactId);
    }
    
    // c. Récupérer les produits des opportunités
    Map<Id, List<OpportunityLineItem>> oppToProducts = new Map<Id, List<OpportunityLineItem>>();
    for (OpportunityLineItem oli : [
        SELECT OpportunityId, Quantity, UnitPrice, PricebookEntryId,
               PricebookEntry.Product2Id, PricebookEntry.Product2.Name
        FROM OpportunityLineItem
        WHERE OpportunityId IN :oppIds
    ]) {
        if (!oppToProducts.containsKey(oli.OpportunityId)) {
            oppToProducts.put(oli.OpportunityId, new List<OpportunityLineItem>());
        }
        oppToProducts.get(oli.OpportunityId).add(oli);
    }
    
    // Étape 3: Créer les devis
    for (Id oppId : oppIds) {
        Opportunity opp = oppMap.get(oppId);
        Quote q = new Quote(
            Name = 'Quote For ' + opp.Name,
            OpportunityId = opp.Id,
            Pricebook2Id = opp.Pricebook2Id,
            Status = 'Draft',
            ExpirationDate = Date.today().addDays(30),
            ContactId = oppToContactId.get(oppId) // Assignation du contact principal
        );
        quotesToInsert.add(q);
    }
    
    if (quotesToInsert.isEmpty()) return;
    
    // Insérer les devis
    insert quotesToInsert;
    
    // Étape 4: Créer les lignes de devis
    List<QuoteLineItem> qlisToInsert = new List<QuoteLineItem>();
    
    for (Quote q : quotesToInsert) {
        if (oppToProducts.containsKey(q.OpportunityId)) {
            for (OpportunityLineItem oli : oppToProducts.get(q.OpportunityId)) {
                QuoteLineItem qli = new QuoteLineItem(
                    QuoteId = q.Id,
                    PricebookEntryId = oli.PricebookEntryId,
                    Quantity = oli.Quantity,
                    UnitPrice = oli.UnitPrice,
                    Product2Id = oli.PricebookEntry.Product2Id
                );
                qlisToInsert.add(qli);
            }
        }
    }
    
    if (!qlisToInsert.isEmpty()) {
        insert qlisToInsert;
    }
}