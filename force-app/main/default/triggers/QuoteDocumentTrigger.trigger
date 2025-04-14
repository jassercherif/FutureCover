trigger QuoteDocumentTrigger on ContentDocumentLink (after insert) {
  /*  Set<Id> quoteIds = new Set<Id>();

    // Identifier les liens attachés à des Quotes
    for (ContentDocumentLink cdl : Trigger.New) {
        if (cdl.LinkedEntityId != null && cdl.LinkedEntityId.getSObjectType() == Quote.SObjectType) {
            quoteIds.add(cdl.LinkedEntityId);
        }
    }

    if (quoteIds.isEmpty()) return;

    // Charger les Quotes et Opportunités
    List<Quote> quotesToUpdate = [SELECT Id, Status, OpportunityId FROM Quote WHERE Id IN :quoteIds];
    List<Opportunity> oppsToUpdate = new List<Opportunity>();

    for (Quote q : quotesToUpdate) {
        q.Status = 'In Review';
        if (q.OpportunityId != null) {
            oppsToUpdate.add(new Opportunity(Id = q.OpportunityId, StageName = 'Proposal/Price Quote'));
        }
    }

    // Mettre à jour les enregistrements
    update quotesToUpdate;
    if (!oppsToUpdate.isEmpty()) update oppsToUpdate;*/
}
