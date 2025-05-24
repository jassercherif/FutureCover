public with sharing class ReimbursementPDFController {
    public Reimbursement_Request__c reimbursement { get; private set; }
    public Contact insured { get; private set; }

    public ReimbursementPDFController() {
        // Récupérer l'ID depuis l'URL
        Id reimbursementId = ApexPages.currentPage().getParameters().get('id');

        if (reimbursementId == null) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'ID de remboursement non fourni.'));
            return;
        }

        // Tenter de charger la demande de remboursement
        List<Reimbursement_Request__c> reimbursements = [
            SELECT Id,
                   Name,
                   Amount__c,
                   Contact__c,
                   Contact__r.Name,
                   Contact__r.Phone,
                   Contact__r.Id,
                   Date__c,
                   Description__c,
                   Frequency__c,
                   Is_Duplicate__c,
                   Mode__c,
                   Pack__c,
                   Previous_fraudulent_requests__c,
                   Status__c,
                   Time_since_last_request__c,
                   Type__c
            FROM Reimbursement_Request__c
            WHERE Id = :reimbursementId
            LIMIT 1
        ];

        if (!reimbursements.isEmpty()) {
            reimbursement = reimbursements[0];
            if (reimbursement.Contact__c != null) {
                insured = reimbursement.Contact__r;
            }
        } else {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Demande de remboursement introuvable.'));
        }
    }

    public String getFormattedDate() {
        return (reimbursement != null && reimbursement.Date__c != null)
            ? reimbursement.Date__c.format()
            : '';
    }

    public String getFormattedAmount() {
        return (reimbursement != null && reimbursement.Amount__c != null)
            ? String.valueOf(reimbursement.Amount__c.setScale(2))
            : '0.00';
    }
}
