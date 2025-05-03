trigger LeadTrigger on Lead (after insert) {
   /* for (Lead lead : Trigger.new) {
        LeadWebhookSender.sendToWebhook(lead.Id, lead.Name, lead.Needs__c);
        //LeadWebhookSender.sendToWebhook('00QXXXXXXXXXXXX', 'Test Lead', 'Consulting');

    }*/
    
        for (Lead l : Trigger.new) {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(' https://a624-197-30-201-163.ngrok-free.app/webhook');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(JSON.serialize(l));
    
            Http http = new Http();
            HttpResponse res = http.send(req);
        }
    
}
