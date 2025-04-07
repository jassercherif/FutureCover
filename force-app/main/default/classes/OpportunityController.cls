public without sharing class OpportunityController {
    public OpportunityController() {

    }
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunity(){ 
        try {
            System.debug('aaaa');
            return [SELECT id, Name, StageName, Probability    
                    FROM Opportunity
                    ORDER BY id DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
 
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getOpportunityWithContactInfo(){
        try {
            // Récupérer les opportunités avec les IDs des comptes associés
            List<Opportunity> opportunities = [SELECT Id, Name, AccountId, Account.Name, StageName FROM Opportunity ORDER BY Id DESC];

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
                    'AccountName' => opp.Account?.Name,
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
        Map<String, Object> contactInfo = new Map<String, Object>{
            'ContactName' => '',
            'ContactPhone' => ''
        };

        if (accountId == null) {
            return contactInfo;
        }

        try {
            Contact contact = [SELECT Id, Name, Phone FROM Contact WHERE AccountId = :accountId LIMIT 1];
            if (contact != null) {
                contactInfo.put('ContactName', contact.Name);
                contactInfo.put('ContactPhone', contact.Phone);
            }
        } catch (QueryException e) {
            System.debug('Aucun contact trouvé pour le compte: ' + accountId);
        }

        return contactInfo;
    }

    /**Suivi Commande */
    //Méthode pour récupérer l'ID du compte associé à l'utilisateur connecté
    public static Id getAccountId(){
        try {
            User user = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            return user.AccountId;
        } catch (Exception e) {
            System.debug('Erreur lors de la récupération du compte utilisateur: ' + e.getMessage());
            return null;
        }
    }

    // Méthode pour récupérer le stage de l'opportunité
    public static Opportunity getOpportunityStage() {
        try {
            Opportunity opp = [SELECT Id, StageName FROM Opportunity WHERE AccountId = :getAccountId()];
        //Opportunity opp = [SELECT Id, StageName FROM Opportunity WHERE Name = 'etudiano-'];
        return opp;
        } catch (Exception e ) {
            System.debug('Erreur lors de la récupération de lOpportunity: ' + e.getMessage());
            return new Opportunity(StageName = 'Salem ');
        }
    }
    public static Opportunity getOpportunityStat() {
        try {
            List<Opportunity> oppList = [SELECT Id, StageName FROM Opportunity WHERE AccountId = '001Qy00000zusVeIAI' LIMIT 1];
            
            if (!oppList.isEmpty()) {
                return oppList[0];
            } else {
                return new Opportunity(StageName = 'Aucune opportunité trouvée');
            }
            
        } catch (Exception e) {
            System.debug('Erreur lors de la récupération de l\'Opportunity: ' + e.getMessage());
            return new Opportunity(StageName = 'Erreur: ' + e.getMessage());
        }
    }
    
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOpportunityStatusWithContactInfo(){
        Map<String, Object> opportunityWithContact = new Map<String, Object>();

        Opportunity opp = getOpportunityStat();
        Id accountId = getAccountId();
        Map<String, Object> contactInfo = getContactInfo(accountId);

        opportunityWithContact.put('StageName', opp?.StageName ?? 'Non disponible');
        opportunityWithContact.put('ContactName', contactInfo.get('ContactName'));

        return opportunityWithContact; 
    }
}