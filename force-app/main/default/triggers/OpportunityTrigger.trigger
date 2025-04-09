trigger OpportunityTrigger on Opportunity (after update) {
    List<Quote> quotesToInsert = new List<Quote>();

    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);

        // Vérifie si le stage est passé à "Qualification"
        if (opp.StageName == 'Qualification' && oldOpp.StageName != 'Qualification') {
            Quote q = new Quote();
            q.Name = 'Quote for ' + opp.Name;
            q.OpportunityId = opp.Id;
            q.Status = 'Draft'; // ou autre valeur selon ton org
            q.ExpirationDate = Date.today().addDays(30); // exemple
            quotesToInsert.add(q);
        }
    }

    if (!quotesToInsert.isEmpty()) {
        insert quotesToInsert;
    }
}
