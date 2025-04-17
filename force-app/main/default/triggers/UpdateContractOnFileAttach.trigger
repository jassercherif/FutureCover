trigger UpdateContractOnFileAttach on ContentDocumentLink (after insert) {
    Set<Id> contractIds = new Set<Id>();

    // Identifier les Contract auxquels un fichier a été attaché
    for (ContentDocumentLink cdl : Trigger.New) {
        if (cdl.LinkedEntityId != null && cdl.LinkedEntityId.getSObjectType() == Contract.SObjectType) {
            contractIds.add(cdl.LinkedEntityId);
        }
    }

    // Mettre à jour le statut des Contracts
    if (!contractIds.isEmpty()) {
        List<Contract> contractsToUpdate = [SELECT Id, Status FROM Contract WHERE Id IN :contractIds];

        for (Contract c : contractsToUpdate) {
            c.Status = 'Send'; // Met à jour le statut
        }

        update contractsToUpdate;
    }
}
