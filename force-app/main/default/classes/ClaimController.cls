public with sharing class ClaimController {

    @AuraEnabled(cacheable=true)
    public static List<Claim__c> getMyClaims() {
        Id currentUserId = UserInfo.getUserId();

        return [
            SELECT Id, Name, CreatedById, Date__c, Details__c,
                   LastModifiedById, OwnerId, Status__c, Subject__c, User__c
            FROM Claim__c
            WHERE User__c = :currentUserId
            ORDER BY CreatedDate DESC
        ];
    }
    
}
