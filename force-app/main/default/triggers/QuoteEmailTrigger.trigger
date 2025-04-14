trigger QuoteEmailTrigger on EmailMessage (after insert) {
    List<Quote> quotesToUpdate = new List<Quote>();
    Set<Id> oppIds = new Set<Id>();

    for (EmailMessage em : Trigger.new) {
        // Vérifie que l'email est sortant, a le bon sujet, et est lié à une Quote
        if (!em.Incoming && em.Subject == 'Quote is ready' && 
            em.RelatedToId != null && em.RelatedToId.getSObjectType() == Quote.SObjectType) {
            
            Quote relatedQuote = [
                SELECT Id, Status, OpportunityId 
                FROM Quote 
                WHERE Id = :em.RelatedToId
                LIMIT 1
            ];

            relatedQuote.Status = 'In Review';
            quotesToUpdate.add(relatedQuote);

            if (relatedQuote.OpportunityId != null) {
                oppIds.add(relatedQuote.OpportunityId);
            }
        }
    }

    if (!quotesToUpdate.isEmpty()) {
        update quotesToUpdate;
    }

    if (!oppIds.isEmpty()) {
        List<Opportunity> oppsToUpdate = new List<Opportunity>();
        for (Opportunity o : [
            SELECT Id, StageName 
            FROM Opportunity 
            WHERE Id IN :oppIds
        ]) {
            o.StageName = 'Proposal/Price Quote';
            oppsToUpdate.add(o);
        }
        update oppsToUpdate;
    }
}
