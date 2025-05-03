trigger ProductTrigger on Product2 (after insert) {
    // Vérifier si le trigger doit s'exécuter
    if (Trigger.isAfter && Trigger.isInsert) {
        // Récupérer le Pricebook standard et le custom "Insurance Products"
        Pricebook2 standardPricebook;
        Pricebook2 insurancePricebook;
        
        try {
            // Pricebook standard (obligatoire pour créer des PricebookEntry)
            standardPricebook = [SELECT Id FROM Pricebook2 WHERE IsStandard = TRUE LIMIT 1];
            
            // Notre Pricebook custom "Insurance Products"
            insurancePricebook = [SELECT Id FROM Pricebook2 WHERE Name = 'Insurance Products' LIMIT 1];
        } catch (Exception e) {
            System.debug('Erreur lors de la récupération des Pricebooks: ' + e.getMessage());
            return;
        }
        
        // Récupérer les valeurs Deductible des produits
        Map<Id, Product2> productsWithDeductible = new Map<Id, Product2>([
            SELECT Id, Price__c 
            FROM Product2 
            WHERE Id IN :Trigger.newMap.keySet()
        ]);
        
        // Préparer les nouvelles entrées de Pricebook
        List<PricebookEntry> newPricebookEntries = new List<PricebookEntry>();
        
        // Parcourir tous les nouveaux produits
        for (Product2 newProduct : Trigger.new) {
            // Récupérer le produit avec son champ Deductible
            Product2 productWithDeductible = productsWithDeductible.get(newProduct.Id);
            Decimal deductibleValue = productWithDeductible.Price__c != null ? productWithDeductible.Price__c : 0;
            
            // 1. D'abord créer l'entrée dans le Pricebook standard (obligatoire)
            PricebookEntry standardEntry = new PricebookEntry(
                Pricebook2Id = standardPricebook.Id,
                Product2Id = newProduct.Id,
                IsActive = true,
                UseStandardPrice = false,
                UnitPrice = deductibleValue // Ajout du champ Price List
            );
            newPricebookEntries.add(standardEntry);
            
            // 2. Ensuite créer l'entrée dans notre Pricebook custom
            PricebookEntry insuranceEntry = new PricebookEntry(
                Pricebook2Id = insurancePricebook.Id,
                Product2Id = newProduct.Id,
                IsActive = true,
                UnitPrice = deductibleValue // Ajout du champ Price List
            );
            newPricebookEntries.add(insuranceEntry);
        }
        
        // Insérer les nouvelles entrées de Pricebook
        if (!newPricebookEntries.isEmpty()) {
            try {
                insert newPricebookEntries;
                System.debug('Entrées de Pricebook créées avec succès: ' + newPricebookEntries.size());
            } catch (DmlException e) {
                System.debug('Erreur lors de la création des entrées de Pricebook: ' + e.getMessage());
            }
        }
    }
}