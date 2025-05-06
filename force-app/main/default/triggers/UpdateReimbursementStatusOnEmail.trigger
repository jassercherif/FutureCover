trigger UpdateReimbursementStatusOnEmail on EmailMessage (after insert) {
        List<Reimbursement_Request__c> toUpdate = new List<Reimbursement_Request__c>();
    
        for (EmailMessage email : Trigger.new) {
            if (email.RelatedToId != null && email.Incoming == false) {
                // Vérifie si c'est bien une demande de remboursement
                if (email.RelatedToId.getSObjectType() == Reimbursement_Request__c.SObjectType) {
                    Reimbursement_Request__c req = new Reimbursement_Request__c(
                        Id = email.RelatedToId,
                        Status__c = 'Approved'
                    );
                    toUpdate.add(req);
                }
            }
        }
    
        if (!toUpdate.isEmpty()) {
            update toUpdate;
        }
    }
    