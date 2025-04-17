public class ContactImportHandler {
    public static void processContactsFromAttachment(Id oppId) {
        // Récupérer l'opportunité et vérifier qu'elle est Closed Won
        Opportunity opp = [SELECT Id, Name, StageName, AccountId FROM Opportunity WHERE Id = :oppId LIMIT 1];
        if (opp.StageName != 'Closed Won') return;

        Id accountId = opp.AccountId;

        // Récupérer les fichiers attachés
        List<Attachment> attachments = [SELECT Id, Name, Body FROM Attachment WHERE ParentId = :oppId];
        if (attachments.isEmpty()) return;

        Attachment csvFile;
        for (Attachment att : attachments) {
            if (att.Name.endsWith('.csv')) {
                csvFile = att;
                break;
            }
        }
        if (csvFile == null) return;
        // Lecture du contenu
        String content = csvFile.Body.toString();
        List<String> lines = content.split('\\r?\\n');

        //List<String> lines = content.split('\n');
        if (lines.size() <= 1) return;

        List<Contact> newContacts = new List<Contact>();
        List<User> newUsers = new List<User>();

        for (Integer i = 1; i < lines.size(); i++) {
            List<String> columns = lines[i].split(',');

            if (columns.size() < 5) continue;

            String firstName = columns[0].trim();
            String lastName = columns[1].trim();
            String email = columns[2].trim();
            String phone = columns[3].trim();
            String title = columns[4].trim();

            Contact c = new Contact(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Phone = phone,
                Title = title,
                AccountId = accountId
            );
            newContacts.add(c);
        }

        insert newContacts;

        // Création des users communautaires
        Id profileId = [SELECT Id FROM Profile WHERE Name = 'CC1' LIMIT 1].Id;

        for (Contact c : newContacts) {
            String alias = (c.FirstName.length() >= 2 ? c.FirstName.substring(0, 2) : 'us') +
                           (c.LastName.length() >= 2 ? c.LastName.substring(0, 2) : 'er');

                           User u = new User(
                            FirstName = c.FirstName,
                            LastName = c.LastName,
                            Email = c.Email,
                            Username = c.Email.replace('@', '.' + DateTime.now().getTime() + '@'),
                            Alias = alias,
                            TimeZoneSidKey = 'Europe/Paris',
                            LocaleSidKey = 'fr_FR',
                            EmailEncodingKey = 'UTF-8',
                            LanguageLocaleKey = 'fr',
                            ProfileId = profileId,
                            ContactId = c.Id,
                            UserRoleId = null,
                            IsActive = true // 👉 Active le user
                        );                        
            newUsers.add(u);
        }

        insert newUsers;
    }
}
