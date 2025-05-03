trigger ReimbursementRequestTrigger on Reimbursement_Request__c (before insert) {
    if (Trigger.isBefore && Trigger.isInsert) {
        ReimbursementRequestHandler.evaluateRequests(Trigger.new);
    }
}
