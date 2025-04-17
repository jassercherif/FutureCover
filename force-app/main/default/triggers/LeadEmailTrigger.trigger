trigger LeadEmailTrigger on Task (after insert) {
    Set<Id> leadIdsToUpdate = new Set<Id>();

    for (Task t : Trigger.new) {
        // Vérifie que c'est un email lié à un Lead
        if (t.WhoId != null && String.valueOf(t.WhoId).startsWith('00Q') && t.Subject != null && t.Subject.toLowerCase().contains('email')) {
            leadIdsToUpdate.add(t.WhoId);
        }
    }

    if (!leadIdsToUpdate.isEmpty()) {
        List<Lead> leadsToUpdate = [SELECT Id, Status FROM Lead WHERE Id IN :leadIdsToUpdate];

        for (Lead l : leadsToUpdate) {
            l.Status = 'Working - Contacted';
        }

        update leadsToUpdate;
    }
}
