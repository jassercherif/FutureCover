trigger AttachmentReimbursementTrigger on Attachment (after insert) {
    Set<Id> reimbursementIds = new Set<Id>();

    for (Attachment att : Trigger.new) {
        if (att.ParentId != null && att.ParentId.getSObjectType() == Reimbursement_Request__c.SObjectType) {
            reimbursementIds.add(att.ParentId);
        }
    }

    if (!reimbursementIds.isEmpty()) {
        List<Reimbursement_Request__c> reimbursementsToUpdate = new List<Reimbursement_Request__c>();

        for (Reimbursement_Request__c rr : [
            SELECT Id, Has_valid_receipt__c
            FROM Reimbursement_Request__c
            WHERE Id IN :reimbursementIds AND Has_valid_receipt__c = FALSE
        ]) {
            rr.Has_valid_receipt__c = true;
            reimbursementsToUpdate.add(rr);
        }

        if (!reimbursementsToUpdate.isEmpty()) {
            update reimbursementsToUpdate;
        }
    }
}
