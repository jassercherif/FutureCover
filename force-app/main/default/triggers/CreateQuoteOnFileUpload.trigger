trigger CreateQuoteOnFileUpload on ContentDocumentLink (after insert) {
    Set<Id> oppIds = new Set<Id>();
    Map<Id, ContentDocumentLink> docLinks = new Map<Id, ContentDocumentLink>();

    for (ContentDocumentLink cdl : Trigger.new) {
        if (cdl.LinkedEntityId != null && cdl.LinkedEntityId.getSObjectType() == Opportunity.SObjectType) {
            oppIds.add(cdl.LinkedEntityId);
            docLinks.put(cdl.ContentDocumentId, cdl);
        }
    }

    if (!oppIds.isEmpty()) {
        // Récupérer les documents liés
        List<ContentVersion> contentVersions = [
            SELECT Id, Title, FileExtension, ContentDocumentId
            FROM ContentVersion
            WHERE ContentDocumentId IN :docLinks.keySet()
            AND FileExtension IN ('csv', 'xls', 'xlsx')
        ];

        List<Quote> quotesToInsert = new List<Quote>();

        for (ContentVersion cv : contentVersions) {
            ContentDocumentLink link = docLinks.get(cv.ContentDocumentId);
            if (link != null && oppIds.contains(link.LinkedEntityId)) {
                quotesToInsert.add(new Quote(
                    Name = 'Auto-Generated Quote from ' + cv.Title,
                    OpportunityId = link.LinkedEntityId,
                    Status = 'Draft',
                    ExpirationDate = Date.today().addDays(30)
                ));
            }
        }

        if (!quotesToInsert.isEmpty()) {
            insert quotesToInsert;
        }
    }
}
