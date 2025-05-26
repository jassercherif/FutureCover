trigger FileTrigger on Reimbursement_Request__c (after insert) {
    FileTriggerHandler.moveContactFilesToReimbursement(Trigger.new);
}
