public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getAllProducts() {
        try {
            return [
                SELECT Id, Name, ProductCode, Family, Description, Beneficiaries__c,Image__c,
                       Coverage_Duration__c, Coverage_Limit__c, Included_Coverage__c,Network_of_Partners__c,
                       Price__c, Reimbursement_Rate__c,Reimbursement_Base__c, Renewable__c, IsActive
                FROM Product2
                WHERE Family != NULL
                ORDER BY Name ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Erreur : ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> searchProduct(String searchKey) {
        // Effectuez la recherche de leads en utilisant le paramètre searchKey
        searchKey = '%' + searchKey + '%';
        return [SELECT Id, Name, ProductCode, Family, Description, Beneficiaries__c,Image__c,
        Coverage_Duration__c, Coverage_Limit__c, Included_Coverage__c,Network_of_Partners__c,
        Price__c, Reimbursement_Rate__c,Reimbursement_Base__c, Renewable__c, IsActive
                FROM Product2 
                WHERE Name LIKE :searchKey
                ORDER BY id DESC];
    }
}
