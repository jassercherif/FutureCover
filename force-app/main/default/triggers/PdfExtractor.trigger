trigger PdfExtractor on Reimbursement_Request__c (after insert,after update) {
      if (Trigger.isBefore && Trigger.isInsert) {
         // ReimbursementRequestHandler.callFlaskWebhook();
          ReimbursementRequestHandler.callFlaskAnalyzer();
        }    
}
