trigger ImportContactTrigger on Opportunity (after update) {
    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        if (opp.StageName == 'Closed Won' && oldOpp.StageName != 'Closed Won') {
            ContactImportHandler.processContactsFromAttachment(opp.Id);
        }

    }
}
