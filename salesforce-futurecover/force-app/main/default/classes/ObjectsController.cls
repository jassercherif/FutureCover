public without sharing class ObjectsController {
    public ObjectsController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        return [
            SELECT Id, Name, Email, AccountId, Phone,Title, Account.Name
            FROM Contact
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }
 @AuraEnabled(cacheable=true)
    public static List<Contact> searchContact(String searchKey) {
        // Effectuez la recherche de leads en utilisant le paramètre searchKey
        searchKey = '%' + searchKey + '%';
        return [SELECT Id, Name, Email, AccountId, Phone,Title, Account.Name
                FROM Contact 
                WHERE Name LIKE :searchKey
                ORDER BY id DESC];
    }
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name, Industry, Phone,NumberOfEmployees
            FROM Account
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contract> getContracts() {
        return [
            SELECT Id, ContractNumber,Name, Status, StartDate, EndDate, AccountId, Account.Name
            FROM Contract
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Quote> getQuotes() {
        return [
            SELECT Id, Name, OpportunityId, Status, TotalPrice,AccountId, Account.Name
            FROM Quote
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }
}