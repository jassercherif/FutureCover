public with sharing class OpportunityController {
    public OpportunityController() {
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunity(){ 
        try {
            System.debug('Récupération des opportunités');
            return [SELECT Id, Name, StageName, Probability    
                    FROM Opportunity
                    ORDER BY Id DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
 
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getOpportunityWithContactInfo(){
        try {
            // Récupérer les opportunités avec les IDs des comptes associés
            List<Opportunity> opportunities = [SELECT Id, Name, AccountId, Account.Name, StageName 
                                               FROM Opportunity 
                                               ORDER BY Id DESC];

            // Liste pour stocker les informations finales
            List<Map<String, Object>> opportunityListWithContact = new List<Map<String, Object>>();

            // Parcourir les opportunités
            for(Opportunity opp : opportunities) {
                // Récupérer l'ID du compte associé à l'opportunité
                Id accountId = opp.AccountId;
                
                // Appeler une méthode pour récupérer les informations du contact associé au compte
                Map<String, Object> contactInfo = getContactInfo(accountId);

                // Ajouter les informations de l'opportunité et du contact à la liste finale
                Map<String, Object> opportunityWithContact = new Map<String, Object>{
                    'OpportunityName' => opp.Name,
                    'StageName' => opp.StageName,
                    'AccountName' => opp.Account.Name,
                    'ContactName' => contactInfo.get('ContactName'),
                    'ContactPhone' => contactInfo.get('ContactPhone')
                };
                opportunityListWithContact.add(opportunityWithContact);
            }

            return opportunityListWithContact;           
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Méthode pour récupérer les informations du contact associé au compte
    private static Map<String, Object> getContactInfo(Id accountId) {
        Map<String, Object> contactInfo = new Map<String, Object>();
        try {
            List<Contact> contacts = [SELECT Id, Name, Phone 
                                      FROM Contact 
                                      WHERE AccountId = :accountId 
                                      LIMIT 1];
            if (!contacts.isEmpty()) {
                contactInfo.put('ContactName', contacts[0].Name);
                contactInfo.put('ContactPhone', contacts[0].Phone);
            } else {
                contactInfo.put('ContactName', ''); 
                contactInfo.put('ContactPhone', ''); 
            }
        } catch (Exception e) {
            // Si aucun contact n'est trouvé ou une autre erreur survient, retourner des valeurs par défaut
            contactInfo.put('ContactName', ''); 
            contactInfo.put('ContactPhone', ''); 
        }
        return contactInfo;
    }

    /** Suivi Commande */
    // Méthode pour récupérer l'ID du compte associé à l'utilisateur connecté
    public static Id getAccountId(){
        try {
            User user = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()];
            if (user.AccountId != null) {
                return user.AccountId;
            } else {
                throw new AuraHandledException('Aucun compte associé à cet utilisateur.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la récupération de l\'ID du compte : ' + e.getMessage());
        }
    }

    // Méthode pour récupérer le stage de l'opportunité
    public static Opportunity getOpportunityStage() {
        try {
            List<Opportunity> opps = [SELECT Id, StageName 
                                      FROM Opportunity 
                                      WHERE AccountId = :getAccountId() 
                                      LIMIT 1];
            if (!opps.isEmpty()) {
                return opps[0];
            } else {
                throw new AuraHandledException('Aucune opportunité trouvée pour cet utilisateur.');
            }
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la récupération de l\'opportunité : ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOpportunityStatusWithContactInfo(){
        try {
            Map<String, Object> opportunityWithContact = new Map<String, Object>();

            Opportunity opp = getOpportunityStage();
            Id accountId = getAccountId();
            Map<String, Object> contactInfo = getContactInfo(accountId);

            opportunityWithContact.put('StageName', opp.StageName);
            opportunityWithContact.put('ContactName', contactInfo.get('ContactName'));

            return opportunityWithContact; 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}