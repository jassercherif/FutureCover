public with sharing class LeadController {
    @AuraEnabled
    public static String createLead(
        String firstName, String lastName, String email, String phone, String mobile, 
        String company, Integer numEmployees, Decimal annualRevenue, String insuranceType, 
        String insuranceAddress, String country, String city, String stateProvince, String productInterest,
        String title // Ajout du paramètre title
    ) 
    {
        try {
            Lead newLead = new Lead(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Phone = phone,
                Title = title, // Correction ici : assignez la valeur du titre
                MobilePhone = mobile,
                Company = company,
                NumberOfEmployees = numEmployees,
                AnnualRevenue = annualRevenue,
                Industry = insuranceType, // Assigner le type d'assurance ici
                Street = insuranceAddress,
                Country = country,
                City = city,
                State = stateProvince,
                Description = productInterest, // Stocke le produit d'intérêt dans "Description"
                Status = 'Open - Not Contacted', // Statut par défaut
                LeadSource = 'Web' // Source du lead par défaut
            );
            insert newLead;
            return 'Lead ajouté avec succès';
        } catch (Exception e) {
            return 'Erreur: ' + e.getMessage();
        }
    }
}
