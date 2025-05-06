public with sharing class LeadController {
    @AuraEnabled
    public static String createLead(
        String firstName, String lastName, String email, String phone, String mobile, 
        String company, Integer numEmployees, Decimal annualRevenue, String insuranceType, String needs,String postalcode,
        String street, String country, String city,  String productInterest,//String stateProvince,
        String title // Ajout du paramètre title
    ) 
    {
        try {
            Lead newLead = new Lead(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Phone = phone,
                Title = title, // Correction ici : assignez la valeur du titre
                MobilePhone = mobile,
                Company = company,
                NumberOfEmployees = numEmployees,
                AnnualRevenue = annualRevenue,
                Insurance__c = insuranceType, // Assigner le type d'assurance ici
                Street = street,
                Country = country,
                City = city,
                PostalCode = postalcode,
                //State = stateProvince,
                Needs__c = needs,
                Product__c =  String.isNotBlank(productInterest) ? Id.valueOf(productInterest) : null, // Stocke le produit d'intérêt dans "Description"
                Status = 'Open - Not Contacted', // Statut par défaut
                LeadSource = 'Web' // Source du lead par défaut
            );
            insert newLead;
            return 'Lead ajouté avec succès';
        } catch (Exception e) {
            return 'Erreur: ' + e.getMessage();
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads(){
        try {
            return [SELECT id, name, Company, Email, Phone, Status   
                    FROM Lead
                    ORDER BY id DESC];
           
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Lead> searchLead(String searchKey) {
        // Effectuez la recherche de leads en utilisant le paramètre searchKey
        searchKey = '%' + searchKey + '%';
        return [SELECT id, name, Company, Email, Phone, Status 
                FROM Lead 
                WHERE Name LIKE :searchKey
                ORDER BY id DESC];
    }
}
