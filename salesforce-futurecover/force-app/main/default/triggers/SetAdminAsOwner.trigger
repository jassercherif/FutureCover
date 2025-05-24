trigger SetAdminAsOwner on Lead (before insert) {
    // ID de l'administrateur à définir comme propriétaire
    Id adminId = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1].Id;

    for (Lead l : Trigger.new) {
        l.OwnerId = adminId;
        //l.CreatedById = adminId;
    }
}
