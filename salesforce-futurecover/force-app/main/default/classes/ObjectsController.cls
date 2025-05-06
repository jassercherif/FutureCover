public with sharing class ObjectsController {
    public ObjectsController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        return [
            SELECT Id, FirstName, LastName, Email, AccountId
            FROM Contact
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
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
            SELECT Id, ContractNumber, Status, StartDate, EndDate, AccountId
            FROM Contract
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Quote> getQuotes() {
        return [
            SELECT Id, Name, OpportunityId, Status, TotalPrice
            FROM Quote
            ORDER BY LastModifiedDate DESC
            LIMIT 10
        ];
    }
}