trigger UpdateQuoteStatusOnOpportunityChange on Opportunity (after update) {
    // Crée une liste de Quotes à mettre à jour
    List<Quote> quotesToUpdate = new List<Quote>();
    
    // Parcours les Opportunities modifiées
    for (Opportunity opp : Trigger.new) {
        // Vérifie si le statut de l'Opportunity a changé
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        
        // Si le statut de l'Opportunity a changé
        if (opp.StageName != oldOpp.StageName) {
            // Récupérer la Quote associée à l'Opportunity
            Quote relatedQuote = [SELECT Id, Status FROM Quote WHERE OpportunityId = :opp.Id LIMIT 1];
            
            // Si l'Opportunity a le statut "Contract Signature Pending", on accepte la Quote
            if (opp.StageName == 'Contract Signature Pending') {
                relatedQuote.Status = 'Accepted';
                quotesToUpdate.add(relatedQuote);
            }
            // Si l'Opportunity a le statut "Closed Lost", on rejette la Quote
            else if (opp.StageName == 'Closed Lost') {
                relatedQuote.Status = 'Rejected';
                quotesToUpdate.add(relatedQuote);
            }
        }
    }
    
    // Mettre à jour toutes les Quotes collectées
    if (!quotesToUpdate.isEmpty()) {
        update quotesToUpdate;
    }
}
