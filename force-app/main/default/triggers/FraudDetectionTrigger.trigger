trigger FraudDetectionTrigger on Reimbursement_Request__c (before insert) {
      if (Trigger.isBefore && Trigger.isInsert) {
          ReimbursementRequestHandler.callFlaskWebhook();
        }    
}
