public without sharing class QuoteService {
    public QuoteService() {

    }

    //Méthode pour récupérer l'ID du compte associé à l'utilisateur connecté
    public static Id getAccountId(){
		User user = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()];
		return user.AccountId;
	}

    // Méthode fictive pour récupérer l'ID de l'opportunité
    private static Id getOpportunityIdByCurrentUser() {
        Opportunity opp = [SELECT Id FROM Opportunity WHERE AccountId = :getAccountId()];
        //Opportunity opp = [SELECT Id FROM Opportunity WHERE Name = 'etudiano-'];
        return opp.Id; 
    }
    
    // Méthode fictive pour récupérer l'ID du devis
    private static Id getQuoteIdByCurrentUser() {
        Quote quo = [SELECT Id FROM Quote WHERE OpportunityId = :getOpportunityIdByCurrentUser() ORDER BY CreatedDate DESC LIMIT 1];
        return quo.Id; 
    }

    @AuraEnabled
    public static void AcceptedQuote() {
        Id opportunityId = getOpportunityIdByCurrentUser(); 

        // Mettre à jour le statut de l'opportunité
        Opportunity oppToUpdate = new Opportunity(Id = opportunityId, StageName = 'Contract Preparation');
        update oppToUpdate;

        // Mettre à jour le statut du devis
        Id quoteId = getQuoteIdByCurrentUser(); 
        Quote quoteToUpdate = new Quote(Id = quoteId, Status = 'Accepted');
        update quoteToUpdate;

        System.debug('AcceptedQuote');
    }

    // @AuraEnabled
    // public static void RejectedQuote() {
    //     Id opportunityId = getOpportunityIdByCurrentUser(); 

    //     // Mettre à jour le statut de l'opportunité
    //     Opportunity oppToUpdate = new Opportunity(Id = opportunityId, StageName = 'Closed Lost');
    //     update oppToUpdate;

    //     // Mettre à jour le statut du devis
    //     Id quoteId = getQuoteIdByCurrentUser(); // Méthode fictive pour récupérer l'ID du devis
    //     Quote quoteToUpdate = new Quote(Id = quoteId, Status = 'Rejected');
    //     update quoteToUpdate;

    //     System.debug('RejectedQuote');
    // }

    @AuraEnabled
    public static void RejectedQuote(String reason) {
        Id opportunityId = getOpportunityIdByCurrentUser(); 

        // Mettre à jour le statut de l'opportunité
        Opportunity oppToUpdate = new Opportunity(Id = opportunityId, StageName = 'Closed Lost');
        update oppToUpdate;

        // Mettre à jour le statut du devis
        Id quoteId = getQuoteIdByCurrentUser();
        Quote quoteToUpdate = new Quote(Id = quoteId, Status = 'Rejected', Description = reason);
        update quoteToUpdate;

        System.debug('RejectedQuote');
    }


}
