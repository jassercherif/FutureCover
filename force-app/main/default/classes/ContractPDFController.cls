public class ContractPDFController {
    public Contract contract { get; set; }
    public Account account { get; set; }
    public Contact signedContact { get; set; }
    public List<OpportunityLineItem> offers { get; set; }

    public String offerName { get; set; }
    public Decimal totalAmount { get; set; }
    public Decimal monthlyAmount { get; set; }
    public Decimal offerPrice { get; set; }
    public Decimal quantity { get; set; }

    public ContractPDFController() {
        // Récupère l'ID du contrat depuis l'URL
        Id contractId = ApexPages.currentPage().getParameters().get('id');

        // Récupération du contrat avec les relations
        contract = [
            SELECT Id, Name, StartDate, ContractTerm, ContractNumber,
                   Opportunity__c, AccountId, Account.Name, Account.Phone,
                   Account.BillingStreet, Account.BillingCity, Account.BillingPostalCode, Account.BillingCountry,
                   CustomerSignedId, CustomerSigned.Name, CustomerSigned.Email, CustomerSigned.Phone
            FROM Contract
            WHERE Id = :contractId
        ];

        // Récupération du compte lié
        account = contract.Account;

        // Récupération du contact signé s'il existe
        if (contract.CustomerSignedId != null) {
            signedContact = [
                SELECT Id, Name, Email, Phone
                FROM Contact
                WHERE Id = :contract.CustomerSignedId
            ];
        }

        // Récupération des produits (offres) liés à l'opportunité du contrat
        offers = [
            SELECT PricebookEntry.Product2.Name,
                   PricebookEntry.Product2.Description,
                   PricebookEntry.Product2.Family,
                   TotalPrice,
                   UnitPrice,
                   Quantity
            FROM OpportunityLineItem
            WHERE OpportunityId = :contract.Opportunity__c
        ];

        // Si une offre existe, récupérer les infos principales
        if (!offers.isEmpty()) {
            OpportunityLineItem firstItem = offers[0];
            offerName = firstItem.PricebookEntry.Product2.Name;
            offerPrice = firstItem.UnitPrice;
            quantity  = firstItem.Quantity;
            totalAmount = firstItem.TotalPrice;
            monthlyAmount = (contract.ContractTerm != null && contract.ContractTerm > 0)
                ? totalAmount / contract.ContractTerm
                : 0;
        }
    }
}
